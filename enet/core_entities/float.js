// #import modules
try {
    var CoreId = require('../CoreId.js');
    var EntityError = require('../EntityError');
    var EntityErrorId = require('../EntityErrorId');

} catch(e) {}
// import modules#

var DataType_Float = {
    checkValueAsProperty: function(entity, value) {
        if (this[CoreId.MAX_VALUE] !== undefined && value > this[CoreId.MAX_VALUE]) {
            throw new EntityError(
                EntityErrorId.ConditionMaxValue,
                'Value for "' + this.id + '" must be <= ' + this[CoreId.MAX_VALUE] + ' but was ' + value);
        }

        if (this[CoreId.MIN_VALUE] !== undefined && value < this[CoreId.MIN_VALUE]) {
            throw new EntityError(
                EntityErrorId.ConditionMinValue,
                'Value for "' + this.id + '" must be <= ' + this[CoreId.MAX_VALUE] + ' but was ' + value);
        }
        return value;
    }
};

// #export modules
try {
    module.exports = DataType_Float;
} catch(e) {}
// export modules#