// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT
import * as ethUtil from 'ethereumjs-util';

import Authereum from 'authereum';
import MewConnect from '@myetherwallet/mewconnect-web-client';

import Web3 from 'web3';
import Web3Modal from 'web3modal';

function hashPersonalMessage(msg: string): string {
    const buffer = Buffer.from(msg);
    const result = ethUtil.hashPersonalMessage(buffer);
    const hash = ethUtil.bufferToHex(result);
    return hash;
}

const providerOptions = {
    mewconnect: {
        package: MewConnect, // required
        options: {
            infuraId: 'a6afd04d29e242be93a6ce29abb4a1ea', // my infura id
        },
    },
    authereum: {
        package: Authereum, // required
    },
};

const web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: false, // optional
    providerOptions, // required
});

function initWeb3(provider: any) {
    const web3: any = new Web3(provider);
    return web3;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function connectWallet(email: string) {
    const provider = await web3Modal.connect();

    const web3: any = initWeb3(provider);

    const accounts = await web3.eth.getAccounts();

    const [address] = accounts;

    console.log(address);

    const hash = hashPersonalMessage(email);

    console.log(hash);

    const hashedEmail = await web3.eth.sign(hash, address);

    console.log(hashedEmail);

    return { address, hashedEmail };
}
