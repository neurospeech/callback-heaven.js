var $p, $ps, $pif, $ploop, $pswitch;

function chain(){
  var a = this.modify(
    this.proces( $p( $.get('/a') )),
    $p( $.get('/b') ));
  console.log(a);
}

function chainResult(){
  var a = null;
  $ps(this,function(p){
    p.add($.get('/a'));
    p.add($.get('/b'));
  })
  .then(function(p,r1,r2){
    a = this.modify(this.process(r1), r2);
    console.log(a);
  });
}