/* Test of our base ORM library */
'use strict';

var assert = require('assert');
var orm = require('../libs/orm.js');

// tie the base tests to the test table:
var testBase = orm.build({ 
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

describe('crud operators', function () {
  it('should should build an object', function () {
    assert(testBase.tableName == 'test', 'named object should be named');
  });

  it('should be able to create an object', function(done) {
    testBase.create({ 'name': 'Create' }).then(function(testObject) {
      assert(testObject.name == 'Create', 'Name should be Create');
      assert(typeof testObject.id != 'undefined', 'ID should not be undefined after insert');
      assert(testObject.prototype == testBase.prototype, 'Protos don\'t match');
      done();
    });
  });

  it('should be able to update an existing object', function(done) {
    testBase.create({ 'name': 'Update' }).then(function(testObject) {
      testObject.name = 'Mike';
      testObject.update().then(function() {
        assert(testObject.name == 'Mike', 'Should update to new name of Mike');
        done();
      });
    });
  });

  it('should be able to update an existing object with hash', function(done) {
    this.timeout(5000);
    testBase.create({ 'name': 'UpdateHash' }).then(function(testObject) {
      testBase.update({ id: testObject.id, name: 'Richard'}).then(function(result) {
        testBase.findById(testObject.id).then(function(newTestObject) {
          assert(newTestObject.name === 'Richard', 'Should update to new name of Richard');
          done();
        })
      });
    });
  });

  it('should be able to find an existing object', function(done) {
    testBase.create({ 'name': 'Find' }).then(function(testObject) {
      testBase.findById(testObject.id).then(function(newTestObject) {
        assert(testObject.name == 'Find', 'Name should be Find after find');
        done();
      });
    });
  });

  it('should be able to delete an existing object by ID', function(done) {
    testBase.create({ 'name': 'Delete' }).then(function(testObject) {
      var _id = testObject.id;
      testObject.deleteById(_id).then(function(data) {
        done();
      })
    });
  });

  it('should be able to delete an existing object', function(done) {
    testBase.create({ 'name': 'Delete' }).then(function(testObject) {
      testObject.delete().then(function(data) {
        done();
      })
    });
  });
});
