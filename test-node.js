var benchmark = {
  start: function() {
    this.startTime = (new Date).getTime();
  },

  stop: function() {
    console.log((new Date).getTime() - this.startTime + "ms");
  }
}

Memoria = require("./memoria.js");

db = Memoria("test");

if(!db.exists) {

  /* create table */

  db("users", ["name", "age", "salary"]); 

  /* insert some values */

  db("users").insert(
    { "name": "Vennril", "age": 41, "salary": 1600 }, 
    { "name": "andrewjbaker", "age": 15, "salary": 2600 }, 
    { "name": "QF-MichaelK", "age": 12, "salary": 2100 }, 
    { "name": "tsatse", "age": 9, "salary": 2800 }, 
    { "name": "jerev", "age": 65, "salary": 2400 }, 
    { "name": "Hinton", "age": 48, "salary": "10 pounds of rice" }, 
    { "name": "digitarald", "age": 58, "salary": 3200 }, 
    { "name": "aJamD0nut", "age": 12, "salary": 2500 }, 
    { "name": "Armen138", "age": 11, "salary": 2400 }
  );

  for(var i = 0; i < 500000; i++) {
    db("users").insert({
      name: Math.random().toString(36).substring(2),
      age: Math.random() * 100 | 0,
      salary: Math.random() * 10000 | 0
    });
  }  

}


/* update sallary by age */

db("users").all().update(function(r, i) {
  r[i.salary] = r[i.age] * 100;
});

/* get users with sallary > 1000 */

db("users").all(function(r, i) {
  return r[i.salary] > 1000;
}).result;

/* Find Hinton */

db("users").one({ name: "Hinton" });

benchmark.start();
  var rc = db("users").all(function(r, i) {
    return Math.random() > 0.5;
  }).result;  
benchmark.stop();
