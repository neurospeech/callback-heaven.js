# Callback Heaven
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
      alert(r);
    }catch(e){
      console.error(e);
    }

Translated to
    
    $.get('/fetchurl').then( function(r){
        alert(r);
    }).failed(function(e){
        console.log(e);
    });
    

$ap - AtomPromise
-----------------

    var r = $ap(AtomPromise.json('/fetchurl/'));
    console.log(r);
  
Translated to

    AtomPromise.json('/fetchurl/').then( function(r) {
      console.log(r);
    }).invoke();
  

Loop promises
-------------

Multiple promises in loop are more complicated, as they involve declaring extra array to store status of each promise. However, it is still expanded correctly.

    var rl = [];
    for(var i=0;i<n;i++){
        rl[i] = $p($.get('/url/' + i));
    }
    
    consol.log(JSON.stringify(rl));
    
Translated to 
    
    var rl = [];
    var rp = [];
    
    for(var i=0;i<n;i++){
        var p = $.get('/url/' + i);
        p.then(function(r){
            rl[i] = r;
            var px = rp.find( function(x) { return x.p == p });
            px.done = true;
            for(var pi=0;pi<rp.length;pi++){
                var pix = rp[pi];
                if(!pix.done) return;
            }
            
            console.log(JSON.stringify(rl));
        });
        rp.push({done:false, p:p});
    }
