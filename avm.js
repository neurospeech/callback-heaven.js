var asyncInvoke = (function(){
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

function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function isString(stringToCheck){
  if(stringToCheck.constructor == String)
    return true;
  return typeof stringToCheck == 'string' || stringToCheck instanceof String;
}

var vmCommands = {
  "async": function(vm,s){
    var flist = s[1];
    if(!Array.isArray(flist)){
      flist = [flist];
    }

    var fa = s[2];
    if(fa){
      vm.push(fa);
    }
    
    var ae = new AtomEnumerator(flist);
    var pl = [];
    
    function next(){
      var a = new AtomEnumerator(pl);
      var failed = false;
      while(a.next()){
        var i = a.current();
        if(!i.state){
          return;
        }
        if(/failed/i.test(i.state)){
          failed = true;
        }
        var r = i.r;
        vm.stack.push(r);
      }
      if(!failed){
        vm.invoke();
      }
    }
    
    function wirePromise(p){
      var pi = {
        p: p,
        i: i
      };
      p.then(function(r){
        pi.r = r;
        pi.state = 'done';
        next();
      });
      p.fail(function(r){
        pi.r = r;
        pi.state = 'failed';
        next();
      });
      return pi;
    }
    
    while(ae.next()){
      var f = ae.current();
      var i = ae.currentIndex();
      var p = f.apply(vm.self,vm);
      pl.push(wirePromise(p));
    }
  },
  "if": function(vm, s){
    s = s[1];
    vm.push(function(){
      console.log("then");
      if(vm.value()){
        vm.push(s.then);
        vm.invoke();
      }else{
        var e = s["else"];
        if(e){
          vm.push(e);
          vm.invoke();
        }
      }
    });
    vm.push(s.test);
    vm.invoke();
  },
  "switch": function(vm,s){
    s = s[1];
    vm.push(function(){
      var r = vm.value();
      var cs = s.cases;
      var c = cs[r];
      if(c){
        vm.push(c);
      }else{
        c = s["default"];
        if(c){
          vm.push(c);
        }
      }
    });
    vm.push(s.test);
    vm.invoke();
  }
};

function asyncVM(thisArg,s){
  this.self = thisArg;
  this.failQ = [];
  this.thenQ = [];
  this.stack = [];
  this.statements = s;
  this.callStack = [];
  
  
  var self = this;
  this.success = function(r){
    self.onSuccess(r);
  };
  this.failed = function(r){
    self.onFailed(r);
  };
}

asyncVM.prototype = {
  value: function(){
    var s = this.stack;
    if(s.length){
      return s[s.length-1];
    }
  },
  
  then: function(f){
    this.thenQ.push(f);
  },
  fail: function(f){
    this.failQ.push(f);
  },
  onSuccess: function(r){
    this.stack.push(r);
    this.invoke();
  },
  onFailed: function(r){
    this.stack.push(r);
  },
  push: function(s){
    this.callStack.push({ 
      statements: this.statements, 
      stack: this.stack, 
      thenQ: this.thenQ,
      failQ: this.failQ
    });
    this.stack = [];
    this.failQ = [];
    this.thenQ = [];
    if(!Array.isArray(s)) s = [s];
    this.statements = s;
  },
  invoke: function(){
    if(this.statements.length==0){
      if(this.callStack.length){
        var s = this.callStack.pop();
        this.statements = s.statements;
        
        var lastValue = this.value();
        
        this.stack = s.stack;
        this.stack.push(lastValue);
        this.thenQ = s.thenQ;
        this.failQ = s.failQ;
        this.invoke();
        return;
      }else{
        // done? call then...
        var v = this.stack.length ? this.stack.pop() : undefined;
        var ae =new AtomEnumerator(this.thenQ);
        while(ae.next()){
          var f = ae.current();
          f.apply(this.self, v);
        }
      }
      return;
    }
    var f = this.statements[0];
    if(isString(f)){
      this.invokeStep(this.statements);
      this.statements.length = 0;
    }else{
      if(Array.isArray(f)){
        this.statements.shift();
        this.push(f);
        this.invoke();
      }else{
        this.invokeStep( this.statements.shift() );   
      }
    }
  },
  invokeStep: function(s){
    if(isFunction(s)){
      var r = s.apply(this.self,this.stack);
    }else{
      var a = s[0];
      var af = vmCommands[a];
      if(!af){
        throw new Error("No vm command found for " + a);
      }
      else{
        console.log('executing ' + a);        
      }
      af(this,s);
    }
  }
};

return function asyncInvoke(thisArg, statements){
  var avm = new asyncVM(thisArg,statements);
  setTimeout(function(){
    avm.invoke();
  },1);
  return avm;
};

})();
