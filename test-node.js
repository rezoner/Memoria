Memoria = require("./memoria.js");

db = Memoria("test");


if(!db.exists) {
  db("users", ["name", "age", "salary"])


  var users = db("users");

  users.insert([{
    "name": "Vennril",
    "age": 41
  }, {
    "name": "andrewjbaker",
    "age": 15
  }, {
    "name": "QF-MichaelK",
    "age": 12
  }, {
    "name": "tsatse",
    "age": 9
  }, {
    "name": "jerev",
    "age": 65
  }, {
    "name": "Hinston",
    "age": 48
  }, {
    "name": "digitarald",
    "age": 58
  }, {
    "name": "aJamD0nut",
    "age": 12
  }, {
    "name": "Armen138",
    "age": 11
  }]);

}