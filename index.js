const {get, post} = require('./fetch');

class NodeWatcher {

	constructor(parsers, options){
		this.scanInterval = null;
		this.headInterval = null;
		this.fetchingBlocks = [];
		this.headBlock = 0;
		this.lastHostIndex = 0;
		this.paused = false;

		this.endpoints = options.endpoints || [];
		this.currentBlock = this.startingBlock = options.startingBlock || 1;
		this.interval = options.interval || 10;
		this.blockTracker = options.blockTracker;

		if(this.endpoints.constructor !== Array) throw new Error("Endpoints must be an array.");
		if(!this.endpoints.length) throw new Error("You must specify at least one endpoint.");
		if(!this.endpoints.every(x => typeof x === 'string')) throw new Error("All endpoints must be strings.");

		this.parserKeys = Object.keys(parsers);
		this.parserKeys.map(key => this[key] = parsers[key]);
	}

	async start(){
		if(this.paused) return this.paused = false;
		this.setHeadBlock(await this.get('chain/get_info').catch(err => { throw new Error(err); }));
		if(this.currentBlock === 0) this.currentBlock = this.headBlock;
		if(this.currentBlock < 0) this.currentBlock = this.headBlock + this.currentBlock;
		this.watch();
		this.watchHead();
	}

	async pause(){
		this.paused = true;
	}

	nextHost(){
		if(this.endpoints.length === 1) return this.endpoints[0];
		const nextIndex = this.lastHostIndex+1;
		if(typeof this.endpoints[nextIndex] === "undefined") this.lastHostIndex = 0;
		else this.lastHostIndex = nextIndex;
		return this.endpoints[nextIndex];
	}

	get(path){
		return get(`${this.nextHost()}/v1/${path}`)
	}

	post(path, data){
		return post(`${this.nextHost()}/v1/${path}`, data)
	}

	setHeadBlock(res){
		if(!res) return;
		this.headBlock = parseInt(res.head_block_num);
	}

	async parseBlock(blockNum, tries = 0){
		if(blockNum > this.currentBlock) return;
		if(this.fetchingBlocks.includes(blockNum)) return;
		if(tries >= 5) return console.error("Failed to fetch block " + blockNum);
		this.fetchingBlocks.push(blockNum);

		const die = () => {
			this.fetchingBlocks = this.fetchingBlocks.filter(x => x !== blockNum);
			return new Promise(r => setTimeout(() => r(this.parseBlock(blockNum, tries++)), 1000));
		}

		const blockData = await this.post(`chain/get_block`, {block_num_or_id:blockNum}).catch(() => null);
		if(!blockData) return die();

		if(typeof this.blockTracker === "function") this.blockTracker(blockNum, this.headBlock);

		const {transactions, timestamp, block_num, id} = blockData;
		if(!transactions) return die();

		if(transactions.length){
			transactions.map(x => {
				if(!x.trx.hasOwnProperty('transaction')) return;
				if(!x.trx.transaction.hasOwnProperty('actions')) return;
				if(!x.trx.transaction.actions.length) return;
				x.trx.transaction.actions.map(act => {
					const parserKeys = ['*', `*::${act.name}`, `${act.account}::*`, `${act.account}::${act.name}`]
					const parsers = parserKeys.filter(x => typeof this[x] === 'function');
					parsers.map(parser => {
						this[parser]({
							cpu_usage:x.cpu_usage_us,
							transaction_id:x.trx.id,
							data:act.data,
							contract:act.account,
							action:act.name,
							timestamp,
							block_num,
						});
					})
				})
			})
		}

		this.fetchingBlocks = this.fetchingBlocks.filter(x => x !== blockNum);

		return true;
	}

	async watch(){
		clearTimeout(this.scanInterval);
		const iterate = () => setTimeout(() => this.watch(), this.headBlock - this.currentBlock < 0 ? 500 : this.interval);

		if(this.currentBlock > this.headBlock || this.paused) return iterate();
		await this.parseBlock(this.currentBlock);
		this.currentBlock++;
		iterate();
	}

	watchHead(){
		clearInterval(this.headInterval);
		this.headInterval = setInterval(async() => {
			this.setHeadBlock(await this.get('chain/get_info').catch(() => null));
		}, 500);
	}

}


module.exports = NodeWatcher;



