/*
* @Author: Gilles Coomans
* @Date:   2017-02-10 23:04:13
* @Last Modified by:   Gilles Coomans
* @Last Modified time: 2017-02-24 01:33:57
*/


/*
 * @Author: Gilles Coomans
 * @Date:   2017-02-10 22:52:17
 * @Last Modified by:   Gilles Coomans
 * @Last Modified time: 2017-02-10 22:57:24
 */

/**
* @author Gilles Coomans <gilles.coomans@gmail.com>
* elenpi v2

//________ new api

done(function(env, obj){
//...
env.string
})
terminal(regExp, name || function(env, obj, captured){
//...
env.string
})
char(test)
optional(rule)
end()

one(rule || { 
rule:rule, 
?as:function(){ return Instance }, 
?set:'name' || function(env, parent, obj){ ... } 
})
zeroOrOne(rule || { 
rule:rule, 
?as:function(){ return Instance }, 
?set:'name' || function(env, parent, obj){ ... } 
})
oneOf(...rules || { 
rules:[rules], 
?as:function(){ return Instance }, 
?set:'name' || function(env, parent, obj){ ... } 
})
xOrMore({ 
rule:rule,
minimum:int,
?as:function(){ return Instance }, 
?pushTo:'name' || function(env, parent, obj){ ... },
?separator:rule,
?maximum:int 
})


V3 will be a Babelute with same api

*
* 
*/

const defaultSpaceRegExp = /^[\s\n\r]+/;

class Rule {

	constructor() {
		this._queue = [];
		this.__elenpi__ = true;
	}

	// base for all rule's handlers
	done(callback) {
		this._queue.push(callback);
		return this;
	}

	// for debug purpose
	log(title) {
		title = title || '';
		return this.done((env, descriptor) => {
			console.log("elenpi log : ", title, env, descriptor); // eslint-disable-line no-console
		});
	}

	use(rule) {
		const args = [].slice.call(arguments, 1);
		return this.done((env, descriptor) => {
			if (typeof rule === 'string')
				rule = getRule(env.parser, rule);
			if (rule.__elenpi__) {
				exec(rule, descriptor, env);
				return;
			}
			const r = new Rule();
			rule.apply(r, args);
			exec(r, descriptor, env);
		});
	}

	optional(rule) {
		return this.done((env, descriptor) => {
			const string = env.string;
			exec(rule, descriptor, env);
			if (env.error) {
				env.string = string;
				env.error = false;
				env.errors = null;
			}
		});
	}

	terminal(reg, set) {
		return this.done((env, descriptor) => {
			if (env.debug)
				console.log('debug:elenpi:terminal : ', reg, descriptor, env.string); // eslint-disable-line no-console
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
				return;
			}
			env.error = true;
		});
	}

	char(test) {
		return this.done((env, descriptor) => {
			if (env.debug)
				console.log('debug:elenpi:char : ', test, descriptor, env.string); // eslint-disable-line no-console
			if (!env.string.length || env.string[0] !== test)
				env.error = true;
			else
				env.string = env.string.substring(1);
		});
	}

	xOrMore(rule) {
		const opt = (typeof rule === 'string' || rule.__elenpi__) ? {
			rule
		} : rule;
		opt.minimum = opt.minimum || 0;
		opt.maximum = opt.maximum || Infinity;
		return this.done((env, descriptor) => {
			const options = opt;
			if (env.debug)
				console.log('debug:elenpi:xOrMore : ', options, descriptor, env.string); // eslint-disable-line no-console
			if (!env.string.length && options.minimum > 0) {
				env.error = true;
				return;
			}
			const string = env.string,
				rule = options.rule,
				pushTo = options.pushTo,
				pushToString = typeof pushTo === 'string',
				As = options.as,
				separator = options.separator;
			let count = 0,
				newDescriptor;
			while (!env.error && env.string.length && count < options.maximum) {
				newDescriptor = As ? As(env, descriptor) : (pushTo ? {} : descriptor);
				exec(rule, newDescriptor, env);

				if (env.error)
					break;

				count++;

				if (!newDescriptor.skip && pushTo)
					if (pushToString) {
						descriptor[pushTo] = descriptor[pushTo] || [];
						descriptor[pushTo].push(newDescriptor);
					} else
						pushTo(env, descriptor, newDescriptor);

				if (separator && env.string.length)
					exec(separator, newDescriptor, env);
			}
			env.error = (count < options.minimum);
			if (!count)
				env.string = string;
		});
	}

	zeroOrMore(rule) {
		return this.xOrMore(rule);
	}

	oneOrMore(rule) {
		if (typeof rule === 'string' || rule.__elenpi__)
			rule = {
				rule,
				minimum: 1
			};
		return this.xOrMore(rule);
	}

	zeroOrOne(rule) {
		const options = (typeof rule === 'string' || rule.__elenpi__) ? {
			rule
		} : rule;
		return this.done((env, descriptor) => {
			if (env.debug)
				console.log('debug:elenpi:zeroOrOne : ', options, descriptor, env.string); // eslint-disable-line no-console
			if (!env.string.length)
				return;
			const newDescriptor = options.as ? options.as(env, descriptor) : (options.set ? {} : descriptor);
			const string = env.string;
			exec(options.rule, newDescriptor, env);
			if (!env.error) {
				if (!newDescriptor.skip && options.set) {
					if (typeof options.set === 'string')
						descriptor[options.set] = newDescriptor;
					else
						options.set(env, descriptor, newDescriptor);
				}
				return;
			}
			env.string = string;
			env.error = false;
			env.errors = null;
		});
	}

	oneOf(rules) {
		const opt = (typeof rules === 'string' || rules.__elenpi__) ? {
			rules: [].slice.call(arguments)
		} : rules;
		return this.done((env, descriptor) => {
			if (env.debug)
				console.log('debug:elenpi:oneOf ', opt, descriptor, env.string); // eslint-disable-line no-console
			if (!env.string.length) {
				env.error = true;
				return;
			}

			const options = opt,
				len = options.rules.length,
				string = env.string;
			let count = 0,
				rule,
				newDescriptor;
			while (count < len) {
				rule = options.rules[count];
				count++;
				newDescriptor = options.as ? options.as(env, descriptor) : (options.set ? {} : descriptor);
				exec(rule, newDescriptor, env);
				if (!env.error) {
					if (!newDescriptor.skip && options.set) {
						if (typeof options.set === 'string')
							descriptor[options.set] = newDescriptor;
						else
							options.set(env, descriptor, newDescriptor);
					}
					return;
				}
				env.error = false;
				env.errors = null;
				env.string = string;
			}
			env.error = true;
		});
	}

	one(rule) {
		const opt = (typeof rule === 'string' || (rule && rule.__elenpi__)) ? {
			rule
		} : rule;
		return this.done((env, descriptor) => {
			if (env.debug)
				console.log('debug:elenpi:one : ', opt, descriptor, env.string); // eslint-disable-line no-console
			if (!env.string.length) {
				env.error = true;
				return;
			}
			const options = opt,
				newDescriptor = options.as ? options.as(env, descriptor) : (options.set ? {} : descriptor);
			exec(options.rule, newDescriptor, env);
			if (!env.error && !newDescriptor.skip && options.set) {
				if (typeof options.set === 'string')
					descriptor[options.set] = newDescriptor;
				else
					options.set(env, descriptor, newDescriptor);
			}
		});
	}

	skip() {
		return this.done((env, descriptor) => {
			descriptor.skip = true;
		});
	}

	space(needed) {
		return this.done((env, descriptor) => {
			if (env.debug)
				console.log('debug:elenpi:space', descriptor, env.string); // eslint-disable-line no-console
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

	end(needed) {
		return this.done((env, descriptor) => {
			if (env.debug)
				console.log('debug:elenpi:end', descriptor, env.string); // eslint-disable-line no-console
			if (!env.string.length)
				env.stop = true;
			else if (needed)
				env.error = true;
		});
	}
};

class Parser {
	constructor(rules, defaultRule) {
		this.rules = rules;
		this.defaultRule = defaultRule;
	}
	exec(rule, descriptor, env) {
		exec(rule, descriptor, env);
	}
	parse(string, rule, descriptor, env) {
		env = env || {};
		descriptor = descriptor || {};
		env.parser = this;
		env.soFar = Infinity;
		env.string = string;
		if (!rule)
			rule = this.rules[this.defaultRule];
		exec(rule, descriptor, env);
		if (env.error || env.string.length) {
			const pos = string.length - env.soFar;
			// todo : catch line number
			console.error('elenpi parsing failed : (pos:' + pos + ') near :\n', string.substring(Math.max(pos - 1, 0), pos + 50)); // eslint-disable-line no-console
			return false;
		}
		return descriptor;
	}
}

const initializer = {};
Object.keys(Rule.prototype).forEach((key) => {
	initializer[key] = function() {
		const r = new Rule();
		return r[key].apply(r, arguments);
	};
});

function exec(rule, descriptor, env) {
	// if (env.debug)
	// console.log('debug:elenpi:exec : ', rule, descriptor, env.string, env.stop, env.error);
	if (env.stop || env.error)
		return;
	if (typeof rule === 'string')
		rule = getRule(env.parser, rule);

	const rules = rule._queue;
	let current;
	for (let i = 0, len = rules.length; i < len; ++i) {
		current = rules[i];
		if (current.__elenpi__)
			exec(current, descriptor, env);
		else { // is function
			current(env, descriptor);
		}
		if (env.error) {
			// if (env.debug)
			// console.log('debug:elenpi:exec : error : ', descriptor, env.error, env.soFar, env.string);
			return;
		}
		if (env.soFar > env.string.length)
			env.soFar = env.string.length;
		if (env.stop)
			return;
	}
}

function getRule(parser, name) {
	const r = parser.rules[name];
	if (!r)
		throw new Error('elenpi : rules not found : ' + name);
	return r;
}

const elenpi = {
	r: initializer,
	exec,
	Rule,
	Parser
};

export default elenpi;

