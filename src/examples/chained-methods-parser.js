/**
 * For parsing strings like : 
 * click ( '12', 14, true, blur(2, 4, hello( false).foo())). bar(12345)
 */

import elenpi from '../index.js';
const r = elenpi.Rule.initializer,
	Parser = elenpi.Parser;

const rules = {
	doublestring: r.terminal(/^"([^"]*)"/, (env, obj, cap) => {
		obj.value = cap[1];
	}),
	singlestring: r.terminal(/^'([^']*)'/, (env, obj, cap) => {
		obj.value = cap[1];
	}),
	float: r.terminal(/^[0-9]*\.[0-9]+/, (env, obj, cap) => {
		obj.value = parseFloat(cap[0], 10);
	}),
	integer: r.terminal(/^[0-9]+/, (env, obj, cap) => {
		obj.value = parseInt(cap[0], 10);
	}),
	bool: r.terminal(/^(true|false)/, (env, obj, cap) => {
		obj.value = (cap[1] === 'true') ? true : false;
	}),
	//_____________________________________
	calls: r
		.space()
		.zeroOrMore({
			rule: 'call',
			pushTo: 'calls',
			separator: r.terminal(/^\s*\.\s*/)
		}),

	call: r
		.terminal(/^([\w-_]+)\s*/, (env, obj, cap) => {
			obj.method = cap[1];
		})
		.maybeOne(
			r.terminal(/^\(\s*/)
			.zeroOrMore({
				rule: r.oneOf('integer', 'bool', 'singlestring', 'doublestring', 'calls'),
				pushTo: 'arguments',
				separator: r.terminal(/^\s*,\s*/)
			})
			.terminal(/^\s*\)/)
		)
};

const parser = new Parser(rules, 'calls');

export default parser;

