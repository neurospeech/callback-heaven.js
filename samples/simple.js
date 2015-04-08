var $p, $ps, promiseResult;

function simple(){
  if(true){
    this.a = $p( $.get('/a') );
    console.log(this.a);
  }
}

function simpleResult(){
  return promiseResult(this,
  [
    {
      "if": function(){ return true;},
      "then":[{
        async: function(){
          return $.get('/a');
        },
        result: function(r){
          this.a = r;
        }
      },function(){
        console.log(this.a);
      }]
    }
  ]);
}
