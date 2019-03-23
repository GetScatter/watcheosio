const http = require("http");
const https = require("https");
var URL = require('url').URL;

const getOptions = (url, method = 'GET', body = null) => {
	const {hostname, port, pathname:path} = new URL(url);
	return {
		hostname,
		port,
		path,
		method,
		// body,
		headers: Object.assign({
			'Content-Type': 'application/json',
		}, body === null ? {} : {'Content-Length': Buffer.byteLength(body)})
	};
};


const parseOutput = (resolve, reject, res) => {
	let output = ''
	res.setEncoding('utf8')
	res.on('data', chunk => output += chunk);
	res.on('end', () => {
		if (res.statusCode !== 200) reject("Api call failed with response code " + res.statusCode);
		else resolve(JSON.parse(output));
	});
};

const getService = url => url.indexOf('https://') === 0 ? https : http;

const post = (url, json) => {
	return new Promise((resolve, reject) => {
		let body = JSON.stringify(json);
		const options = getOptions(url, 'POST', body);

		let req = getService(url).request(options, res => parseOutput(resolve, reject, res));

		req.on('error', err => reject(err.message));
		req.write(body)
		req.end()
	})
};

const get = (url) => {
	return new Promise((resolve, reject) => {
		const options = getOptions(url, 'GET');
		let req = getService(url).request(options, res => parseOutput(resolve, reject, res));
		req.on('error', err => reject(err.message));
		req.end()
	})
};

module.exports = {
	get,
	post
}