/**
 * For parsing html5/xml.
 *
 */

var elenpi = require('../index.js'),
	r = elenpi.r,
	Parser = elenpi.Parser;

var rules = {
	// html5 unstrict self closing tags : 
	openTags: /(br|input|img|area|base|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)/,

	document: r()
		.zeroOrMore(null, r().space().rule('comment'))
		.regExp(/^\s*<!DOCTYPE[^>]*>\s*/i, true)
		.rule('children')
		.space(),

	// tag children
	children: r()
		.zeroOrMore('childNodes',
			r().oneOf([
				r().space().rule('comment').skip(),
				r().space().rule('tag'),
				r().rule('text')
			])
		),

	text: r().regExp(/^[^<]+/, false, 'textContent'),

	comment: r().regExp(/^<!--(?:.|\n|\r)*?(?=-->)-->/),

	tag: r()
		.regExp(/^<([\w-_]+)\s*/, false, function(descriptor, cap) {
			descriptor.tagName = cap[1].toLowerCase();
		})
		.rule('attributes')
		.oneOf([
			r().char('>')
			.done(function(string, descriptor) {
				if (descriptor.tagName === 'script')
					return this.exec(string, descriptor, this.rules.innerScript); // get script content

				// check html5 unstrict self-closing tags
				if (this.rules.openTags.test(descriptor.tagName))
					return string; // no children

				// get inner tag content
				return this.exec(string, descriptor, this.rules.tagContent);
			}),
			// strict self closed tag
			r().regExp(/^\/>/)
		]),

	attributes: r().zeroOrMore('attributes',
		r().regExp(/^([\w-_]+)\s*(?:=(?:"([^"]*)"|([\w-_]+)))?\s*/, false, function(descriptor, cap) {
			descriptor.attrName = cap[1];
			if (cap[2] !== undefined)
				descriptor.value = cap[2];
			else if (cap[3])
				descriptor.value = cap[3];
		})
	),

	tagContent: r()
		.rule('children')
		// closing tag
		.regExp(/^\s*<\/([\w-_]+)\s*>/, false, function(descriptor, cap) {
			if (descriptor.tagName !== cap[1].toLowerCase())
				throw new Error('tag badly closed : ' + cap[1] + ' - (at opening : ' + descriptor.tagName + ')');
		}),

	innerScript: r()
		.done(function(string, descriptor) {
			var index = string.indexOf('</script>');
			if (index == -1)
				throw new Error('script tag badly closed.');
			if (index)
				descriptor.scriptContent = string.substring(0, index);
			return string.substring(index + 9);
		})
};

module.exports = new Parser(rules, 'document');
