# starknet-rivet

Starknet Rivet is a developer wallet tailored specifically for the Starknet ecosystem. 

It aims to streamline your development process, offering:

1. Easy Onboarding: Set up a local devnet effortlessly
2. Block and Transaction Explorer: Inspect blocks and transactions
3. Account Management: View and manage Starknet accounts
4. Contract Deployment: Deploy directly from the extension
5. Devnet Configuration: Customize your development environment
6. DApp Integration: Seamlessly connect to all Starknet dApps
7. Enhanced Debugging: Efficient local testing and troubleshooting

## Installing

1. Check if your `Node.js` version is >= **14**.
2. Change or configurate the name of your extension on `src/manifest`.
3. Run `npm install` to install the dependencies.

## Developing

Run the commands

```shell
$ cd starknet-rivet

$ npm run build
```

### Run

> Rivet is a chrome extension tool built with Vite + React, and Manifest v3

1. set your Chrome browser in 'Developer mode'
2. click 'Load unpacked', and select `starknet-rivet/build` folder
3. Activate the Rivet extension

## Contribute

If you spot a problem or room for improvement, check if an issue for it [already exists](https://github.com/0xSpaceShard/starknet-rivet/issues). If not, [create a new one](https://github.com/0xSpaceShard/starknet-rivet/issues/new). You are welcome to open a PR yourself to close the issue. Once you open a PR, you will see a template with a list of steps - please follow them.
