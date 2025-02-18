---
sidebar_position: 8
---

# Dapp Connection

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
