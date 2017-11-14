/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
/* global describe, it */
import chai from 'chai';
import elenpi from '../src/index';

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
			expect(parser.parse.bind(parser, 'b')).to.throws('Parsing failed : no rules matched : (line:1 , col:0) near : b');
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

	describe("use a rule by object ref", () => {

		const rules = {
			a: r.terminal(/^a/)
		};
		rules.b = r.use(rules.a);

		const parser = new elenpi.Parser(rules, 'b');

		it("should parse correctly", () => {
			expect(parser.parse('a')).to.deep.equals({});
		});
	});

	describe("use a missing rule by string ref", () => {
		const rules = {
			b: r.use('a')
		};
		const parser = new elenpi.Parser(rules, 'b');

		it("should throw a MissingRule Error", () => {
			expect(parser.parse.bind(parser, 'a')).to.throw('elenpi parser : rules not found : a');
		});
	});

	describe("oneOrMore that push to string ref", () => {

		const rules = {
			a: r.terminal(/^a/, (env, obj, cap) => obj.cap = cap[0])
		};
		rules.b = r.oneOrMore({ rule: rules.a, pushTo: 'children' });

		const parser = new elenpi.Parser(rules, 'b');

		it("should parse correctly and produce an array containing catched children", () => {
			expect(parser.parse('aaa')).to.deep.equals({ children: [{ cap: 'a' }, { cap: 'a' }, { cap: 'a' }] });
		});
	});

	describe("skip rules", () => {

		const rules = {
			a: r.terminal(/^a/, (env, obj, cap) => obj.captured = cap[0]).skip()
		};
		rules.b = r.oneOrMore({ rule: rules.a, pushTo: 'children' });

		const parser = new elenpi.Parser(rules, 'b');

		it("should parse correctly and has no effect", () => {
			expect(parser.parse('aaa')).to.deep.equals({});
		});
	});

	describe("terminal rule", () => {

		const rules = {
			a: r.terminal(/^aaa/, (env, obj, cap) => obj.captured = cap[0])
		};

		const parser = new elenpi.Parser(rules, 'a');

		it("should parse correctly and catch value", () => {
			expect(parser.parse('aaa')).to.deep.equals({ captured: 'aaa' });
		});
	});
	describe("end rule", () => {

		const rules = {
			a: r.end()
		};

		const parser = new elenpi.Parser(rules, 'a');

		it("should parse correctly", () => {
			expect(parser.parse('')).to.deep.equals({});
		});
	});

	describe("terminal rule that fail because no string to parse", () => {

		const rules = {
			a: r.terminal(/^a/),
			b: r.terminal(/^b/),
			c: r.use('a').use('b')
		};

		const parser = new elenpi.Parser(rules, 'c');

		it("should throw", () => {
			expect(parser.parse.bind(parser, 'a')).to.throw('Parsing failed : no rules matched : (line:1 , col:1) near : a');
		});
	});

	describe("needed space", () => {

		const rules = {
			a: r.terminal(/^a/).space(true).terminal(/^b/),
		};

		const parser = new elenpi.Parser(rules, 'a');

		it("should parse correctly", () => {
			expect(parser.parse('a  b')).to.deep.equals({});
		});
	});

	describe("needed space fail", () => {

		const rules = {
			a: r.terminal(/^a/).space(true).terminal(/^b/),
		};

		const parser = new elenpi.Parser(rules, 'a');

		it("should throw", () => {
			expect(parser.parse.bind(parser, 'ab')).to.throw('Parsing failed : no rules matched : (line:1 , col:1) near : ab');
		});
	});

	describe("needed space fail because no more string", () => {

		const rules = {
			a: r.terminal(/^a/).space(true),
		};

		const parser = new elenpi.Parser(rules, 'a');

		it("should throw", () => {
			expect(parser.parse.bind(parser, 'a')).to.throw('Parsing failed : no rules matched : (line:1 , col:1) near : a');
		});
	});

	describe("terminal rule that fail because no end when needed", () => {

		const rules = {
			a: r.terminal(/^a/).end().terminal(/^b/)
		};

		const parser = new elenpi.Parser(rules, 'a');

		it("should parse correctly and catch value", () => {
			expect(parser.parse.bind(parser, 'ab')).to.throw('Parsing failed : no rules matched : (line:1 , col:1) near : a');
		});
	});

	describe("multiple terminal rule", () => {

		const rules = {
			a: r.terminal(/^a/),
			b: r.terminal(/^b/),
			c: r.terminal(/^c/),
			d: r.one('a').one('b').one('c')
		};

		const parser = new elenpi.Parser(rules, 'd');

		it("should parse", () => {
			expect(parser.parse('abc')).to.deep.equals({});
		});
	});


	describe("multiple terminal rule that fail", () => {

		const rules = {
			a: r.terminal(/^a/),
			b: r.terminal(/^b/),
			c: r.terminal(/^c/),
			d: r.one('a').one('b').one('c')
		};

		const parser = new elenpi.Parser(rules, 'd');

		it("should fail", () => {
			expect(parser.parse.bind(parser, 'aba')).to.throw('Parsing failed : no rules matched : (line:1 , col:2) near : aba');
		});
	});
	describe("multiple terminal rule that fail on line other line than 1", () => {

		const rules = {
			a: r.terminal(/^a\n/),
			b: r.terminal(/^b\n/),
			c: r.terminal(/^c/),
			d: r.one('a').one('b').one('c')
		};

		const parser = new elenpi.Parser(rules, 'd');

		it("should fail", () => {
			expect(parser.parse.bind(parser, 'a\nb\na')).to.throw('Parsing failed : no rules matched : (line:4 , col:1) near : a\nb\na');
		});
	});

	describe("still string to parse after parsing", () => {

		const rules = {
			a: r.terminal(/^a/, (env, obj, cap) => obj.captured = cap[0])
		};

		const parser = new elenpi.Parser(rules, 'a');

		it("should parse correctly and catch value", () => {
			expect(parser.parse.bind(parser, 'aaa')).to.throw('Parsing failed : string wasn\'t parsed entierly : (line:1 , col:1) near : aaa');
		});
	});

	describe("onOrMore rule", () => {

		const rules = {
			a: r.terminal(/^a/, (env, obj, cap) => obj.captured = cap[0])
		};
		rules.b = r.oneOrMore({ rule: rules.a, pushTo: 'children' });

		const parser = new elenpi.Parser(rules, 'b');

		it("should parse correctly and has no effect", () => {
			expect(parser.parse('aaa')).to.deep.equals({ children: [{ captured: 'a' }, { captured: 'a' }, { captured: 'a' }] });
		});
	});


	describe("onOrMore rule with pushTo as function", () => {

		const rules = {
			a: r.terminal(/^a/, (env, obj, cap) => obj.captured = cap[0])
		};
		rules.b = r.oneOrMore({ rule: 'a', pushTo: (env, parent, descriptor) => ((parent.children = parent.children || []) && parent.children.push(descriptor)) });

		const parser = new elenpi.Parser(rules, 'b');

		it("should parse correctly and has no effect", () => {
			expect(parser.parse('aaa')).to.deep.equals({ children: [{ captured: 'a' }, { captured: 'a' }, { captured: 'a' }] });
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

