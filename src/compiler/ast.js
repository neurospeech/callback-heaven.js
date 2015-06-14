var ast = (function(){
  
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
	
	
	function walk(tree, f, parent, name){
		if(tree.length !== undefined){
			var ae =new AtomEnumerator(tree);
			while(ae.next()){
				walk(ae.current(),f, tree, ae.currentIndex());
			}
			return;
		}
		for(var i in tree){
			if(!tree.hasOwnProperty(i)) continue;
			if(/^(parent|parentfield|tree)$/i.test(i)) continue;
			var v = tree[i];
			if(v && v!==tree){
				if(isString(v))
					continue;
				if(v.type !== undefined || v.length !== undefined){
					walk(v,f, tree,i);
				}
			}
		}
		f(tree,parent, name);
	}

	function prepareDom(node, tree){
		walk(node,function(item,parent,name){
			item.parent = parent;
			item.parentField = name;
			if(tree){
			  item.tree = tree;
			}
		});
	}

	function findParent(tree, f){
		if(!tree) return;
		var p = f(tree);
		if(p) return p;
		return findParent(tree.parent,f);
	}
	
	
	function isCallExpression(signature){
		return function(item){
				if(item.type == 'Identifier'){
					if(item.name == signature && item.parent.type == 'CallExpression'){
						return true;
					}
				}
				return false;
		};
	}
	
	var isPromise = isCallExpression('$wait');
	
	function findParentType(p, rg){
	  
	  return findParent(p, function(e){
	    return rg.test(e.type);
	  });
	  
	}

	function findParentTypeNot(p, rg){
	  
	  return findParent(p, function(e){
	    return !rg.test(e.type);
	  });
	  
	}
	function hasPromise(p){
		var list = [];
		walk(p, function(item){
			if(item.isPromise || isPromise(item)){
				list.push(item);
			}
		});
		return list.length ? list : null;
	}

	function AST(tree){
		this.tree = tree;
	}  
	
	AST.prototype = {
		process: function(){
		  var item;
		  var p;
			var tree = this.tree;
			prepareDom(this.tree, this.tree);
			var list = hasPromise(tree);
			
			if(!list){
				return tree;
			}
			
			console.log('promises found ' + list.length);
			
			var ae = new AtomEnumerator(list);
			while(ae.next()){
				item = ae.current();
				item.isPromise = true;
				p = item.parent;
				while(p){
				  p.hasPromise = true;
				  p = p.parent;
				}
			}
			
			ae = new AtomEnumerator(list);
			while(ae.next()){
			  item = ae.current();
			  p = item.parent;
			  while(p){
			    if(p.isPromise)
			      throw new Error('Recursive calls not supported');
			    p = p.parent;
			  }
			}
			
			var self = this;
			walk(tree,function(t){
				if(/^function/i.test(t.type)){
					self.functionExpression(t);
				}
			});
			
			return this.visit(tree);
			
		},
		
    visit: function(e){
      if(!e)
        return e;
      var type = e.type;
      if(type){
        type = type.substr(0,1).toLowerCase() + type.substr(1);
        var visitor = this[type] || this.expression;
        return visitor.call(this,e);
      }
      if(e.length){
        var ae = new AtomEnumerator(e);
        var list = [];
        while(ae.next()){
          var item = ae.current();
          list.push(this.visit(item));
        }
        return list;
      }
      return e;
    },
    
    expression: function(e){
      //console.log('default expression ' + e.type);
      for(var i in e){
        if(/parent|tree/i.test(i))
          continue;
        var v = e[i];
        if(!v)
          continue;
        if(isString(v))
          continue;
        e[i] = this.visit(v);
      }
      return e;
    },
    
    expressionStatement: function(e){
    	
    	return this.transformPromise(e);

    },
    
    callExpression: function(e){
    	return this.transformPromise(e);
    },
    
    assignmentExpression: function(e){
    	return this.transformPromise(e);
    },
   
    
    transformPromise: function(e){
    	var list = [];
    	walk(e,function(ex){
    		if(ex.isPromise){
    			list.push(ex);
    		}
    	});
    	
    	if(!list.length)
				return e;
				
  		var s = this.createAsyncStatement("async",null);
			var sa = [];
			s.elements.push({
				type: 'arrayExpression',
				elements:sa
			});
    	var vars = [];
    	var ae =new AtomEnumerator(list);
    	while(ae.next()){
    		var p = ae.current();
    		var invoke = p.parent.arguments[0];
    		sa.push(this.toFunction(invoke));
    		p = p.parent;
    		var f = p.parentField;
    		p = p.parent;
    		if(!/statement/i.test(p.type)){
	    		var v = "__v" + (vars.length+1);
	    		vars.push(v);
	    		p[f] = {
	    			type: 'identifier',
	    			name: v
	    		};
    		}
    	}
    	
    	if(vars.length){
	    	var rf = {
	    		type: 'functionDeclaration',
	    		params: vars.map(function(i){
	    			return { type: 'literal', raw: i };
	    		}),
	    		body:{
	    			type: 'blockStatement',
	    			body:[e]
	    		}
	    	};
	    	
	    	s.elements.push(rf);
    	}
    	//debugger;
    	return s;
    },
    
		
		functionExpression: function(e){
			var t = e.type;
			e = this.functionDeclaration(e);
			e.type = t;
			return e;
		},

		functionDeclaration: function(e){
			
			if(e.transformPromise)
				return e;
			
			var self = this;
			
			//debugger;
			walk(e,function(t){
				if(t==e)
					return;
				if(/^function/i.test(t.type)){
					console.log('nested function processing');
					self.functionDeclaration(t);	
				}
			});
			
			if(!hasPromise(e.body)){
				return e;
			}
			
			e.transformPromise = true;
			
			// remove all variables...
			var vars = [];
			walk(e, function(t,p){
				
				// if(/catchClause/i.test(t.type)){
				// 	vars.push({
				// 		type: 'variableDeclarator',
				// 		id: {
				// 			type: 'identifier',
				// 			name: t.param.name
				// 		}
				// 	});
				// }
				
			  if(/variableDeclarator$/i.test(t.type)){
			    vars.push({
			      type: 'variableDeclarator',
			      id: {
			      	type: 'identifier',
			      	name: t.id.name
			      }
			    });
			    if(!t.init){
			      var i = p.indexOf(t);
			      p.splice(i,1);
			    }else{
			      t.type = 'assignmentExpression';
			      t.left = {
			        type: 'identifier',
			        name: t.id.name
			      };
			      t.right = t.init;
			      t.right.parent = t;
			      t.right.parentField = "right";
			      delete t.init;
			    }
			  }
			});

			var body = this.visit(e.body);
			
			
			e.body = {
			  type:'blockStatement',
			  body:[
			    {
  					type: 'returnStatement',
  					argument: {
  						type: 'callExpression',
  						callee:{
  							type: 'identifier',
  							name: 'avm'
  						},
  						arguments:[
  							{
  								type: 'thisExpression',
  						},
  							body
  						]
  					}
  				}
				]
			  
			};				

			var ae = new AtomEnumerator(vars);
			while(ae.next()){
			  var item = ae.current();
			  e.body.body.unshift(item);
			}
			
			return e;
		},
		
		toFunction: function(e, assign, field){
			
			var stmt = {
				type: 'returnStatement',
				argument: e
			};
			
			var r = {
				type:'functionExpression',
				body: { type: 'blockStatement',
				body:[stmt]
				}
			};
			if(assign){
				r.params = [{ type: 'literal', raw: '___v' }];
				assign[field] = {
						type: 'identifier',
						name: '___v'
				};
			}
			return r;
		},
		
		toAsync: function(e){
			e.type = 'arrayExpression';
			delete e.callee;
			var arg = e.arguments[0];
			e.arguments.unshift({
				type: 'literal',
				raw: 'async'
			});
			
			e.arguments[1] = this.toFunction(arg);
			return e;
		},
		
		createFunction: function(stmt){
		  var s = {
		    type: 'functionExpression',
		    id: '',
		    body:{
		      type: 'blockStatement',
		      body:[]
		    }
		  };
		  s.statements = s.body.body;
		  if(stmt) s.statements.push(stmt);
		  return s;
		},
		
		createAsyncStatement: function(name,props, func){
			
			var s = {
				type: 'arrayExpression',
				elements:[
					{	
						type: 'literal',
						raw: '"' + name + '"'
					}
				]
			};

			if(props){
				var objExp = {
					type: 'objectExpression',
					properties:[]
				};
				
				for(var i in props){
					if(props.hasOwnProperty(i)){
						var v = props[i];
						if(v){
							objExp.properties.push({
								type: 'property',
								key: { type: 'literal', raw: '"' + i + '"' },
								value: v
							});
						}
					}
				}
				
				s.elements.push(objExp);
			}
			
			if(func){
				func = this.toFunction(func);
				s.elements.push(func);
			}
			
			//debugger;
			return s;
		},
		
		ifStatement: function(e){
			var testPromise = false;
			var consequentPromise = false;
			var alternatePromise = false;
			if(hasPromise(e.test)){
				testPromise = true;
				e.test = this.transformPromise(e.test);
			}else{
				e.test = this.toFunction(e.test);
			}
			
			if(hasPromise(e.consequent)){
				consequentPromise = true;
				e.consequent = this.visit(e.consequent);
			}else{
				e.consequent = this.createFunction(e.consequent);
			}
			
			
			if(e.alternate){
				if(hasPromise(e.alternate)){
					alternatePromise = true;
					e.alternate =  this.visit(e.alternate);
				}else{
					e.alternate =  this.createFunction(e.alternate);
				}
			}
			
			if(!(testPromise || consequentPromise || alternatePromise))
				return e;
			
			
			return this.createAsyncStatement("if",{
				test: e.test,
				then: e.consequent,
				"else": e.alternate
			});
		},
		
		forStatement: function(e){
			var initPromise = hasPromise(e.init);
			var testPromise = hasPromise(e.test);
			var updatePromise = hasPromise(e.update);
			var bodyPromise = hasPromise(e.body);
			if(initPromise || testPromise || updatePromise)
				throw new Error('Waitable promise not supported in init,test and update of for loop');
			if(!bodyPromise)
				return e;
				
			var body = this.visit(e.body);
				
			var s = this.createAsyncStatement("for",{
				init: this.toFunction(e.init),
				test: this.toFunction(e.test),
				update: this.toFunction(e.update),
				body: body
			});
			
			return s;
		},	
		
		whileStatement: function(e){
			var testPromise = hasPromise(e.test);
			var bodyPromise = hasPromise(e.body);
			if(testPromise){
				throw new Error('Waitable promise not supported test part of while loop');
			}
			if(!bodyPromise)
				return e;
			var s = this.createAsyncStatement("while",{
				test: this.toFunction(e.test),
				body: this.visit(e.body)
			});
			return s;
		},
		
		doWhileStatement: function(e){
			var testPromise = hasPromise(e.test);
			var bodyPromise = hasPromise(e.body);
			if(testPromise){
				throw new Error('Waitable promise not supported test part of while loop');
			}
			if(!bodyPromise)
				return e;
			var s = this.createAsyncStatement("do",{
				test: this.toFunction(e.test),
				body: this.visit(e.body)
			});
			return s;
		},
		
		forInStatement: function(e){
			var leftPromise = hasPromise(e.left);
			var rightPromise = hasPromise(e.right);
			var bodyPromise = hasPromise(e.body);
			if(leftPromise || rightPromise || bodyPromise)
				throw new Error("Waitable promises are not supported in for-in statement");
			return e;
		},
		
		tryStatement: function(e){
			var bodyPromise = hasPromise(e.block);
			if(!bodyPromise)
				return e;
			var tb = {
				"try": this.visit(e.block)
			};
			if(e.handler){
				var c = e.handler;
				tb["catch"] = c;
				c.type = 'FunctionExpression';
				c.params = [c.param];
			}
			if(e.finalizer){
				var f = {
					type: 'FunctionExpression',
					body: e.finalizer
				};
				tb["finally"] = f;
			}
			var s = this.createAsyncStatement("try",tb);
			return s;
		},
		
		blockStatement: function(e){
		  if(!hasPromise(e))
		    return e;
		  var list = e.body;
		  
		  e = {
		    type: 'arrayExpression',
		    elements:[]
		  };
		  
		  var body = e.elements;
		  
		  var current = null;
		  

		  var ae = new AtomEnumerator(list);
		  while(ae.next()){
		    var s = ae.current();
		    if(!hasPromise(s)){
		      if(!current){
		        current = this.createFunction();
		        body.push(current);
		      }
		      current.statements.push(s);
		    }else{
		      s = this.visit(s);
		      body.push(s);
		      current = null;
		    }
		  }
		  
		  return e;
		},
		
		
	};
  
  	return AST;
})();