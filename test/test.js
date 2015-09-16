/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
if (typeof require !== 'undefined')
	var chai = require("chai"),
		elenpi = require("../index"),
		r = elenpi.r;
else
	var r = elenpi.r;

var expect = chai.expect;

describe(".done() after end of string", function() {


	var rules = {
		filters: r()
			.space()
			.zeroOrMore('filters',
				r().regExp(/^[\w-_]+/, false, 'method'),
				r().regExp(/^\s*\.\s*/)
			)
			.done(function(string, descriptor) {
				descriptor.decorated = true;
				return string;
			})
	};

	var parser = new elenpi.Parser(rules, 'filters');

	var res = parser.parse('hello.world');

	it("should", function() {
		expect(res).to.deep.equals({
			"filters": [{
				method: "hello"
			}, {
				method: "world"
			}],
			decorated: true
		});
	});

});
