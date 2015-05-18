var acorn = require('acorn');
var vm = require('vm');
var fs = require('fs');

function loadFile(name){
  var cb = process.env.PWD + '/' + name;
  var cbscript = fs.readFileSync(cb, 'utf8');
  vm.runInThisContext(cbscript,cb);
}


var sample = 'samples/simple.js';
//var sample = 'callback-heaven.js';

var input = (process.argv[2]) || ( process.env.PWD +  '/' + sample);

loadFile('callback-heaven.js');
loadFile('ast.js');

var inputScript = fs.readFileSync(input);

var tree = acorn.parse(inputScript);

var a = new ast(tree);
tree = a.process();

var cbh = new CallbackHeaven(tree);
console.log(cbh.convert());

