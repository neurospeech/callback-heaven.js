var $wait, $ps, promiseResult;

function simple(c){
    var a = null;
  if($wait( $.get('/a') )){
    this.a = $wait($.get('/b'));
    console.log(this.a);
  }
}

function fortest(list){
  var r = [];
  for(var i=0;i<list.length;i++){
    var item = list[i];
    r.push($wait($.get('/a' + item)));
  }
  console.log(r);
  return r;
}