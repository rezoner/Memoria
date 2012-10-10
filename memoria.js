Memoria = (function() {

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

    indexes: function(keys) {
      var result = {};
      for(var i = 0; i < keys.length; i++) {
        result[i] = keys[i];
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
      this.tables[name] = {
        autoincrement: 1,
        structure: fields,
        indexes: _.indexes(fields),
        items: {}
      }
    }
  };

  var Table = function(db, name) {
      this.db = db;
      this.name = name;

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
      this.items[this.autoincrement++] = _.fold(data, this.structure);
    }
  };

  var Query = function(single, table, query) {
      this.single = single

      this.table = table;
      this.result = null;
      this.items = [];



      if(query instanceof Function) {
        for(var i = 0, len = this.table.items.length; i < len; i++) {
          if(this.query(this.table.items[i], this.table.indexes)) {
            this.items.push(this.table.items[i]);
            if(this.single) {
              break;
            }
          }
        }
      } else {
        this.items = [this.table.items[query]];
      }

      if(this.items) {
        if(this.single) {
          this.result = _.unfold(this.items[0], this.table.structure);
        } else {

        }
        
      }
    };

  _.extend(Query.prototype, {

    update: function(how) {
      if(query instanceof Function) {
        how(this.item);
      } else {
        this.result
      }
    }

  });

  return Memoria;

})();