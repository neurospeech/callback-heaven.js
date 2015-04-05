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
    console.log(a);
  }
  else{
    a = $p($.get('d'));
  }
  console.log(a);
}

function c1Intermediate2(){
  var a = null;
  return $pif(this, function(p){
    p.add($.get(''));
  })
  .continueIf(function(p,r1){ 
    return r1;
    }, function(p){
    if($p($.get('a'))){
      a = $p($.get('b'));
    }else{
      a = $p($.get('c'));
    }
    console.log(a);
  },function(p){
    a = $p($.get('d'));
  }).then(function(p){
    console.log(a);
  });
}

function c1Result(){
  var a = null;
  return $ps(this, function(p){
    p.add($.get(''));
  })
  .continueIf(function(p,r1){ 
    return r1;
    }, function(p,r1){
      p.add($ps(this,function(p){
        p.add($.get('a'));
      }).continueIf(function(p){
        p.add($ps(this,$.get('b')).then(function(){
          
        }));
      },function(p){
        
      },function(p){
        
      }).then(function(){
        console.log(a);
      }));
    },function(p){
    a = $p($.get('d'));
  }).then(function(p){
    console.log(a);
  });
}