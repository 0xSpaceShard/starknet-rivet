<!-- logo -->
<p align="center">
  <img width="1990" alt="Group 33" src="https://github.com/0xSpaceShard/starknet-rivet/assets/2848732/612502d7-68d1-4ed5-bcfa-bde1bdda89dc">
</p>

**Starknet Rivet** is a developer wallet tailored specifically for the Starknet ecosystem.

It aims to streamline your development process, offering:

1. Easy Onboarding: Set up a local devnet effortlessly
2. Block and Transaction Explorer: Inspect blocks and transactions (details for each tbd)
3. Account Management: View and manage Starknet accounts (deploying tbd)
4. Contract Deployment: Declare and deploy directly from the extension
5. Devnet Configuration: Customize your development environment
6. DApp Integration: Seamlessly connect to all Starknet dApps
7. Enhanced local testing and troubleshooting: In combination with starknet-devnet-rs

> Take a look at our [Toni](https://github.com/tabaktoni), [presenting](https://www.youtube.com/watch?v=O5vvwZl1bso) Starknet Rivet on stage!

## Download

You can find the extension on the [Chrome Web Store](https://chromewebstore.google.com/detail/starknet-rivet/lhckpiocmbojfflgoncacebcdefcalpa).

## Features

- Onboarding
  - Set up local Devnet-rs instance with various configurations
  - Configure & deploy Devnet docker instance (fork block number, fork rpc url, etc)
- Devnet configuration
  - Configure blocks (timestamp interval, etc)
  - Configure fork settings (block number, RPC URL, etc)
  - Switch between instances
- Accounts
  - List Devnet accounts
  - Deploy new Accounts
  - View balances, and other account details
  - Set balances
  - Set tokens
  - Inspect, connect, and manage accounts
- Blocks
  - Scroll through previous blocks
  - View block details & transactions in the block
  - Toggle between "click-to-mine", interval mining, and auto-mining
  - Remove blocks
- Contracts
  - Declare contracts
  - Deploy contracts
- Transactions
  - List of transactions from 10 latest blocks
  - Transaction details
- Dapp Connections
  - Connect to Dapps with your Devnet account(s)
  - Send transactions, sign messages & typed data, etc

> This feature list will expand as we add them to Rivet!

Take a look at the Starknet Rivet [documentation](https://0xspaceshard.github.io/starknet-rivet/) for a more in-depth look at the features!

## Installing and running

> Check if your `Node.js` version is >= **14**

The fastest way to run Starknet Rivet is with the `starknet-run.sh` script:

```shell
$ ./starknet-run/starknet-run.sh
```

Arguments can be passed to the starknet devnet container with the `--args` flag

```shell
$ ./starknet-run/starknet-run.sh --args "--timeout 240"
```

Add the `--add-l1` flag to run `foundryup` as well:

```shell
$ ./starknet-run/starknet-run.sh --add-l1
```

> Note: these commands install docker if not already installed!

Optionally:

- Change or configure the name of your extension on `src/manifest`.

### Running in the browser

> Rivet is a **Chrome** extension tool built with Vite + React, and Manifest v3

1. set your Chrome browser in 'Developer mode'
2. click 'Load unpacked', and select `starknet-rivet/build` folder
3. Activate the Rivet extension

## Connect to a Dapp

### Rivet testing Dapp

We have an example repo with a simple DAPP, that you can use to test and connect with Starknet Rivet:
https://github.com/0xSpaceShard/rivet-dapp-brussels

Steps:

- Have Starknet-Rivet running in the browser
- Follow the instructions in the dapp repo, like `npm install`... and run the example Dapp
- You should see `rivet` in the menu of the Dapp
- Click on `rivet`
- Test and enjoy!

### Connect to an existing Dapp

If you want to use Starknet Rivet in your existing Dapp (and your Dapp is using Starknet React), you can use the `useInjectedConnectors` hook that automatically discovers injected wallets, as well as Starknet Rivet!

Check the Starknet React [docs](https://www.starknet-react.com/docs/hooks/use-injected-connectors) on how to do so!

## Developing

Run the commands:

```shell
$ cd starknet-rivet

$ npm install

$ npm run build
```

### Devnet

To start local devnet you can also run:

```shell
$ npm run devnet
```

## Contribute

If you spot a problem or room for improvement, check if an issue for it [already exists](https://github.com/0xSpaceShard/starknet-rivet/issues). If not, [create a new one](https://github.com/0xSpaceShard/starknet-rivet/issues/new). You are welcome to open a PR yourself to close the issue. Once you open a PR, you will see a template with a list of steps - please follow them.
