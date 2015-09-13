/**
 * For parsing strings like : 
 * click ( '12', 14, true, blur(2, 4, hello( false).foo())). bar(12345)
 */

var l = require('../index.js').l;

module.exports = {
    doublestring: l().regExp(/^"([^"]*)"/, false, function(descriptor, cap) {
        descriptor.value = cap[1];
    }),
    singlestring: l().regExp(/^'([^']*)'/, false, function(descriptor, cap) {
        descriptor.value = cap[1];
    }),
    "float": l().regExp(/^[0-9]*\.[0-9]+/, false, function(descriptor, cap) {
        descriptor.value = parseFloat(cap[0], 10);
    }),
    integer: l().regExp(/^[0-9]+/, false, function(descriptor, cap) {
        descriptor.value = parseInt(cap[0], 10);
    }),
    bool: l().regExp(/^(true|false)/, false, function(descriptor, cap) {
        descriptor.value = (cap[1] === 'true') ? true : false;
    }),
    //_____________________________________
    calls: l()
        .space()
        .zeroOrMore('calls',
            'call',
            l().regExp(/^\s*\.\s*/)
        ),

    call: l()
        .regExp(/^([\w-_]+)\s*/, false, function(descriptor, cap) {
            descriptor.method = cap[1];
        })
        .zeroOrOne(
            l()
            .regExp(/^\(\s*/)
            .zeroOrMore('arguments',
                l().oneOf(['integer', 'bool', 'singlestring', 'doublestring', 'calls']),
                l().regExp(/^\s*,\s*/)
            )
            .regExp(/^\s*\)/)
        )
};
