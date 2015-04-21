var $p, $ps, promiseResult;

function simple(c){
  if(c){
    this.a = $p( $p( $.get('/a') ) );
    console.log(this.a);
  }
}

function simpleResult(c){
  return promiseResult(this,[
    ["if", {
      test: function() { return c;},
      then: [
        ["async", function(){ return $.get('/a'); } , function(r){ this.a = r;  }],
        function(){
          console.log(this.a);
        }
      ]
    }]
  ]);
}
