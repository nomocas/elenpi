/**
 * For parsing strings like : 
 * click ( '12', "zoo", 14, true, blur(2, 4.02, hello( false).foo())). bar(12345)
 *
 * see tests for result
 */

import elenpi from '../index';
import primitiveValueRules from './primitive-value-rules';

const r = elenpi.Rule.initializer,
	rules = {

		...primitiveValueRules,
		
		//_____________________________________

		calls: r
			.space()
			.zeroOrMore({
				rule: 'call',
				pushTo: 'calls',
				separator: r.terminal(/^\s*\.\s*/)
			}),

		call: r
			.terminal(/^([\w-_]+)\s*/, (env, obj, cap) => obj.method = cap[1]) // method name
			.terminal(/^\(\s*/) // open parenthesis
			.zeroOrMore({ // arguments list
				rule: r.oneOf('null', 'undefined', 'NaN', 'Infinity', 'integer', 'bool', 'singlestring', 'doublestring', 'calls'),
				pushTo: 'arguments',
				separator: r.terminal(/^\s*,\s*/)
			})
			.terminal(/^\s*\)/) // close parenthesis
	};

export default new elenpi.Parser(rules, 'calls');
