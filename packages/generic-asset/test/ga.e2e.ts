// Copyright 2019 Centrality Investments Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Get more fund from https://cennznet-faucet-ui.centrality.me/ if the sender account does not have enough fund
 */
import {Api} from '@cennznet/api';
import {WsProvider, SubmittableResult} from '@cennznet/api/polkadot';
import {Hash} from '@cennznet/types/polkadot';
import {SimpleKeyring, Wallet} from '@cennznet/wallet';

import {GenericAsset} from '../src/GenericAsset';

const assetOwner = {
    address: '5DXUeE5N5LtkW97F2PzqYPyqNkxqSWESdGSPTX6AvkUAhwKP',
    uri: '//cennznet-js-test',
};
const receiver = {
    address: '5ESNjjzmZnnCdrrpUo9TBKhDV1sakTjkspw2ZGg84LAK1e1Y'
};
const testAsset = {
    id: 16000,
    symbol: 'CENNZ-T',
    ownerAccount: '5FPCjwLUkeg48EDYcW5i4b45HLzmCn4aUbx5rsCsdtPbTsKT',
    totalSupply: '20000000000000000000000000000'
};

const passphrase = 'passphrase';
// const urlUatKauri = 'wss://kauri.centrality.me/ws?apikey=aa2ce32f-cf4a-40f7-9d40-897808dae4b5';
const url = 'wss://cennznet-node-0.centrality.me:9944';

describe('Generic asset APIs', () => {
    let api: Api;
    let ga: GenericAsset;
    beforeAll(async () => {
        const websocket = new WsProvider(url);
        api = await Api.create({provider: websocket});
        const simpleKeyring = new SimpleKeyring();
        simpleKeyring.addFromUri(assetOwner.uri);
        const wallet = new Wallet();
        await wallet.createNewVault(passphrase);
        await wallet.addKeyring(simpleKeyring);
        api.setSigner(wallet);
        ga = await GenericAsset.create(api);
    });

    afterAll(async () => {
        ((api as any)._rpc._provider as any).websocket.onclose = null;
        ((api as any)._rpc._provider as any).websocket.close();
    });

    describe('create()', () => {
        it('should create asset and return \'Created\' event when finishing', async (done) => {
            const totalAmount = 100;
            const assetOptions = {
                initialIssuance: totalAmount,
            };
            await ga.create(assetOptions).signAndSend(assetOwner.address, ({events, status}: SubmittableResult) => {
                if (status.isFinalized && events !== undefined) {
                    for(let i = 0; i < events.length; i += 1) {
                        const event = events[i];
                        if (event.event.method === 'Created') {
                            const assetId: any = event.event.data[0];
                            // query balance
                            ga.getFreeBalance(assetId, assetOwner.address).then(balance => {
                                expect(balance.toString()).toEqual(totalAmount.toString())
                                done();
                            });
                        }
                    }
                }
            });
        })
    });

    describe('transfer()', () => {
        it('transfer asset to target account', async (done) => {
            const transferAmount = 7;
            const balanceBefore = await ga.getFreeBalance(testAsset.id, assetOwner.address);
            expect(balanceBefore).toBeDefined;
            await ga.transfer(testAsset.id, receiver.address, transferAmount).signAndSend(assetOwner.address, ({events, status}: SubmittableResult) => {
                if (status.isFinalized && events !== undefined) {
                    ga.getFreeBalance(testAsset.id, assetOwner.address).then((balanceAfter) => {
                        expect((balanceBefore.sub(balanceAfter)).toString()).toEqual(transferAmount.toString());
                        done();
                    });
                }
            });
        });
        it('transfer asset to target account using asset symbol', async (done) => {
            const transferAmount = 7;
            const transferAsset = testAsset.symbol;
            const balanceBefore = await ga.getFreeBalance(transferAsset, assetOwner.address);
            expect(balanceBefore).toBeDefined;
            const tx = ga.transfer(transferAsset, receiver.address, transferAmount);

            await tx.signAndSend(assetOwner.address, ({events, status}: SubmittableResult) => {
                if (status.isFinalized && events !== undefined) {
                    ga.getFreeBalance(transferAsset, assetOwner.address).then(balanceAfter => {
                        expect((balanceBefore.sub(balanceAfter)).toString()).toEqual(transferAmount.toString());
                        done();
                    });
                }
            });
        });
    });

    describe('queryFreeBalance()', () => {
        it('queries free balance', async () => {
            const balance = await ga.getFreeBalance(testAsset.id, assetOwner.address);
            expect(balance).toBeDefined;
        });

        it('queries free balance with At', async () => {
            const balance = await ga.getFreeBalance(testAsset.id, assetOwner.address);
            const blockHash = (await api.rpc.chain.getBlockHash()) as Hash;
            const balanceAt = await ga.getFreeBalance.at(blockHash, testAsset.id, assetOwner.address);
            expect(balance).toEqual(balanceAt)
        });

        it('queries free balance with subscribe', async (done) => {
            const balance = await ga.getFreeBalance(testAsset.id, assetOwner.address);
            let counter1 = 1;
            let counter2 = 1;
            const transferAmount = 7;
            const unsubscribeFn = await ga.getFreeBalance(testAsset.id, assetOwner.address, (balanceSubscribe) => {
                switch (counter1) {
                    case 1:
                        expect(balance.toString()).toEqual(balanceSubscribe.toString());
                        break;
                    default:
                        if (balance.toString() !== balanceSubscribe.toString()) {
                            expect((balance.subn(transferAmount)).toString()).toEqual(balanceSubscribe.toString());
                            unsubscribeFn();
                            done();
                        }
                        break;
                }
                counter1 += 1;
            });

            // transfer to change balance value for triggering subscribe
            ga.transfer(testAsset.id, receiver.address, transferAmount).signAndSend(assetOwner.address);
        })
    });

    describe('queryReservedBalance()', () => {
        it('queries reserved balance', async () => {
            const balance = await ga.getReservedBalance(testAsset.id, assetOwner.address);
            expect(balance).toBeDefined;
        });

        it('queries reserved balance with At', async () => {
            const balance = await ga.getReservedBalance(testAsset.id, assetOwner.address);
            const blockHash = (await api.rpc.chain.getBlockHash()) as Hash;
            const balanceAt = await ga.getReservedBalance.at(blockHash, testAsset.id, assetOwner.address);
            expect(balance).toEqual(balanceAt)
        });

        it('queries reserved balance with subscribe', async (done) => {
            const balance = await ga.getReservedBalance(testAsset.id, assetOwner.address);
            const unsubscribeFn = await ga.getReservedBalance(testAsset.id, assetOwner.address, (balanceSubscribe) => {
                expect(balance.toString()).toEqual(balanceSubscribe.toString());
                done();
            }) as any;
            unsubscribeFn();
        })
    });

    describe('queryNextAssetId()', () => {
        it('returns next assetId', () => {
            ga.getNextAssetId().then(assetId => {
                expect(assetId).toBeDefined;
            })
        })
    });

    describe('queryTotalIssuance()', () => {
        it('returns total extrinsic', async () => {
            const balance = await ga.getTotalIssuance(testAsset.id);
            expect(balance.toString()).toEqual(testAsset.totalSupply);
        })
    });

    describe('queryTotalBalance()', () => {
        it('queries total balance', async () => {
            const [freeBalance,reservedBalance,totalBalance] = [
                await ga.getFreeBalance(testAsset.id, assetOwner.address),
                await ga.getReservedBalance(testAsset.id, assetOwner.address),
                await ga.getTotalBalance(testAsset.id, assetOwner.address)
            ];
            expect(freeBalance.add(reservedBalance).toString()).toEqual(totalBalance.toString())
        });

        it('queries total balance with At', async () => {
            const blockHash = (await api.rpc.chain.getBlockHash()) as Hash;
            const [freeBalance,reservedBalance,totalBalance] = [
                await ga.getFreeBalance.at(blockHash, testAsset.id, assetOwner.address),
                await ga.getReservedBalance.at(blockHash, testAsset.id, assetOwner.address),
                await ga.getTotalBalance.at(blockHash, testAsset.id, assetOwner.address)
            ];
            expect(freeBalance.add(reservedBalance).toString()).toEqual(totalBalance.toString())
        });
    })
});
