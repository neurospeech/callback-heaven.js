var $p, $ps;

function simple(){
  if(true){
    this.a = $p( $.get('/a') );
    console.log(this.a);
  }
}

function simpleResult(){
  if(true){
    this.a = null;
    $ps(this, function(p){
      p.add($.get('/a'));
    })
    .then(function(p,r1){
      this.a = r1;
      console.log(this.a);
    });
  }
}
