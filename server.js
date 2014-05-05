var settings = require('./settings.js');

var app = require('http').createServer(handler),
    fs = require('fs'),
    url = require('url'),
    mongo = require('mongoskin'),
    path = require('path'),
    processor = require('./processor.js');
    

app.listen(settings.port);
// kill $(ps ax | grep '[j]s' | awk '{ print $1 }')

// handle requests..
function handler (req, res) {
  var call = url.parse(req.url);
  if (call.query) {
    queryDatabase(call.query, res);
  } else {
    serverStaticFile(call.pathname, res);
  }
}

function serverStaticFile(fileName, res) {
  fileName = (fileName === '/') ? '/index.html' : fileName;
  fs.readFile(settings.root+fileName,
    function (err, data) {
      if (err) {
        res.writeHead(404);
        return res.end('File not found: '+fileName);
      } else {
        res.writeHead(200, getContentType(fileName));
        return res.end(data);
      }
    }
  );
}

function queryDatabase(query, res) {
  // db will be the connection to the mongoDB hosted on mongoHQ..
  var db = mongo.db( settings.mongoPath, {w: -1}),
    data = JSON.parse(urlDecode(query));
    
  console.log({'orig request=':data});
  
  // parse the typed in command into actions to perform and things to perform them on..
  parseCommand(db, data, res);
}

// convert the passed cmd in the json string into useful bits
// {'cmd':'create a small white fluffy mouse',
//  'player':{id:'87',loc:'1'}}
function parseCommand(db, data, res) {
  var db_objects = db.collection(settings.dbObjects);
  if (data.cmd) {
    // grab first word..
    data.words = data.cmd.split(' ');
    data.action = data.words[0].toLowerCase().trim();
    
    // DEBUG: faking the actor to be wolis in the open field..
    data.actor = 87;
    data.actorLoc = 1;

    // try to find an object named this in the player or the current location..
    var query = { "name": data.action, "loc": { "$in": [data.actor, data.actorLoc] }, "code" : { "$ne": null } },
        fields = { "id": 1, "code": 1, "info": 1 };

    db_objects.find(query, fields).toArray(
      function(err, items) {
        if (err) {
          throw err;
        }
        if (typeof items[0] == 'undefined') {
          var query = { "name": data.action, "class": { "$in": ["command", "action"] }, "code" : { "$ne": null } };
          db_objects.find(query, fields).toArray(
            function(err, items) {
              if (err) {
                throw err;
              }
              if (typeof items[0] != 'undefined') {
                items[0].foundInLocation = false;
                data.process = items[0];
                processCmd(data, db, res);
              } else {
                // DEBUG: dont know what to do so make the command 'say'..
                data.process = {"id" : "say", "code" : "You said "+data.words.join(' ')};
                processCmd(data, db, res);
              } 
            }
          );
        } else {
          items[0].foundInLocation = true;
          data.process = items[0];
          processCmd(data, db, res);
        }
      }
    );
  }
  // no cmd so nothing returned..
}

// add the command to the list of commands to be processed..
function addCommand(data, db, res)
{
  // data.process = {id, code}
  // data.player = {id, loc}
  // data.target = {id}
  // data.second = {id}
  
  var db_commands = db.collection(settings.dbCommands);
  db_commands.insert(
    data, function(err, result) {
    if (err || !result) {
      throw err;
    }  
  });
}

function processCmd(data, db, res)
{
  // we are always returning json..
  res.writeHead(200, {'Content-Type': 'text/plain'});
  var db_objects = db.collection(settings.dbObjects);
  //console.log({"data=":data});
  
  // DEBUG: data.process = {id,code} during testing..
  // this needs to be added to out command stack..
  
  
  // DEBUG: quick hack to show the results of a 'list' command in the browser..
  if ((data.action == 'login')) {
    // TODO: get the objects location.
    var items = {player:{id:'87', loc:'1'}, log: 'You wake up'};
    var returnJson = JSON.stringify(items);
    return res.end(returnJson);
    
  } else if ((data.action == 'look') || (data.action == 'go')) {
    var lookLocation = (data.words[1] == 'undefined') ? data.loc : data.words[1];
    var query = {loc:lookLocation},
        fields = {id:1, loc:1, class:1, name:1, qty:1, extra:1, host:1, link: 1};
    // return an array of objects in the collection 'objects' that match the criteria..
    console.log(query);
    db_objects.find(query, fields).toArray(
      function(err, items) {
        if (err) {
          throw err;
        }
        var objList = {};
        for (var i=0; i < items.length; i++) {
          objList[items[i].id] = items[i];
        }
        // the end of our processing now return something to the browser..
        // ui wants {log:'msg to log'}..
        items = {player:{id:'87',loc:lookLocation},look:objList}; // , log: 'You look around'
        var returnJson = JSON.stringify(items);
        return res.end(returnJson);
      }
    );
  } else if (data.action == 'read') {
    // show the info from the named object..
    //TODO:  hack as we know the second word will be an ID..
    var thisQuery = {'id': data.words[1]},
        theseFields = {'id' : 1, 'info': 1, 'class': 1};
    
    db_objects.find(thisQuery, theseFields).toArray(
      function(err, items) {
        if (err) {
          throw err;
        }
        if (typeof items[0] !== 'undefined') {
          var returnJson = {};
          var info = (typeof items[0].info == 'undefined') ? 'An ordinary '+items[0].class : items[0].info;
          returnJson.read = JSON.stringify(info);
          returnJson.log = 'You '+data.action;
          return res.end(JSON.stringify( returnJson));
        }
      }
    );
  } else {
    // show the code to be executed back to the user..
    processor.processBlocks(settings, db, data);

    //var tab = 'edit';
    var returnJson2 = {};
    //returnJson2[tab] = JSON.stringify(data.process.code);
    returnJson2.log = 'You '+data.action;
    return res.end(JSON.stringify( returnJson2));
  }
}  

function urlDecode(str) {
   return decodeURIComponent((str+'').replace(/\+/g, '%20'));
}

function getContentType(fileName) {
  var extensions = {
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "application/javascript",
    ".png" : "image/png",
    ".gif" : "image/gif",
    ".jpg" : "image/jpeg"};
  return {'Content-Type': extensions[path.extname(fileName)]};
}

console.log('Listening on '+settings.host+':'+settings.port);
