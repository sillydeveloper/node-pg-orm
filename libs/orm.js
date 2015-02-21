'use strict';

var baseOrm = require('./base.js');

module.exports.build = function(obj) {
  // some simple error checking:
  if (typeof obj != 'object') throw new Error('Cannot build without an object');
  if (obj.hasOwnProperty('tableName') == false && obj.tableName != null) throw new Error('Cannot build without a tableName to connect');
  if (obj.hasOwnProperty('tableProperties') == false && obj.tableProperties != null) throw new Error('Cannot build without tableProperties to export');

  var _return = new baseOrm.Base();
  _return.tableName = obj.tableName;
  _return.tableProperties = obj.tableProperties;

  return _return;
};

