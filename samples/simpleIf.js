var $p, $pif, $ploop, $pswitch, allSuccess;

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
  var a = null;
  $pif(this,function(p){
    p.add($.get('/a'));
  })
  .thenIf(function(p,r1){
    return allSuccess(r1);
  })
  .thenTrue(function(p){
    a = 'a';
    this.update();
  })
  .thenFalse(function(p){
    a = 'b';
    this.update();
  })
  .then(function(p){
    console.log(a);
  });
}
