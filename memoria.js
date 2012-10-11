(function() {

  var BROWSER = typeof window !== 'undefined';

  if(!BROWSER) {
    var fs = require('fs');
  }

  var _ = {

    benchmark: {
      start: function() {
        this.startTime = (new Date).getTime();
      },

      stop: function(text) {
        return(new Date).getTime() - this.startTime;
      }
    },


    extend: function() {
      for(var i = 1; i < arguments.length; i++) {
        for(var j in arguments[i]) {
          arguments[0][j] = arguments[i][j];
        }
      }
    },

    /* fold object using keys */

    fold: function(data, keys) {
      var result = [];
      for(var i = 0; i < keys.length; i++) {
        result[i] = data[keys[i]];
      }

      return result;
    },

    /* unfold object using keys */

    unfold: function(data, keys) {
      var result = {};
      for(var i = 0; i < keys.length; i++) {
        result[keys[i]] = data[i];
      }

      return result
    },

    inverse: function(keys) {
      var result = {};
      for(var i = 0; i < keys.length; i++) {
        result[keys[i]] = i;
      }

      return result
    },

    pack: function(s) {
      var dict = {};
      var data = (s + "").split("");
      var out = [];
      var currChar;
      var phrase = data[0];
      var code = 256;
      for(var i = 1; i < data.length; i++) {
        currChar = data[i];
        if(dict[phrase + currChar] != null) {
          phrase += currChar;
        } else {
          out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
          dict[phrase + currChar] = code;
          code++;
          phrase = currChar;
        }
      }
      out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
      for(var i = 0; i < out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
      }
      return out.join("");
    },

    unpack: function(s) {
      var dict = {};
      var data = (s + "").split("");
      var currChar = data[0];
      var oldPhrase = currChar;
      var out = [currChar];
      var code = 256;
      var phrase;
      for(var i = 1; i < data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if(currCode < 256) {
          phrase = data[i];
        } else {
          phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
      }
      return out.join("");
    }

  };


  var databases = {};

  var Memoria = function(name, callback) {
      if(!databases[name]) {
        databases[name] = new Database(name, callback);
      }

      var database = databases[name];

      var wrapper = (function(database) {
        return function(name, args) {
          if(typeof args !== "undefined") {
            return database.setupTable(name, args);
          } else {
            return database.table(name);
          }
        };
      })(database);

      wrapper.exists = database.exists;

      return wrapper;

    };

  Memoria.databases = databases;
  Memoria.saveInterval = 2000;
  Memoria.benchmark = true;

  var Database = function(name, callback) {
      this.data = {};
      this.tables = {};

      var self = this;
      this.filePath = name + ".memoria";
      this.callback = callback;

      if(!BROWSER) {
        if(this.exists = fs.existsSync(this.filePath)) {
          this.open();
        } else {
          setTimeout(function() { callback(true); }, 100);
        }

        setInterval(function() {
          self.save();
        }, Memoria.saveInterval);
      }
    };

  Database.prototype = {

    table: function(name) {
      if(!this.tables[name]) {
        this.tables[name] = new Table(this, name);
      }
      return this.tables[name];
    },

    setupTable: function(name, fields) {
      fields.unshift("id");

      this.data[name] = {
        autoincrement: 1,
        structure: fields,
        keyToIndex: _.inverse(fields),
        items: []
      }
    },

    open: function() {
      var self = this;
      var buffer = fs.readFileSync(this.filePath);
      require('zlib').inflate(buffer, function(err, data) {
        self.data = JSON.parse(data);
        self.callback(false);
      });      
    },

    save: function() {
      if(!this.updated) return false;
      if(this.saving) return false;

      var self = this;      

      this.saving = true;
      this.updated = false;
/*
      fs.writeFile(this.filePath, JSON.stringify(this.data), function(err) {
        if(err) {
          throw err;
        } else {
          self.saving = false;
        }

      });*/

      require('zlib').deflate(JSON.stringify(this.data), function(err, buffer) {
        fs.writeFile(self.filePath, buffer, function(err) {
          if(Memoria.benchmark) console.log("database saved");
        });
        self.saving = false;
      });
    }
  };

  var Table = function(db, name) {
      this.db = db;
      this.name = name;
      this.indexing = {};

      if(this.db) {
        _.extend(this, db.data[name]);
      }

      for(var i = 0; i < this.items.length; i++) {
        this.indexing[this.items[i][0]] = this.items[i];
      }


      if(Memoria.benchmark) {
        console.log("\n\n");
        console.log("Memoria: table `" + name + "` length is " + this.items.length);
        console.log("---------------------------------------------------");
      }

    };

  Table.prototype = {
    one: function(query) {
      return new Query(true, this, query);
    },

    all: function(query) {
      return new Query(false, this, query);
    },

    false: function(query) {
      return new Query(true, this, query);
    },

    insert: function(data) {
      var items = arguments;

      this.db.updated = true;

      /*
      if(!(data instanceof Array)) {
        items = [data];
      }
*/

      for(var i = 0; i < items.length; i++) {
        var id = this.autoincrement++;
        items[i].id = id;
        var item = _.fold(items[i], this.structure);

        this.items.push(item);
        this.indexing[id] = item;
      }
    }
  };

  var Query = function(single, table, query) {
      this.single = single

      this.table = table;
      this.result = null;
      this.items = [];

      if(Memoria.benchmark) _.benchmark.start();

      if(!query || query instanceof Function) {

        for(var i = 0, len = this.table.items.length; i < len; i++) {
          if(!query || query(this.table.items[i], this.table.keyToIndex)) {
            this.items.push(this.table.items[i]);
            if(this.single) {
              break;
            }
          }
        }
      } else if(query instanceof Object) {
        for(var i = 0, len = this.table.items.length; i < len; i++) {
          var add = true;
          for(var property in query) {
            var keyIndex = this.table.keyToIndex[property];
            if(this.table.items[i][keyIndex] !== query[property]) {
              add = false;
              break;
            }
          }

          if(add) {
            this.items.push(this.table.items[i]);
          }
        }
      } else {
        var item = this.table.indexing[query];
        if(item) {
          this.items = [item];
        }
      }

      if(this.items.length) {
        if(this.single) {
          if(this.items.length) {
            this.result = _.unfold(this.items[0], this.table.structure);
          }
        } else {
          this.result = [];
          for(var i = 0; i < this.items.length; i++) {
            this.result.push(_.unfold(this.items[i], this.table.structure));
          }
        }

      }

      if(Memoria.benchmark) {
        if(!query || query instanceof Function) {
          console.log(_.benchmark.stop() + " ms | selecting " + (single ? "one" : "all") + " from " + this.table.name + " matching " + (!query ? "*" : String(query).replace(/\n/g, " ")));
        } else if(query instanceof Object) {
          console.log(_.benchmark.stop() + " ms | selecting " + (single ? "one" : "all") + " from " + this.table.name + " matching ", query);
        } else {
          console.log(_.benchmark.stop() + " ms | selecting " + (single ? "one" : "all") + " from " + this.table.name + " matching ID=" + query);
        }

        console.log("results: ", this.items ? this.items.length : 0);
        console.log("---------------------------------------------------");
      }
    };

  _.extend(Query.prototype, {

    update: function(what) {
      for(var i = 0; i < this.items.length; i++) {
        if(what instanceof Function) {
          what(this.items[i], this.table.keyToIndex);
        } else {
          _.extend(this.items[i], what);
        }
      }
    }

  });

  if(BROWSER) {
    window.Memoria = Memoria;
  } else {
    module.exports = Memoria;
  }


})();