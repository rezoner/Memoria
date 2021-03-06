var benchmark = {
  start: function() {
    this.startTime = (new Date).getTime();
  },

  stop: function() {
    return(new Date).getTime() - this.startTime;
  }
}


Memoria = require("./memoria.js");

db = Memoria("test", function(exists) {
  console.log("EXISTS", exists);
  if(!exists) {

    /* create table */

    db("users", ["name", "age", "salary"]);

    /* insert some values */

    db("users").insert({
      "name": "Vennril",
      "age": 41,
      "salary": 1600
    }, {
      "name": "andrewjbaker",
      "age": 15,
      "salary": 2600
    }, {
      "name": "QF-MichaelK",
      "age": 12,
      "salary": 2100
    }, {
      "name": "tsatse",
      "age": 9,
      "salary": 2800
    }, {
      "name": "Hoppertje",
      "age": 65,
      "salary": 2400
    }, {
      "name": "Hinton",
      "age": 48,
      "salary": "10 pounds of rice"
    }, {
      "name": "digitarald",
      "age": 58,
      "salary": 3200
    }, {
      "name": "aJamD0nut",
      "age": 12,
      "salary": 2500
    }, {
      "name": "Armen138",
      "age": 11,
      "salary": 2400
    });

    var count = 100000;

    benchmark.start();

    for(var i = 0; i < count; i++) {
      db("users").insert({
        name: Math.random().toString(36).substring(2),
        age: Math.random() * 100 | 0,
        salary: Math.random() * 10000 | 0
      });
    }

    console.log("DATABASE FILE DOESN'T EXIST");
    console.log("inserting ", count, "rows took", benchmark.stop() + "ms");
    console.log("---------------------------------------------------");
  }


  /* update sallary by age */

  db("users").all().update(function(r) {
    r.salary = r.age * 100;
  });

  /* get users with sallary > 1000 */

  db("users").all(function(r) {
    return r.salary > 1000;
  }).result;

  /* Find Hoppertje */

  db("users").one({
    name: "Hoppertje"
  });

  var rc = db("users").all(function(r, i) {
    return Math.random() > 0.5;
  }).result;

  db("users").one(function(r) {
    return r.name === "Vennril";
  });

  db("users").one({
    name: "FakenCziken"
  });

  db("users").one(12000).remove();

  db("users").one(12000);

});