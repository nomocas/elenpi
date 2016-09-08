/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * elenpi v2

	//________ new api

	done(function(env, obj, string){
		//...
		return string || false;
	})
	terminal(regExp, name || function(env, obj, string, captured){
		//...
		return string || false;
	})
	char(test)
	optional(rule)
	end()

	one(rule || { 
		rule:rule, 
		?as:Class, 
		?set:'name' || function(env, parent, obj){ ... } 
	})
	zeroOrOne(rule || { 
		rule:rule, 
		?as:Class, 
		?set:'name' || function(env, parent, obj){ ... } 
	})
	oneOf([rules] || { 
		rules:[rules], 
		?as:Class, 
		?set:'name' || function(env, parent, obj){ ... } 
	})
	xOrMore({ 
		rule:rule,
		minimum:int,
		?as:Class,
		?pushTo:'name' || function(env, parent, obj){ ... },
		?separator:rule,
		?maximum:int 
	})


	V3 will be a Babelute with same api

 *
 * 
 */

(function() {
	var defaultSpaceRegExp = /^[\s\n\r]+/;

	function exec(rule, descriptor, env) {
		if (env.stop || env.error)
			return;
		if (typeof rule === 'string')
			rule = getRule(env.parser, rule);
		// Parser.counts.countExec++;
		var rules = rule._queue,
			current;
		for (var i = 0, len = rules.length; i < len; ++i) {
			current = rules[i];
			if (current.__elenpi__)
				exec(current, descriptor, env);
			else // is function
				current(env, descriptor);
			if (env.error)
				return;
			if (env.soFar > env.string.length)
				env.soFar = env.string.length;
			if (env.stop)
				return;
		}
	};

	function getRule(parser, name) {
		var r = parser.rules[name];
		if (!r)
			throw new Error('elenpi : rules not found : ' + rule);
		return r;
	}

	function Rule() {
		this._queue = [];
		this.__elenpi__ = true;
	};

	Rule.prototype = {
		// base for all rule's handlers
		done: function(callback) {
			this._queue.push(callback);
			return this;
		},
		// for debug purpose
		log: function(title) {
			title = title || '';
			return this.done(function(env, descriptor) {
				console.log("elenpi log : ", title, env, descriptor);
			});
		},
		use: function(rule) {
			var args = [].slice.call(arguments, 1);
			return this.done(function(env, descriptor) {
				if (typeof rule === 'string')
					rule = getRule(env.parser, rule);
				if (rule.__elenpi__) {
					exec(rule, descriptor, env);
					return;
				}
				var r = new Rule();
				rule.apply(r, args);
				exec(r, descriptor, env);
			});
		},
		optional: function(rule) {
			return this.done(function(env, descriptor) {
				var string = env.string;
				exec(rule, descriptor, env);
				if (env.error) {
					env.string = string;
					env.error = false;
				}
			});
		},
		terminal: function(reg, set) {
			return this.done(function(env, descriptor) {
				// console.log('terminal test : ', reg);
				if (!env.string.length) {
					env.error = true;
					return;
				}
				// Parser.counts.countTerminalTest++;
				var cap = reg.exec(env.string);
				// console.log('terminal : ', reg, cap);
				if (cap) {
					// Parser.counts.countTerminalMatched++;
					env.string = env.string.substring(cap[0].length);
					// console.log('terminal cap 0 length : ', cap[0].length);
					// console.log('terminal string length : ', string.length, cap[0]);
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
		},
		char: function(test) {
			return this.done(function(env, descriptor) {
				if (!env.string.length || env.string[0] !== test)
					env.error = true;
				else
					env.string = env.string.substring(1);
			});
		},
		xOrMore: function(rule) {
			var opt = (typeof rule === 'string' ||  rule.__elenpi__) ? { rule: rule } : rule;
			opt.minimum = opt.minimum || 0;
			opt.maximum = opt.maximum || Infinity;
			return this.done(function(env, descriptor) {
				var options = opt;
				if (!env.string.length && options.minimum > 0) {
					env.error = true;
					return;
				}
				var string = env.string,
					count = 0,
					rule = options.rule,
					pushTo = options.pushTo,
					pushToString = typeof pushTo === 'string',
					As = options.as,
					separator = options.separator,
					newDescriptor;
				// Parser.counts.countXorMore++;
				while (!env.error && env.string.length && count < options.maximum) {

					// Parser.counts.countXorMores++;

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
		},
		zeroOrMore: function(rule) {
			return this.xOrMore(rule);
		},
		oneOrMore: function(rule) {
			if (typeof rule === 'string' || rule.__elenpi__)
				rule = {
					rule: rule,
					minimum: 1
				}
			return this.xOrMore(rule);
		},
		zeroOrOne: function(rule) {
			var options = (typeof rule === 'string' ||  rule.__elenpi__) ? { rule: rule } : rule;
			return this.done(function(env, descriptor) {
				if (!env.string.length)
					return;
				// Parser.counts.countZeroOrOne++;
				var newDescriptor = options.as ? options.as(env, descriptor) : (options.set ? {} : descriptor);
				var string = env.string;
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
			});
		},
		oneOf: function(rules) {
			var opt = (typeof rules === 'string' || rules.__elenpi__) ? { rules: [].slice.call(arguments) } : rules;
			return this.done(function(env, descriptor) {
				if (!env.string.length) {
					env.error = true;
					return;
				}

				var options = opt,
					count = 0,
					len = options.rules.length,
					rule,
					newDescriptor,
					string = env.string;
				// Parser.counts.countOneOf++;
				while (count < len) {
					rule = options.rules[count];
					count++;
					// Parser.counts.countOneOfs++;
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
					env.string = string;
				}
				env.error = true;
			});
		},
		one: function(rule) {
			var opt = (typeof rule === 'string' ||  (rule && rule.__elenpi__)) ? { rule: rule } : rule;
			return this.done(function(env, descriptor) {
				if (!env.string.length) {
					env.error = true;
					return;
				}
				// Parser.counts.countOne++;
				var options = opt,
					newDescriptor = options.as ? options.as(env, descriptor) : (options.set ? {} : descriptor);
				exec(options.rule, newDescriptor, env);
				if (!env.error && !newDescriptor.skip && options.set) {
					if (typeof options.set === 'string')
						descriptor[options.set] = newDescriptor;
					else
						options.set(env, descriptor, newDescriptor);
				}
			});
		},
		skip: function() {
			return this.done(function(env, descriptor) {
				descriptor.skip = true;
			});
		},
		space: function(needed) {
			return this.done(function(env, descriptor) {
				if (!env.string.length) {
					if (needed)
						env.error = true;
					return;
				}
				var cap = (env.parser.rules.space || defaultSpaceRegExp).exec(env.string);
				if (cap)
					env.string = env.string.substring(cap[0].length);
				else if (needed)
					env.error = true;
			});
		},
		end: function(needed) {
			return this.done(function(env, descriptor) {
				if (!env.string.length)
					env.stop = true;
				else if (needed)
					env.error = true;
			});
		}
	};

	var Parser = function(rules, defaultRule) {
		this.rules = rules;
		this.defaultRule = defaultRule;
	};
	Parser.prototype = {
		exec: function(rule, descriptor, env) {
			exec(rule, descriptor, env);
		},
		parse: function(string, rule, descriptor, env) {
			env = env || {};
			descriptor = descriptor || {};
			env.parser = this;
			env.soFar = Infinity;
			env.string = string;
			if (!rule)
				rule = this.rules[this.defaultRule];
			exec(rule, descriptor, env);
			if (env.error || env.string.length) {
				var pos = string.length - env.soFar;
				// todo : catch line number
				console.error('elenpi parsing failed : (pos:' + pos + ') near :\n', string.substring(Math.max(pos - 1, 0), pos + 50));
				return false;
			}
			return descriptor;
		}
	};

	// 	Parser.counts = {
	// 	countTerminalTest: 0,
	// 	countTerminalMatched: 0,
	// 	countOneOf: 0,
	// 	countOneOfs: 0,
	// 	countExec: 0,
	// 	countXorMore: 0,
	// 	countXorMores: 0,
	// 	countZeroOrOne: 0,
	// 	countOne: 0
	// };

	var elenpi = {
		r: function() {
			return new Rule();
		},
		Rule: Rule,
		Parser: Parser
	};

	if (typeof module !== 'undefined' && module.exports)
		module.exports = elenpi; // use common js if avaiable
	else this.elenpi = elenpi; // assign to global window
})();
//___________________________________________________
