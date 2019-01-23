# `cennznet-js/generic-asset`

> The Cennznet JavaScript API library for supporting generic asset.



# Install

```
$> npm config set registry https://npm-proxy.fury.io/centrality/
$> npm login
$> npm i cennznet-generic-asset cennznet-api @polkadot/api @polkadot/extrinsics @polkadot/rpc-core @polkadot/rpc-provider @polkadot/storage @polkadot/types
$> npm i cennznet-wallet
```



# USAGE

node --experimental-repl-await
```
// initialize Api and connect to dev network
const {Api} = require('cennznet-api')
const api = await Api.create({provider: 'wss://cennznet-node-0.centrality.me:9944'});

// initialize generic asset
const {GenericAsset} = require('cennznet-generic-asset')
const ga = new GenericAsset(api);

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
await ga.getInitialIssuance(testAsset.id)

// get free balance
await ga.getFreeBalance(testAsset.id, assetOwner.address)

// get reserved balance
await ga.getReservedBalance(testAsset.id, assetOwner.address)

// transfer
const transferAmount = 7;
await ga.transfer(testAsset.id, receiver.address, transferAmount).signAndSend(assetOwner.address);
```

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
"@polkadot/api": ">= 0.42.18 < 1",
"@polkadot/extrinsics": ">= 0.42.18 < 1",
"@polkadot/rpc-core": ">= 0.42.18 < 1",
"@polkadot/rpc-provider": ">= 0.42.18 < 1",
"@polkadot/storage": ">= 0.42.18 < 1",
"@polkadot/types": ">= 0.42.18 < 1",
"cennznet-api": ">= 0.7.0",
"cennznet-runtime-types": ">= 0.7.0"
```
