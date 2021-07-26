# Copyright (C) 2021 Intel Corporation
#
# SPDX-License-Identifier: MIT

from web3.auto import w3
from eth_account.messages import encode_defunct

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

    #assert not WalletToUser.objects.filter(wallet_address=wallet_address).exists()

    walletToUser = WalletToUser(user=user, wallet_address=wallet_address)
    walletToUser.save()

    return wallet_address