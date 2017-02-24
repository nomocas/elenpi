/**
 * For parsing strings like : 
 * click ( '12', 14, true, blur(2, 4, hello( false).foo())). bar(12345)
 */
(function() {
    if (typeof require !== 'undefined')
        elenpi = require('../index.js');

    var r = elenpi.r,
        Parser = elenpi.Parser;

    var rules = {
        doublestring: r.terminal(/^"([^"]*)"/, function(env, obj, cap) {
            obj.value = cap[1];
        }),
        singlestring: r.terminal(/^'([^']*)'/, function(env, obj, cap) {
            obj.value = cap[1];
        }),
        "float": r.terminal(/^[0-9]*\.[0-9]+/, function(env, obj, cap) {
            obj.value = parseFloat(cap[0], 10);
        }),
        integer: r.terminal(/^[0-9]+/, function(env, obj, cap) {
            obj.value = parseInt(cap[0], 10);
        }),
        bool: r.terminal(/^(true|false)/, function(env, obj, cap) {
            obj.value = (cap[1] === 'true') ? true : false;
        }),
        //_____________________________________
        calls: r
            .space()
            .zeroOrMore({
                pushTo:'calls',
                rule:'call',
                separator:r.terminal(/^\s*\.\s*/)
            }),

        call: r
            .terminal(/^([\w-_]+)\s*/, function(env, obj, cap) {
                obj.method = cap[1];
            })
            .zeroOrOne(
                r
                .terminal(/^\(\s*/)
                .zeroOrMore({ 
                    pushTo:'arguments',
                    rule:r.oneOf('integer', 'bool', 'singlestring', 'doublestring', 'calls'),
                    separator:r.terminal(/^\s*,\s*/)
                })
                .terminal(/^\s*\)/)
            )
    };
    var parser = new Parser(rules, 'calls');
    if (typeof module !== 'undefined' && module.exports)
        module.exports = parser;
    else
        elenpi.chainedMethodParser = parser;
})();
