# elenpi

Small javascript lexer/Parser tool.

Allow to describe Lexer and Parser rules with chained API.

Take a look at rules examples in [./lib](./lib).


## Elenpi instance API

```javascript
.done(function(string, descriptor){
	// ...
	return string;
}) : Elenpi
```

```javascript
.regExp(RegExp, ?optional, ?String || ?function(descriptor, captured){
	descriptor.something = captured[1]; // example
}) : Elenpi
```

```javascript
.char( String ) : Elenpi
```

```javascript
.xOrMore(as || null , rule) : Elenpi
```

```javascript
.zeroOrMore(as || null, rule) : Elenpi
```

```javascript
.oneOrMore(as || null, rule) : Elenpi
```

```javascript
.zeroOrOne(as || null, rule) : Elenpi
```

```javascript
.oneOf(?as, Array<Rule>) : Elenpi
```

```javascript
.rule(ruleName) : Elenpi
```

```javascript
.skip() : Elenpi
```

```javascript
.space(?optional) : Elenpi
```

```javascript
.id( String || handler, optional, lowerCase) : Elenpi
```

```javascript
.log( title ) : Elenpi
```

```javascript
.exec(string, descriptor, rules) : String
```


## Static API

```javascript
Elenpi.exec(string, rule, descriptor, rules) : String
```


## Licence

The [MIT](http://opensource.org/licenses/MIT) License

Copyright (c) 2015 Gilles Coomans <gilles.coomans@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
