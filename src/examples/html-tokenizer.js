/** 
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * html tokenizer
 */

import elenpi from '../index.js';
const r = elenpi.Rule.initializer,
	Parser = elenpi.Parser,
	exec = Parser.exec,
	attributeExpr = /^([\w-_]+)\s*(?:=\s*("([^"]*)"|[\w-_]+))?\s*/,
	openTags = /^(br|input|img|area|base|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)/,
	onlySpace = /^\s+$/,
	rawContentTags = /^(?:script|style|code)/;

const rules = {
	document: r
		.zeroOrMore(r.space().one('comment'))
		.terminal(/^\s*<!DOCTYPE[^>]*>\s*/i)
		.one('children')
		.space(),

	comment: r.terminal(/^<!--([\s\S]*)?(?=-->)-->/, (env, obj, cap) => { obj.comment = cap[1]; }),

	// closing tag
	tagEnd: r.terminal(/^\s*<\/([\w-_\:]+)\s*>/, (env, obj, cap) => {
		if (obj.tagName !== cap[1]) {
			env.errors = env.errors || [];
			env.errors.push('tag badly closed : ' + cap[1] + ' - (at opening : ' + obj.tagName + ')');
		}
	}),

	// tag children
	children: r
		.zeroOrMore({
			pushTo: 'children',
			rule: r.oneOf('comment', 'text', 'tag')
		}),

	text: r.terminal(/^[^<]+/, (env, obj, cap) => {
		const val = cap[0];
		if (onlySpace.test(val)) 
			obj.skip = true;
		else 
			obj.textValue = val;
	}),

	// normal tag (including raw tags)
	tag: r
		// start tag
		.terminal(/^<([\w-_\:]+)\s*/, (env, obj, cap) => { obj.tagName = cap[1]; })
		// attributes
		.zeroOrMore(
			// attrName | attrName="... ..." | attrName=something | attrName={{ .. }} | attrName={ .. }
			// with an optional space (\s*) after equal sign (if any).
			r.terminal(attributeExpr, (env, obj, cap) => {
				const attrName = cap[1],
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
			.done((env, obj) => {
				// check html5 unstrict self-closing tags
				if (openTags.test(obj.tagName))
					return; // no children

				if (rawContentTags.test(obj.tagName)) // get raw content
					return rawContent(obj.tagName, env, obj);

				// get inner tag content
				exec(env.parser.rules.children, obj, env);
				if (!env.error) // close tag
					exec(env.parser.rules.tagEnd, obj, env);
			}),
			// strict self closed tag
			r.terminal(/^\/>/),
			r.error('Missing end of tag')
		)
};

// raw inner content of tag
function rawContent(tagName, env, tag) {
	const index = env.string.indexOf('</' + tagName + '>');
	if (index === -1) {
		env.error = true;
		env.errorMessage = tagName + ' tag not closed.';
		return;
	}
	if (index) // more than 0
		tag.rawContent = env.string.substring(0, index);
	env.string = env.string.substring(index + tagName.length + 3);
}

const parser = new Parser(rules, 'children');

export default parser;

