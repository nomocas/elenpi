/*
 * @Author: Gilles Coomans
 */

import { exec } from './parser.js';

const defaultSpaceRegExp = /^\s+/;

/**
 * The Rule base class.
 * @public
 */
class Rule {

	/**
	 * the Rule constructor
	 */
	constructor() {
		this._queue = [];
		this.__elenpi__ = true;
	}

	/**
	 * the base handler for every other lexems
	 * @param  {Function} callback the callback to handle string
	 * @return {Rule}          this rule handler
	 * @public
	 */
	done(callback) {
		this._queue.push(callback);
		return this;
	}

	/**
	 * use another rule  
	 * @param  {String|Rule} rule the rule to use
	 * @return {Rule}          this rule handler
	 */
	use(rule) {
		const args = [].slice.call(arguments, 1);
		return this.done((env, descriptor) => {
			if (typeof rule === 'string')
				rule = env.parser.getRule(rule);
			if (rule.__elenpi__) {
				exec(rule, descriptor, env);
			} else {
				const r = new Rule();
				rule.apply(r, args);
				exec(r, descriptor, env);
			}
		});
	}

	/**
	 * catch a terminal
	 * @param  {RegExp} reg the terminal's regexp
	 * @param  {String|Function} set either the name of the property (in current descriptor) where store the catched value 
	 *                           or a function to handle captured object by hand 
	 * @return {Rule}          this rule handler
	 */
	terminal(reg, set) {
		return this.done((env, descriptor) => {
			if (!env.string.length) {
				env.error = true;
				return;
			}
			const cap = reg.exec(env.string);
			if (cap) {
				env.string = env.string.substring(cap[0].length);
				if (set) {
					if (typeof set === 'string')
						descriptor[set] = cap[0];
					else
						set(env, descriptor, cap);
				}
			} else
				env.error = true;
		});
	}

	/**
	 * match a single character
	 * @param  {String} test the caracter to match
	 * @return {Rule}          this rule handler
	 */
	char(test) {
		return this.done((env) => {
			if (!env.string.length || env.string[0] !== test)
				env.error = true;
			else
				env.string = env.string.substring(1);
		});
	}

	/**
	 * match x or more element from string with provided rule
	 * @param  {Rule|Object} rule either a rule instance or an option object
	 * @return {Rule}          this rule handler
	 */
	xOrMore(rule) {
		const opt = (typeof rule === 'string' || rule.__elenpi__) ? {
			rule
		} : rule;
		opt.minimum = opt.minimum || 0;
		opt.maximum = opt.maximum || Infinity;
		return this.done((env, descriptor) => {
			const options = opt;

			if (opt.minimum && !env.string.length) {
				env.error = true;
				return;
			}

			const rule = options.rule,
				pushTo = options.pushTo,
				pushToString = typeof pushTo === 'string',
				As = options.as,
				separator = options.separator;

			let count = 0,
				currentPosition,
				newDescriptor;

			while (!env.error && env.string.length && count < options.maximum) {
				newDescriptor = As ? As(env, descriptor) : (pushTo ? {} : descriptor);
				currentPosition = env.string.length;
				exec(rule, newDescriptor, env);

				if (env.error) {
					if (currentPosition === env.string.length) {
						env.error = false;
					}
					break;
				}

				count++;

				if (!newDescriptor.skip && pushTo)
					if (pushToString) {
						descriptor[pushTo] = descriptor[pushTo] || [];
						descriptor[pushTo].push(newDescriptor);
					} else
						pushTo(env, descriptor, newDescriptor);

				if (separator && env.string.length) {
					currentPosition = env.string.length;
					exec(separator, newDescriptor, env);
					if (env.error) {
						if (currentPosition === env.string.length)
							env.error = false;
						break;
					}
				}
			}

			if (!env.error && count < options.minimum) {
				env.error = true;
				env.errorMessage = "missing xOrMore item : " + rule;
			}
		});
	}

	/**
	 * match 0 or more element from string with provided rule
	 * @param  {Rule|Object} rule either a rule instance or an option object
	 * @return {Rule}          this rule handler
	 */
	zeroOrMore(rule) {
		return this.xOrMore(rule);
	}

	/**
	 * match 1 or more element from string with provided rule
	 * @param  {Rule|Object} rule either a rule instance or an option object
	 * @return {Rule}          this rule handler
	 */
	oneOrMore(rule) {
		if (typeof rule === 'string' || rule.__elenpi__)
			rule = {
				rule,
				minimum: 1
			};
		else
			rule.minimum = 1;
		return this.xOrMore(rule);
	}

	/**
	 * match one element from string with one of provided rules
	 * @param  {Rule|Object} rules either a rule instance or an option object
	 * @return {Rule}          this rule handler
	 */
	oneOf(rules) {
		const opt = (typeof rules === 'string' || rules.__elenpi__) ? {
			rules: [].slice.call(arguments)
		} : rules;
		return this.done((env, descriptor) => {

			if (!opt.optional && !env.string.length) {
				env.error = true;
				return;
			}

			const options = opt,
				len = options.rules.length,
				currentPosition = env.string.length;

			let count = 0,
				rule,
				newDescriptor;

			while (count < len) {
				rule = options.rules[count];
				count++;
				newDescriptor = options.as ? options.as(env, descriptor) : (options.set ? {} : descriptor);
				exec(rule, newDescriptor, env);
				if (env.error) {
					if (env.string.length === currentPosition) {
						env.error = false;
						continue;
					}
				} else if (!newDescriptor.skip && options.set) {
					if (typeof options.set === 'string')
						descriptor[options.set] = newDescriptor;
					else
						options.set(env, descriptor, newDescriptor);
				}
				return;
			}
			if (!opt.optional)
				env.error = true;
		});
	}

	/**
	 * maybe match one element from string with one of provided rules
	 * @param  {Rule|Object} rules either a rule instance or an option object
	 * @return {Rule}          this rule handler
	 */
	maybeOneOf(rules) {
		const opt = (typeof rules === 'string' || rules.__elenpi__) ? {
			rules: [].slice.call(arguments)
		} : rules;
		opt.optional = true;
		return this.oneOf(opt);
	}

	/**
	 * match one element from string with provided rule
	 * @param  {Rule|Object} rule either a rule instance or an option object
	 * @return {Rule}          this rule handler
	 */
	one(rule) {
		const opt = (typeof rule === 'string' || (rule && rule.__elenpi__)) ? {
			rule
		} : rule;
		return this.done((env, descriptor) => {
			if (!opt.optional && !env.string.length) {
				env.error = true;
				return;
			}
			const newDescriptor = opt.as ? opt.as(env, descriptor) : (opt.set ? {} : descriptor),
				currentPosition = env.string.length;

			exec(opt.rule, newDescriptor, env);
			if (!env.error && !newDescriptor.skip && opt.set) {
				if (typeof opt.set === 'string')
					descriptor[opt.set] = newDescriptor;
				else
					opt.set(env, descriptor, newDescriptor);
			} else if (opt.optional && env.string.length === currentPosition)
				env.error = false;
		});
	}

	/**
	 * maybe match one element from string with provided rule
	 * @param  {Rule|Object} rule either a rule instance or an option object
	 * @return {Rule}          this rule handler
	 */
	maybeOne(rule) {
		const opt = (typeof rule === 'string' || (rule && rule.__elenpi__)) ? {
			rule
		} : rule;
		opt.optional = true;
		return this.one(opt);
	}

	/**
	 * skip current descriptor
	 * @return {Rule}          this rule handler
	 */
	skip() {
		return this.done((env, descriptor) => {
			descriptor.skip = true;
		});
	}

	/**
	 * match a space
	 * @param  {Boolean} needed true if space is needed. false otherwise.
	 * @return {Rule}          this rule handler
	 */
	space(needed = false) {
		return this.done((env) => {
			if (!env.string.length) {
				if (needed)
					env.error = true;
				return;
			}
			const cap = (env.parser.rules.space || defaultSpaceRegExp).exec(env.string);
			if (cap)
				env.string = env.string.substring(cap[0].length);
			else if (needed)
				env.error = true;
		});
	}

	/**
	 * match the end of string
	 * @return {Rule}          this rule handler
	 */
	end() {
		return this.done((env) => {
			if (env.string.length)
				env.error = true;
		});
	}

	/**
	 * force end parsing with error. Only aimed to be used in .oneOf().
	 * @param  {String} msg the error message.
	 * @return {Rule}          this rule handler
	 */
	error(msg) {
		return this.done((env) => {
			env.error = true;
			env.errorMessage = msg;
		});
	}
}


/**
 * rules initializer object
 * @public
 * @type {Object}
 */
const r = {};

Object.getOwnPropertyNames(Rule.prototype) // because Babel make prototype methods not enumerable
	.forEach((key) => {
		if (typeof Rule.prototype[key] === 'function')
			r[key] = function() {
				const r = new Rule();
				return r[key].apply(r, arguments);
			};
	});


export { Rule, r };
