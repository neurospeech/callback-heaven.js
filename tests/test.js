var acorn = require('acorn');
var vm = require('vm');
var fs = require('fs');

var heaven = require('./../dist/callback-heaven.js');

function loadFile(name){
  var cb = process.env.PWD + '/../' + name;
  var cbscript = fs.readFileSync(cb, 'utf8');
  vm.runInThisContext(cbscript,cb);
}


var sample = 'samples/simple.js';
//var sample = 'callback-heaven.js';

var input = (process.argv[2]) || ( process.env.PWD +  '/../' + sample);


var inputScript = fs.readFileSync(input);

console.log(heaven.compile(inputScript));

