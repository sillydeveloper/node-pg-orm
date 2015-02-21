# An overly simplistic ORM.

This is a simple Postgres ORM that uses promises. 

### Installation

```
npm install pg-orm --save
```

Note that this will automatically use your database.json file to build the pg link, a la:

```
{
  "dev": {
    "driver": "pg",
    "user": "skoobi",
    "password": "something",
    "host": "localhost",
    "database": "myDB",
    "schema": "myDBSchema"
  }
}
```

### Creating your models
The ORM essentially acts like a factory that pops out objects based on a simple DSL. Here's an example definition:

```
'use strict';
var orm = require('pg-orm');

var person = {
  'tableName': 'people',
  'tableProperties': {
    'id': {
      'type': 'key'
    },
    'name': { 
      'type': 'string',
      'required': true
    },
    'email': { 
      'type': 'string',
      'required': true
    }
  }
};

module.exports = orm.build(person);
```

Once you have a factory set up, you can now create people:

```
'use strict';
var person = require('./person.js');

person.create({ 'name': 'Jimmy Johnson', 'email': 'test@example.com' }).then(function(newPerson) {
  assert(newPerson.name == 'Jimmy Johnson', 'Jimmy should have a name');
  newPerson.name = 'Jack White';
  newPerson.update().then(function(result) {
    assert(newPerson.name == 'Jack White', 'Database should be updated');
  });
});
```

I like [db-migrate](https://www.npmjs.com/package/db-migrate) to manage the database changes and keep the domain in sync.

### Available methods

##### create({ hash })
Create an object with the properties in the hash. This will return a new pg-orm object.

##### update()
Update the database with the properties of the object that matches tableProperties. This will return the raw pg result.

##### update(hash)
Update the database with the properties of the hash. This will return the raw pg result.

##### findById(id)
Find an object by ID. This will return a new pg-orm object.

##### deleteById(id)
Delete the object by ID. This will return the raw pg result.

##### delete()
Euphamisn for deleteById with the current ID.


### Quick start for developing pg-orm
Clone the project locally then install node modules:

```
npm install
```

Create a database.json file in the root directory like the example (or just rename it).

Install the test table:

```
db-migrate up
```

Run tests:

```
grunt mochacli
```
