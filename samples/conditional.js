var $p, $ps, $pif, promiseResult, isTrue;

function c1(){
  
  var a = $p( isTrue($.get('')) 
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

function c1Result(){
  var a = null;
  return promiseResult(this,[
      [
        "if", { 
          test:["async",function() { return  $.get('');}, function(r){ return isTrue(r); }],
          "then":
          [
            ["if",{ 
              test:["async", function(){ return $.get('a'); }],
              then: ["async", function(){ return $.get('b'); }, function(r) { a = r; }],
              "else": ["async", function(){ return $.get('c'); }, function(r) { a = r; }]
            }],
            function(){
              console.log(a);
            }
          ],
          "else":[
              ["async", function() { return $.get('d'); }]
            ]
          }
        ],
      function(){
        console.log(a);
      }
    ]);
}
