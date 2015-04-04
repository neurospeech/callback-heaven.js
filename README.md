# macrojs
Macros for JavaScript to write shorter syntax and expand inline expressions

$p - promise
------------

    var r = $p($.get('/fetchurl/'));
    console.log(r);
  
Translated to

    $.get('/fetchurl/').then( function(r) {
      console.log(r);
    });
  
Try catch

    try{
      var r = $p($.get('/fetchurl'));
    }catch(e){
      console.error(e);
    }

Translated to

    

$ap - AtomPromise
-----------------

    var r = $ap(AtomPromise.json('/fetchurl/'));
    console.log(r);
  
Translated to

    AtomPromise.json('/fetchurl/').then( function(r) {
      console.log(r);
    }).invoke();
  
