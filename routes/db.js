var mysql = require('mysql');
var Bookshelf = require('bookshelf');

var sql_config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'database'
};

var connection = mysql.createConnection(sql_config);
var DB = Bookshelf.initialize({
    client: 'mysql',
    connection: sql_config
});

module.exports = connection;
module.exports.DB = DB;
