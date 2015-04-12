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

    
    var ae = new AtomEnumerator(flist);
    var pl = [];
    
    var fa = s[2];
    if(!fa){
      fa = function(r){
        return r;
      };
    }
    
    vm.push([function(){
     var ra = pl.map(function(ri){ return ri.r; }); 
     var v = fa.apply(vm.self,ra);
     vm.value(v);
    }]);

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
      }
      if(!failed){
        vm.run();
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
    
    vm.stop = true;
  },
  "if": function(vm, s){
    s = s[1];
    vm.push(function(){
      if(vm.value()){
        vm.push(s.then);
      }else{
        var e = s["else"];
        if(e){
          vm.push(e);
        }
      }
    });
    vm.push(s.test);
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
  },
  "for": function(vm,s){
    s = s[1];
    function runFor(){
      var r = vm.value();
      if(r){
        vm.push([s.body,s.update, s.test, runFor]);
      }
    };
    vm.push([s.init, s.test, runFor]);
  }
};

function asyncVM(thisArg,s){
  this.self = thisArg;
  this.failQ = [];
  this.thenQ = [];
  this.statements = s;
  this.callStack = [];
  this.stop = false;
  
  var self = this;
  this.success = function(r){
    self.onSuccess(r);
  };
  this.failed = function(r){
    self.onFailed(r);
  };
}

asyncVM.prototype = {
  value: function(v){
    if(v === undefined)
      return this._value;
    this._value = v;
  },
  
  then: function(f){
    this.thenQ.push(f);
  },
  fail: function(f){
    this.failQ.push(f);
  },
  onSuccess: function(r){
    this.value(r);
    this.run();
  },
  onFailed: function(r){
    this.value(r);
  },
  push: function(s){
    this.callStack.push({ 
      statements: this.statements
    });
    if(!Array.isArray(s)) s = [s];
    this.statements = s;
  },
  run: function(s){
    if(s!==undefined){
      this.push(s);
    }
    this.stop = false;
    this.invoke();
  },
  invoke: function(){
    if(this.statements.length==0){
      if(this.callStack.length){
        var s = this.callStack.pop();
        this.statements = s.statements;
        this.invoke();
        return;
      }else{
        // done? call then...
        var v = this.value();
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
      var s = this.statements;
      this.statements = [];
      this.invokeStep(s);
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
      var r = s.call(this.self,this.value());
      if(r!==undefined){
        this.value(r);
      }
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
    if(!this.stop){
      this.invoke();
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
