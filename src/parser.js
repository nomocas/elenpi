/*
* @Author: Gilles Coomans
* @Date:   2017-02-26 01:27:44
* @Last Modified by:   Gilles Coomans
* @Last Modified time: 2017-02-26 01:32:44
*/

/**
 * The Parser class.
 * @public
 */
class Parser {

	/**
	 * @param  {Object} rules       an object containing rules
	 * @param  {String} defaultRule the default rule to use when parsing
	 */
	constructor(rules, defaultRule) {
		this.rules = rules;
		this.defaultRule = defaultRule;
	}


	getRule(name) {
		const r = this.rules[name];
		if (!r)
			throw new Error('elenpi : rules not found : ' + name);
		return r;
	}

	/**
	 * Parse provided string with specific rule
	 * @param  {String} string     the string to parse
	 * @param  {String} rule       the name of the rule to apply. default is null (will use parser's default method if not provided).
	 * @param  {Object} descriptor the main descriptor object
	 * @return {Object}            the decorated descriptor
	 * @throw {Error} If parsing fail
	 */
	parse(string, rule = null, descriptor) {
		const env = {};
		descriptor = descriptor || {};
		env.parser = this;
		env.string = string;
		if (!rule)
			rule = this.rules[this.defaultRule];
		exec(rule, descriptor, env);
		if (!env.error && env.string.length) {
			env.error = true;
			env.errorMessage = 'string wasn\'t parsed entierly';
		}
		if (env.error) {
			const pos = string.length - env.string.length,
				posInFile = getPositionInFile(string, pos);
			throw new Error('Parsing failed : ' + (env.errorMessage || 'unknown') + ' : (line:' + posInFile.line + ' , col:' + posInFile.col + ') near :\n', string.substring(pos, pos + 50));
		}
		return descriptor;
	}
}

/**
 * Execute a rule (only for those who developing grammars)
 * @param  {String|Rule} rule      the name of the rule to use or the rule itself
 * @param  {Object} descriptor the descriptor to decorate
 * @param  {Object} env        the inner-job main object where the parsed string and eventual errors are stored
 * @return {Void}            nothing
 * @public
 */
function exec(rule, descriptor, env) {
	if (env.error)
		return;
	if (typeof rule === 'string')
		rule = env.parser.getRule(rule);

	const rules = rule._queue;
	for (let i = 0, current, len = rules.length; i < len; ++i) {
		current = rules[i];
		if (current.__elenpi__)
			exec(current, descriptor, env);
		else // is function
			current(env, descriptor);
		if (env.error)
			break;
	}
}


function getPositionInFile(string, position) {
	const splitted = string.split(/\r|\n/),
		len = splitted.length;
	let lineNumber = 0,
		current = 0,
		line;
	while (lineNumber < len) {
		line = splitted[lineNumber];
		if (position <= (current + line.length))
			break;
		current += line.length;
		lineNumber++;
	}
	return {
		line: lineNumber + 1,
		col: position - current
	};
}

export {
	Parser,
	exec
};

