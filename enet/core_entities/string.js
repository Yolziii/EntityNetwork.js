// #import modules
try {
    var CoreId = require('../CoreId.js');
    var EntityError = require('../EntityError');
    var EntityErrorId = require('../EntityErrorId');
} catch(e) {}
// import modules#

var DataType_String = {
    checkValueAsProperty: function(entity, value) {
        if (this[CoreId.MAX_LENGTH] !== undefined && value.length > this[CoreId.MAX_LENGTH]) {
            throw new EntityError(
                EntityErrorId.ConditionMaxLength,
                'Length of string value for "' + this.id + '" must be <= ' + this[CoreId.MAX_VALUE] + ' but was ' + value.length);
        }

        if (this[CoreId.MIN_LENGTH] !== undefined && value.length < this[CoreId.MIN_LENGTH]) {
            throw new EntityError(
                EntityErrorId.ConditionMinLength,
                'Length of string value for "' + this.id + '" must be <= ' + this[CoreId.MAX_VALUE] + ' but was ' + value.length);
        }

        if (this[CoreId.SINGLE_LINE] !== undefined && this[CoreId.SINGLE_LINE] && value.indexOf('\n') != -1) {
            throw new EntityError(
                EntityErrorId.ConditionSingleLine,
                'String value for "' + this.id + '" must be single line but was "' + value + '"');
        }

        if (this[CoreId.REGEXP] !== undefined && !value.match(new RegExp(this[CoreId.REGEXP]))) {
            throw new EntityError(
                EntityErrorId.ConditionRegexp,
                'String value "' + value + '" for "' + this.id + '" doesn\'t match to regexp "'+this[CoreId.REGEXP]+'"');
        }

        return value;
    }
};

// #export modules
try {
    module.exports = DataType_String;
} catch(e) {}
// export modules#