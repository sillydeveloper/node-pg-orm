'use strict';

var pg = require('pg');
var fs = require('fs');
var Q = require('q');
var _ = require('lodash');

// read in the database.json file:
var dbFile = './database.json';
if (fs.existsSync(dbFile) == false) {
  throw new Error('No database.json to read.');
}

var db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
var connectionString = 'postgres://' + db.dev.user + ':' + db.dev.password + '@' + db.dev.host + '/' + db.dev.database;

// convenience method:
function dbCall(stmnt, values) {
  // return a promise encased db call
  var defer = Q.defer();
  pg.connect(connectionString, function(err, client, done) {
    if(err) {
      return console.error('Error fetching client from pool', err);
    }

    client.query(stmnt, values, function(err, result) {
      if(err) {
        return console.error('Error running query:\n', err + '\n', stmnt, values + '\n');
      }

      // release!
      client.end();
      defer.resolve(result);
    });
  });
  return defer.promise;
}

// ---------------------------------------

var Base = function() {
  this.tableName = null;
  this.tableProperties = null;
};

Base.prototype.create = function(hash) {
  var _this = this,
      ppo = [], 
      propertyNames = [], 
      propertyValues = [], 
      cnt = 1;

  // check the incoming data to ensure that it's legit mapped to the db:
  for (var i in hash) {
    if (this.tableProperties.hasOwnProperty(i)) {
      propertyNames.push(i);
      ppo.push('$' + cnt);
      cnt++;
      propertyValues.push(hash[i]);
    }
  }

  var stmnt = 'INSERT INTO ' + _this.tableName + ' ( ' + propertyNames.join() + ' ) VALUES (' + ppo.join() + ') RETURNING ID';

  var defer = Q.defer();
  dbCall(stmnt, propertyValues).then(function(data) {
    var newObject = new Base();
    newObject.tableProperties = _this.tableProperties;
    newObject.tableName = _this.tableName;

    newObject.id = data.rows[0].id;

    for(var j in propertyNames) {
      var k = propertyNames[j];
      newObject[k] = propertyValues[j];
    }
    defer.resolve(newObject);
  });
  
  return defer.promise;
}; // end create

Base.prototype.createMany = function(arrayOfHashes) {
  var _this = this;
  var promiseArray = _.map(arrayOfHashes, function(objectDefinition) {
    console.log(objectDefinition);
    return _this.create(objectDefinition);
  });

  return Q.all(promiseArray);
};

Base.prototype.update = function(hash) {
  var _this = this;

  var propertyValues = [], 
      cnt = 1,
      stmntChunks = [],
      sourceValues, 
      sourceKeys;

  // use our own properties or use a passed-in hash?
  if (hash) {
    sourceValues = sourceKeys = hash;
  } else {
    sourceKeys = _this.tableProperties;
    sourceValues = _this;
  } 

  if (sourceKeys.hasOwnProperty('id') == false || sourceKeys.id == null) {
    throw new Error('Update call with hash requires \'id\' to update');
  }

  // statement building:
  for (var i in sourceKeys) {
    if (i != 'id') {
      stmntChunks.push(i + ' = $' + cnt);
      cnt++;
      propertyValues.push(sourceValues[i]);
    }
  }
  propertyValues.push(sourceValues.id);

  var stmnt = 'UPDATE ' + _this.tableName + ' SET ' + stmntChunks.join() + ' WHERE id=$' + cnt;

  var defer = Q.defer();
  dbCall(stmnt, propertyValues).then(function(data) {
    defer.resolve(data);
  });

  return defer.promise;
}; // end update

Base.prototype.findById = function(id) {
  var _this = this;
  var stmnt = 'SELECT * FROM ' + _this.tableName + ' WHERE id = $1';

  var defer = Q.defer();
  dbCall(stmnt, [ id ]).then(function(data) {
    if (data.rows.length < 1) {
      defer.resolve(data);
    }

    // build a new object from the result:
    var newObject = new Base();
    newObject.tableProperties = _this.tableProperties;
    newObject.tableName = _this.tableName;

    for(var j in newObject.tableProperties) {
      newObject[j] = data.rows[0][j];
    }
    defer.resolve(newObject);
  });

  return defer.promise;
}; // end findById

Base.prototype.deleteById = function(id) {
  var _this = this;
  var stmnt = 'DELETE FROM ' + _this.tableName + ' WHERE id=$1';

  var defer = Q.defer();
  dbCall(stmnt, [ id ]).then(function(data) {
    defer.resolve(data);
  });

  return defer.promise;
}; // end deleteById

Base.prototype.delete = function() {
  return this.deleteById(this.id);
}; // end delete

// ---------------------------------------

module.exports.Base = Base;
