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

import {Balance} from '@cennznet/types/polkadot';
import {assert, formatUnits, isUndefined, parseUnits} from '@cennznet/util';
import BN from 'bn.js';

/**
 * Enhanced Balance with unit conversion helpers
 */
export class AssetBalance extends Balance {
    /**
     * create AssetBalance from value in unit of asset's largest
     * @param input
     * @param decimals
     */
    static parseUnits(input: string | number, decimals: number) {
        return new AssetBalance(parseUnits(input, decimals), decimals);
    }

    constructor(value: any, public decimals?: number) {
        super(value);
    }

    /**
     * format balance into asset's largest unit for display
     * @param unValue
     * @param decimals
     */
    formatUnits(decimals?: number): string {
        assert(!isUndefined(this.decimals) || !isUndefined(decimals), 'decimals is undefined');
        return formatUnits(this, decimals || this.decimals);
    }

    add(b: AssetBalance | BN): AssetBalance {
        if (!isUndefined(this.decimals)) {
            if (b instanceof AssetBalance && !isUndefined(b.decimals)) {
                assert(b.decimals === this.decimals, 'can not add two AssetBalance of different decimals');
            }
            return new AssetBalance(super.add(b), this.decimals);
        } else {
            return new AssetBalance(super.add(b));
        }
    }

    addn(b: number): AssetBalance {
        return new AssetBalance(super.addn(b), this.decimals);
    }

    sub(b: AssetBalance | BN): AssetBalance {
        if (!isUndefined(this.decimals)) {
            if (b instanceof AssetBalance && !isUndefined(b.decimals)) {
                assert(b.decimals === this.decimals, 'can not sub two AssetBalance of different decimals');
            }
            return new AssetBalance(super.sub(b), this.decimals);
        } else {
            return new AssetBalance(super.sub(b));
        }
    }

    subn(b: number): AssetBalance {
        return new AssetBalance(super.subn(b), this.decimals);
    }
}
