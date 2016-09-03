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

	function exec(string, rule, descriptor, parser, env) {
		if (typeof rule === 'string')
			rule = parser.rules[rule];
		var rules = rule._queue;
		for (var i = 0, len = rules.length; i < len; ++i) {
			var current = rules[i];
			if (current.__elenpi__)
				string = exec(string, current, descriptor, parser, env);
			else // is function
				string = current.call(parser, env, descriptor, string);
			if (string === false)
				return false;
			env.soFar = string.length;
		}
		return string;
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
			return this.done(function(env, descriptor, string) {
				console.log("elenpi log : ", title, string, descriptor);
				return string;
			});
		},
		use: function(rule) {
			var args = [].slice.call(arguments, 1);
			return this.done(function(env, descriptor, string) {
				if (typeof rule === 'string')
					rule = getRule(this, rule);
				if (rule.__elenpi__)
					return exec(string, rule, descriptor, this, env);
				var r = new Rule();
				rule.apply(r, args);
				return exec(string, r, descriptor, this, env);
			});
		},
		optional: function(rule) {
			return this.done(function(env, descriptor, string) {
				if (typeof rule === 'string')
					rule = getRule(this, rule);
				var newString = exec(string, rule, descriptor, this, env);
				return newString === false ? string : newString;
			});
		},
		terminal: function(reg, set) {
			return this.done(function(env, descriptor, string) {
				if (!string)
					return false;
				var cap = reg.exec(string);
				if (cap) {
					if (set) {
						if (typeof set === 'string')
							descriptor[set] = cap[0];
						else
							return set.call(this, env, descriptor, string.substring(cap[0].length), cap);
					}
					return string.substring(cap[0].length);
				}
				return false;
			});
		},
		char: function(test) {
			return this.done(function(env, descriptor, string) {
				if (!string)
					return false;
				if (string[0] === test)
					return string.substring(1);
				return false;
			});
		},
		xOrMore: function(rule) {
			var options = (typeof rule === 'string' ||  rule.__elenpi__) ? { rule: rule } : rule;
			options.minimum = options.minimum || 0;
			return this.done(function(env, descriptor, string) {
				if (typeof options.rule === 'string')
					options.rule = getRule(this, options.rule);
				var newString = true,
					count = 0;
				while (newString && string) {
					if (options.maximum && options.maximum === count)
						break;
					var newDescriptor = options.as ? options.as(env, descriptor) : (options.pushTo ? {} : descriptor);
					newString = exec(string, options.rule, newDescriptor, this, env);
					if (newString !== false) {
						count++;
						string = newString;
						if (!newDescriptor.skip && options.pushTo)
							if (typeof options.pushTo === 'string') {
								descriptor[options.pushTo] = descriptor[options.pushTo] || [];
								descriptor[options.pushTo].push(newDescriptor);
							} else
								options.pushTo(env, descriptor, newDescriptor);
						if (options.separator && string) {
							newString = exec(string, options.separator, newDescriptor, this, env);
							if (newString !== false)
								string = newString;
						}
					}
				}
				if (count < options.minimum)
					return false;
				return string;
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
			return this.done(function(env, descriptor, string) {
				if (typeof options.rule === 'string')
					options.rule = getRule(this, options.rule);
				var newDescriptor = options.as ? options.as(env, descriptor) : (options.set ? {} : descriptor),
					res = exec(string, options.rule, newDescriptor, this, env);
				if (res !== false) {
					if (!newDescriptor.skip && options.set) {
						if (typeof options.set === 'string')
							descriptor[options.set] = newDescriptor;
						else
							options.set(env, descriptor, newDescriptor);
					}
					string = res;
				}
				return string;
			});
		},
		oneOf: function(rules) {
			var options = (typeof rules === 'string' || rules.__elenpi__) ? { rules: [].slice.call(arguments) } : rules;
			return this.done(function(env, descriptor, string) {
				if (!string)
					return false;
				var count = 0;
				while (count < options.rules.length) {
					var rule = options.rules[count];
					if (typeof rule === 'string')
						rule = getRule(this, rule);
					var newDescriptor = options.as ? options.as(env, descriptor) : (options.set ? {} : descriptor),
						newString = exec(string, rule, newDescriptor, this, env);
					if (newString !== false) {
						if (!newDescriptor.skip && options.set) {
							if (typeof options.set === 'string')
								descriptor[options.set] = newDescriptor;
							else
								options.set(env, descriptor, newDescriptor);
						}
						return newString;
					}
					count++;
				}
				return false;
			});
		},
		one: function(rule) {
			var options = (typeof rule === 'string' ||  (rule && rule.__elenpi__)) ? { rule: rule } : rule;
			return this.done(function(env, descriptor, string) {
				if (typeof options.rule === 'string')
					options.rule = getRule(this, options.rule);
				var newDescriptor = options.as ? options.as(env, descriptor) : (options.set ? {} : descriptor),
					newString = exec(string, options.rule, newDescriptor, this, env);
				if (newString !== false && !newDescriptor.skip && options.set) {
					if (typeof options.set === 'string')
						descriptor[options.set] = newDescriptor;
					else
						options.set(env, descriptor, newDescriptor);
				}
				return newString;
			});
		},
		skip: function() {
			return this.done(function(env, descriptor, string) {
				descriptor.skip = true;
				return string;
			});
		},
		space: function(needed) {
			return this.done(function(env, descriptor, string) {
				if (!string)
					if (needed)
						return false;
					else
						return string;
				var cap = (this.rules.space || defaultSpaceRegExp).exec(string);
				if (cap)
					return string.substring(cap[0].length);
				else if (needed)
					return false;
				return string;
			});
		},
		end: function(needed) {
			return this.done(function(env, descriptor, string) {
				if (!string || !needed)
					return string;
				return false;
			});
		}
	};

	var Parser = function(rules, defaultRule) {
		this.rules = rules;
		this.defaultRule = defaultRule;
	};
	Parser.prototype = {
		exec: function(string, descriptor, rule, env) {
			env = env || {};
			if (!rule)
				rule = this.rules[this.defaultRule];
			return exec(string, rule, descriptor, this, env);
		},
		parse: function(string, rule, descriptor, env) {
			env = env || {};
			descriptor = descriptor || {};
			var ok = this.exec(string, descriptor, rule, env);
			if (ok === false || (ok && ok.length > 0)) {
				var pos = string.length - env.soFar;
				// todo : catch line number
				console.error('elenpi parsing failed : (pos:' + pos + ') near :\n', string.substring(Math.max(pos - 1, 0), pos + 50));
				return false;
			}
			return descriptor;
		}
	};

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
