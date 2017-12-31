var Property_ActiveProperty = {
    _activeProperties: [],

    activeProperties: function() {return this._activeProperties},

    checkValueAsProperty: function(entity, value) {
        if (this._activeProperties.indexOf(entity.id) === -1) {
            this._activeProperties.push(entity.id);
        }
        return value;
    }
};

// #export modules
try {
    module.exports = Property_ActiveProperty;
} catch(e) {}
// export modules#