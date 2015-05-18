var CallbackHeaven = (function(){
	
	function isString(stringToCheck){
	  if(stringToCheck.constructor == String)
	    return true;
	  return typeof stringToCheck == 'string' || stringToCheck instanceof String;
	}
	
	
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
			},
			currentIndex: function(){
			  return this.index;
			}
		};
	}


	function CBHeaven(tree){
		this.tree = tree;
		this.indent = '';
	}

	CBHeaven.prototype = {
		convert: function(input){
			return this.visit(this.tree);
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
		
		forStatement: function(e){
			var init = this.visit(e.init);
			var test = this.visit(e.test);
			var update = this.visit(e.update);
			var body = this.visit(e.body);
			return "for(" + init + ", " + test + ", " + update + ")" + body;
		},

		forInStatement: function(e){
			var left = this.visit(e.left);
			var right = this.visit(e.right);
			var body = this.visit(e.body);
			return "for(" + left + " in " + right + ")" + body;
		},

		whileStatement: function(e){
			var test = this.visit(e.test);
			var body = this.visit(e.body);
			return "while(" + test + ")" + body;
		},
		
		doWhileStatement: function(e){
			var body = this.visit(e.body);
			var test = this.visit(e.test);
			return "do" + body + "while(" + test + ")";
		},

		switchStatement: function(e){
			var dis = this.visit(e.discriminant);
			var oldIndent = this.indent;
			this.indent += '\t';
			var cases = this.visitArray(e.cases, ";\n" + this.indent);
			this.indent = oldIndent;
			return "switch(" + dis + "){\n" + this.indent  + cases + "}";
		},
		
		switchCase: function(e){
			var c = this.visitArray(e.consequent, ';\n' + this.indent );
			var test = this.visit(e.test);
			if(test){
				test = "case " + test;
			}else{
				test = "default";
			}
			return test + ":\n\t" + this.indent + c;
		},
		
		breakStatement: function(e){
			return "break";
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
			var oldIndent = this.indent;
			this.indent += '\t';
			var elist = this.visitArray(e.elements, ',\n' + this.indent);
			this.indent = oldIndent;
			return "[" + elist + "]\n" + this.indent;
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
		
		throwStatement: function(e){
			var arg = this.visit(e.argument);
			return "throw " + arg;
		},

		program: function(e){
			return this.visitArray(e.body,';\n' + this.indent);
		}
	};

	return CBHeaven;
})();