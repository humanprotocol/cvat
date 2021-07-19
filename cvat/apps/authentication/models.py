# Copyright (C) 2021 Intel Corporation
#
# SPDX-License-Identifier: MIT

from django.conf import settings

from django.contrib.auth.models import AbstractUser
from django.db import models

from django.utils.crypto import salted_hmac

class User(AbstractUser):
   password = None

   def get_session_auth_hash(self):
        """
        Return an HMAC of the password field.
        """
        key_salt = "django.contrib.auth.models.AbstractBaseUser.get_session_auth_hash"
        return salted_hmac(
            key_salt,
            self.email,
            # RemovedInDjango40Warning: when the deprecation ends, replace
            # with:
            # algorithm='sha256',
            algorithm=settings.DEFAULT_HASHING_ALGORITHM,
        ).hexdigest()

class WalletToUser(models.Model):
    user = models.ForeignKey(User, null=True, blank=True,
                              on_delete=models.SET_NULL, related_name="+")
    wallet_address = models.CharField(max_length=42, default='')
