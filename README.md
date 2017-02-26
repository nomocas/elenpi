# elenpi

[![Travis branch](https://img.shields.io/travis/nomocas/elenpi/master.svg)](https://travis-ci.org/nomocas/elenpi)
[![npm](https://img.shields.io/npm/v/elenpi.svg)]()
[![npm-downloads](https://img.shields.io/npm/dm/elenpi.svg)]()
[![licence](https://img.shields.io/npm/l/elenpi.svg)]()
[![dependecies](https://img.shields.io/david/nomocas/elenpi.svg)]()
[![dev-dependencies](https://img.shields.io/david/dev/nomocas/elenpi.svg)]()

Small javascript LL(1) Parser generator.

Allow to describe Lexer and Parser rules with structured Method Chaining.

Take a look at examples in [./src/examples](./src/examples).


## Rule instance API

Create a rule instance : 

```javascript
var rule = new Rule();
```

or using shortcut :

```javascript
var  r = Rule.r;
var rule = r.oneOf(...);
```

Adding behaviour to rule :

```javascript
.done(function(env, obj){
	// ...
	obj.foo = env.string...;
	env.string = env.string.substring(...);
}) : Rule
```

```javascript
.terminal(RegExp, ?String || ?function(env, descriptor, captured){
	descriptor.something = captured[1]; // example
}) : Rule
```

```javascript
.char( String ) : Rule
```
```javascript
.optional(rule) : Rule
```

```javascript
.end() : Rule
```

```javascript
.rule(ruleName) : Rule
```

```javascript
.skip() : Rule
```

```javascript
.space(?needed) : Rule
```

```javascript
.log( title ) : Rule
```

```javascript
.one(rule || { 
	rule:rule, 
	?as:function(){ return Instance }, 
	?set:'name' || function(env, parent, obj){ ... } 
}) : Rule
```

```javascript
.xOrMore({ 
	rule:rule,
	minimum:int = 0,
	?as:function(){ return Instance }, 
	?pushTo:'name' || function(env, parent, obj){ ... },
	?separator:rule,
	?maximum:int = Infinity
}) : Rule
```

```javascript
.zeroOrMore(opt /* as above in xOrMore */) : Rule
```

```javascript
.oneOrMore(opt /* as above in xOrMore (minimum = 1) */) : Rule
```

```javascript
.zeroOrOne(rule || { 
	rule:rule, 
	?as:function(){ return Instance }, 
	?set:'name' || function(env, parent, obj){ ... } 
}) : Rule
```

```javascript
.oneOf(...rules || { 
	rules:[rules], 
	?as:function(){ return Instance }, 
	?set:'name' || function(env, parent, obj){ ... } 
}) : Rule
```


## Parser API

Constructor :
```javascript
var parser = new Parser(rulesObject, 'defaultRulesName');
```


```javascript
var  r = parser.parse('a string to parse', ?ruleToApply); // parse until the end of string
// r is false if parsing failed
// Otherwise, r is a descriptor object containing catched properties
```


```javascript
var descriptor = {};
var  r = parser.parse('a string to parse', ruleToApply = null, objectWhereStoreTokens = null);

// r is false if parsing failed
// Otherwise, r is the string that still to be parsed

// If parsing succeed, descriptor has been decorated with catched properties
```

__see parsers examples__ in [./src/examples](./src/examples)

## Licence

The [MIT](http://opensource.org/licenses/MIT) License

Copyright (c) 2015-2017 Gilles Coomans <gilles.coomans@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
