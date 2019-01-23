# `cennznet-js/generic-asset`

> The Cennznet JavaScript API library for supporting generic asset.



# Install

```
$> npm config set registry https://npm-proxy.fury.io/centrality/
$> npm login
$> npm i cennznet-generic-asset cennznet-api @polkadot/api @polkadot/extrinsics @polkadot/rpc-core @polkadot/rpc-provider @polkadot/storage @polkadot/types
$> npm i cennznet-wallet
```



# USAGE (Promise)

node --experimental-repl-await
```
// initialize Api and connect to dev network
const {Api} = require('cennznet-api')
const api = await Api.create({provider: 'wss://cennznet-node-0.centrality.me:9944'});

// initialize generic asset
const {GenericAsset} = require('cennznet-generic-asset')
const ga = await GenericAsset.create(api);

// initialize wallet and import an account
const {SimpleKeyring, Wallet} = require('cennznet-wallet')
const {stringToU8a} = require('@polkadot/util')
const assetOwner = {
    address: '5FPCjwLUkeg48EDYcW5i4b45HLzmCn4aUbx5rsCsdtPbTsKT',
    seed: stringToU8a('cennznetjstest'.padEnd(32, ' '))
}
const receiver = {
    address: '5EfqejHV2xUUTdmUVBH7PrQL3edtMm1NQVtvCgoYd8RumaP3',
    seed: stringToU8a('cennznetjstest2'.padEnd(32, ' '))
}

const testAsset = {
    id: 1000036,
    ownerAccount: '5FPCjwLUkeg48EDYcW5i4b45HLzmCn4aUbx5rsCsdtPbTsKT',
    initialIssuance: 10000000000
}

const simpleKeyring = new SimpleKeyring();
simpleKeyring.addFromSeed(assetOwner.seed);
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
await ga.getTotalgIssuance(testAsset.id)

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
const {GenericAssetRx} = require('cennznet-generic-asset')
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
await ga.create({totalSupply: 100}).signAndSend(assetOwner.address, (status) => {
    if (status.type === 'Finalised' && status.events !== undefined) {
        for(let i = 0; i < status.events.length; i += 1) {
            if (status.events[i].event.method === 'Created') {
                // get created asset ID from the returned event
                const assetId = new AssetId(event.event.data[0]);
            }
        }
    }
});
```

# PEER DEPENDENCIES
```
@cennznet/api
@cennznet/types
@cennznet/util
```
