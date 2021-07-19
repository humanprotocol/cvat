from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import ugettext_lazy as _
from rest_auth.registration.serializers import RegisterSerializer
from rest_auth.serializers import PasswordResetSerializer
from rest_auth.serializers import LoginSerializer as _LoginSerializer
from rest_framework import serializers, exceptions

from django.conf import settings
from rest_framework.fields import CharField

from cvat.apps.authentication.utils import setup_user_wallet_address, validate_user_wallet_address

# Get the UserModel
UserModel = get_user_model()

class RegisterSerializerEx(RegisterSerializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    wallet_address = serializers.CharField(write_only=True, required=True)
    signed_email = serializers.CharField(write_only=True, required=True)
    hashed_email = serializers.CharField(write_only=True, required=True)
    password1 = None
    password2 = None

    def authenticate(self, **kwargs):
        return authenticate(self.context['request'], **kwargs)

    def validate_password1(self, password):
        pass

    def validate(self, data):
        validate_user_wallet_address(data['wallet_address'], data['hashed_email'], data['signed_email'])
        return data

    def get_cleaned_data(self):
        return {
            'username': self.validated_data.get('username', ''),
            'email': self.validated_data.get('email', ''),
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', ''),
        }

    def save(self, request):
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        adapter.save_user(request, user, self)
        self.custom_signup(request, user)
        setup_user_email(request, user, [])
        setup_user_wallet_address(request, user)
        return user

class PasswordResetSerializerEx(PasswordResetSerializer):
    def get_email_options(self):
        domain = None
        if hasattr(settings, 'UI_HOST') and settings.UI_HOST:
            domain = settings.UI_HOST
            if hasattr(settings, 'UI_PORT') and settings.UI_PORT:
                domain += ':{}'.format(settings.UI_PORT)
        return {
            'email_template_name': 'authentication/password_reset_email.html',
            'domain_override': domain
        }

class LoginSerializer(_LoginSerializer):
    password = None
    wallet_address = CharField(required=True)

    def authenticate(self, **kwargs):
        return authenticate(self.context['request'], **kwargs)

    def _validate_email(self, email, wallet_address):
        user = None

        if email and wallet_address:
            user = self.authenticate(email=email, wallet_address=wallet_address)
        else:
            msg = _('Must include "email" and "wallet_address".')
            raise exceptions.ValidationError(msg)

        return user

    def _validate_username(self, username, wallet_address):
        user = None

        if username and wallet_address:
            user = self.authenticate(username=username, wallet_address=wallet_address)
        else:
            msg = _('Must include "username" and "wallet_address".')
            raise exceptions.ValidationError(msg)

        return user

    def _validate_username_email(self, username, email, wallet_address):
        user = None

        if email and wallet_address:
            user = self.authenticate(email=email, wallet_address=wallet_address)
        elif username and wallet_address:
            user = self.authenticate(username=username, wallet_address=wallet_address)
        else:
            msg = _('Must include either "username" or "email" and "wallet_address".')
            raise exceptions.ValidationError(msg)

        return user
    def validate(self, attrs):
        username = attrs.get('username')
        email = attrs.get('email')
        wallet_address = attrs.get('wallet_address')

        user = None

        if 'allauth' in settings.INSTALLED_APPS:
            from allauth.account import app_settings

            # Authentication through email
            if app_settings.AUTHENTICATION_METHOD == app_settings.AuthenticationMethod.EMAIL:
                user = self._validate_email(email, wallet_address)

            # Authentication through username
            elif app_settings.AUTHENTICATION_METHOD == app_settings.AuthenticationMethod.USERNAME:
                user = self._validate_username(username, wallet_address)

            # Authentication through either username or email
            else:
                user = self._validate_username_email(username, email, wallet_address)

        else:
            # Authentication without using allauth
            if email:
                try:
                    username = UserModel.objects.get(email__iexact=email).get_username()
                except UserModel.DoesNotExist:
                    pass

            if username:
                user = self._validate_username_email(username, '', wallet_address)

        # Did we get back an active user?
        if user:
            if not user.is_active:
                msg = _('User account is disabled.')
                raise exceptions.ValidationError(msg)
        else:
            msg = _('Unable to log in with provided credentials.')
            raise exceptions.ValidationError(msg)

        # If required, is the email verified?
        if 'rest_auth.registration' in settings.INSTALLED_APPS:
            from allauth.account import app_settings
            if app_settings.EMAIL_VERIFICATION == app_settings.EmailVerificationMethod.MANDATORY:
                email_address = user.emailaddress_set.get(email=user.email)
                if not email_address.verified:
                    raise serializers.ValidationError(_('E-mail is not verified.'))

        attrs['user'] = user
        return attrs
