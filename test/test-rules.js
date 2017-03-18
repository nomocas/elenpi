/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
/* global describe, it */
import chai from 'chai';
import elenpi from '../src/index.js';

const r = elenpi.Rule.initializer;
const expect = chai.expect;
chai.should();

describe("base rules", () => {

	describe("when parsing failed ", () => {

		const rules = {
			a: r.terminal(/^a/)
		};
		const parser = new elenpi.Parser(rules, 'a');

		it("should throw whith an error containing line-col numbers", () => {
			expect(parser.parse.bind(parser, 'b')).to.throws('Parsing failed : no rules matched : (line:1 , col:0) near :\n');
		});
	});

	describe("use a rule by string reference", () => {

		const rules = {
			a: r.terminal(/^a/),
			b: r.use('a')
		};
		const parser = new elenpi.Parser(rules, 'b');

		it("should parse correctly", () => {
			expect(parser.parse('a')).to.deep.equals({});
		});
	});

	describe("use a rule by ref", () => {

		const rules = {
			a: r.terminal(/^a/)
		};
		rules.b = r.use(rules.a);

		const parser = new elenpi.Parser(rules, 'b');

		it("should parse correctly", () => {
			expect(parser.parse('a')).to.deep.equals({});
		});
	});

	describe("oneOrMore that push to string ref", () => {

		const rules = {
			a: r.terminal(/^a/,  (env, obj, cap) => obj.cap = cap[0])
		};
		rules.b = r.oneOrMore({ rule: rules.a, pushTo: 'children' });

		const parser = new elenpi.Parser(rules, 'b');

		it("should parse correctly and produce an array containing catched children", () => {
			expect(parser.parse('aaa')).to.deep.equals({ children:[{cap:'a'},{cap:'a'},{cap:'a'}]});
		});
	});

	describe("skip rules", () => {

		const rules = {
			a: r.terminal(/^a/,  (env, obj, cap) => obj.captured = cap[0]).skip()
		};
		rules.b = r.oneOrMore({ rule: rules.a, pushTo: 'children' });

		const parser = new elenpi.Parser(rules, 'b');

		it("should parse correctly and has no effect", () => {
			expect(parser.parse('aaa')).to.deep.equals({});
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

