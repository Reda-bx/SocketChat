var DB = require('./db').DB;

var User = DB.Model.extend({
    tableName: 'user',
    idAttribute: 'id'
});


module.exports = {
    User: User
};
