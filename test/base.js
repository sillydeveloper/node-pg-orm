/* Test of our base ORM library */
'use strict';

var assert = require('assert');
var base = require('../libs/base.js');

// tie the base tests to the test table:
var testBase = base.build({ 
  'tableName': 'test', 
  'tableProperties': { 
    'id': {
      'type': 'key'
    },
    'name': { 
      'type': 'string' 
    }
  }
});

describe('base node module', function () {
  it('should should build an object', function () {
    assert(testBase.tableName == 'test', 'named object should be named');
  });

  it('should be able to create a new object', function(done) {
    testBase.create({ 'name': 'Ronald' }).then(function(testObject) {
      assert(testObject.name == 'Ronald', 'Name should be ronald');
      assert(typeof testObject.id != 'undefined', 'ID should not be undefined after insert');
      assert(testObject.prototype == testBase.prototype, 'Protos don\'t match');
      done();
    });
  });

  it('should be able to update an existing object', function(done) {
    this.timeout(5000);
    testBase.create({ 'name': 'Ronald' }).then(function(testObject) {
      testObject.name = 'Mike';
      testObject.update().then(function() {
        assert(testObject.name == 'Mike', 'Should update to new name');
        done();
      });
    });
  });
});
