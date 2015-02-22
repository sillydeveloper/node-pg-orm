/* Test of our ability to do relations */
'use strict';

var assert = require('assert');
var orm = require('../libs/orm.js');

// tie the base tests to the test table:
var testBase = orm.build({ 
  tableName: 'test', 
  tableProperties: { 
    id: {
      type: 'key'
    },
    name: { 
      type: 'string' 
    }
  },
  relations: {
    hasMany: [ 'testMany' ]
  }
});

var testMany = orm.build({ 
  tableName: 'test_many', 
  tableProperties: { 
    id: {
      type: 'key'
    },
    name: { 
      type: 'string' 
    }
  },
  relations: {
    belongsTo: [ 'test' ]
  }
});

describe('crud operators', function () {
  it('should be able to load', function () {
    assert(testBase.tableName == 'test', 'named object should be named');
  });

});
