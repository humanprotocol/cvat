# Copyright (C) 2021 Intel Corporation
#
# SPDX-License-Identifier: MIT

from django.conf import settings

from django.contrib.auth.models import AbstractUser
from django.db import models

from django.utils.crypto import salted_hmac
from django.utils.translation import gettext_lazy as _

from cvat.apps.authentication.utils import hash_signed_email

class User(AbstractUser):
   hashed_signed_email = models.CharField(_('hashed_signed_email'), max_length=128, default='')

   _hashed_signed_email = None

   def set_hashed_signed_email(self, raw_signed_email):
        self.hashed_signed_email = hash_signed_email(raw_signed_email)
        self._hashed_signed_email = raw_signed_email

   def get_session_auth_hash(self):
       # TODO: rework this temporary solution
        """
        Return an HMAC of the hashed and signed email field.
        """
        key_salt = "cvat.apps.authentication.models.User.get_session_auth_hash"
        return salted_hmac(
            key_salt,
            self.hashed_signed_email,
            # RemovedInDjango40Warning: when the deprecation ends, replace
            # with:
            # algorithm='sha256',
            algorithm=settings.DEFAULT_HASHING_ALGORITHM,
        ).hexdigest()

class WalletToUser(models.Model):
    user = models.ForeignKey(User, null=True, blank=True,
                              on_delete=models.CASCADE, related_name="+")
    wallet_address = models.CharField(max_length=42, default='')
