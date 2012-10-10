Memoria
=======

Simple database for node.js
---------------------------

It is not working yet.

Memoria is designed especially for browser based games without much of relational data.
Everything happens in memory, but the data is saved to a file.
It is meant to be used with applications that doesn't share database with other instances.

### Create database:

This creates a file named `test.memoria` to store the data.

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

Object (equal check):

    db("users").all({ age: 16 }).result;
    
Function (flexible querries):

    /* get all items matching age > 32 */

    db("users").all(function(r, i) {
      return r[i.age] > 32;
    }).result; 
    
Note that properties have to be accessed using additional array with indexes. It is not really convenient but gives a huge boost to performance.

### Updating *not implemented*:

    db("users").all({ age: 32 }).update({ salary: 1600 });
    
or

    db("users").all({ age: 32 }).update(function(r, i) {
      r[i.salary] *= 2;
    });
    
    
    
### Removing *not implemented*:

    db("users").all(selector).remove();
