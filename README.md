# Watcher for EOSIO blockchains

This watcher is meant to be extremely lightweight and fast.
It has no dependencies and is a total of around 10kb.

## Installation

`npm i -S watcheosio`


## Usage

```js
const NodeWatcher = require('watcheosio');

// Just a method to log out incoming action data.
const log = data => console.log('data', data);

const parsers = {
    // Using a wildcard for contract
    '*::transfer':log,

    // Using a wildcard for action
    'eosio.token::*':log,

    // Using a global catch-all wildcard
    '*':log,

    // Catching only specific actions on specific contracts
    'eosio.token::transfer':log,
}

const options = {
    startingBlock:0,      // Start at last/head block
    // startingBlock:-20,    // Start at last/head block - NUMBER
    // startingBlock:511500,   // Start at specific block
    interval:50,            // The poll interval to use. (For catching up to head block only)


    // An array of endpoints.
    // Will be used in a Round-Robin fashion so that you don't hit a single endpoint
    // repeatedly and cause mass loads. Fetch failures will simply move to the next endpoint and
    // retry block fetch (up to 5 times)
    endpoints:[
        'http://127.0.0.1:8888',
    ],

    // Calls method on every block after fetching block data from chain.
    // This allows you to cache your own "currentBlock" variable for later use.
    blockTracker:(block, head) => console.log(`Block: ${block} | Head: ${head} | Behind: ${head - block}`)
}


const watcher = new NodeWatcher(parsers, options);

// Starts watching.
watcher.start();


// Pauses temporarily.
// watcher.pause();
// -------------------------------------
// Call watcher.start() again to unpause.
```