'use strict';

var pg = require('pg');
var fs = require('fs');
var Q = require('q');

// read in the database.json file:
var db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
var connectionString = 'postgres://' + db.dev.user + ':' + db.dev.password + '@' + db.dev.host + '/' + db.dev.database;

// convenience method:
function dbCall(stmnt, values) {
  // return a promise encased db call
  var defer = Q.defer();
  pg.connect(connectionString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }

    client.query(stmnt, values, function(err, result) {
      if(err) {
        return console.error('error running query', err);
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

Base.prototype.create = function(data) {
  var _this = this;

  var _ppo = [], 
    _propertyNames = [], 
    _propertyValues = [], 
    _cnt = 1;

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

Base.prototype.update = function() {
  var _this = this;

  var _propertyValues = [], 
      _cnt = 1,
      _stmntChunks = [];

  for (var i in _this.tableProperties) {
    if (i != 'id') {
      _stmntChunks.push(i + ' = $' + _cnt);
      _cnt++;
      _propertyValues.push(_this[i]);
    }
  }
  _propertyValues.push(_this.id);

  var stmnt = 'UPDATE ' + _this.tableName + ' SET ' + _stmntChunks.join() + ' WHERE id=$' + _cnt;

  var defer = Q.defer();
  dbCall(stmnt, _propertyValues).then(function(data) {
    defer.resolve(data);
  });
  
  return defer.promise;
}; // end update

// ---------------------------------------

module.exports.build = function(obj) {
  if (typeof obj != 'object') throw new Error('Cannot build without an object');
  if (obj.hasOwnProperty('tableName') == false && obj.tableName != null) throw new Error('Cannot build without a tableName to connect');
  if (obj.hasOwnProperty('tableProperties') == false && obj.tableProperties != null) throw new Error('Cannot build without tableProperties to export');

  var _return = new Base();
  _return.tableName = obj.tableName;
  _return.tableProperties = obj.tableProperties;

  return _return;
};

