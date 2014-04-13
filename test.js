var mongo = require('mongoskin');

var db = mongo.db('mongodb://cowuser:Remembering_cow_database@oceanic.mongohq.com:10064/creativeobjectworld', {w: -1});

var command = 'list';

var storage = db.collection('objects');
var thingToFind = {$and: [
      { $or: [{ class: 'command' }, { class: 'action'}] },
      { $and: [{ name: command }] }
    ]};

storage.find(thingToFind).toArray(
  function(err, items) {
    if (err) {
      throw err;
    }

    var objList = packageItems(items);

    console.log(objList);
  }
);


function packageItems(items) {
  var objList = {};
  for (var i=0; i < items.length; i++) {
    objList[items[i].id] = items[i];
  }
  return objList;  
}


    
