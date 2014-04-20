var settings = require('./settings.js');

var app = require('http').createServer(handler),
    fs = require('fs'),
    url = require('url'),
    mongo = require('mongoskin'),
    path = require('path');
    

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
  //console.log('Request for : '+fileName);
  fileName = (fileName === '/') ? '/index.html' : fileName;
  //console.log('Showing '+settings.root+fileName);
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
    

  // parse the typed in command into actions to perform and things to perform them on..
  parseCommand(db, data, res);
}

// convert the passed cmd in the json string into useful bits {'cmd':'create a small white fluffy mouse','actor':'abdok'}
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
        fields = { "id": 1, "code": 1 };

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

function processCmd(data, db, res)
{
  var db_objects = db.collection(settings.dbObjects);
  //console.log({"data.process=":data.process});
  
  // DEBUG: data.process = {id,code} during testing..
  // this needs to be added to out command stack..
  
  
  // DEBUG: quick hack to show the results of a 'list' command in the browser..
  if (data.action == 'look') {
    var query = {loc:data.words[1]},
        fields = {id:1, loc:1, class:1, name:1, qty:1, extra:1, host:1};
    // return an array of objects in the collection 'objects' that match the criteria..
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
        items = {look:objList, log: 'You look around'};
        var returnJson = JSON.stringify(items);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        return res.end(returnJson);
      }
    );
  } else {
    // show the code to be executed back to the user..
    var tab = 'read';
    var returnJson = {};
    returnJson[tab] = JSON.stringify(data.process.code);
    returnJson.log = 'You '+data.action;
    res.writeHead(200, {'Content-Type': 'text/plain'});
    return res.end(JSON.stringify( returnJson));
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
