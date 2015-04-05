var $p, $ps, $pif;

function c1(){
  
  var a = $p( $.get('') 
    ?($p($.get('a')) 
        ?$p($.get('b')) 
        :$p($.get('c'))) 
    :$p($.get('d') ));
  
  console.log(a);
}

function c1Intermediate(){
  var a = null;
  if($p($.get(''))){
    if($p($.get('a'))){
      a = $p($.get('b'));
    }else{
      a = $p($.get('c'));
    }
  }
  else{
    a = $p($.get('d'));
  }
  console.log(a);
}

function c1Intermediate2(){
  var a = null;
  $pif(this, function(p){
    p.add($.get(''));
  })
  .thenIf(function(p,r1){ 
    return r1;
  })
  .thenTrue(function(p){
    if($p($.get('a'))){
      a = $p($.get('b'));
    }else{
      a = $p($.get('c'));
    }
  })
  .thenFalse(function(p){
    a = $p($.get('d'));
  }).then(function(p){
    console.log(a);
  });
}

function c1Result(){
  
}