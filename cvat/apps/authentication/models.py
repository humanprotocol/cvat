from django.contrib.auth.models import User
from django.db import models
from django.db.models.fields import CharField


class UserToWallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    human_wallet = CharField(max_length=42, default=False)

    class Meta:
        default_permissions = ()