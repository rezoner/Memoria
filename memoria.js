(function() {

  var _ = {

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
    }

  };

  var databases = {};

  var Memoria = function(name) {
      if(!databases[name]) {
        databases[name] = new Database(name);
      }

      return(function(database) {
        return function(name, args) {
          if(typeof args !== "undefined") {
            return database.setupTable(name, args);
          } else {
            return database.table(name);
          }
        };
      })(databases[name]);

    };

  Memoria.databses = databases;

  var Database = function(name) {
      this.tables = {};
    };

  Database.prototype = {
    table: function(name) {
      return new Table(this, name);
    },

    setupTable: function(name, fields) {
      fields.unshift("id");

      this.tables[name] = {
        autoincrement: 1,
        structure: fields,
        keyToIndex: _.inverse(fields),
        items: []
      }
    }
  };

  var Table = function(db, name) {
      this.db = db;
      this.name = name;
      this.indexing = {};

      if(this.db) {
        _.extend(this, db.tables[name]);
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
      var items = data;

      if(!(data instanceof Array)) {
        items = [data];
      }

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
      } else {
        this.items = [this.indexing[query]];
      }

      if(this.items.length) {
        if(this.single) {
          this.result = _.unfold(this.items[0], this.table.structure);
        } else {
          this.result = [];
          for(var i = 0; i < this.items.length; i++) {
            this.result.push(_.unfold(this.items[i], this.table.structure));
          }
        }

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

  if(typeof window === 'undefined') {
    exports = Memoria;
  } else {
    window.Memoria = Memoria;
  }


})();