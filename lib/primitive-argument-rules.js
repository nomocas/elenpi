/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * elenpi rules for primitives function's arguments. aka : "double", 'single', 1.12, 14, true, false
 */
var r = require('../index').r;

var rules = {
	doublestring: r.terminal(/^"([^"]*)"/, function(env, descriptor, cap) {
		descriptor.arguments.push(cap[1]);
	}),
	singlestring: r.terminal(/^'([^']*)'/, function(env, descriptor, cap) {
		descriptor.arguments.push(cap[1]);
	}),
	'float': r.terminal(/^[0-9]*\.[0-9]+/, function(env, descriptor, cap) {
		descriptor.arguments.push(parseFloat(cap[0], 10));
	}),
	integer: r.terminal(/^[0-9]+/, function(env, descriptor, cap) {
		descriptor.arguments.push(parseInt(cap[0], 10));
	}),
	bool: r.terminal(/^(true|false)/, function(env, descriptor, cap) {
		descriptor.arguments.push((cap[1] === 'true') ? true : false);
	})
};

module.exports = rules;
