# Copyright (C) 2021 Intel Corporation
#
# SPDX-License-Identifier: MIT

from django.contrib.auth.forms import UserCreationForm as _UserCreationForm


class UserCreationForm(_UserCreationForm):

   def __init__(self, *args, **kwargs):
       super(UserCreationForm, self).__init__(*args, **kwargs)
       del self.fields['password1']
       del self.fields['password2']