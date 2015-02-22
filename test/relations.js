/* Test of our ability to do relations */
'use strict';

var assert = require('assert');
var orm = require('../libs/orm.js');
var _ = require('lodash');

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
  tableRelations: {
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
  tableRelations: {
    belongsTo: [ 'test' ]
  }
});

describe('relationships matter', function () {
  it('should be able to assign a parent to a hasMany', function (done) {
    testBase.create({ name: 'HasMany' }).then(function(hasManyObject) {
      testMany.createMany([{ name: 'belongs1', test: hasManyObject }, { name: 'belongs2', test: hasManyObject }]).then(function(belongsToArray) {
        assert(belongsToArray.length == 2, 'Should have 2 objects');
        _.each(belongsToArray, function(obj) {
          assert(obj['test_id'] == hasManyObject.id, 'Relationships should map back');
        });
        done();
      });
    })
  });

});
