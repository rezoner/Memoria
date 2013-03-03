Memoria
=======

Simple database for node.js
---------------------------

The library is in early development - some features are not implemented yet - but these are marked.

Memoria is designed especially for browser based games without much of relational data.
Everything happens in memory, but the data is saved to a file.
It is meant to be used with applications that doesn't share database with other instances.

### Install:

    npm install memoria

### Create database:

    Memoria(name, onReady);

Looks for file `test.memoria` to restore data.
If file doesn't exists it will be created.

    var db = Memoria("test", function(exists) {

        if(!exists) {

            /* some creational functions */    

        }       

    });


### Create collection:

    /* just use it - collection will be created on the fly */
    db("users");

### Insertion:

    db("users").insert({ name: "Vennril", age: 15, salary: 1000 });

or

    db("users").insert({ ... }, { ... }, { ... });
    
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

    db("users").all(function(r) {
      return r.age > 32;
    }).result; 
    

### Updating:

    db("users").all({ age: 32 }).update({ salary: 1600 });
    
or

    db("users").all({ age: 32 }).update(
      function(r) {
        r.salary *= 2;
    });    
    
### Removing:

    db("users").all(selector).remove();
