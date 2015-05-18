var vm = require('vm');
var fs = require('fs');

var sample = 'avm.js';

var inputScript = fs.readFileSync(sample, 'utf8');


vm.runInThisContext(inputScript,'avm.js');

function asyncTemp(){
  var a = {
    then: function(f){
      this.thenQ = f;
    },
    fail: function(){
      
    }
  };
  
  setTimeout(function(){
    a.thenQ("success");
  },100);
  
  return a;
}

avm(this,[
  ["if",{
    test:
    [ "async", function(){
      return asyncTemp();
    }, function(r){
      return r;
    }],
    then: function(r){
      console.log('value:' + r);
    },
    "else": function(){
      console.log("else");
    }
  }]
  
]);

// var i =0;
// asyncInvoke(this,[
//     ["for", {
//       init: function(){ i = 0; },
//       test: function() { return i<5; },
//       body: ["async", function(){ return asyncTemp(); }, function(r){ console.log('for ' + i); return r; }],
//       update: function(){ i = i+1; }
//     }]
//   ]);
