var $p, $ps, $pif, $ploop, $pswitch, allSuccess;

function simpleSwitch(a){
  var b = null;
  switch(a){
    case "a":
      b = $p($.get('/a'));
      console.log('case a' + b);
      break;
    case "b":
      b = $p($.get('/b'));
      console.log('case b' + b);
      break;
    default:
      b = null;
      break;
  }
  console.log(b);
}

function simpleSwitchResult(a){
  var b = null;
  $ps(this,function(p){
    switch(a){
      case "a":
        p.add($.get('/a'));
        p.then(function(p1,r1){
          b = r1;
          console.log('case a' + b);
        });
        break;
      case "b":
        p.add($.get('/b'));
        p.then(function(p1,r1){
          b = r1;
          console.log('case b' + b);
        });
    }
  }).then(function(p,r1){
    console.log(b);
  });
}


function complexSwitch(a){
  var a = null;
  switch($p($.get('/a'))){
    case "a":
      console.log(a);
      break;
    case "b":
      console.log(a);
      break;
  }
}