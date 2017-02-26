/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */

/* global describe, it */
import chai from 'chai';
// import elenpi from '../src/index.js';
import parser from '../src/examples/html-tokenizer.js';

// const r = elenpi.r;
const expect = chai.expect;
chai.should();

describe("HTML5 parse", () => {
	describe("tag", () => {
		const res = parser.parse('<div></div>', 'tag');
		it("should", () => {
			expect(res).to.deep.equals({
				tagName: "div"
			});
		});
	});

	describe("self closed tag", () => {
		const res = parser.parse('<div/>', 'tag');
		it("should", () => {
			expect(res).to.deep.equals({
				tagName: "div"
			});
		});
	});

	describe("unstrict self-closing tag", () => {
		const res = parser.parse('<br>', 'tag');
		it("should", () => {
			expect(res).to.deep.equals({
				tagName: "br"
			});
		});
	});

	describe("open tag", () => {
		const res = parser.parse('<meta>', 'tag');
		it("should", () => {
			expect(res).to.deep.equals({
				tagName: "meta"
			});
		});
	});
	describe("open tag + closed just after", () => {
		const res = parser.parse('<meta><title>ho</title>', 'children');
		it("should", () => {
			expect(res).to.deep.equals({
				children: [{
					tagName: "meta"
				}, {
					children: [{
						textValue: "ho"
					}],
					tagName: "title"
				}]
			});
		});
	});
	describe("tag with text content", () => {
		const res = parser.parse('<div>hello</div>', 'tag');
		it("should", () => {
			expect(res).to.deep.equals({
				tagName: "div",
				children: [{
					textValue: "hello"
				}]
			});
		});
	});


	describe("tag with attributes", () => {
		const res = parser.parse('<div class="hello" id=reu></div>', 'tag');
		it("should", () => {
			expect(res).to.deep.equals({
				tagName: "div",
				attributes: {
					id: "reu"
				},
				classes: ["hello"]
			});
		});
	});

	describe("tag with children", () => {
		const res = parser.parse('<div>hello <span>John</span></div>', 'tag');
		it("should", () => {
			expect(res).to.deep.equals({
				tagName: "div",
				children: [{
					textValue: "hello "
				}, {
					tagName: "span",
					children: [{
						textValue: "John"
					}]
				}]
			});
		});
	});

	describe("tag with children with new line and tab", () => {
		const res = parser.parse('<div>hello \n\t<span>John</span>\n</div>', 'tag');
		it("should", () => {
			expect(res).to.deep.equals({
				tagName: "div",
				children: [{
					textValue: "hello \n\t"
				}, {
					tagName: "span",
					children: [{
						textValue: "John"
					}]
				}]
			});
		});
	});

	describe("tag with script", () => {
		const res = parser.parse('<div>hello <script>var a = 12 < 15;</script></div>', 'tag');
		it("should", () => {
			expect(res).to.deep.equals({
				tagName: "div",
				children: [{
					textValue: "hello "
				}, {
					tagName: "script",
					rawContent: "var a = 12 < 15;"
				}]
			});
		});
	});

	describe("tag with script with new line", () => {
		const res = parser.parse('<div>hello <script>var a = 12 < 15;\nvar b = 0; </script></div>', 'tag');
		it("should", () => {
			expect(res).to.deep.equals({
				tagName: "div",
				children: [{
					textValue: "hello "
				}, {
					tagName: "script",
					rawContent: "var a = 12 < 15;\nvar b = 0; "
				}]
			});
		});
	});

	describe("comment", () => {
		const res = parser.parse('<!-- bloupi -->', 'comment');
		it("should", () => {
			expect(res).to.deep.equals({ comment: " bloupi " });
		});
	});

	describe("comment with new line", () => {
		const res = parser.parse('<!-- \rbloupi\n -->', 'comment');
		it("should", () => {
			expect(res).to.deep.equals({ comment: ' \rbloupi\n ' });
		});
	});

	describe("full line", () => {
		const text = '<div id="hello" class=reu >foo <br> <!-- hello \n--> <span class="blu" > bar </span></div><home /> hello <script type="text/javascript">var a = 12, \nb = a < 14;</script>';
		const res = parser.parse(text, 'children');
		it("should", () => {
			expect(res).to.deep.equals({
				children: [{
					tagName: "div",
					attributes: {
						id: "hello"
					},
					classes: ["reu"],
					children: [{
						textValue: "foo "
					}, {
						tagName: "br"
					}, {
						comment: " hello \n"
					}, {
						tagName: "span",
						classes: ["blu"],
						children: [{
							textValue: " bar "
						}]
					}]
				}, {
					tagName: "home"
				}, {
					textValue: " hello "
				}, {
					tagName: "script",
					attributes: {
						type: "text/javascript"
					},
					rawContent: "var a = 12, \nb = a < 14;"
				}]
			});
		});
	});



	describe("document", () => {
		// from elenpi/index.html (mocha tests index for browser)
		const doc = `<!DOCTYPE html>
<html>

	<head>
		<meta charset="utf-8">
		<title>elenpi mocha tests</title>
		<link rel="stylesheet" href="./test/mocha.css" />
		<style>
			#fixture {
				position: absolute;
				top: -9999;
				left: -9999;
			}
		</style>
		<script type="text/javascript" src="./index.js"></script>
		<script src="./test/chai.js"></script>
		<script src="./test/mocha.js"></script>
		<script>
			mocha.setup("bdd");
		</script>
		<script src="./test/test.js"></script>
		<script>
			window.onload = function() {
				mocha.run()
			};
		</script>
	</head>

	<body>
		<h2 style="margin-left:30px;"><a href="https://github.com/nomocas/elenpi">elenpi</a> tests</h2>
		<div id="mocha"></div>
	</body>
</html>`;

		const res = parser.parse(doc, 'document');
		it("should", () => {
			expect(res).to.deep.equals({
				children: [{
					tagName: "html",
					children: [{
						tagName: "head",
						children: [{
							tagName: "meta",
							attributes: {
								charset: "utf-8"
							}
						}, {
							tagName: "title",
							children: [{
								textValue: "elenpi mocha tests"
							}]
						}, {
							tagName: "link",
							attributes: { rel: "stylesheet", href: "./test/mocha.css" }
						}, {
							tagName: "style",
							rawContent: "\n\t\t\t#fixture {\n\t\t\t\tposition: absolute;\n\t\t\t\ttop: -9999;\n\t\t\t\tleft: -9999;\n\t\t\t}\n\t\t"
						}, {
							tagName: "script",
							attributes: { type: "text/javascript", src: "./index.js" }
						}, {
							attributes: {
								src: "./test/chai.js"
							},
							tagName: "script"
						}, {
							attributes: {
								src: "./test/mocha.js"
							},
							tagName: "script"
						}, {
							rawContent: "\n\t\t\tmocha.setup(\"bdd\");\n\t\t",
							tagName: "script"
						}, {
							attributes: {
								src: "./test/test.js"
							},
							tagName: "script"
						}, {
							rawContent: "\n\t\t\twindow.onload = function() {\n\t\t\t\tmocha.run()\n\t\t\t};\n\t\t",
							tagName: "script"
						}]
					}, {
						tagName: "body",
						children: [{
							tagName: "h2",
							attributes: {
								style: "margin-left:30px;"
							},
							children: [{
								tagName: "a",
								attributes: {
									href: "https://github.com/nomocas/elenpi"
								},
								children: [{
									textValue: "elenpi"
								}]
							}, {
								textValue: " tests"
							}]
						}, {
							tagName: "div",
							attributes: {
								id: "mocha"
							}
						}]
					}]
				}]
			});
		});
	});

});

