# Copyright (C) 2021 Intel Corporation
#
# SPDX-License-Identifier: MIT

from allauth.account.auth_backends import AuthenticationBackend as _AuthenticationBackend
from allauth.account.auth_backends import app_settings
from allauth.account.utils import filter_users_by_email, filter_users_by_username
from django.contrib.auth import get_user_model

class AuthenticationBackend(_AuthenticationBackend):

    def _authenticate_by_email(self, **credentials):
        # Even though allauth will pass along `email`, other apps may
        # not respect this setting. For example, when using
        # django-tastypie basic authentication, the login is always
        # passed as `username`.  So let's play nice with other apps
        # and use username as fallback
        email = credentials.get("email", credentials.get("username"))
        if email:
            for user in filter_users_by_email(email):
                if self._check_wallet_address(user, credentials["wallet_address"]):
                    return user
        return None

    def _authenticate_by_username(self, **credentials):
        username_field = app_settings.USER_MODEL_USERNAME_FIELD
        username = credentials.get("username")
        wallet_address = credentials.get("wallet_address")

        User = get_user_model()

        if not username_field or username is None or wallet_address is None:
            return None
        try:
            # Username query is case insensitive
            user = filter_users_by_username(username).get()
            if self._check_wallet_address(user, wallet_address):
                return user
        except User.DoesNotExist:
            return None

    def _check_wallet_address(self, user, wallet_address):
        from cvat.apps.authentication.models import WalletToUser

        try:
            walletToUser = WalletToUser.objects.get(wallet_address=wallet_address)
        except WalletToUser.DoesNotExist:
            raise WalletToUser.DoesNotExist

        ret = user == walletToUser.user
        if ret:
            ret = self.user_can_authenticate(user)
            if not ret:
                self._stash_user(user)
        return ret
