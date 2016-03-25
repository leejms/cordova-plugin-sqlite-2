import map from 'lodash.map';
import zipObject from 'lodash.zipobject';

function massageError(err) {
  return typeof err === 'string' ? new Error(err) : err;
}

function Database(dbName) {
  this._dbName = dbName;
}

Database.prototype._exec = function exec(type, sql, sqlArgs, callback) {

  function onSuccess(successResult) {
    var executionResult = {
      lastID: successResult.insertId,
      changes: successResult.rowsAffected
    };
    var rows = map(successResult.rows, function (rawRow) {
      return zipObject(successResult.columns, rawRow);
    });
    callback.call(executionResult, null, rows);
  }

  function onError(err) {
    var executionResult = {
      lastID: 0,
      changes: 0
    };
    callback.call(executionResult, massageError(err), []);
  }

  cordova.exec(onSuccess,
    onError,
    "SQLitePlugin",
    type,
    [this._dbName, sql, sqlArgs]);
};

Database.prototype.all = function all(sql, sqlArgs, callback) {
  this._exec('all', sql, sqlArgs, callback);
};

Database.prototype.run = function run(sql, sqlArgs, callback) {
  this._exec('run', sql, sqlArgs, callback);
};

function SQLite() {
}
SQLite.prototype.Database = Database;

export default new SQLite();