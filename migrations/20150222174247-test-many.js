dbm = dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('test_many', {
    id: { type: 'serial', primaryKey: true },
    name: 'string',
    test_id: 'integer'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('test_many', callback);
};
