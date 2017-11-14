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
	doublestring: r.terminal(/^"((?:[^"\\]|\\.)*)"/, (env, obj, cap) => obj.value = cap[1]),

	singlestring: r.terminal(/^'((?:[^'\\]|\\.)*)'/, (env, obj, cap) => obj.value = cap[1]),

	templatestring: r.terminal(/^`([^`]*)`/, (env, obj, cap) => obj.value = cap[1]),

	float: r.terminal(/^[0-9]*\.[0-9]+/, (env, obj, cap) => obj.value = parseFloat(cap[0], 10)),

	integer: r.terminal(/^[0-9]+/, (env, obj, cap) => obj.value = parseInt(cap[0], 10)),

	bool: r.terminal(/^(true|false)/, (env, obj, cap) => obj.value = (cap[1] === 'true') ? true : false),

	null: r.terminal(/^null/, (env, obj) => obj.value = null),

	undefined: r.terminal(/^undefined/, (env, obj) => obj.value = undefined),

	NaN: r.terminal(/^NaN/, (env, obj) => obj.value = NaN),

	Infinity: r.terminal(/^Infinity/, (env, obj) => obj.value = Infinity)
};

export default rules;
