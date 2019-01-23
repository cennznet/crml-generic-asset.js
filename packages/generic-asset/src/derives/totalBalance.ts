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

import {ApiInterface$Rx} from '@cennznet/api/polkadot.types';
import {Hash} from '@cennznet/types/polkadot';
import {drr} from '@plugnet/api-derive/util/drr';
import BN from 'bn.js';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AnyAddress, AnyAssetId} from '../types';
import {freeBalance, freeBalanceAt} from './freeBalance';
import {reservedBalance, reservedBalanceAt} from './reservedBalance';

export function totalBalance(api: ApiInterface$Rx) {
    return (assetId: AnyAssetId, address: AnyAddress): Observable<BN> => {
        return combineLatest(freeBalance(api)(assetId, address), reservedBalance(api)(assetId, address)).pipe(
            map(([freeBalance, reservedBalance]) => freeBalance.add(reservedBalance)),
            drr()
        );
    };
}

export function totalBalanceAt(api: ApiInterface$Rx) {
    return (hash: Hash, assetId: AnyAssetId, address: AnyAddress): Observable<BN> => {
        return combineLatest(
            freeBalanceAt(api)(hash, assetId, address),
            reservedBalanceAt(api)(hash, assetId, address)
        ).pipe(
            map(([freeBalance, reservedBalance]) => freeBalance.add(reservedBalance)),
            drr()
        );
    };
}
