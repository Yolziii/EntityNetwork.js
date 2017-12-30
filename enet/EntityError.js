// #Node.js
try {
    //var CoreId = require('./CoreId.js');
    module.exports = EntityError;
} catch(e) {}
// Node.js#

function EntityError(id, message) {
    this.id = id;
    this.message = message;
}

