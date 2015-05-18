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
    
## How to run

Generated output script will refer "avm" , which is available from https://github.com/neurospeech/avm.js or 

    npm install avmjs
    
## Supported statements

    function testVM(){
        var countries = $wait($.get('/countries'));
        for(var i=0; i<countries.length; i++){
            var country = countries[i];
            country.states = $wait($.get('/countries/' + country.code));
        }
        console.log(JSON.stringify(countries));
    }
    
## What happens?

Above code gets translated into following code automatically.

    function testVM(){                                                                                                  
        var country;                                                                                                    
        var i;                                                                                            
        var countries;                                                                              
        return avm(this, [[["async",                                                                    
            [(function (){                                                        
                return $.get('/countries');
            })],                                                                  
            function (__v1){                                                         
                countries = __v1;
            }],                                                                                   
            ["for",                                                                                 
                {                                                     
                    "init": (function (){                                                        
                        return i = 0;
                    }),                                                     
                    "test": (function (){                                      
                        return i < countries.length;
                    }),                                                   
                    "update": (function (){                                                       
                        return i++;                                                              
                    }),                                                                 
                    "body": {                                                    
                        [(function (){                           
                            country = countries[i];
                        }),                                                 
                        ["async",                                    
                            [(function (){
                                return $.get('/countries/' + country.code);
                            })],                                  
                            function (__v1){                    
                                country.states = __v1;
                            }]                                                         
                        ]                                                                 
                        ;                                                                         
                    }                                                                                
                }]                                                                                         
            ,                                                                             
            (function (){                                           
                    console.log(JSON.stringify(countries));
            })]                                                                                                 
        ]                                                                                                        
        );                                                                                                              
    }
    
This generated code runs inside "avm" asynchronous virtual machine, which takes care of asynchronous logic and gives you a promise that will contain the last successful result.
