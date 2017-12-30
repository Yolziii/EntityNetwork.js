// #import modules
try {
    var CoreId = require('../CoreId.js');
    var EntityError = require('../EntityError');
    var EntityErrorId = require('../EntityErrorId');
} catch(e) {}
// import modules#

var Property_SingleLine = {
    checkValueAsProperty: function(entity, value) {
        if (!entity.is(CoreId.STRING)) {
            throw new EntityError(
                EntityErrorId.SingleLineForStringsOnly,
                '"single_line" can be applied to string properties only, but property is "' + this.id + '"');
        }

        return value;
    }
};

// #export modules
try {
    module.exports = Property_SingleLine;
} catch(e) {}
// export modules#