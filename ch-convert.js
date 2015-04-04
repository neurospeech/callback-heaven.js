var acorn = require('acorn');
var vm = require('vm');
var fs = require('fs');

var input = process.argv[2];
var cb = process.env.PWD + '/callback-heaven.js';
var inputScript = fs.readFileSync(input);


var cbscript = fs.readFileSync(cb, 'utf8');


vm.runInThisContext(cbscript,cb);

var cbh = new CallbackHeaven(acorn);
console.log(cbh.convert(inputScript));

