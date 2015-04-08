var $p, $ps, $pif, $ploop, $pswitch, allSuccess, promiseResult;

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
  return promiseResult(this,[
      {
        "switch": function(){
          return a;
        },
        "cases":{
          "a": [
            { 
              async: function(){
                return $.get('/a');
              },result: function(r){
                b = r;
              }
            },
            function(){
              console.log('case a' + b);
            }
          ],
          "b": [
            {
              async: function(){
                return $.get('/b');
              },
              result: function(r){
                b = r;
              }
            },
            function(){
              console.log('case b' + b);
            }
          ]
        },
        "default": function(){
          b = null;
        }
      },function(){
        console.log(b);
      }
    ]);
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

function complexSwitchResult(){
  var a = null;
  return promiseResult(this,[
    {
      "switch":{
        async: function(){
          return $.get('/a');
        }
      },
      "cases": {
        "a":function(){
          console.log(a);
        },
        "b": function(){
          console.log(a);
        }
      }
    }
  ]);
}