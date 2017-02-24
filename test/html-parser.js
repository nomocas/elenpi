/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
if (typeof require !== 'undefined')
	var chai = require("chai"),
		parser = require("../lib/html-tokenizer.js");
else
	var parser = htmlParser;


var expect = chai.expect;

describe("HTML5 parser", function() {
	describe("tag", function() {
		var res = parser('<div></div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div"
			});
		});
	});

	describe("self closed tag", function() {
		var res = parser('<div/>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div"
			});
		});
	});

	describe("unstrict self-closing tag", function() {
		var res = parser('<br>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "br"
			});
		});
	});

	describe("tag with text content", function() {
		var res = parser('<div>hello</div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div",
				children: [{
					textValue: "hello"
				}]
			});
		});
	});


	describe("tag with attributes", function() {
		var res = parser('<div class="hello" id=reu></div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div",
				attributes: {
					id:"reu"
				},
				classes:["hello"]
			});
		});
	});

	describe("tag with children", function() {
		var res = parser('<div>hello <span>John</span></div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div",
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

	describe("tag with children with new line and tab", function() {
		var res = parser('<div>hello \n\t<span>John</span>\n</div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div",
				children: [{
					textValue: "hello \n\t"
				}, {
					tagName: "span",
					children: [{
						textValue: "John"
					}]
				}, {
					textValue: "\n"
				}]
			});
		});
	});

	describe("tag with script", function() {
		var res = parser('<div>hello <script>var a = 12 < 15;</script></div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div",
				children: [{
					textValue: "hello "
				}, {
					tagName: "script",
					rawContent: "var a = 12 < 15;"
				}]
			});
		});
	});

	describe("tag with script with new line", function() {
		var res = parser('<div>hello <script>var a = 12 < 15;\nvar b = 0; </script></div>', 'tag');
		it("should", function() {
			expect(res).to.deep.equals({
				"tagName": "div",
				children: [{
					textValue: "hello "
				}, {
					tagName: "script",
					rawContent: "var a = 12 < 15;\nvar b = 0; "
				}]
			});
		});
	});

	describe("comment", function() {
		var res = parser('<!-- bloupi -->', 'comment');
		it("should", function() {
			expect(res).to.deep.equals({ "comment":" bloupi " });
		});
	});

	describe("comment with new line", function() {
		var res = parser('<!-- \rbloupi\n -->', 'comment');
		it("should", function() {
			expect(res).to.deep.equals({});
		});
	});

	describe("full line", function() {
		var text = '<div id="hello" class=reu >foo <br> <!-- hello \n--> <span class="blu" > bar </span></div><home /> hello <script type="text/javascript">var a = 12, \nb = a < 14;</script>';
		var res = parser(text, 'children');
		it("should", function() {
			expect(res).to.deep.equals({
				"children": [{
					"tagName": "div",
					"attributes": [{
						"attrName": "id",
						"value": "hello"
					}, {
						"attrName": "class",
						"value": "reu"
					}],
					"children": [{
						"textValue": "foo "
					}, {
						"tagName": "br"
					}, {
						"tagName": "span",
						"attributes": [{
							"attrName": "class",
							"value": "blu"
						}],
						"children": [{
							"textValue": " bar "
						}]
					}]
				}, {
					"tagName": "home"
				}, {
					"textValue": " hello "
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

		var res = parser(doc);
		it("should", function() {
			expect(res).to.deep.equals({
				"children": [{
					"tagName": "html",
					"children": [{
						"tagName": "head",
						"children": [{
							"tagName": "meta",
							"attributes": [{
								"attrName": "charset",
								"value": "utf-8"
							}]
						}, {
							"tagName": "title",
							"children": [{
								"textValue": "elenpi mocha tests"
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
							"children": [{
								"textValue": "#fixture {position: absolute;top: -9999;left: -9999;};"
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
						"children": [{
							"tagName": "h2",
							"attributes": [{
								"attrName": "style",
								"value": "margin-left:30px;"
							}],
							"children": [{
								"tagName": "a",
								"attributes": [{
									"attrName": "href",
									"value": "https://github.com/nomocas/elenpi"
								}],
								"children": [{
									"textValue": "elenpi"
								}]
							}, {
								"textValue": " tests"
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
