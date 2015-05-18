var $wait, $ps, promiseResult;

function simple(c){
    var a = null;
  if($wait( $.get('/a') )){
    this.a = $wait($.get('/b'));
    console.log(this.a);
  }
}

function chain(){
  var a = this.modify(
    this.proces( $wait( $.get('/a') )),
    $wait( $.get('/b') ));
  console.log(a);
}