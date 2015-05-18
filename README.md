# Callback Heaven
Callbacks are very difficult to write and program. So I decided to create asyncVM, 
an asynchronous vm that accepts objects and arrays as instructions which may or 
may not be async in nature. 

## Callback Converter 
Callback converts $wait() functions to Async AVM instructions, which are 
executed in async timeline explained below. This conversion happens automatically
however you can still use avm independently of this converter and create your own
set of instructions.

## AVM
To run generated code, you will need avm.

## How to compile?

    var heaven = require('callback-heaven');
    var fs = require('fs');
    var script = fs.readFileSync('input.js','utf8');
    script = heaven.compile(script);
    fs.writeFileSync('ouput.js',script, 'utf8');
    
    
## Supported statements

    function testVM(){
        var countries = $wait($.get('/countries'));
        for(var i=0; i<countries.length; i++){
            var country = countries[i];
            country.states = $wait($.get('/countries/' + country.code));
        }
        console.log(JSON.stringify(countries));
    }
    