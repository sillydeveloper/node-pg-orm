'use strict';

var pg = require('pg');
var fs = require('fs');
var Q = require('q');

// read in the database.json file:
var dbFile = './database.json';
if (fs.existsSync(dbFile) == false) {
  throw new Error('No database.json to read.');
}

var db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
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
        return console.error('Error running query', err);
      }

      // release!
      client.end();
      defer.resolve(result);
      
    });
  });
  return defer.promise;
}

// ---------------------------------------

// This should probably be in another file...
var Base = function() {
  this.tableName = null;
  this.tableProperties = null;
};

Base.prototype.create = function(data) {
  var _this = this;

  var _ppo = [], 
    _propertyNames = [], 
    _propertyValues = [], 
    _cnt = 1;

  // check the incoming data to ensure that it's legit mapped to the db:
  for (var i in data) {
    if (this.tableProperties.hasOwnProperty(i)) {
      _propertyNames.push(i);
      _ppo.push('$' + _cnt);
      _cnt++;
      _propertyValues.push(data[i]);
    }
  }

  var stmnt = 'INSERT INTO ' + _this.tableName + ' ( ' + _propertyNames.join() + ' ) VALUES (' + _ppo.join() + ') RETURNING ID';

  var defer = Q.defer();
  dbCall(stmnt, _propertyValues).then(function(data) {
    var newObject = new Base();
    newObject.tableProperties = _this.tableProperties;
    newObject.tableName = _this.tableName;

    newObject.id = data.rows[0].id;

    for(var j in _propertyNames) {
      var k = _propertyNames[j];
      newObject[k] = _propertyValues[j];
    }
    defer.resolve(newObject);
  });
  
  return defer.promise;
}; // end create

Base.prototype.update = function(hash) {
  var _this = this;

  var _propertyValues = [], 
      _cnt = 1,
      _stmntChunks = [],
      _sourceValues, 
      _sourceKeys;

  if (hash) {
    _sourceValues = _sourceKeys = hash;
  } else {
    _sourceKeys = _this.tableProperties;
    _sourceValues = _this;
  } 

  if (_sourceKeys.hasOwnProperty('id') == false || _sourceKeys.id == null) {
    throw new Error('Update call with hash requires \'id\' to update');
  }

  // statement building:
  for (var i in _sourceKeys) {
    if (i != 'id') {
      _stmntChunks.push(i + ' = $' + _cnt);
      _cnt++;
      _propertyValues.push(_sourceValues[i]);
    }
  }
  _propertyValues.push(_sourceValues.id);

  var stmnt = 'UPDATE ' + _this.tableName + ' SET ' + _stmntChunks.join() + ' WHERE id=$' + _cnt;

  var defer = Q.defer();
  dbCall(stmnt, _propertyValues).then(function(data) {
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
