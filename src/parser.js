/*
 * @Author: Gilles Coomans
 * @Last Modified by:   Gilles Coomans
 * @Last Modified time: 2017-05-08 00:53:57
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

		/**
		 * the rules map
		 * @type {Object}
		 */
		this.rules = rules;

		/**
		 * the default rule's name to use
		 * @type {String}
		 */
		this.defaultRule = defaultRule;
	}

	/**
	 * find rule by name
	 * @param  {String} name the rule's name
	 * @return {Rule}      the finded rule
	 * @throws {Error} If rule not found
	 */
	getRule(name) {
		const r = this.rules[name];
		if (!r)
			throw new Error('elenpi parser : rules not found : ' + name);
		return r;
	}

	/**
	 * Parse provided string with specific rule
	 * @param  {String} string     the string to parse
	 * @param  {?String} rule       the name of the rule to apply. default is null (will use parser's default method if not provided).
	 * @param  {?Object} descriptor the main descriptor object
	 * @param  {?Object} env 		the env object (internal object used while parsing)
	 * @return {Object}            the decorated descriptor
	 * @throws {Error} If parsing fail (for any reason)
	 */
	parse(string, rule = null, descriptor = {}, env = {}) {
		env.parser = this;
		env.string = string;
		env.lastPosition = env.lastPosition || 0;
		rule = rule || this.getRule(this.defaultRule);
		Parser.exec(rule, descriptor, env);
		if (!env.error && env.string.length) {
			env.error = true;
			env.errorMessage = 'string wasn\'t parsed entierly';
		}
		if (env.error) {
			const pos = string.length - env.string.length,
				posInFile = getPositionInFile(string, pos);
			throw new Error('Parsing failed : ' + (env.errorMessage || 'no rules matched') + ' : (line:' + posInFile.line + ' , col:' + posInFile.col + ') near : ' + string.substring(Math.max(0, pos-10), pos + 50));
		}
		return descriptor;
	}

	/**
	 * Execute a rule (only for those who developing grammars)
	 * @param  {String|Rule} rule      the name of the rule to use or the rule itself
	 * @param  {Object} descriptor the descriptor to decorate
	 * @param  {Object} env        the inner-job main object where parser, parsed string and eventual errors are stored
	 * @return {Void}            nothing
	 * @public
	 * @throws {Error} If rule is string (so it's a rule's name) and referenced rule could not be found with it.
	 */
	static exec(rule, descriptor, env) {
		// if (env.error)
			// return;
		if (typeof rule === 'string')
			rule = env.parser.getRule(rule);

		const rules = rule._queue;
		for (let i = 0, len = rules.length; i < len; ++i) {
			rules[i](env, descriptor, env.lastPosition);
			if (env.error)
				break;
		}
	}
}

function getPositionInFile(string, position) {
	const splitted = string.split(/\r|\n/),
		len = splitted.length;
	let lineNumber = 0,
		current = 0,
		line,
		lineLength;
	while (lineNumber < len) {
		line = splitted[lineNumber];
		lineLength = line.length;
		if (position <= (current + lineLength))
			break;
		current += lineLength;
		lineNumber++;
	}
	return {
		line: lineNumber + 1,
		col: position - current
	};
}

export default Parser;

