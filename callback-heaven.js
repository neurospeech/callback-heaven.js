var CallbackHeaven = (function(){
	if(!AtomEnumerator){
		var AtomEnumerator = function(a){
			this.array = a;
			this.index = -1;
		};

		AtomEnumerator.prototype = {
			next: function(){
				this.index++;
				return this.index < this.array.length;
			},
			current: function(){
				return this.array[this.index];
			}
		};
	}

	function walk(tree, f, parent){
		if(tree.length !== undefined){
			var ae =new AtomEnumerator(tree);
			while(ae.next()){
				var item = ae.current();
				if(!walk(item,f, tree))
					return false;
			}
			return true;
		}
		for(var i in tree){
			if(!tree.hasOwnProperty(i)) continue;
			if(/parent/i.test(i)) continue;
			var v = tree[i];
			if(v && v!==tree){
				if( typeof v == 'string' || v.constructor == String || v instanceof String)
					continue;
				if(v.type !== undefined || v.length !== undefined){
					if(!walk(v,f, tree))
					{
						return false;
					}
				}
			}
		}
		return f(tree,parent);
	}

	function prepareDom(tree){
		walk(tree,function(item,parent){
			item.parent = parent;
			return true;
		});
	}

	function processMacro(tree, signature, replacer){
		var list = [];
		walk(tree, function(item){
			if(item.type == 'Identifier'){
				if(item.name == signature && item.parent.type == 'CallExpression'){
					list.push(item.parent);
				}
			}
			return true;
		});
		
		var ae = new AtomEnumerator(list);
		while(ae.next()){
			var item = ae.current();
			replacer(item);
		}
	}

	function CBHeaven(acorn){
		this.parser = acorn;
		this.indent = '';
	}

	CBHeaven.prototype = {
		convert: function(input){
			var p = this.parser.parse(input);
			prepareDom(p);
			processMacro(p,'$ap');
			return this.visit(p);
		},

		visit: function(p){
			if(!p)
				return '';
			var type = p.type;
			type = type.substr(0,1).toLowerCase() + type.substr(1);
			var visitor = this[type] || this.expression;
			return visitor.call(this,p);
		},
		visitArray: function(p,s){
			if(!p)
				return "";
			var r = [];
			var ae = new AtomEnumerator(p);
			while(ae.next()){
				var item = ae.current();
				item = this.visit(item);
				if(item){
					r.push(item);
				}
			}
			return r.join(s || ',');
		},

		expression: function(p){
			return p.type + '\n' + JSON.stringify(p);
			//return '';
		},

		objectExpression: function(e){
			var oldIndent = this.indent;
			this.indent += '\t';
			var plist = this.visitArray(e.properties, ',\n' + this.indent);
			this.indent = oldIndent;
			return "{\n" + this.indent + "\t" + plist + "\n" + this.indent + "}";
		},

		forInStatement: function(e){
			var left = this.visit(e.left);
			var right = this.visit(e.right);
			var body = this.visit(e.body);
			return "for(" + left + " in " + right + ")" + body;
		},

		property: function(e){
			var key = this.visit(e.key);
			var value = this.visit(e.value);
			return key + ": " + value;
		},

		expressionStatement: function(e){
			var exp = e.expression;
			exp = this.visit(exp);
			return exp;
		},

		returnStatement: function(e){
			return "return " + this.visit(e.argument);
		},

		identifier: function(e){
			return e.name;
		},

		whileStatement: function(e){
			var test = this.visit(e.test);
			var body = this.visit(e.body);
			return "while(" + test + ")" + body;
		},

		continueStatement: function(e){
			return "continue";
		},

		blockStatement: function(e){
			var oldIndent = this.indent;
			this.indent += '\t';

			var body = this.program(e);

			this.indent = oldIndent;
			return "{\n" + this.indent + '\t' + body + ";\n" + this.indent + "}";
		},

		functionExpression: function(e){
			var body = this.visit(e.body);
			var params = this.visitArray(e.params, ', ');
			var id = this.visit(e.id);
			return "(function " + id + "("+ params +")" + body + ")";
		},

		functionDeclaration: function(e){
			var body = this.visit(e.body);
			var params = this.visitArray(e.params, ', ');
			var id = this.visit(e.id);
			return "function " + id + "("+ params +")" + body ;
		},

		thisExpression: function(e){
			return "this";
		},

		ifStatement: function(e){
			var test = this.visit(e.test);
			var c = this.visit(e.consequent);
			var a = this.visit(e.alternate);
			if(a){
				a = "else" + a;
			}
			return "if(" + test + ") " + c + a; 
		},

		binaryExpression: function(e){
			var left = this.visit(e.left);
			var right = this.visit(e.right);
			return left + " " +  e.operator + " " + right;
		},

		logicalExpression: function(e){
			return this.binaryExpression(e);
		},

		unaryExpression: function(e){
			var op = e.operator;
			var arg = this.visit(e.argument);
			return e.prefix ? op + arg : arg + op;
		},

		assignmentExpression: function(e){
			var left = this.visit(e.left);
			var right = this.visit(e.right);
			return left + " = " + right;
		},

		updateExpression: function(e){
			var op = e.operator;
			var exp = this.visit(e.argument);
			return e.prefix ? op + exp : exp + op;
		},

		arrayExpression: function(e){
			var elist = this.visitArray(e.elements, ', ');
			return "[" + elist + "]";
		},

		newExpression: function(e){
			var exp = this.callExpression(e);
			return "new " + exp;
		},

		variableDeclaration: function(e){
			var d = this.visitArray(e.declarations,';\n' + this.indent);
			return d;
		},

		conditionalExpression: function(e){
			var test= this.visit(e.test);
			var left = this.visit(e.left);
			var right = this.visit(e.right);
			return test + "?" + left + ":" + right;
		},

		variableDeclarator : function(e){
			var id = this.visit(e.id);
			var init = this.visit(e.init);
			if(init){
				id += " = " + init;
			}
			return "var " + id;
		},

		memberExpression: function(e){
			var obj = this.visit(e.object);
			var property = this.visit(e.property);
			return obj + "." + property;
		},

		literal: function(e){
			return e.raw;
		},

		callExpression: function(e){
			var callee = this.visit(e.callee);
			var args = this.visitArray(e.arguments,', ');
			return callee + '(' + args + ')';
		},

		tryStatement: function(e){
			var tryBlock = this.visit(e.block);
			var handler = this.visit(e.handler);
			return "try" + this.indent +  "\t" + tryBlock + this.indent + "\n" + handler;
		},

		catchClause: function(e){
			var arg = this.visit(e.param);
			var body = this.visit(e.body);
			return "catch (" + arg + ")" + body;
		},

		program: function(e){
			return this.visitArray(e.body,';\n' + this.indent);
		}
	};

	return CBHeaven;
})();