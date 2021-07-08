# Copyright (C) 2021 Intel Corporation
#
# SPDX-License-Identifier: MIT

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
   password = None

class WalletToUser(models.Model):
    user = models.ForeignKey(User, null=True, blank=True,
                              on_delete=models.SET_NULL, related_name="+")
    wallet_address = models.CharField(max_length=42, default='')
