// #import modules
try {
    var CoreId = require('../CoreId.js');
    var EntityError = require('../EntityError');
    var EntityErrorId = require('../EntityErrorId');
} catch(e) {}
// import modules#

var Property_Unique = {
    _values: null,

    init: function() {
        this._values = {};
    },

    checkValueAsActiveProperty: function(property, entity, value) {
        if (this._values[property.id] === undefined) {
            this._values[property.id] = [];
        }
        if (this._values[property.id].indexOf(value) !== -1) {
            throw new EntityError(
                EntityErrorId.NotUniqueValue,
                'Value for property "'+property.id+'" must be unique, but value "' + value + '" was already used');
        }
        this._values[property.id].push(value);

        return value;
    }
};

// #export modules
try {
    module.exports = Property_Unique;
} catch(e) {}
// export modules#