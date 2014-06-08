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

All blocks are added to the blockSoup and called on as needed.db
*/
var db,
    data,
    io,
    socket,
    blockSoup,
    settings;

// process one block by its name. the first is always known as __start..
function processBlock(blockName) {
  log(blockName,'blockName');
  if (blockSoup[blockName]) {
    var statementList = blockSoup[blockName].split(';');
      statementList.forEach(function(statement) {
      processStatement(statement);  
    });
  }
}

function processStatement(statement) {
  var words = statement.trim().split(/\r| /);
  var cowmand = words.shift();

  if (cowmand === '') {
    // ignore blanks..
  } else if (cowmand == 'if') {
    doIf(words);
  } else if (cowmand == 'get') {
    doGet(words);
  } else if (cowmand == 'msg') {
    doMsg(words);
  } else if (cowmand == 'say') {
    doSay(words);
  } else if (cowmand == 'go') {
    doGo(words);    
  } else {
    console.log("? did not know what to do with "+cowmand);
  }
} 

// based on the value of the condition do another block..
function doIf(words) {
 
  // DEBUG: fake it..
  var nextBlock = 'sayit';
  processBlock(nextBlock);
}

// try to locate the object/s in the location and assign it to the target or second..
function doGet(words) {
  data.target = '99';
}


// shortcut to adding a message.. some values are pre-defined..
function doSay(words) {
  // TODO set some things like the current location..
  doMsg(words); 
}

// add a message to the messages colection with a timestamp..
function doMsg(words) {
  data.words.shift();
  var msgPrefix = '[$actor] says';
  var thisMsg = msgPrefix+' '+data.words.join(' ');
  thisMsg = dataToIds(thisMsg);
  console.log("=sending msg=", thisMsg);
  io.sockets.emit('msg', {log: thisMsg}, function() { console.log("=message sent="); });  
}

// converts things like [$actor] into [1234] where data.actor = 1234;
function dataToIds(srcString) {
  var matches = srcString.match(/\$\w+\b/g);

  matches.forEach (
    function (item) {
    item = item.replace(/\$/, '');
       srcString = srcString.replace('[$'+item+']', data[item]);
     }
  );
  return srcString;
}

// change the player's location..
function doGo(words) {
  io.sockets.emit('msg', {log: "changing location to "+words.join(' ')}, function() { console.log("message sent"); });  
}

// all purpose variable logger..
function log(object, msg) {
  console.log('='+msg+'=');
  console.log(object);
}

// build our block soup from which we can pluck a block and process it based on its name..
// more blocks can be added to the soup using include etc..
function buildBlockSoup(thisCode) {
  var returnResult = {},
      theseBlocks = thisCode.replace(/\\r/,'').split('##');
  
  theseBlocks.forEach(function(block) {
    var blockHead = block.split(':');
    if (blockHead[1]) {
      returnResult[blockHead[0]] = blockHead[1];
    }
  });
  return returnResult;
}

exports.processBlocks = function(theseSettings, thisDb, thisData, thisIo, thisSocket) {
  settings = theseSettings;
  db = thisDb;
  data = thisData;
  io = thisIo;
  socket = thisSocket;
  if (data.process.code) {
    blockSoup = buildBlockSoup('##__start:'+data.process.code);
    // always start processing the first block that is never named in the code..
    processBlock('__start');
  } else {
      console.log("No code to process");
  }    
};

