from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from rest_auth.registration.serializers import RegisterSerializer
from rest_auth.serializers import PasswordResetSerializer
from rest_framework import serializers

from django.conf import settings

from cvat.apps.authentication.utils import setup_user_wallet_address, validate_user_wallet_address


class RegisterSerializerEx(RegisterSerializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    wallet_address = serializers.CharField(write_only=True, required=True)
    signed_email = serializers.CharField(write_only=True, required=True)
    hashed_email = serializers.CharField(write_only=True, required=True)
    password1 = None
    password2 = None

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
