var settings = {
  host : 'wolispace.kd.io',
  port : '8888',
  prot : 'http://',
  root : '.',
  noServer : false
}

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