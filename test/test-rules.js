/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
/* global describe, it */
import chai from 'chai';
import elenpi from '../src/index.js';

const r = elenpi.r;
const expect = chai.expect;
chai.should();

describe("base rules", () => {
	describe("error", () => {

		const rules = {
			filters: r.terminal(/^a/)
		};
		const parser = new elenpi.Parser(rules, 'filters');

		it("should", () => {
			expect(parser.parse.bind(parser, 'b')).to.throws('Parsing failed : unknown : (line:1 , col:0) near :\n');
		});
	});
	describe(".done() after end of string", () => {

		const rules = {
			filters: r
				.space()
				.zeroOrMore({
					pushTo: 'filters',
					rule: r.terminal(/^[\w-_]+/, 'method'),
					separator: r.terminal(/^\s*\.\s*/)
				})
				.done((env, descriptor) => {
					descriptor.decorated = true;
				})
		};

		const parser = new elenpi.Parser(rules, 'filters');

		const res = parser.parse('hello.world');

		it("should", () => {
			expect(res).to.deep.equals({
				filters: [{
					method: "hello"
				}, {
					method: "world"
				}],
				decorated: true
			});
		});
	});
});

