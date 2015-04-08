var $p, $ps, $pif, $ploop, $pswitch, promiseResult;

function chain(){
  var a = this.modify(
    this.proces( $p( $.get('/a') )),
    $p( $.get('/b') ));
  console.log(a);
}

function chainResult(){
  var a = null;
  return promiseResult(this,[
    { 
      push:[
        function(){
          return $.get('/a');
        },function(){
          return $.get('/b');
        }
      ]
    },
    function(r1,r2){
      a = this.modify(this.process(r1,r2));
      console.log(a);
    }
  ]);
}

function complexChain(){
  var a = this.modify(
      this.process( $.get('/a') ? $.get('/b') : $.get('/c') )
    );
}

function complexChainResult(){
  var a;
  return promiseResult(this,[
    {
      push: {
        "if": {
          async: function(){
            return $.get('/a');
          }
        },
        "then": {
          async: function(){
            return $.get('/b');
          }
        },
        "else": function(){
          return $.get('/c');
        }
      }
    },
    function(r1){
      a = this.modify(this.process(r1));
    }
  ]);
}