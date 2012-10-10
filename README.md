Memoria
=======

It is not working yet.

Memoria is an library which is meant to be used as a temporary database. 
Designed especially for browser based games to quickly store things like users.
It lives in memory and is a wrapper for an array, not a real database.
Tho perfect for an applications without meny relations data where there is only one process using a database.

Native database for javascript
---------------------------

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
    
    
