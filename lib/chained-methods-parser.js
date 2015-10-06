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
        doublestring: r().regExp(/^"([^"]*)"/, false, function(descriptor, cap) {
            descriptor.value = cap[1];
        }),
        singlestring: r().regExp(/^'([^']*)'/, false, function(descriptor, cap) {
            descriptor.value = cap[1];
        }),
        "float": r().regExp(/^[0-9]*\.[0-9]+/, false, function(descriptor, cap) {
            descriptor.value = parseFloat(cap[0], 10);
        }),
        integer: r().regExp(/^[0-9]+/, false, function(descriptor, cap) {
            descriptor.value = parseInt(cap[0], 10);
        }),
        bool: r().regExp(/^(true|false)/, false, function(descriptor, cap) {
            descriptor.value = (cap[1] === 'true') ? true : false;
        }),
        //_____________________________________
        calls: r()
            .space()
            .zeroOrMore('calls',
                'call',
                r().regExp(/^\s*\.\s*/)
            ),

        call: r()
            .regExp(/^([\w-_]+)\s*/, false, function(descriptor, cap) {
                descriptor.method = cap[1];
            })
            .zeroOrOne(
                r()
                .regExp(/^\(\s*/)
                .zeroOrMore('arguments',
                    r().oneOf(['integer', 'bool', 'singlestring', 'doublestring', 'calls']),
                    r().regExp(/^\s*,\s*/)
                )
                .regExp(/^\s*\)/)
            )
    };
    var parser = new Parser(rules, 'calls');
    if (typeof module !== 'undefined' && module.exports)
        module.exports = parser;
    else
        elenpi.chainedMethodParser = parser;
})();
