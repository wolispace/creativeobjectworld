var settings = require('./settings.js');

var app = require('http').createServer(handler),
    socketio = require('socket.io'),
    fs = require('fs'),
    url = require('url'),
    mongo = require('mongoskin'),
    path = require('path'),
    processor = require('./processor_sockets.js');
    

app.listen(settings.port);
var io = socketio.listen(app);
// kill $(ps ax | grep '[j]s' | awk '{ print $1 }')

// handle requests..
function handler (req, res) {
  var call = url.parse(req.url);
  serverStaticFile(call.pathname, res);
}

function serverStaticFile(fileName, res) {
  fileName = (fileName === '/') ? '/index_sockets.html' : fileName;
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


io.sockets.on('connection', function (socket) {
  // connection established.. user must now login using a cmd..
  //io.sockets.emit('message', { msg: 'server joined as id='+socket.id });
  socket.send("your ID is "+socket.id, function() { 
    console.log("send sent"); 
  });
  socket.on('cmd', function (data) {
    console.log("=got data=");
    var db = mongo.db( settings.mongoPath, {w: -1});
    console.log(data);
    parseCommand(db, data, io, socket);
    //io.sockets.emit('msg', data, function() { console.log("message sent"); });
  });
});

// convert the passed cmd in the json string into useful bits
// {'cmd':'create a small white fluffy mouse',
//  'player':{id:'87',loc:'1'}}
function parseCommand(db, data, socket) {
  var db_objects = db.collection(settings.dbObjects);
  if (data.cmd) {
    // grab first word..
    data.words = data.cmd.split(' ');
    data.action = data.words[0].toLowerCase().trim();
    
    // DEBUG: faking the actor to be wolis in the open field..
    data.actor = 87;
    data.actorLoc = 1;

    // try to find an object named this in the player or the current location..
    var query = { "name": data.action, "loc": { "$in": [data.actor, data.actorLoc] }, "new_code" : { "$ne": null } },
        fields = { "id": 1, "code": 1, "info": 1 };

    db_objects.find(query, fields).toArray(
      function(err, items) {
        if (err) {
          throw err;
        }
        if (typeof items[0] == 'undefined') {
          var query = { "name": data.action, "class": { "$in": ["command", "action"] }, "new_code" : { "$ne": null } };
          db_objects.find(query, fields).toArray(
            function(err, items) {
              if (err) {
                throw err;
              }
              if (typeof items[0] != 'undefined') {
                items[0].foundInLocation = false;
                data.process = items[0];
                processor.processBlocks(settings, db, data, socket);
              } else {
                // DEBUG: dont know what to do so make the command 'say'..
                data.process = {"id" : "say", "code" : "say "+data.words.join(' ')};
                processor.processBlocks(settings, db, data, socket);              } 
            }
          );
        } else {
          items[0].foundInLocation = true;
          data.process = items[0];
          processor.processBlocks(settings, db, data, socket);
        }
      }
    );
  }
  // no cmd so nothing returned..
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
