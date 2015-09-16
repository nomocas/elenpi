# elenpi

Small javascript lexer/Parser tool.

Allow to describe Lexer and Parser rules with chained API.

Take a look at examples in [./lib](./lib).


## Rule instance API

Create a rule instance : 

```javascript
var rule = new Rule();
```

or using shortcut :

```javascript
var  r = Rule.r;
var rule = r();
```

Adding behaviour to rule :

```javascript
.done(function(string, descriptor){
	// ...
	return string;
}) : Rule
```

```javascript
.regExp(RegExp, ?optional, ?String || ?function(descriptor, captured){
	descriptor.something = captured[1]; // example
}) : Rule
```

```javascript
.char( String ) : Rule
```

```javascript
.xOrMore(as || null , rule, ?separationRule) : Rule
```

```javascript
.zeroOrMore(as || null, rule, ?separationRule) : Rule
```

```javascript
.oneOrMore(as || null, rule, ?separationRule) : Rule
```

```javascript
.zeroOrOne(as || null, rule) : Rule
```

```javascript
.oneOf(?as, Array<rule || ruleNames>) : Rule
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
.id( String || handler, optional, lowerCase) : Rule
```

```javascript
.log( title ) : Rule
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
var  r = parser.exec('a string to parse', descriptor, ?ruleToApply);

// r is false if parsing failed
// Otherwise, r is the string that still to be parsed

// If parsing succeed, descriptor has been decorated with catched properties
```

__see parsers examples__ in [./lib](./lib)

## Licence

The [MIT](http://opensource.org/licenses/MIT) License

Copyright (c) 2015 Gilles Coomans <gilles.coomans@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
