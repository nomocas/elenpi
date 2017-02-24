/** 
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * html tokenizer
 */

var elenpi = require('../index.js'),
	r = elenpi.r,
	Parser = elenpi.Parser,
	attributeExpr = /^([\w-_]+)\s*(?:=\s*("([^"]*)"|[\w-_]+))?\s*/,
	openTags = /(br|input|img|area|base|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)/,
	rawContentTags = /^(?:script|style|code)/;

var rules = {
	document: r
		.zeroOrMore(
			r.space()
			.one('comment')
		)
		.terminal(/^\s*<!DOCTYPE[^>]*>\s*/i, true)
		.one('children')
		.space(),

	comment: r.terminal(/^<!--(.*|\s*)?(?=-->)-->/, function(env, obj, cap) {
		obj.comment = cap[1];
	}),

	// closing tag
	tagEnd: r.terminal(/^\s*<\/([\w-_\:]+)\s*>/, function(env, obj, cap) {
		if (obj.tagName !== cap[1]) {
			env.errors = env.errors ||  [];
			env.errors.push('tag badly closed : ' + cap[1] + ' - (at opening : ' + obj.tagName + ')');
		}
	}),

	// tag children
	children: r
		.zeroOrMore({
			pushTo: 'children',
			rule: r
				.oneOf(
					r.space()
					.one('comment'),
					r.space()
					.one('tag'),
					r.one('text')
				)
		}),

	text: r.terminal(/^[^<]+/, function(env, obj, cap) {
		obj.textValue = cap[0];
	}),

	// normal tag (including raw tags)
	tag: r
		// start tag
		.terminal(/^<([\w-_\:]+)\s*/, function(env, obj, cap) {
			obj.tagName = cap[1];
		})
		// attributes
		.zeroOrMore(
			// attrName | attrName="... ..." | attrName=something | attrName={{ .. }} | attrName={ .. }
			// with an optional space (\s*) after equal sign (if any).
			r.terminal(attributeExpr, function(env, obj, cap) {
				var attrName = cap[1],
					value = (cap[3] !== undefined) ? cap[3] : ((cap[2] !== undefined) ? cap[2] : '');
				switch (attrName) {
					case 'class':
						if (!value)
							break;
						obj.classes = value.split(/\s+/);
						break;
					default:
						obj.attributes = obj.attributes || {};
						obj.attributes[attrName] = value;
						break;
				}
			})
		)
		.oneOf(
			r.char('>')
			.done(function(env, obj) {
				// check html5 unstrict self-closing tags
				if (openTags.test(obj.tagName))
					return; // no children

				if (rawContentTags.test(obj.tagName)) // get raw content
					return rawContent(obj.tagName, env, obj);

				// get inner tag content
				elenpi.exec(env.parser.rules.children, obj, env);
				if (!env.error) // close tag
					elenpi.exec(env.parser.rules.tagEnd, obj, env);
			}),
			// strict self closed tag
			r.terminal(/^\/>/)
		)
};

// raw inner content of tag
function rawContent(tagName, env, tag) {
	var index = env.string.indexOf('</' + tagName + '>'),
		raw;
	if (index === -1) {
		env.errors = env.errors ||  [];
		env.errors.push(tagName + ' tag badly closed.');
		return;
	}
	if (index) { // more than 0
		raw = env.string.substring(0, index);
		tag.rawContent = raw;
	}
	env.string = env.string.substring(index + tagName.length + 3);
}

var parser = new Parser(rules, 'children');

module.exports = function(htmlString, rule, descriptor, env) {
	return parser.parse(htmlString, rule, descriptor, env);
};