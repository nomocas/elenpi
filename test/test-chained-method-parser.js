/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */

/* global describe, it */
import chai from 'chai';
// import elenpi from '../src/index.js';
import parser from '../src/examples/chained-methods-parser';

// const r = elenpi.r;
const expect = chai.expect;

describe("Chained Methods Parser", () => {
	describe("full chain", () => {

		const res = parser.parse("click ( '12', 14, true, blur(2, 4, hello( false).foo())). bar(12345)", 'calls');
		it("should", () => {
			expect(res).to.deep.equals({
				calls: [{
					method: "click",
					arguments: [{
						value: "12"
					}, {
						value: 14
					}, {
						value: true
					}, {
						calls: [{
							method: "blur",
							arguments: [{
								value: 2
							}, {
								value: 4
							}, {
								calls: [{
									method: "hello",
									arguments: [{
										value: false
									}]
								}, {
									method: "foo",
									arguments: [{}]
								}]
							}]
						}]
					}]
				}, {
					method: "bar",
					arguments: [{
						value: 12345
					}]
				}]
			});
		});
	});
});

