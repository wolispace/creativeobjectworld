// process cow statements..

/*
  cowScript is made of of blocks of statements.
  first word on a statement is the thing we are doing.
  a block starts with ##
  a statement ends with ;

This is the original cowScript syntax that I might simplify with the 'first-word'  
---
if target of push then someonepushed;
##someonepushed: 
$sound = (rings,dings,bings,doings,goes ka-thump);
$vol = (softly,loudly,slowly,quickly);
print "[$actor] $sound $vol";
---

*/
var db;

function processBlock(block) {
  var statementList = block.split(';');
  statementList.forEach(function(statement) {
    processStatement(statement);  
  });  
}

function processStatement(statement) {
  var words = statement.split(' ');
  if (words[0] == 'msg') {
    doMsg(words);
  } else if (words[0] == 'say') {
    doSay(words);
  } else if (words[0] == 'go') {
    doGo(words);    
  } else {
    doSay(words);
  }
} 

function doSay(words) {
  console.log("Actor says "+words.join(' '));  
}

function doMsg(words) {
  console.log("adding msg to stack of "+words.join(' '));  
}

function doGo(words) {
  console.log("changing locaiton to "+words.join(' '));
}

exports.processBlocks = function(thisDb, sourceCode) {
  db = thisDb;
  sourceCode = '##__start'+sourceCode;
  var blockList = sourceCode.split('##');
  blockList.forEach(function(block) {
    processBlock(block);
  });  
};

