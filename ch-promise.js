(function(g){
  
  function chPromise(self,f){
    this.self = self;
    this.list = [];
    this.thenQ = [];
    this.failQ = [];
    this.cIf = null;
    this.cSwitch = null;
    f.apply(self,this);
  }
  
  chPromise.prototype = {
    add: function(p){
      var px = { promise: p, state: ''};
      this.list.add(px);
      var self = this;
      p.then(function(r){
        px.result = r;
        px.state = 'done';
        self.finish();
      }).fail(function(r){
        px.fail = r;
        px.state = 'fail';
        self.finish();
      });
    },
    continueIf: function(ftest,fthen,felse){
      this.cif = { 
        test: ftest,
        then: fthen,
        else: felse
      };
    },
    continueSwitch: function(fswitch, fcases){
      this.cSwitch = {
        test: fswitch,
        cases : fcases
      };
    },
    finish: function(){
      var list = this.list;
      var n = list.length;
      var failed = false;
      var item;
      var r = [this];
      for(var i=0;i<n;i++){
        item = list[i];
        if(item.state == 'fail'){
          failed = true;
          break;
        }
        if(!item.state){
          return;
        }
        r.push(item.result);
      }
      
      list = failed ? this.failQ : this.thenQ;
      n = list.length;
      var self = this.self;
      for (var i = 0; i < n; i++) {
        item = list[i];
        item.apply(self,r);
      }        
    }
    ,
    then: function(f){
      this.thenQ.push(f);
    },
    fail: function(f){
      this.failQ.push(f);
    }
  };
  
  function $ps(self,f){
    return new chPromise(self,f);
  }
  g.$ps = $ps;
})(this);