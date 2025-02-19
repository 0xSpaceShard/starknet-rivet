---
sidebar_position: 2
---

# What is Starknet Rivet?

Rivet is a developer-focused wallet & DevTools for Starknet - a browser extension that enables developers to inspect, debug, modify, and manipulate the state of a local Starknet node. Centered around common workflows of frontend Starknet development, it is compatible with any Starknet DApp, and comes with many advanced features out-of-the-box. We are excited for the community to build Rivet with us, so feel free to reach out if you’re interested in contributing!

Rivet is a browser extension that allows users to connect to any Starknet app and has all the table-stakes features one would expect in a wallet, i.e. manage multiple addresses, sign and submit transactions or messages, and view your transaction history.

**Starknet Rivet** is a developer wallet tailored specifically for the Starknet ecosystem.

It aims to streamline your development process, offering:

1. Easy Onboarding: Set up a local devnet effortlessly
2. Block and Transaction Explorer: Inspect blocks and transactions (details for each tbd)
3. Account Management: View and manage Starknet accounts (deploying tbd)
4. Contract Deployment: Declare and deploy directly from the extension
5. Devnet Configuration: Customize your development environment
6. DApp Integration: Seamlessly connect to all Starknet dApps
7. Enhanced local testing and troubleshooting: In combination with starknet-devnet-rs

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
