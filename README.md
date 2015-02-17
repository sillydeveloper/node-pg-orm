# An overly simplistic ORM experiment.

This was built primarily to see how far I could get in an afternoon / evening in scratch building an ORM. You can see that in the initial [commits](https://github.com/sillydeveloper/node-pg-orm/commit/cdae9fe33e0c2e2ce79a9f8141f4773574706ccc). (Not to say I won't keep working on it!)

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

### Quick start for development

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
