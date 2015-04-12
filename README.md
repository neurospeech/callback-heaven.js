# Callback Heaven
Callbacks are very difficult to write and program. So I decided to create asyncVM, 
an asynchronous vm that accepts objects and arrays as instructions which may or 
may not be async in nature. 

## Callback Converter 
Callback converts $p() functions to Async AVM instructions, which are 
executed in async timeline explained below. This conversion happens automatically
however you can still use avm independently of this converter and create your own
set of instructions.

## AVM Instructions
AVM Instruction is an either an array or a function that will be executed as per 
asynchronous timeline. async timeline is different then cpu timeline, cpu timeline
executes instructions one after another, async timeline stops vm till completion of async
instruction. This is the reason, each statement is an array with a prefix, specifying 
name of instruction.

### async , only waitable instruction
    ["async", asyncFunctions, resultProcessor]
    asyncFunctions: it can be function or array of function 
        that will return a promise.
    resultProcessor: a function that will be called on result of
        promise return before next instruction
        
#### Example

code:

    var countries = $p($.get('/countries'));
    console.log(JSON.stringify(countries));
        
asyncVM code:
    
    var countries;
    return asyncVM(this,[
        ["async", 
            function(){ 
                $.get('/countries'); },
            function(v){
                /* v is result of last operation */
                countries = v;
            }],
        function(v){
            console.log(JSON.stringify(countries));
        }
    ]);
    
Above example, executes an async instruction, which gets a promise to load
url '/countries', and it will halt till it receives response. Then it will 
execute second function in async array.

Nested async example.

code:
    
    var countries = $p($.get('/countries'));
    var states = {};
    for(var i = 0; i < countries.length; i++){
        var c = countries[i];
        var s = $p($.get('/countries/' + c.id));
        states[c.id] = s;
    }
    console.log(JSON.stringify(states));
    
asyncVM code:

    var countries;
    var states;
    var i;
    var c;
    var s;
    return asyncVM(this,[
        ["async", function() { return $.get('/countries'); }],
        ["for", {
            init: function() { i = 0; },
            test: function() { i < countries.length; },
            body: [
                function(){
                    c = countries[i];
                },
                ["async", 
                    function(){ return $.get('/countries/' + c.id); },
                    function(v){ s = v; }],
                function(){
                    states[c.id] = s;
                }
            ],
            update: function() { i++; }
        }],
        function(){
            console.log(JSON.stringify(states));
        }
    ]);