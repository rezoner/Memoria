Memoria
=======

It is not working yet.

Memoria is a library which is meant to be used as a temporary database. 
Designed especially for browser based games to quickly store things like users.
It lives in memory and is a wrapper for an array, not a real database.
Tho perfect for an applications without many relations data where there is only one process using a database.

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

Object (equal check):

    db("users").all({ age: 16 }).result;
    
Function (flexible querries):

    /* get all items matching age > 32 */

    db("users").all(function(r, i) {
      return r[i.age] > 32;
    }).result; 
    
Note that properties have to be accessed using additional array with indexes. It is not really convenient but gives a huge boost to performance.

### Updates:

    db("users").all({ age: 32 }).update({ salary: 1600 });
    
or

    db("users").all({ age: 32 }).update(function(r, i) {
      r[i.salary] *= 2;
    });
    
    
