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
			if(/^(parent|tree)$/i.test(i)) continue;
			var v = tree[i];
			if(v && v!==tree){
				if(isString(v))
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
			item.tree = tree;
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
	
	function findParent(tree, f){
		if(!tree) return;
		var p = f(tree);
		if(p) return p;
		return findParent(tree.parent,f);
	}
	
	
	function isCallExpression(signature){
		return function(item){
				if(item.type == 'Identifier'){
					if(item.name == '$p' && item.parent.type == 'CallExpression'){
						return true;
					}
				}
				return false;
		};
	}

	function AST(tree){
		this.tree = tree;
	};  
	
	AST.prototype = {
		process: function(){
			var tree = this.tree;
			prepareDom(this.tree);
			var list = [];
			
			var isPromise = isCallExpression("$p");
			
			walk(tree, function(item){
				if(isPromise(item)){
					list.push(item);
				}
				return true;
			});
			
			console.log('promises found ' + list.length);
			
			var recursive = list.filter(function(t){
				return findParent(t, function(a){
					return isPromise(a);
				});
			});
			
			if(recursive.length>0){
				throw new Error('Recursive calls not supported');
			}
			
		}
	};
  
  	return AST;
})();