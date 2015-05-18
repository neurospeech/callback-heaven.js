var acorn = require('acorn');
var vm = require('vm');
var fs = require('fs');

var script = "";

function loadFile(name){
  var cb = process.env.PWD + '/../' + name;
  var cbscript = fs.readFileSync(cb, 'utf8');
  script += cbscript;
}



loadFile('src/compiler/ast.js');
loadFile('src/compiler/ast-writer.js');
loadFile('src/compiler/export.js');

fs.writeFile( process.env.PWD + "/../dist/callback-heaven.js", script , "utf8");
