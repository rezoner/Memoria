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

    inverse: function(keys) {
      var result = {};
      for(var i = 0; i < keys.length; i++) {
        result[keys[i]] = i;
      }

      return result
    },

    cleanArray: function(array, property) {

      var lastArgument = arguments[arguments.length - 1];
      var isLastArgumentFunction = typeof lastArgument === "function";

      for(var i = 0, len = array.length; i < len; i++) {
        if(array[i] === null || (property && array[i][property])) {
          if(isLastArgumentFunction) {
            lastArgument(array[i]);
          }
          array.splice(i--, 1);
          len--;
        }
      }
    }


  };


  var databases = {};

  var Memoria = function(name, callback) {
      if(!databases[name]) {
        databases[name] = new Database(name, callback);
      }

      var database = databases[name];

      var wrapper = (function(database) {
        return function(name) {
          return database.collection(name);
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
      this.collections = {};

      var self = this;
      this.filePath = name + ".memoria";
      this.callback = callback;

      if(!BROWSER) {
        if(this.exists = fs.existsSync(this.filePath)) {
          this.open();
        } else {
          setTimeout(function() { callback(false); }, 100);
        }

        setInterval(function() {
          self.save();
        }, Memoria.saveInterval);
      }
    };

  Database.prototype = {

    collection: function(name) {
      if(!this.collections[name]) {
        this.collections[name] = new Collection(this, name);
      }
      return this.collections[name];
    },

    open: function() {
      var self = this;
      var buffer = fs.readFileSync(this.filePath);
      require('zlib').inflate(buffer, function(err, data) {
        self.data = JSON.parse(data);
        self.callback(true);
      });      
    },

    save: function() {
      if(!this.updated) return false;
      if(this.saving) return false;

      var self = this;      

      this.saving = true;
      this.updated = false;

      require('zlib').deflate(JSON.stringify(this.data), function(err, buffer) {
        fs.writeFile(self.filePath, buffer, function(err) {
          if(Memoria.benchmark) console.log("database saved");
        });
        self.saving = false;
      });
      
    }
  };

  var Collection = function(db, name) {
      this.db = db;
      this.name = name;
      this.indexing = {};

      if(this.db) {
        if(!this.db.data[name]) {
          this.db.data[name] = {
            autoincrement: 1,
            documents: []
          }
        }
        
        _.extend(this, db.data[name]);
      }

      for(var i = 0; i < this.documents.length; i++) {
        this.indexing[this.documents[i][0]] = this.documents[i];
      }

      if(Memoria.benchmark) {
        console.log("\n\n");
        console.log("Memoria: collection `" + name + "` length is " + this.documents.length);
        console.log("---------------------------------------------------");
      }

    };

  Collection.prototype = {
    one: function(query) {
      return new Query(true, this, query);
    },

    all: function(query) {
      return new Query(false, this, query);
    },

    insert: function(data) {
      var documents = arguments;

      this.db.updated = true;

      /*
      if(!(data instanceof Array)) {
        documents = [data];
      }
*/

      for(var i = 0; i < documents.length; i++) {
        var id = this.autoincrement++;
        documents[i].id = id;
        var document = documents[i];

        this.documents.push(document);
        this.indexing[id] = document;
      }
    },

    clean: function() {
      _.cleanArray(this.documents, "_remove");
    }

  };

  var Query = function(single, collection, query) {
      this.single = single

      this.collection = collection;
      this.result = null;
      this.documents = [];

      if(Memoria.benchmark) _.benchmark.start();

      if(!query || query instanceof Function) {

        for(var i = 0, len = this.collection.documents.length; i < len; i++) {
          if(!query || query(this.collection.documents[i])) {
            this.documents.push(this.collection.documents[i]);
            if(this.single) break;            
          }
        }
      } else if(query instanceof Object) {
        for(var i = 0, len = this.collection.documents.length; i < len; i++) {
          var add = true;
          for(var property in query) {
            if(this.collection.documents[i] !== query[property]) {
              add = false;
              break;
            }
          }

          if(add) {
            this.documents.push(this.collection.documents[i]);
          }
        }
      } else {
        var document = this.collection.indexing[query];
        if(document) {
          this.documents = [document];
        }
      }

      if(this.documents.length) {
        if(this.single) {
          if(this.documents.length) {
            this.result = this.documents[0];
          }
        } else {
          this.result = [];
          for(var i = 0; i < this.documents.length; i++) {
            this.result.push(this.documents[i]);
          }
        }

      }

      if(Memoria.benchmark) {
        if(!query || query instanceof Function) {
          console.log(_.benchmark.stop() + " ms | selecting " + (single ? "one" : "all") + " from " + this.collection.name + " matching " + (!query ? "*" : String(query).replace(/\n/g, " ")));
        } else if(query instanceof Object) {
          console.log(_.benchmark.stop() + " ms | selecting " + (single ? "one" : "all") + " from " + this.collection.name + " matching ", query);
        } else {
          console.log(_.benchmark.stop() + " ms | selecting " + (single ? "one" : "all") + " from " + this.collection.name + " matching ID=" + query);
        }

        console.log("results: ", this.documents ? this.documents.length : 0);
        console.log("---------------------------------------------------");
      }
    };

  _.extend(Query.prototype, {

    update: function(what) {
      for(var i = 0; i < this.documents.length; i++) {
        if(what instanceof Function) {
          what(this.documents[i]);
        } else {
          _.extend(this.documents[i], what);
        }
      }
    },

    remove: function() {
      console.log("REMOVE", this.documents)
      for(var i = 0; i < this.documents.length; i++) {
        this.documents[i]._remove = true;
      }
      this.collection.clean();
    }

  });

  if(BROWSER) {
    window.Memoria = Memoria;
  } else {
    module.exports = Memoria;
  }


})();