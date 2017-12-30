// #import modules
try {
    var CoreId = require('../CoreId.js');
    var EntityError = require('../EntityError');
    var EntityErrorId = require('../EntityErrorId');
} catch(e) {}
// import modules#

var Property_Regexp = {
    checkValueAsProperty: function(entity, value) {
        if (!entity.is(CoreId.STRING)) {
            throw new EntityError(
                EntityErrorId.RegexpForStringsOnly,
                'Regexp can be applied to string properties only, but property is "' + this.id + '"');
        }

        return value;
    }
};

// #export modules
try {
    module.exports = Property_Regexp;
} catch(e) {}
// export modules#