/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * elenpi rules for primitives function's arguments. aka : "double", 'single', 1.12, 14, true, false
 */
import elenpi from '../index';
const r = elenpi.Rule.initializer;

/**
 * example of rules for parsing arguments somewhere
 * @type {Object}
 * @private
 */
const rules = {
	doublestring: r.terminal(/^"(?:([^"]|\\")*)"/, (env, descriptor, cap) => descriptor.arguments.push(cap[1])),

	singlestring: r.terminal(/^'(?:([^']|\\')*)'/, (env, descriptor, cap) => descriptor.arguments.push(cap[1])),

	templatestring: r.terminal(/^`([^`]*)`/, (env, descriptor, cap) => descriptor.arguments.push(cap[1])),

	float: r.terminal(/^[0-9]*\.[0-9]+/, (env, descriptor, cap) => descriptor.arguments.push(parseFloat(cap[0], 10))),

	integer: r.terminal(/^[0-9]+/, (env, descriptor, cap) => descriptor.arguments.push(parseInt(cap[0], 10))),

	bool: r.terminal(/^(true|false)/, (env, descriptor, cap) => descriptor.arguments.push((cap[1] === 'true') ? true : false)),

	null: r.terminal(/^null/, (env, obj) => obj.arguments.push(null)),

	undefined: r.terminal(/^undefined/, (env, obj) => obj.arguments.push(undefined)),

	NaN: r.terminal(/^NaN/, (env, obj) => obj.arguments.push(NaN)),

	Infinity: r.terminal(/^Infinity/, (env, obj) => obj.arguments.push(Infinity))
};

export default rules;
