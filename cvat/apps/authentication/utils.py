# Copyright (C) 2021 Intel Corporation
#
# SPDX-License-Identifier: MIT

from web3.auto import w3
from eth_account.messages import encode_defunct
from django.contrib.auth.hashers import get_hasher


def validate_user_wallet_address(wallet_address, email, signed_email):
    message_hash = encode_defunct(text=email)
    signer = w3.eth.account.recover_message(message_hash, signature=signed_email)

    assert wallet_address == signer

def setup_user_wallet_address(request, user):
    """
    Creates proper WalletToUser for the user that was just signed
    up.
    """
    from cvat.apps.authentication.models import WalletToUser

    wallet_address = request.data.get('wallet_address')

    assert not WalletToUser.objects.filter(wallet_address=wallet_address).exists()

    walletToUser = WalletToUser(user=user, wallet_address=wallet_address)
    walletToUser.save()

    return wallet_address

def hash_signed_email(signed_email, salt=None, hasher='default'):
    """
    Turn a signed email into a hash for database storage
    """
    if not isinstance(signed_email, (bytes, str)):
        raise TypeError(
            'Signed email must be a string or bytes, got %s.'
            % type(signed_email).__qualname__
        )
    hasher = get_hasher(hasher)
    salt = salt or hasher.salt()
    return hasher.encode(signed_email, salt)