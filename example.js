const NodeWatcher = require('./index');

const watcher = new NodeWatcher(
	{
		'*::transfer':data => console.log('action data', data),
	},
	{
		// startingBlock:0,      // Start at last/head block
		startingBlock:-20,    // Start at last/head block - NUMBER
		// startingBlock:511500,   // Start at specific block
		interval:50,            // The poll interval to use. (For catching up to head block only)


		// An array of endpoints.
		// Will be used in a Round-Robin fashion so that you don't hit a single endpoint
		// repeatedly and cause mass loads. Fetch failures will simply move to the next endpoint and
		// retry block fetch (up to 5 times)
		endpoints:[
			'http://192.168.1.7:8888',

			// 'https://api.eosnewyork.io',
			// 'https://api.eosdetroit.io:443',
			// 'https://eos.greymass.com:443',
			// 'https://api.eosmetal.io:18890',
			// 'http://api.hkeos.com:80',
			// 'https://eosapi.blockmatrix.network:443',
			// 'https://fn.eossweden.se:443',
			// 'http://api.blockgenicbp.com:8888',
			// 'http://mainnet.eoscalgary.io:80',
			// 'https://node1.eosphere.io',
			// 'https://eos.saltblock.io',
			// 'https://eos-api.worbli.io:443',
			// 'http://mainnet.eoscalgary.io:80',
			// 'https://user-api.eoseoul.io:443',
			// 'https://node2.liquideos.com:8883',
			// 'https://api.eosuk.io:443',
			// 'http://api1.eosdublin.io:80',
			// 'http://api.eosvibes.io:80',
			// 'http://api.cypherglass.com:8888',
			// 'http://bp.cryptolions.io:8888',
			// 'https://api.eosn.io',
			// 'https://eu1.eosdac.io:443',
			// 'https://api.main.alohaeos.com:443',
			// 'https://rpc.eosys.io'
		],

		// Calls method on every block after fetching block data from chain.
		// This allows you to cache your own "currentBlock" variable for later use.
		blockTracker:(block, head) => console.log(`Block: ${block} | Head: ${head} | Behind: ${head - block}`)
	}
);
watcher.start();

setTimeout(() => {
	watcher.pause();

	setTimeout(() => {
		watcher.start();
	}, 2000);
}, 500)