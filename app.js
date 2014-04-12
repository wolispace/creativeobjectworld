  var ObjectCache = function() {
    this.store = {};
    this.data = {}; 
    this.getObj = function(objId) {
      if ((typeof this.store[objId] == 'undefined') 
       || (this.data[objId] && this.store[objId].updated != this.data[objId].updated)) {
        this.store[objId] = this.buildObj(objId);
      }
      return this.store[objId];
    };
    this.jsonData = {};

    // retrives a basic object and fleshes it out with nice descriptions and default values..
    this.buildObj = function(objId) {
      var d = (typeof this.data[objId] == 'undefined') ? {} : this.data[objId];
      d.id = objId;
      d.updated = (!d.updated) ? '' : d.updated;
      d.name = (!d.name) ? 'unkown object' : d.name;
      d.qty = (!d.qty) ? 1 : d.qty;
      d.extra = (!d.extra) ? '' : d.extra;
      d.loc = (!d.loc) ? 'void' : d.loc;
      d.relToLoc = (!d.relToLoc) ? 'in' : d.relToLoc;
      d.host = (!d.host) ? 'void' : d.host;
      d.relToHost = (!d.relToHost) ? 'on' : d.relToHost;
      d.qtyText = d.qty;
      if (d.qty == 1) {
        d.qtyText = ('aeiou'.indexOf(d.name.substr(0,1)) > -1) ? 'an' : 'a';
      } else if (d.qty == 2) {
        d.qtyText = 'two';
      } else if (d.qty == 3) {
        d.qtyText = 'three';
      } else if (d.qty == -1) {
        d.qtyText = 'the';
      } else if (d.qty < 10) {
        d.qtyText = d.qty;
      } else if (d.qty < 20) {
        d.qtyText = 'some';
      } else if (d.qty < 99) {
        d.qtyText = 'many';
      } else if (d.qty < 999) {
        d.qtyText = 'hundreds of';
      } else if (d.qty < 999999) {
        d.qtyText = 'thousands of';
      } else if (d.qty < 999999999) {
        d.qtyText = 'millions of';
      } else {
        d.qtyText = 'a mind-boggling quantity of';
      }
      if (d.qty > 1) {
        var plurals = {'knife':'knives', 'sheep':'sheep', 'loaf':'loaves','mouse':'mice'};
        var plural = plurals[d.name];
        d.pluralName = (plural === undefined) ? d.name+'s' : plural;
      } else {
        d.pluralName = d.name;
      }
      var inLoc = '';
      if (d.loc != 'void' && d.loc !== '') {
        var tmpObj = objStore.getObj(d.loc);
        inLoc = ' '+d.relToLoc+' '+tmpObj.qtyText+' '+tmpObj.extra+' '+tmpObj.pluralName;
      }    
      d.longName = d.qtyText+' '+d.extra+' '+d.pluralName+inLoc;
        
      return d;
    };
  };

  var rawDataFromServer = {
    "house":{"id":"house", "name":"house", "qty":"1", "extra":"red brick", "loc":"openfield", "updated":"20140410010101"},
    "openfield":{"id":"openfield", "name":"open field", "qty":"1", "extra":"large", "loc":"void", "updated":"20140410010101"},
    "mouse":{"id":"mouse", "name":"mouse", "qty":"4000", "extra":"small", "loc":"house", "updated":"20140410010101"}
  };
  
  var objStore = new ObjectCache();
  // update the raw data from the server like this..
  objStore.data = rawDataFromServer;  
  
  var objOne = objStore.getObj("mouse");
  console.log(objOne.longName);
  
  objOne = objStore.getObj("house");
  console.log(objOne.longName);
  
  rawDataFromServer = {
    "can":{"name":"can", "qty":"3", "extra":"tin", "loc":"house", "updated":"20140410010101"},
    "mouse":{"id":"mouse", "name":"mouse", "qty":"1", "extra":"large pink", "loc":"house", "updated":"20140410010102"}
  };
  // update the raw data from the server like this..
  objStore.data = rawDataFromServer;
  
  objOne = objStore.getObj("can");
  console.log(objOne.longName);
  
  objOne = objStore.getObj("mouse");
  console.log(objOne.longName);

  objOne = objStore.getObj("house");
  console.log(objOne.longName);


  

  

  
