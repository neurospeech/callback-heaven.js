var acorn = require('acorn');

exports.compile = function (input){
  var tree = acorn.parse(input);
  var p = new ast(tree);
  tree = p.process();
  
  var cbh = new CallbackHeaven(tree);
  return cbh.convert();
}