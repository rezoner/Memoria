Memoria
=======

IT IS A DRAFT DONT USE THIS YET

Native database for javascript
---------------------------

    var db = Memoria("test");

### Create table:

    db("users", ["name", "age", "salary"]);

### Insertion:

    db("users").insert({ name: "Vennril", age: 15, salary: 1000 });
    
### Querrying:

    db("users").one(selector).result;
    db("users").all(selector).result;

### Selectors:

Number (returns entry by ID):

    db("users").one(32).result;

Object

    db("users").all({ age: 16 }).result;
    
Function (adds item to resultset if it returns true)

    /* this returns all items matching age > 32 */

    db("users").all(function(r, i) {
      return r[i.age] > 32;
    }).result; 

### Updates:

    db("users").all({ age: 32 }).update({ salary: 1600 });
    
or

    db("users").all({ age: 32 }).update(function(r, i) {
      r[i.salary] *= 2;
    });
    
    
