/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
if (typeof require !== 'undefined')
	var chai = require("chai"),
		parser = require("../lib/chained-methods-parser.js");

var expect = chai.expect;

describe("Chained Methods Parser", function() {
	describe("full chain", function() {

		var res = parser.parse("click ( '12', 14, true, blur(2, 4, hello( false).foo())). bar(12345)", 'calls');
		it("should", function() {
			expect(res).to.deep.equals({
				"calls": [{
					"method": "click",
					"arguments": [{
						"value": "12"
					}, {
						"value": 14
					}, {
						"value": true
					}, {
						"calls": [{
							"method": "blur",
							"arguments": [{
								"value": 2
							}, {
								"value": 4
							}, {
								"calls": [{
									"method": "hello",
									"arguments": [{
										"value": false
									}]
								}, {
									"method": "foo",
									"arguments": [{}]
								}]
							}]
						}]
					}]
				}, {
					"method": "bar",
					"arguments": [{
						"value": 12345
					}]
				}]
			});
		});
	});
});
