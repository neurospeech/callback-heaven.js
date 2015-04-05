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
  .continueIf(function(p,r1){
    return allSuccess(r1);
  },function(p){
    // true part
    a = 'a';
    this.update();
  },function(p){
    // false part..
    a = 'b';
    this.update();
  })
  .then(function(p){
    console.log(a);
  });
}
