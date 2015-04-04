
if(!AtomEnumerator){
	var AtomEnumerator = function(a){
		this.array = a;
		this.index = -1;
	};
	
	this.AtomEnumerator.prototype = {
		next: function(){
			this.index++;
			return this.index < this.array.length;
		},
		current: function(){
			return this.array[this.index];
		}
	};
}

function CallbackHeaven(acorn){
	this.parser = acorn;
	this.indent = '';
}

CallbackHeaven.prototype = {
	convert: function(input){
		var p = this.parser.parse(input);
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
			r.push(item);
		}
		return r.join(s || ',');
	},
	
	expression: function(p){
		return p.type + '\n' + JSON.stringify(p, null, 2);
	},
	
	expressionStatement: function(e){
		var exp = e.expression;
		exp = this.visit(exp);
		return exp + ';\n';
	},
	
	identifier: function(e){
		return e.name;
	},
	
	blockStatement: function(e){
		var oldIndent = this.indent;
		this.indent += '\t';
		
		var body = this.program(e);
		
		this.indent = oldIndent;
		return "{\n" + this.indent + '\t' + body + ";\n}";
	},
	
	functionExpression: function(e){
		var body = this.visit(e.body);
		var params = this.visitArray(e.params, ', ');
		var id = this.visit(e.id);
		return "(function " + id + "("+ params +")" + body + ")";
	},
	
	ifStatement: function(e){
		var test = this.visit(e.test);
		var c = this.visit(e.consequent);
		return "if(" + test + ") " + c; 
	},
	
	binaryExpression: function(e){
		var left = this.visit(e.left);
		var right = this.visit(e.right);
		return left + e.operator + right;
	},
	
	variableDeclaration: function(e){
		var d = this.visitArray(e.declarations,';\n' + this.indent);
		return d;
	},
	
	variableDeclarator : function(e){
		var id = this.visit(e.id);
		var init = this.visit(e.init);
		if(init){
			id += " = " + init;
		}
		return id;
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