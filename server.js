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
  var db = mongo.db('mongodb://cowuser:Remembering_cow_database@oceanic.mongohq.com:10064/creativeobjectworld', {w: -1}),
    data = JSON.parse(urlDecode(query)),
    storage,
    thingToFind;

  // parse the typed in command into actions to perform and things to perform them on..
  data = parseCommand(data);
  console.log(data);
  console.log(data.cmd.toLowerCase());
  
  // different commands use diferent collections..
  if (data.cmd.toLowerCase() == 'list') {
    storage = db.collection('objects');
    thingToFind = {loc:data.target};
      // return an array of objects in the collection 'objects' that match the criteria..
      storage.find(thingToFind).toArray(
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
          items = {log:objList};
          var data = JSON.stringify(items);
          console.log('data='+data);
          res.writeHead(200, {'Content-Type': 'text/plain'});
          return res.end(data);
        }
      );
  } else {

    // DEBUG echo it back..
    res.writeHead(200, {'Content-Type': 'text/plain'});
    return res.end(JSON.stringify({log:data.cmd}));
  }
}

// convert the passed cmd in the json string into useful bits {'cmd':'creat a small white fluffy mouse','actor':'abdok'}
function parseCommand(data) {
  if (data.cmd) {
    var poss = data.cmd.toLowerCase().indexOf('list');
    if (poss > -1) {
      data.target = data.cmd.replace(/list /i, '').trim();
      data.cmd = 'list';
    }
  } else {
    data.cmd = '';
  }
  //console.log(data);
  return data;
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
