var benchmark = require('htmlparser-benchmark');
var Lexer = require('../lib/lexer.js');
var res = [];
var bench = benchmark(function(html, callback) {
	var descriptor = {};
	try {
		var output = Lexer.execRule(html, 'document', descriptor);
	} catch (e) {
		console.log('error ', e);
		return callback(e);
	}
	res.push(descriptor);
	callback(null, true);
	//callback((output === false) ? new Error("failed") : null, descriptor);
});

bench.on('progress', function(key) {
	console.log('finished parsing ' + key + '.html');
});

bench.on('result', function(stat) {
	console.log(stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
	console.log(res);
});
