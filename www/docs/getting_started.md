---
sidebar_position: 1
---

# Getting Started

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
