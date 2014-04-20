var settings = {
  host : 'wolispace.kd.io',
  port : '8888',
  prot : 'http://',
  root : '.',
  noServer : false,
  dbSwitch : false,
  dbHost : 'oceanic.mongohq.com',
  dbPort : '10064',
  dbUser : 'cowuser',
  dbPwd  : 'Remembering_cow_database',
  dbName : 'creativeobjectworld',
  dbObjects : 'old_objects',
  dbMessages : 'messages',
  dbCommands : 'commands'
};

// flip this switch to use a different database host..
if (settings.dbSwitch) {
  settings.dbHost = 'ds053858.mongolab.com';
  settings.dbPort = '53858';
}

settings.mongoPath = 'mongodb://'+settings.dbUser;
settings.mongoPath += ':'+settings.dbPwd;
settings.mongoPath += '@'+settings.dbHost;
settings.mongoPath += ':'+settings.dbPort;
settings.mongoPath += '/'+settings.dbName;

// cloud9 uses process, koding allows any port..
if (typeof process != 'undefined' && typeof process.env.PORT != 'undefined') {
  settings.host = 'creativeobjectworld-c9-wolispace.c9.iowolispace.kd.io';
  settings.port = process.env.PORT;
  settings.prot = 'https://';
  console.log('cloud9');
}

// for node.js..
if (typeof module != 'undefined') {
  module.exports = settings;
}