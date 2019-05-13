# `cennznet-js/crml-generic-asset`

> The Cennznet JavaScript API library for supporting generic asset.



# Install

```
$> npm i @cennznet/api @cennznet/crml-generic-asset @cennznet/crml-cennzx-spot @cennznet/crml-attestation
$> npm i @cennznet/wallet
```



# USAGE

node --experimental-repl-await
```
// initialize Api and connect to dev network
const {Api} = require('@cennznet/api')
const api = await Api.create({provider: 'wss://rimu.unfrastructure.io/ws?apikey=***'});
// please apply api key from https://www.unfrastructure.io or use local network.

const ga = api.genericAsset;

// initialize wallet and import an account
const {SimpleKeyring, Wallet} = require('@cennznet/wallet')
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

const simpleKeyring = new SimpleKeyring();
simpleKeyring.addFromUri(assetOwner.uri);
const wallet = new Wallet();
const passphrase = 'passphrase';
await wallet.createNewVault(passphrase);
await wallet.addKeyring(simpleKeyring);
api.setSigner(wallet);

// create an asset
await ga.create({initialIssuance: 100}).signAndSend(assetOwner.address);

// get next asset id 
await ga.getNextAssetId();

// get total supply
await ga.getInitialIssuance(testAsset.id)

// get free balance
await ga.getFreeBalance(testAsset.id, assetOwner.address)

// get reserved balance
await ga.getReservedBalance(testAsset.id, assetOwner.address)

// transfer
const transferAmount = 7;
await ga.transfer(testAsset.id, receiver.address, transferAmount).signAndSend(assetOwner.address);
```



# USAGE (Rxjs)
```
const {GenericAssetRx} = require('@cennznet/generic-asset')
const ga = await GenericAssetRx.create(api).toPromise();
```

# Enhanced AssetId for reserved assets
## query reserved assets
```
    import {assetRegistry} from '@cennznet/generic-asset';
    
    assetRegistry.findAssetById(0);
    assetRegistry.findAssetBySymbol('CENNZ');
    /* {
                id: 0,
                symbol: 'CENNZ',
                decimals: 18,
                type: AssetType.STAKING,
            }
    */
    assetRegistry.allReserveAssets()
    
```

## use asset symbol everywhere (only for reserved assets)
to query balance
```
ga.getFreeBalance('CENNZ', assetOwner.address);

``` 
to transfer
```
ga.transfer('CENNZ', receiver.address, transferAmount);
```

if the symbol passed in is not a valid reserved asset, an error will be thrown



# DEMO CODE
```
// get the ID of the created asset from the returned event
await ga.create({totalSupply: 100}).signAndSend(assetOwner.address, ({events, status}) => {
    if (status.isFinalized && events !== undefined) {
        for(let i = 0; i < events.length; i += 1) {
            const event = events[i].event;
            if (event.method === 'Created') {
                // do something
            }
        }
    }
});
```



# PEER DEPENDENCIES
```
"@cennznet/api": ">= 0.13.1",
"@cennznet/types": ">= 0.13.1",
"@cennznet/util": ">= 0.13.1"
```
