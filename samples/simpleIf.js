var $p, $pif, $ploop, $pswitch, allSuccess, promiseResult;

function simpleIf(){
  var a = null;
  if(allSuccess($p($.get('/a')))){
    a = 'a';
    this.update();
  }else{
    a = 'b';
    this.update();
  }
  console.log(a);
}

function simpleIfResult(){
  var a;
  return promiseResult(this,[
    {
      "if": {
        async: function(){
          return $.get('/a');
        },
        result: function(r){
          return allSuccess(r);
        }
      },
      "then": function(){
        a = 'a';
        this.update();
      },
      "else": function(){
        a = 'b';
        this.update();
      }
    },
    function(){
      console.log(a);
    }
  ]);
}
