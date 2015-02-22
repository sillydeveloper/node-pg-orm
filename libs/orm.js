'use strict';

var _ = require('lodash');
var baseOrm = require('./base.js');


module.exports.build = function(obj) {
  // some simple error checking:
  if (typeof obj != 'object') throw new Error('Cannot build without an object');
  if (obj.hasOwnProperty('tableName') == false && obj.tableName != null) throw new Error('Cannot build without a tableName to connect');
  if (obj.hasOwnProperty('tableProperties') == false && obj.tableProperties != null) throw new Error('Cannot build without tableProperties to export');

  var newObjectBase = new baseOrm.Base();
  newObjectBase.tableName = obj.tableName;
  newObjectBase.tableProperties = obj.tableProperties;
  newObjectBase.tableRelations = obj.tableRelations;

  /* if (obj.relations) {
    if (obj.relations.belongsTo) {
      _.map(obj.relations.belongsTo, function(fakeMethod) {
        obj[fakeMethod] = 
      });
    }
    attachRelations(obj, obj.relations.hasMany);
    attachRelations(obj, obj.relations.hasOne);
  } */

  return newObjectBase;
};

