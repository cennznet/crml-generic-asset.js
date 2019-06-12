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
import {ApiRx} from '@cennznet/api';
import {WsProvider, SubmittableResult} from '@cennznet/api/polkadot';
import {Hash} from '@cennznet/types/polkadot';
import {stringToU8a} from '@cennznet/util';
import {SimpleKeyring, Wallet} from '@cennznet/wallet';
import {take, filter, switchMap, first} from 'rxjs/operators';
import {combineLatest} from 'rxjs';

import {GenericAssetRx} from '../src/GenericAssetRx';

const assetOwner = {
    address: '5DXUeE5N5LtkW97F2PzqYPyqNkxqSWESdGSPTX6AvkUAhwKP',
    uri: '//cennznet-js-test',
};
const receiver = {
    address: '5EfqejHV2xUUTdmUVBH7PrQL3edtMm1NQVtvCgoYd8RumaP3'
}
const testAsset = {
    id: 16000,
    symbol: 'CENNZ-T',
    ownerAccount: '5FPCjwLUkeg48EDYcW5i4b45HLzmCn4aUbx5rsCsdtPbTsKT',
    totalSupply: '10000000000000000000000000000'
};

const passphrase = 'passphrase';

const url = 'wss://rimu.unfrastructure.io/public/ws';

describe('Generic asset Rx APIs', () => {
    let api: ApiRx;
    let ga: GenericAssetRx;
    beforeAll(async () => {
        const websocket = new WsProvider(url);
        api = await ApiRx.create({provider: websocket}).toPromise();
        const simpleKeyring = new SimpleKeyring();
        simpleKeyring.addFromUri(assetOwner.uri);
        const wallet = new Wallet();
        await wallet.createNewVault(passphrase);
        await wallet.addKeyring(simpleKeyring);
        api.setSigner(wallet);
        ga = await GenericAssetRx.create(api).toPromise();
    });

    afterAll(async () => {
        ((api as any)._rpc._provider as any).websocket.onclose = null;
        ((api as any)._rpc._provider as any).websocket.close();
    });

    describe.only('tests which work!', () => {
        describe('create()', () => {
            it('should create asset and return \'Created\' event when finishing', (done) => {
                const totalAmount = 100;
                const assetOptions = {
                    initialIssuance: totalAmount
                };
                ga.create(assetOptions).signAndSend(assetOwner.address)
                    .pipe(
                        filter(({events, status}: SubmittableResult) => {
                            let isCreated = false;
                            if (status.isFinalized && events !== undefined) {
                                for (let i = 0; i < events.length; i += 1) {
                                    const event = events[i];
                                    if (event.event.method === 'Created') {
                                        isCreated = true;
                                    }
                                }
                            }
                            return isCreated;
                        }),
                        switchMap(({events, status}: SubmittableResult) => {
                            let event;
                            for (let i = 0; i < events.length; i += 1) {
                                if (events[i].event.method === 'Created') {
                                    event = events[i];
                                }
                            }
                            const assetId: any = event.event.data[0];
                            return ga.getFreeBalance(assetId, assetOwner.address);
                        }),
                        first()
                    )
                    .subscribe((balance) => {
                        expect(balance.toString()).toEqual(totalAmount.toString());
                        done();
                    });
            })
        });

        describe('mint()', () => {
            it('should mint an amount of an asset to the specified address', async () => {
                // Arrange
                const {address} = assetOwner;

                const initialIssuance = 100;
                const mintAmount = 100;
                const expectedBalance = initialIssuance + mintAmount;

                const permissions = {mint: address};

                const assetId: number = await new Promise((resolve, reject) => {
                    ga.create({initialIssuance, permissions}).signAndSend(address).subscribe(({status, events}) => {
                        if (status.isFinalized) {
                            for (const {event} of events) {
                                if (event.method === "Created") {
                                    resolve(+event.data[0]);
                                }
                            }
                            reject('No "Created" event was emitted while creating asset.');
                        }
                    });
                });

                // Act
                await new Promise((resolve, reject) => {
                    ga.mint(assetId, address, mintAmount).signAndSend(address).subscribe(({status, events}) => {
                        if (status.isFinalized) {
                            for (const {event} of events) {
                                // TODO: Once https://github.com/cennznet/cennznet/pull/16 is released, this 
                                // should be be updated to resolve only when a "Minted" event is raised.
                                if (event.method === "ExtrinsicSuccess") {
                                    resolve();
                                }
                            }
                            reject('No "ExtrinsicSuccess" event was emitted while minting asset.');
                        }
                    });
                });

                // Assert
                expect(+(await ga.getFreeBalance(assetId, address).pipe(first()).toPromise())).toBe(expectedBalance);
            });
        });

        describe('burn()', () => {
            it('should burn an amount of an asset from the specified address', async () => {
                // Arrange
                const {address} = assetOwner;

                const initialIssuance = 100;
                const burnAmount = 100;
                const expectedBalance = initialIssuance - burnAmount;

                const permissions = {burn: address};

                const assetId: number = await new Promise((resolve, reject) => {
                    ga.create({initialIssuance, permissions}).signAndSend(address).subscribe(({status, events}) => {
                        if (status.isFinalized) {
                            for (const {event} of events) {
                                if (event.method === "Created") {
                                    resolve(+event.data[0]);
                                }
                            }
                            reject('No "Created" event was emitted while creating asset.');
                        }
                    });
                });

                // Act
                await new Promise((resolve, reject) => {
                    ga.burn(assetId, address, burnAmount).signAndSend(address).subscribe(({status, events}) => {
                        if (status.isFinalized) {
                            for (const {event} of events) {
                                // TODO: Once https://github.com/cennznet/cennznet/pull/16 is released, this 
                                // should be be updated to resolve only when a "Burned" event is raised.
                                if (event.method === "ExtrinsicSuccess") {
                                    resolve();
                                }
                            }
                            reject('No "ExtrinsicSuccess" event was emitted while burning asset.');
                        }
                    });
                });

                // Assert
                expect(+(await ga.getFreeBalance(assetId, address).pipe(first()).toPromise())).toBe(expectedBalance);
            });
        });
    });

    describe('transfer()', () => {
        it('transfer asset to target account', async (done) => {
            const transferAmount = 7;
            const balanceBefore = await ga.getFreeBalance(testAsset.id, assetOwner.address).pipe(first()).toPromise();
            expect(balanceBefore).toBeDefined;
            ga.transfer(testAsset.id, receiver.address, transferAmount).signAndSend(assetOwner.address)
                .subscribe(async ({events, status}: SubmittableResult) => {
                    if (status.isFinalized && events !== undefined) {
                        const balanceAfter = await ga.getFreeBalance(testAsset.id, assetOwner.address).pipe(first()).toPromise();
                        expect((balanceBefore.sub(balanceAfter)).toString()).toEqual(transferAmount.toString());
                        done();
                    }
                });
        });
        it('transfer asset to target account using asset symbol', async (done) => {
            const transferAmount = 7;
            const transferAsset = testAsset.symbol;
            const balanceBefore = await ga.getFreeBalance(transferAsset, assetOwner.address).pipe(first()).toPromise();
            expect(balanceBefore).toBeDefined;
            const tx = ga.transfer(transferAsset, receiver.address, transferAmount);

            tx.signAndSend(assetOwner.address).subscribe(async ({events, status}: SubmittableResult) => {
                if (status.isFinalized && events !== undefined) {
                    const balanceAfter = await ga.getFreeBalance(transferAsset, assetOwner.address).pipe(first()).toPromise();
                    expect((balanceBefore.sub(balanceAfter)).toString(10)).toEqual(transferAmount.toString());
                    done();
                }
            });
        });
    });

    describe('queryFreeBalance()', () => {
        it('queries free balance', async () => {
            const balance = await ga.getFreeBalance(testAsset.id, assetOwner.address).pipe(first()).toPromise();
            expect(balance).toBeDefined;
        });

        it('queries free balance with At', async () => {
            const balance = await ga.getFreeBalance(testAsset.id, assetOwner.address).pipe(first()).toPromise();
            const blockHash = (await api.rpc.chain.getBlockHash().pipe(first()).toPromise()) as Hash;
            const balanceAt = await ga.getFreeBalance.at(blockHash, testAsset.id, assetOwner.address).pipe(first()).toPromise();
            expect(balance).toEqual(balanceAt)
        });

        it('queries free balance with subscribe', async (done) => {
            const balance = await ga.getFreeBalance(testAsset.id, assetOwner.address).pipe(first()).toPromise();
            let counter1 = 1;
            let counter2 = 1;
            const transferAmount = 7;
            ga.getFreeBalance(testAsset.id, assetOwner.address).pipe(
                take(3)
            ).subscribe(async (balanceSubscribe) => {
                switch (counter1) {
                    case 1:
                        expect(balance.toString()).toEqual(balanceSubscribe.toString());
                        break;
                    case 2:
                        // should get return value when balance is changed
                        expect((balance.subn(transferAmount)).toString()).toEqual(balanceSubscribe.toString());
                        break;
                }
                counter1 += 1;
            });

            ga.getFreeBalance(testAsset.id, assetOwner.address).pipe(take(4)).subscribe(async (balanceSubscribe) => {
                switch (counter2) {
                    case 1:
                        expect(balance.toString()).toEqual(balanceSubscribe.toString());
                        // transfer to change balance value for triggering subscribe
                        await ga.transfer(testAsset.id, receiver.address, transferAmount).signAndSend(assetOwner.address).pipe(first()).toPromise();
                        break;
                    case 2:
                        // should get return value when balance is changed
                        expect((balance.subn(transferAmount)).toString()).toEqual(balanceSubscribe.toString());
                        // transfer to change balance value for triggering subscribe
                        await ga.transfer(testAsset.id, receiver.address, transferAmount).signAndSend(assetOwner.address).pipe(first()).toPromise();
                        break;
                    case 3:
                        expect((balance.subn(transferAmount * 2)).toString()).toEqual(balanceSubscribe.toString());
                        await ga.transfer(testAsset.id, receiver.address, transferAmount).signAndSend(assetOwner.address).pipe(first()).toPromise();
                        break;
                    case 4:
                        expect((balance.subn(transferAmount * 3)).toString()).toEqual(balanceSubscribe.toString());
                        done();
                        break;
                }
                counter2 += 1;
            });
        })
    });

    describe('queryReservedBalance()', () => {
        it('queries reserved balance', async () => {
            const balance = await ga.getReservedBalance(testAsset.id, assetOwner.address).pipe(first()).toPromise();
            expect(balance).toBeDefined;
        });

        it('queries reserved balance with At', async () => {
            const balance = await ga.getReservedBalance(testAsset.id, assetOwner.address).pipe(first()).toPromise();
            const blockHash = (await api.rpc.chain.getBlockHash().pipe(first()).toPromise()) as Hash;
            const balanceAt = await ga.getReservedBalance.at(blockHash, testAsset.id, assetOwner.address).pipe(first()).toPromise();
            expect(balance).toEqual(balanceAt)
        });

        it('queries reserved balance with subscribe', async (done) => {
            const balance = await ga.getReservedBalance(testAsset.id, assetOwner.address).pipe(first()).toPromise();
            ga.getReservedBalance(testAsset.id, assetOwner.address).pipe(take(1))
                .subscribe((balanceSubscribe) => {
                    expect(balance.toString()).toEqual(balanceSubscribe.toString());
                    done();
                });
        })
    });

    describe('queryNextAssetId()', () => {
        it('returns next assetId', async () => {
            const assetId = await ga.getNextAssetId().pipe(first()).toPromise();
            expect(assetId).toBeDefined;
        })
    });

    describe('queryTotalIssuance()', () => {
        it('returns total extrinsic', async () => {
            const balance = await ga.getTotalIssuance(testAsset.id).pipe(first()).toPromise();
            expect(balance.toString()).toEqual(testAsset.totalSupply);
        })
    });

    describe('queryTotalBalance()', () => {
        it('queries total balance', (done) => {
            combineLatest(
                ga.getFreeBalance(testAsset.id, assetOwner.address),
                ga.getReservedBalance(testAsset.id, assetOwner.address),
                ga.getTotalBalance(testAsset.id, assetOwner.address)
            ).pipe(first()).subscribe(([freeBalance,reservedBalance,totalBalance]) => {
                expect(freeBalance.add(reservedBalance).toString()).toEqual(totalBalance.toString());
                done();
            });
        });

        it('queries total balance with At', async (done) => {
            const blockHash = (await api.rpc.chain.getBlockHash().pipe(first()).toPromise() as Hash);
            combineLatest(
                ga.getFreeBalance.at(blockHash, testAsset.id, assetOwner.address),
                ga.getReservedBalance.at(blockHash, testAsset.id, assetOwner.address),
                ga.getTotalBalance.at(blockHash, testAsset.id, assetOwner.address)
            ).pipe(first()).subscribe(([freeBalance,reservedBalance,totalBalance]) => {
                expect(freeBalance.add(reservedBalance).toString()).toEqual(totalBalance.toString());
                done();
            });
        });
    })
});
