

	// chuck a json string in here and it can be interrogated for display etc..
	var CowObject = function(jsonObj) {
    try {
      var data = jsonObj; // (typeof jsonObj === "string") ? JSON.parse(jsonObj) : jsonObj;
      
      console.log(data);
    } catch(err) {
      console.log(err);
      console.log("Freakout man. json could not parse the string["+jsonObj+"]");
    }
    
    this.name       = getName();
    this.longName   = getLongName();
    this.pluralName = getPluralName();
    this.qty        = getQtyNumber();
    this.qtyText    = getQtyText(this.name);
    this.loc        = getLoc();
    this.relToHost  = 'in';
  console.log('building '+this.name);

    function getName() {
      return (data.name) ? data.name : 'unkown object';
    }

    function getLoc() {
      console.log('my loc=');
      console.log(data.loc);
      return (data.loc) ? data.loc : 'void';
    }
  
    function getPluralName() {
      var name = getName();
      if (getQtyNumber() > 1) {
        var plurals = {'knife':'knives', 'sheep':'sheep', 'loaf':'loaves'};
        var plural = plurals[name];
        name = (plural === undefined) ? name+'s' : plural;
      }
      return name;
    } 
    
    function getLongName() {
      var qty = getQtyText(getName());
      var extra = (data.extra) ? data.extra : '';
      
      var inLoc = '';
      if (getLoc() != 'void') {
        var tmpObj = new CowObject(getLoc());
        inLoc = ' '+tmpObj.relToHost+' '+tmpObj.pluralName;
      };
      
      return qty+' '+extra+' '+getPluralName()+inLoc;
    }
  
    function getQtyNumber() {
      return (data.qty) ? data.qty : 1;
    }
    
    function getQtyText(name2) {
      var qty = getQtyNumber();
      console.log("name="+name2);
      
      if (qty == 1) {
        qty = ('aeiou'.indexOf(name2.substr(0,1))) ? 'an' : 'a';
      } else if (qty == 2) {
        qty = 'two';
      } else if (qty == 3) {
        qty = 'three';
      } else if (qty == -1) {
        qty = 'the';
      } else if (qty < 10) {
        qty = 'some';
      } else if (qty < 99) {
        qty = 'many';
      } else if (qty < 999) {
        qty = 'hundreds';
      } else if (qty < 999999) {
        qty = 'thousands';
      } else if (qty < 999999999) {
        qty = 'millions';
      } else {
        qty = 'truckloads of'
      }
      return qty; 
    }
  }

  function getObject(id) {
    var objList = {
      "house":{"id":"house", "name":"house", "qty":"2", "extra":"red brick", "loc":"openfield"},
      "openfield":{"id":"openfield", "name":"open field", "qty":"1", "extra":"large", "loc":"void"},
      "smallmouse":{"id":"smallmouse", "name":"open field", "qty":"1", "extra":"large", "loc":"openfield"}
    };

    var jsonObject = objList[id];
    return jsonObject;
  }

  var myRawObj = getObject("house");
  if (myRawObj) {
    var myObj = new CowObject(myRawObj);
    console.log(myObj.longName);
  } else {
    console.log("Not found")
  }
