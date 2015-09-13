/**
 * For parsing html5/xml.
 *
 */

var Elenpi = require('../index.js'),
	l = Elenpi.l;

module.exports = {
	// html5 self closing tags : 
	openTags: /(br|input|img|area|base|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)/,

	document: l()
		.oneOrMore(null, l().space().rule('comment'))
		.regExp(/^\s*<\!DOCTYPE[^>]*>\s*/i, true)
		.rule('children')
		.space(),

	children: l()
		.zeroOrMore('childNodes',
			l().oneOf([
				l().rule('comment').skip(),
				l().rule('tag'),
				l().rule('text')
			])
			.space()
		),

	text: l().regExp(/^[^<]+/, false, function(descriptor, cap) {
		descriptor.textContent = cap[0];
	}),

	comment: l().regExp(/^<!--.*?(?=-->)-->/),

	tag: l()
		.regExp(/^<([\w-_]+)\s*/, false, function(descriptor, cap) {
			descriptor.tagName = cap[1].toLowerCase();
		})
		.zeroOrMore('attributes',
			l().regExp(/^([\w-_]+)\s*(?:=(?:(?:"([^"]*)")|([\w-_]+)))?/, false, function(descriptor, cap) {
				descriptor.attrName = cap[1];
				if (cap[2] !== undefined)
					descriptor.value = cap[2];
				else if (cap[3])
					descriptor.value = cap[3];
			})
			.space()
		)
		.oneOf([
			l().char('>')
			// check html5 self-closing tags
			.done(function(string, descriptor) {
				if (this.openTags.test(descriptor.tagName)) // self-closed
					return string;
				return Elenpi.exec(string, this.tagContent, descriptor, this); // get tag content
			}),
			// xml self closed tag
			l().regExp(/^\/>/)
		]),

	tagContent: l().rule('children')
		// closing tag
		.regExp(/^<\/([\w-_]+)\s*>/, false, function(descriptor, cap) {
			if (descriptor.tagName !== cap[1].toLowerCase())
				throw new Error("tag badly closed");
		})
};
