import elenpi from '../index';
import primitiveValueRules from './primitive-value-rules';

const r = elenpi.Rule.initializer;

const rules = {

	...primitiveValueRules,
	//_____________________________________

	arguments: r.zeroOrMore({ // arguments list
		rule: r.oneOf('integer', 'bool', 'singlestring', 'doublestring', 'null', 'undefined', 'NaN', 'Infinity'),
		pushTo: 'arguments',
		separator: r.terminal(/^\s*,\s*/)
	}),

	call: r
		.terminal(/^([\w-_]+)\s*/, (env, obj, cap) => obj.method = cap[1]) // method name
		.maybeOne(
			r.terminal(/^\(\s*/) // open parenthesis
			.one('arguments')
			.terminal(/^\s*\)/) // close parenthesis
		)
};

export default new elenpi.Parser(rules, 'call');
