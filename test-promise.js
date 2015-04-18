function $p(){
  
}

function promiseQueue(){
  this.queue = [];
  this.thenQ = [];
  this.failedQ = [];
}

promiseQueue.prototype = {
  add: function(p, then, failed){
    var self = this;
    var px = { promise: p, state: 'running' };
    p.then(function(pr){
      px.state = 'done';
      if(then) then(pr);
      self.finish();
    }).failed(function(pf){
      px.state = 'failed';
      if(failed) failed(pf);
      self.finish();
    });
    this.queue.push(px);
  },
  finish: function(){
    if(this.queue.find(
      function(i){ 
        return i.state == 'running'; 
      }))
    {
      return;
    }
    
    var failed = this.queue.find(function(i){ return i.state == 'failed'});
    var list = this.thenQ;
    if(failed && this.failedQ.length){
      list = this.failedQ;
    }
    list.forEach(function(i){ 
      i(); 
    });
  },
  then: function(fthen){
    this.thenQ.push(fthen);
  },
  failed: function(ffailed){
    this.failedQ.push(ffailed);
  }
};


function complexIf(a){
  var b = null;
  if(a){
    b = $.get('/a');
    console.log('true: ' + b);
  }else{
    b = $.get('/b');
    console.log('false: ' + b);
  }
  console.log(b);
}

function complexIfResult(a){
  var b = null;
  function continue1(r1){
    b = r1;
    console.log(b);
  }
  function continue2(r1){
    b = r1;
    console.log('true: ' + b);
    continue1(r1);
  }
  function continue3(r1){
    b = r1;
    console.log('false: ' + b);
    continue1(r1);
  }
  if(a){
    $.get('/a').then(continue2);
  }else{
    $.get('/b').then(continue3);
  }
}

function simpleFor(){
  
  var ae = new AtomEnumerator($p($.get('/list')));
  while(ae.next()){
    console.log(ae.current());
  }
  
}


function simpleForResult(){
  function continue1(r1){
    var ae = new AtomEnumerator(r1);
    while(ae.next()){
      console.log(ae.current());
    }
  }
  
  $.get('/list').then(continue1);
  
}

function complexFor(a){
  var r = [];
  var ae = new AtomEnumerator(list);
  while(ae.next()){
    var item = ae.current();
    var ir = $p($.get(item));
    r.push(ir);
  }
  console.log(r);
}

function complexForResult(a){
  var plist = [];
  var r = [];
  function continue1(r1){
    r = r1;
    console.log(r);
  }
  function continue2(r1){
    var ir = r1;
    r.push(ir);
  }
  
  var ae = new AtomEnumerator(list);
  while(ae.next()){
    var item = ae.current();
    $.get(item).then(continue2);
  }
}

