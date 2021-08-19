// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT
import Authereum from 'authereum';
import MewConnect from '@myetherwallet/mewconnect-web-client';
import WalletConnectProvider from '@walletconnect/web3-provider';

import Web3 from 'web3';
import Web3Modal from 'web3modal';

const providerOptions = {
    mewconnect: {
        package: MewConnect,
        options: {
            infuraId: '2b78e14debb2482c8865cc1b494bc2dc',
        },
    },
    authereum: {
        package: Authereum,
    },
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: '2b78e14debb2482c8865cc1b494bc2dc',
        },
    },
};

const web3Modal = new Web3Modal({
    network: 'mainnet',
    cacheProvider: false,
    providerOptions,
});

function initWeb3(provider: any): Web3 {
    const web3: any = new Web3(provider);
    return web3;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function connectWallet(email: string) {
    const provider = await web3Modal.connect();

    const web3: any = initWeb3(provider);

    const accounts = await web3.eth.getAccounts();

    const [address] = accounts;
    const signedEmail = await web3.eth.personal.sign(email, address);

    return { address, signedEmail };
}
