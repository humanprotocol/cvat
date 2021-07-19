# Copyright (C) 2021 Intel Corporation
#
# SPDX-License-Identifier: MIT

from cvat.apps.engine.log import slogger

from django.conf import settings
from allauth.account.adapter import DefaultAccountAdapter

from django.contrib.auth import SESSION_KEY, BACKEND_SESSION_KEY, user_logged_in

class UserAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        """
        Saves a new `User` instance using information provided in the
        signup form.
        """
        from allauth.account.utils import user_email, user_field, user_username

        data = form.cleaned_data
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        username = data.get("username")
        user_email(user, email)
        user_username(user, username)
        if first_name:
            user_field(user, "first_name", first_name)
        if last_name:
            user_field(user, "last_name", last_name)

        self.populate_username(request, user)
        user.set_unusable_password()
        if commit:
            # Ability not to commit makes it easier to derive from
            # this adapter by adding
            user.save()
        return user