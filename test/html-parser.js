/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
if (typeof require !== 'undefined')
	var chai = require("chai"),
		parser = require("../lib/html-parser.js");

var expect = chai.expect;

describe("HTML5 parser", function() {
	describe("tag", function() {
		var res = parser.parse('<div></div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div"
			});
		});
	});

	describe("self closed tag", function() {
		var res = parser.parse('<div/>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div"
			});
		});
	});

	describe("unstrict self-closing tag", function() {
		var res = parser.parse('<br>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "br"
			});
		});
	});

	describe("tag with text content", function() {
		var res = parser.parse('<div>hello</div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div",
				childNodes: [{
					textContent: "hello"
				}]
			});
		});
	});


	describe("tag with attributes", function() {
		var res = parser.parse('<div class="hello" id=reu></div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div",
				attributes: [{
					attrName: "class",
					value: "hello"
				}, {
					attrName: "id",
					value: "reu"
				}]
			});
		});
	});

	describe("tag with children", function() {
		var res = parser.parse('<div>hello <span>John</span></div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div",
				childNodes: [{
					textContent: "hello "
				}, {
					tagName: "span",
					childNodes: [{
						textContent: "John"
					}]
				}]
			});
		});
	});

	describe("tag with children with new line and tab", function() {
		var res = parser.parse('<div>hello \n\t<span>John</span>\n</div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div",
				childNodes: [{
					textContent: "hello \n\t"
				}, {
					tagName: "span",
					childNodes: [{
						textContent: "John"
					}]
				}, {
					textContent: "\n"
				}]
			});
		});
	});

	describe("tag with script", function() {
		var res = parser.parse('<div>hello <script>var a = 12 < 15;</script></div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div",
				childNodes: [{
					textContent: "hello "
				}, {
					tagName: "script",
					scriptContent: "var a = 12 < 15;"
				}]
			});
		});
	});

	describe("tag with script with new line", function() {
		var res = parser.parse('<div>hello <script>var a = 12 < 15;\nvar b = 0; </script></div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div",
				childNodes: [{
					textContent: "hello "
				}, {
					tagName: "script",
					scriptContent: "var a = 12 < 15;\nvar b = 0; "
				}]
			});
		});
	});

	describe("comment", function() {
		var res = parser.parse('<!-- bloupi -->', 'comment');
		it("should", function() {
			expect(res).to.deep.equals({});
		});
	});

	describe("comment with new line", function() {
		var res = parser.parse('<!-- \rbloupi\n -->', 'comment');
		it("should", function() {
			expect(res).to.deep.equals({});
		});
	});

	describe("full line", function() {
		var text = '<div id="hello" class=reu >foo <br> <!-- hello \n--> <span class="blu" > bar </span></div><home /> hello <script type="text/javascript">var a = 12, \nb = a < 14;</script>';
		var res = parser.parse(text, 'children');
		it("should", function() {
			expect(res).to.deep.equals({
				"childNodes": [{
					"tagName": "div",
					"attributes": [{
						"attrName": "id",
						"value": "hello"
					}, {
						"attrName": "class",
						"value": "reu"
					}],
					"childNodes": [{
						"textContent": "foo "
					}, {
						"tagName": "br"
					}, {
						"tagName": "span",
						"attributes": [{
							"attrName": "class",
							"value": "blu"
						}],
						"childNodes": [{
							"textContent": " bar "
						}]
					}]
				}, {
					"tagName": "home"
				}, {
					"textContent": " hello "
				}, {
					"tagName": "script",
					"attributes": [{
						"attrName": "type",
						"value": "text/javascript"
					}],
					"scriptContent": "var a = 12, \nb = a < 14;"
				}]
			});
		});
	});

	describe("document", function() {

		// from elenpi/index.html (mocha tests index for browser)
		var doc = '<!-- foo\n -->\n<!-- bar\n -->\n\n<!DOCTYPE html>' + '<html>' + '\n' + '<head>' + '<meta charset="utf-8">' + '<title>elenpi mocha tests</title>' + '<link rel="stylesheet" href="./test/mocha.css" />' + '<style>' + '#fixture {' + 'position: absolute;' + 'top: -9999;' + 'left: -9999;' + '}' + '' + ';' + '</style>' + '<script type="text/javascript" src="./index.js"></script>' + '<script src="./test/chai.js"></script>' + '<script src="./test/mocha.js"></script>' + '<script>' + 'mocha.setup("bdd");' + '</script>' + '<script src="./test/test.js"></script>' + '<script>' + 'window.onload = function() {' + 'mocha.run()' + '};' + '</script>' + '</head>' + '\n' + '<body>' + '<h2 style="margin-left:30px;"><a href="https://github.com/nomocas/elenpi">elenpi</a> tests</h2>' + '<div id="mocha"></div>' + '</body>' + '</html>';

		var res = parser.parse(doc);
		it("should", function() {
			expect(res).to.deep.equals({
				"childNodes": [{
					"tagName": "html",
					"childNodes": [{
						"tagName": "head",
						"childNodes": [{
							"tagName": "meta",
							"attributes": [{
								"attrName": "charset",
								"value": "utf-8"
							}]
						}, {
							"tagName": "title",
							"childNodes": [{
								"textContent": "elenpi mocha tests"
							}]
						}, {
							"tagName": "link",
							"attributes": [{
								"attrName": "rel",
								"value": "stylesheet"
							}, {
								"attrName": "href",
								"value": "./test/mocha.css"
							}]
						}, {
							"tagName": "style",
							"childNodes": [{
								"textContent": "#fixture {position: absolute;top: -9999;left: -9999;};"
							}]
						}, {
							"tagName": "script",
							"attributes": [{
								"attrName": "type",
								"value": "text/javascript"
							}, {
								"attrName": "src",
								"value": "./index.js"
							}]
						}, {
							"attributes": [{
								"attrName": "src",
								"value": "./test/chai.js"
							}],
							"tagName": "script"
						}, {
							"attributes": [{
								"attrName": "src",
								"value": "./test/mocha.js"
							}],
							"tagName": "script"
						}, {
							"scriptContent": 'mocha.setup("bdd");',
							"tagName": "script"
						}, {
							"attributes": [{
								"attrName": "src",
								"value": "./test/test.js"
							}],
							"tagName": "script"
						}, {
							"scriptContent": "window.onload = function() {mocha.run()};",
							"tagName": "script"
						}]
					}, {
						"tagName": "body",
						"childNodes": [{
							"tagName": "h2",
							"attributes": [{
								"attrName": "style",
								"value": "margin-left:30px;"
							}],
							"childNodes": [{
								"tagName": "a",
								"attributes": [{
									"attrName": "href",
									"value": "https://github.com/nomocas/elenpi"
								}],
								"childNodes": [{
									"textContent": "elenpi"
								}]
							}, {
								"textContent": " tests"
							}]
						}, {
							"tagName": "div",
							"attributes": [{
								"attrName": "id",
								"value": "mocha"
							}]
						}]
					}]
				}]
			});
		});
	});

});
