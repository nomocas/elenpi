export default {
	doublestring: /^"([^"]*)"/,
	singlestringArg: /^'([^']*)'/,
	floatArg: /^[0-9]*\.[0-9]+/,
	integerArg: /^[0-9]+/,
	boolArg: /^(true|false)/,
	id: /^[\w-_]+/,
	objectKey: /^([\w-_]+)|"([^"]*)"|'([^']*)'/
};
