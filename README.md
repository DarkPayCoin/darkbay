![](https://darkdot.network/sites/default/files/2021-02/dark-dot-token-banner-d4rk-news.png)

# ▼ DarkBay - DarkDot Network DeCommerce Web UI

This repository holds development code for DarkBay front-end DApp.

![DarkBay preview](DarkDot-Github-Preview.gif)

demo : [coming soon](https://app.darkdot.network)

/!\ you will need Polkadot JS extension in your browser and a Polkadot account to test the app.

Purpose
=============
Born in 2018, Dark is a community funded project which aims to provide a DAO governed, decentralized p2p e-commerce network.
Usage fees are collected in Treasury account, and used to reward users and stakers regularly, and  funding appoved proposals.
An automated escrow layer while ordering and a reputation system prevent users from having bad behavior.

Features
=============
Features implementation can be found  in the /pallets folder.
- [x] Profiles
- [x] Storefronts
- [x] Products
- [x] Orders
- [x] Escrow system
- [x] Reputation
- [x] Fiat prices via offchain worker
- [x] IPFS storage & cluster

Every user can create one or several storefronts, and create products in it. Users can then order these product, and pay in tokens according to the conversion rate given by offchain worker.

More features are planned and being developped : storefront ownership transfer & multi-ownership, inventory management, and more !


Escrow system & order flow
=============
Order flow and funds locking are managed by blockchain logic (found in /pallets/orderings folder).
An escrow system locks a per-product configurable buyer & seller escrow (= a % of product price), depending of order state and user action.
To make it short : scammers loose their funds and enrich the DAO Treasury account.

```flow
st=>start: Buyer creates order
op=>operation:  Buyer funds locked
cond=>condition: Seller accepts order?
slock=>operation: Seller funds locked
ful=>operation: Buyer funds un:ocked
arrcond=>condition: Buyer & seller solve the issue

ssend=>operation: Order is shipped & seller marks order as sent
complete=>operation: Order is complete, both escrow funds unlocked
notcomplete=>operation: Order is not marked as complete
dispute=>operation: Both funds are retained by Treasury account. User may use dispute mode (DAO arbitrage)

delivcond=>condition: Order is received and conform

st->op->cond
cond(yes)->slock
cond(no)->ful

slock->ssend->delivcond
delivcond(yes)->complete
delivcond(no)->notcomplete

slock->ssend->delivcond(no)->arrcond
arrcond(yes)->complete
arrcond(no)->dispute

```


Chain metrics
=============
As a Substrate port of legacy D4RK blockchain, last metrics voted by community will be applied.
Basic chain params are enhanced thanks to Substrate (i.e: block time target = 6 seconds).

### DARK token

| Item      | Value |
| --------- | -----:|
| Token  | DARK |
| SS58 prefix    |  17 |
| Decimals     |   12 |
| Block Time     |   6s |

### Staking rewards/inflation curve

|  june 2020 | june 2021 | june 2022 |june 2023 |june 2024 |june 2025 |june 2026 |june 2027
| :------------ |:---------------:| -----:|
| 18.00%    | 15.00% | 13.00% | 5.00% |5.00% |2.50% |2.50% |2.00% |
Inflation & rewards decrease yearly as voted by community in 2019

Setup & run
=============

## Run locally

If you want to develop Darkdot's web UI or just check it out locally, there is an easy way to do it.

Clone this repo:

```sh
git clone git@github.com:DarkPayCoin/dark-ui.git
cd dark-ui
```

Connect the app to Darkdot's server (Substrate node, IPFS):

```sh
cp darkdot-v2.env .env
```

Install project dependencies:

```sh
yarn
```

### Option A: Run in a DEV mode

A dev mode supports hot reloads – this is very helpful when developing UI bacuse you can see changes in your browser without restarting the app. But it takes some time (in seconds) compile updated parts of the app, after you made changes to the source code.

```sh
./run-dev.sh
```

Go to [localhost:3003](http://localhost:3003)

### Option B: Run in a PROD mode

A prod mode doesn't support hot reloads, but works super fast, because UI gets compiled by Next.js before running.

```sh
yarn build
yarn start
```

Go to [localhost:3003](http://localhost:3003)

Credits
=============
To avoid reinventing the wheel, we forked te great [Subsocial](https://subsocial.network/) project as a development basis. We learnt a lot about Substrate thanks to their very professional work. Kudos to their team.

Licence
=============
Darkdot is [GPL 3.0](./LICENSE) licensed.
