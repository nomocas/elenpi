var tokenizer = require('./html-tokenizer');

function outputTag(tag, intializer) {
	if (tag.textValue)
		return '.text(' + JSON.stringify(tag.textValue) + ')';
	if (text.comment)
		return '';
	var inner = '';
	if (tag.classes)
		tag.classes.forEach(function(cl) {
			inner += '.cl("' + cl + '")';
		});
	if (tag.attributes)
		for (var i in tag.attributes)
			inner += '.attr("' + i + '",' + JSON.stringify(tag.attributes[i]) + ')';
	if (tag.children)
		tag.children.forEach(function(tag) {
			inner += outputTag(tag);
		});
	if (tag.rawContent)
		inner += '.raw(`' + tag.rawContent + '`)';
	return '.' + tag.tagName + '(' + (inner ? initializer + inner : '') + ')';
}

module.exports = function(htmlString, intializer) {
	var tags = tokenizer(htmlString),
		out = initializer;

	if (tags)
		tags.forEach(function(tag) {
			out += outputTag(tag, intializer);
		});
	return out;
};