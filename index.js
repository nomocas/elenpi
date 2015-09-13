(function() {
    var defaultSpaceRegExp = /^[\s\n\r]+/;

    function Elenpi() {
        this._queue = [];
        this.__lexer__ = true;
    };

    function exec(string, rule, descriptor, rules) {
        if (typeof rule === 'string')
            rule = rules[rule];
        var rules = rule._queue;
        for (var i = 0, len = rules.length; i < len && string; ++i) {
            var current = rules[i];
            if (current.__lexer__)
                string = exec(string, current, descriptor, rules);
            else // is function
                string = current.call(rules, string, descriptor);
            if (string === false)
                return false;
        }
        return string;
    };

    Elenpi.prototype = {
        exec: function(string, descriptor, rules) {
            return exec(string, this, descriptor, rules);
        },
        done: function(callback) {
            this._queue.push(callback);
            return this;
        },
        log: function(title) {
            title = title || '';
            return this.done(function(string, descriptor) {
                console.log("Elenpi.log : ", title, string, descriptor);
                return string;
            });
        },
        regExp: function(reg, optional, as) {
            return this.done(function(string, descriptor) {
                var cap = reg.exec(string);
                if (cap) {
                    if (as) {
                        if (typeof as === 'string')
                            descriptor[as] = cap[0];
                        else
                            as(descriptor, cap);
                    }
                    return string.substring(cap[0].length);
                }
                if (!optional)
                    return false;
                return string;
            });
        },
        char: function(test, optional) {
            return this.done(function(string, descriptor) {
                if (string[0] === test)
                    return string.substring(1);
                if (optional)
                    return string;
                return false;
            });
        },
        xOrMore: function(name, rule, separator, minimum) {
            minimum = minimum || 0;
            return this.done(function(string, descriptor) {
                var output = [];
                if (name) descriptor[name] = output;
                var newString = true,
                    count = 0;
                while (newString && string) {
                    var newDescriptor = name ? {} : descriptor;
                    newString = exec(string, rule, newDescriptor, this);
                    if (newString !== false) {
                        count++;
                        string = newString;
                        if (!newDescriptor.skip)
                            output.push(newDescriptor);
                        if (separator && string) {
                            var r = exec(string, separator, descriptor, this);
                            if (r !== false)
                                string = r;
                        }
                    }
                }
                if (count < minimum)
                    return false;
                return string;
            });
        },
        zeroOrMore: function(as, rule, separator) {
            return this.xOrMore(as, rule, separator, 0);
        },
        oneOrMore: function(as, rule, separator) {
            return this.xOrMore(as, rule, separator, 1);
        },
        zeroOrOne: function(as, rule) {
            if (arguments.length === 1) {
                rule = as;
                as = null;
            }
            return this.done(function(string, descriptor) {
                var newDescriptor = as ? {} : descriptor,
                    res = exec(string, rule, newDescriptor, this);
                if (res !== false) {
                    if (as)
                        descriptor[as] = newDescriptor;
                    string = res;
                }
                return string;
            });
        },
        oneOf: function(as, rules) {
            if (arguments.length === 1) {
                rules = as;
                as = null;
            }
            return this.done(function(string, descriptor) {
                var count = 0;
                while (count < rules.length) {
                    var newDescriptor = as ? {} : descriptor,
                        newString = exec(string, rules[count], newDescriptor, this);
                    if (newString !== false) {
                        if (as)
                            descriptor[as] = newDescriptor;
                        return newString;
                    }
                    count++;
                }
                return false;
            });
        },
        rule: function(name) {
            var rule;
            return this.done(function(string, descriptor) {
                if (!rule) {
                    rule = this[name];
                    if (!rule)
                        throw new Error('Elenpi rules not found : ', name);
                }
                return exec(string, rule, descriptor, this);
            });
        },
        skip: function() {
            return this.done(function(string, descriptor) {
                descriptor.skip = true;
                return string;
            });
        },
        space: function(needed) {
            return this.done(function(string, descriptor) {
                var cap = (this.space || defaultSpaceRegExp).exec(string);
                if (cap)
                    return string.substring(cap[0].length);
                else if (needed)
                    return false;
                return string;
            });
        },
        id: function(as, optional, lowerCase) {
            return this.regExp(this.id || /^[\w-_]+/, optional, (typeof as === 'function') ? as : function(descriptor, cap) {
                if (as)
                    if (lowerCase)
                        descriptor[as] = cap[0].toLowerCase();
                    else
                        descriptor[as] = cap[0];
            });
        }
    };

    Elenpi.exec = exec;

    Elenpi.l = function() {
        return new Elenpi();
    };

    if (typeof module !== 'undefined' && module.exports)
        module.exports = Elenpi; // use common js if avaiable
    else this.Elenpi = Elenpi; // assign to global window
})();
//___________________________________________________
