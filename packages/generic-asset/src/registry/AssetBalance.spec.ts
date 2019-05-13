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
import {AssetBalance} from './AssetBalance';

// tslint:disable no-magic-numbers
describe('AssetBalance', () => {
    it('compatible with Balance', () => {
        const amount = '12345678901234567890';
        const assetBalance = new AssetBalance(amount);
        const balance = new Balance(amount);
        expect(assetBalance.toU8a()).toEqual(balance.toU8a());
        expect(new AssetBalance(balance).toString()).toBe(amount);
        expect(new Balance(assetBalance).toString()).toBe(amount);
    });

    it('format amount according to decimals', () => {
        const amount = '12345678901234567890';
        const assetBalance = new AssetBalance(amount, 18);
        expect(assetBalance.formatUnits()).toBe('12.34567890123456789');
    });

    it('format amount according to decimals passed in', () => {
        const amount = '12345678901234567890';
        const assetBalance = new AssetBalance(amount, 18);
        expect(assetBalance.formatUnits(10)).toBe('1234567890.123456789');
    });

    it('create from a amount of display unit', () => {
        const amount = '12.34567890123456789';
        const assetBalance = AssetBalance.parseUnits(amount, 18);
        expect(assetBalance.toString()).toBe('12345678901234567890');
    });

    it('keep decimals after add', () => {
        const assetBalance = new AssetBalance('123', 18);
        const result = assetBalance.add(new AssetBalance('456', 18));
        expect(result.decimals).toBe(18);

        const result2 = assetBalance.add(new AssetBalance('456'));
        expect(result2.decimals).toBe(18);
    });

    it('keep decimals after addn', () => {
        const assetBalance = new AssetBalance('123', 18);
        const result = assetBalance.addn(456);
        expect(result.decimals).toBe(18);
    });

    it('throw error when add a balance with different decimals', () => {
        const assetBalance = new AssetBalance('123', 18);
        expect(() => assetBalance.add(new AssetBalance('456', 10))).toThrow('different decimals');
    });

    it('keep decimals after sub', () => {
        const assetBalance = new AssetBalance('123', 18);
        const result = assetBalance.sub(new AssetBalance('45', 18));
        expect(result.decimals).toBe(18);

        const result2 = assetBalance.sub(new AssetBalance('45'));
        expect(result2.decimals).toBe(18);
    });

    it('keep decimals after subn', () => {
        const assetBalance = new AssetBalance('123', 18);
        const result = assetBalance.subn(45);
        expect(result.decimals).toBe(18);
    });

    it('throw error when sub a balance with different decimals', () => {
        const assetBalance = new AssetBalance('123', 18);
        expect(() => assetBalance.sub(new AssetBalance('46', 10))).toThrow('different decimals');
    });
});
