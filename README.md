# elenpi

[![Travis branch](https://img.shields.io/travis/nomocas/elenpi/master.svg)](https://travis-ci.org/nomocas/elenpi)
[![bitHound Overall Score](https://www.bithound.io/github/nomocas/elenpi/badges/score.svg)](https://www.bithound.io/github/nomocas/elenpi)
[![Coverage Status](https://coveralls.io/repos/github/nomocas/elenpi/badge.svg?branch=master)](https://coveralls.io/github/nomocas/elenpi?branch=master)
[![npm-downloads](https://img.shields.io/npm/dm/elenpi.svg)]()
[![dependecies](https://img.shields.io/david/nomocas/elenpi.svg)]()
[![dev-dependencies](https://img.shields.io/david/dev/nomocas/elenpi.svg)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![npm](https://img.shields.io/npm/v/elenpi.svg)]()
[![licence](https://img.shields.io/npm/l/elenpi.svg)]()

Small javascript LL(1) Parser generator through simple and expressive DSL. 

Allow to describe parser rules with structured sentences based on Method Chaining.

- really short, clear, clean and maintenable parser rules
- less than 2ko gzip/minified
- easy DSL prototyping
- quite fast

Take a look at examples in [./src/examples](https://github.com/nomocas/elenpi/tree/master/src/examples).

[Esdoc references](https://doc.esdoc.org/github.com/nomocas/elenpi/)

## Rule's Api

Create a rule instance : 

```javascript
var rule = new Rule();
```

or using shortcut :

```javascript
var  r = Rule.initializer;
var rule = r.oneOf(...);
```

Behaviour : 

The fundamental atom of elenpi : a simple handler that take an object (env) containing the __rest of the string__ to parse and the errors report, and the current object descriptor where to store catched information.
```javascript
.done(function(env, descriptor){
	// place information in current descriptor
	descriptor.foo = env.string...;
	// when information catched : your responsible to replace THE REST of the string in env.
	env.string = env.string.substring(...);
}) : Rule
```

Recognize a terminal (aka try to match a regexp at beginning of current string).

Second argument : 
- could be the name of the property in descriptor where elenpi will store first value of the regexp matching output ("captured" below, which is an array with captured parts)
- could be a function that receive the "env" object, the current descriptor, and the "captured" regexp output. You're free to do what you want. __You should not manage the rest of the string__ (it will be done by elenpi).
```javascript
.terminal(RegExp, ?String || ?function(env, descriptor, captured){
	descriptor.something = captured[1]; // example
}) : Rule
```

Recognize a single char, that will __not__ be stored in descriptor.
```javascript
.char( String ) : Rule
```

Impose the end of string there.
```javascript
.end() : Rule
```

Use a rule, either by name (will be found in parser's rules), or by providing a rule instance (that will be "inserted" there).
```javascript
.use(ruleName:String||rule:Rule) : Rule
```

Place a `skip:true` in current descriptor and so elenpi will ignored it.
```javascript
.skip() : Rule
```

Recognized an optional space (/^\s+/ : __one or more__).
```javascript
.space(needed = false) : Rule
```

Force error if parser execute it (useful in some cases when placed after end of rule)
```javascript
.error(msg): Rule
```


Match elements in strings through one rule (maybe optional) :

```javascript
.one(rule || { 
	rule:rule, 
	?as:function(){ return Instance }, 
	?set:'name' || function(env, parent, descriptor){ ... } 
}) : Rule
```

```javascript
.maybeOne(rule || { 
	rule:rule, 
	?as:function(){ return Instance }, 
	?set:'name' || function(env, parent, descriptor){ ... } 
}) : Rule
```

- rule : the rule to apply (ruleName:String||rule:Rule)
- as : optional, a function that return __a descriptor instance to use with the provided rule__
- set : optional, 
	- either a string that give the property's name where to store descriptor (the one created by the "as" function) in parent descriptor
	- either a function that receive "env", the __parent descriptor__, and the __descriptor__.


Match elements in strings through one of provided rules :

```javascript
.oneOf(...rules || { 
	rules:[rules], 
	?as:function(){ return Instance }, 
	?set:'name' || function(env, parent, descriptor){ ... } 
}) : Rule
```

```javascript
.maybeOneOf(...rules || {
	rules:[rules], 
	?as:function(){ return Instance }, 
	?set:'name' || function(env, parent, descriptor){ ... } 
})
```


Match x or more element in string with provided rule (and maybe a separator rule) :

```javascript
.xOrMore({ 
	rule:rule,
	minimum:int = 0,
	?as:function(){ return Instance }, 
	?pushTo:'name' || function(env, parent, descriptor){ ... },
	?separator:rule,
	?maximum:int = Infinity
}) : Rule
```

- rule : the rule to apply (ruleName:String||rule:Rule)
- minimum: the minimum number of elements to recognize (default 0)
- as : optional, a function that return __a descriptor instance to use with the provided rule__
- pushTo : optional, 
	- either a string that give the property's name where to __PUSH__ descriptor (the one created by the "as" function) in parent descriptor
	- either a function that receive "env", the __parent descriptor__, and the __descriptor__.
- separator: optional, a rule that express the possible separator between recognized elements. (by example a coma between items in an array) 
- maximum: optional, the maximum number of elements to recognize (default Infinity)



xOrMore shortcuts : 

```javascript
.zeroOrMore(opt /* as above in xOrMore */) : Rule
```

```javascript
.oneOrMore(opt /* as above in xOrMore (minimum = 1) */) : Rule
```


## Parser's API

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

__see parsers examples__ in [./src/examples](https://github.com/nomocas/elenpi/tree/master/src/examples)

## Licence

The [MIT](http://opensource.org/licenses/MIT) License

Copyright (c) 2015-2017 Gilles Coomans <gilles.coomans@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
