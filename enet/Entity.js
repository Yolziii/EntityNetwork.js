const CoreId = {
    ENTITY: 'entity',

    DATA_TYPE: 'datatype', // Data types
    BOOLEAN: 'bool',
    INT: 'int',
    FLOAT: 'float',
    STRING: 'string',

    MAX_VALUE: 'max_value',    // Conditions
    MIN_VALUE: 'min_value',
    MAX_LENGTH: 'max_length',
    MIN_LENGTH: 'min_length',
    SINGLE_LINE: 'single_line',

    MULTIPLE_VALUE: 'multiple_value',

    C_COMMANDED: 'c_commanded',

    REGEXP: 'regexp'
};


//========================================================================================================================================================================
// Object members
//========================================================================================================================================================================
function Entity() { }

Entity.prototype.is = function(parentEntityId) {
    var parent = parentEntityId;
    if (typeof parent === 'string' || parent instanceof String) {
        parent = Entity._entities[parentEntityId];
    }

    var me = this;
    while (true) {
        if (me.parentId === parent.id || me.id === parent.id) return true;
        if (me.parentId === null) return false;
        me = Entity._entities[me.parentId];
    }
};

Entity.prototype.isFor = function(childEntityId) {
    var child = childEntityId;
    if (typeof child === 'string' || child instanceof String) {
        child = Entity._entities[childEntityId];
    }

    var me = this;
    while (true) {
        if (me.id === child.parentId) return true;
        if (child.parentId === null) return false;
        child =  Entity._entities[child.parentId];
    }
};

Entity.prototype.setValue = function(property, value) {
    property = Entity._getPropertyId(property);
    value = Entity._checkValue(this, property, value);
    this[property] = value;
};

Entity.prototype.addValue = function(property, value) {
    propertyId = Entity._getPropertyId(property);
    value = Entity._checkValue(this, propertyId, value);

    property = Entity.get(propertyId);
    if (!property.hasProperty(CoreId.MULTIPLE_VALUE) || !property[CoreId.MULTIPLE_VALUE]) {
        throw new TypeError('Property "'+propertyId+'" must has "multiple_value=true" to store several values!');
    }

    if (this[propertyId] === undefined || !this.hasOwnProperty(propertyId)) {
        this[propertyId] = value;
    } else if (Array.isArray(this[propertyId]) || this[propertyId] instanceof Array) {
        this[propertyId].push(value);
    } else {
        this[propertyId] = [this[propertyId], value];
    }
};

Entity.prototype.getValue = function(property) {
    property = Entity._getPropertyId(property);
    this._checkPropertyId(property);
    return this[property];
};

Entity.prototype.hasProperty = function(property) {
    property = Entity._getPropertyId(property);
    return this[property] !== undefined;
};

Entity.prototype.isMultiple = function(property) {
    property = Entity._getPropertyId(property);
    this._checkPropertyId(property);

    return this[property] !== undefined && (Array.isArray(this[property]) || this[property] instanceof Array);
};

Entity.prototype.removeProperty = function(property) {
    property = Entity._getPropertyId(property);
    delete this[property];
};

Entity.prototype.contains = function(property, value) {
    property = Entity._getPropertyId(property);
    this._checkPropertyId(property);

    if (Array.isArray(this[property]) || this[property] instanceof Array) {
        var toRemoveIndex = this[property].indexOf(value);
        if (toRemoveIndex > -1) {
            return true;
        }
    } else if (this[property] === value) {
        return true;
    }
    return false;
};

Entity.prototype.removeValue = function(property, value) {
    property = Entity._getPropertyId(property);
    if (this[property] === undefined) return;

    if (Array.isArray(this[property]) || this[property] instanceof Array) {
        var toRemoveIndex = this[property].indexOf(value);
        if (toRemoveIndex > -1) {
            this[property].splice(toRemoveIndex, 1);
            if (this[property].length === 1) {
                this[property] = this[property][0];
            }
        }
    } else if (this[property] === value) {
        delete this[property];
    }
};

Entity.prototype._checkPropertyId = function(propertyID) {
    if (this[propertyID] === undefined)  {
        throw new TypeError('Undefined property "'+propertyID+'"');
    }
};

//========================================================================================================================================================================
// "Static" members
//========================================================================================================================================================================
Entity._entities = {};

Entity._implementations = {};

Entity.clear = function() {
    Entity._entities = {};
    Entity._implementations = {};

    Entity._initValues();
};

Entity.contains = function(entityId) {
    return Entity._entities[entityId] !== undefined;
};

Entity._initValues = function() {
    Entity.defineImplementationForEntity(CoreId.INT, {
        checkValue: function(property, entity, value) {
            if (property[CoreId.MAX_VALUE] !== undefined && value > property[CoreId.MAX_VALUE]) {
                throw new TypeError('Value for "' + property.id + '" must be <= ' + property[CoreId.MAX_VALUE] + ' but was ' + value);
            }

            if (property[CoreId.MIN_VALUE] !== undefined && value < property[CoreId.MIN_VALUE]) {
                throw new TypeError('Value for "' + property.id + '" must be <= ' + property[CoreId.MAX_VALUE] + ' but was ' + value);
            }
        }
    });

    Entity.defineImplementationForEntity(CoreId.FLOAT, {
        checkValue: function(property, entity, value) {
            if (property[CoreId.MAX_VALUE] !== undefined && value > property[CoreId.MAX_VALUE]) {
                throw new TypeError('Value for "' + property.id + '" must be <= ' + property[CoreId.MAX_VALUE] + ' but was ' + value);
            }

            if (property[CoreId.MIN_VALUE] !== undefined && value < property[CoreId.MIN_VALUE]) {
                throw new TypeError('Value for "' + property.id + '" must be <= ' + property[CoreId.MAX_VALUE] + ' but was ' + value);
            }
        }
    });

    Entity.defineImplementationForEntity(CoreId.STRING, {
        checkValue: function(property, entity, value) {
            if (property[CoreId.MAX_LENGTH] !== undefined && value.length > property[CoreId.MAX_LENGTH]) {
                throw new TypeError('Length of string value for "' + property.id + '" must be <= ' + property[CoreId.MAX_VALUE] + ' but was ' + value.length);
            }

            if (property[CoreId.MIN_LENGTH] !== undefined && value.length < property[CoreId.MIN_LENGTH]) {
                throw new TypeError('Length of string value for "' + property.id + '" must be <= ' + property[CoreId.MAX_VALUE] + ' but was ' + value.length);
            }

            if (property[CoreId.SINGLE_LINE] !== undefined && property[CoreId.SINGLE_LINE] && value.indexOf('\n') != -1) {
                throw new TypeError('String value for "' + property.id + '" must be single line but was "' + value + '"');
            }

            if (property[CoreId.REGEXP] !== undefined && !value.match(new RegExp(property[CoreId.REGEXP]))) {
                throw new TypeError('String value "' + value + '" for "' + property.id + '" doesn\'t match to regexp "'+property[CoreId.REGEXP]+'"');
            }
        }
    });

    Entity.defineImplementationForEntity(CoreId.SINGLE_LINE, {
        checkValue: function(property, entity, value) {
            if (!entity.is(CoreId.STRING)) {
                throw new TypeError('Single line can be applied to string properties only but property is "' + property.id + '"');
            }
        }
    });

    Entity.defineImplementationForEntity(CoreId.REGEXP, {
        checkValue: function(property, entity, value) {
            if (!entity.is(CoreId.STRING)) {
                throw new TypeError('Regexp can be applied to string properties only but property is "' + property.id + '"');
            }
        }
    });

    // TODO: Load from core.json
    var entity = Entity.create(CoreId.ENTITY, null);
    var dataType = Entity.create(CoreId.DATA_TYPE, entity);
    Entity.create(CoreId.BOOLEAN, dataType);
    Entity.create(CoreId.INT, dataType);
    Entity.create(CoreId.FLOAT, dataType);
    Entity.create(CoreId.STRING, dataType);

    Entity.create(CoreId.MAX_VALUE, CoreId.INT);
    Entity.create(CoreId.MIN_VALUE, CoreId.INT);
    Entity.create(CoreId.MAX_LENGTH, CoreId.INT);
    Entity.create(CoreId.MIN_LENGTH, CoreId.INT);

    Entity.create(CoreId.SINGLE_LINE, CoreId.BOOLEAN);
    Entity.create(CoreId.MULTIPLE_VALUE, CoreId.BOOLEAN);

    var regexp = Entity.create(CoreId.REGEXP, CoreId.STRING);
    regexp.setValue(CoreId.SINGLE_LINE, true);

    Entity.create(CoreId.C_COMMANDED, CoreId.BOOLEAN);
};

Entity.get = function(entityId) {
    entityId = Entity._getPropertyId(entityId);
    if (Entity._entities[entityId] === undefined) {
        throw new TypeError('Unknown entity "'+entityId+'"');
    }

    return Entity._entities[entityId];
};

/**
 * @param newEntityId {string|Entity} Unique id for a new entity
 * @param parentEntityId {string|Entity|undefined|null} Id for parent existing entity
 * @returns {*}
 */
Entity.create = function(newEntityId, parentEntityId) {
    newEntityId = Entity._getPropertyId(newEntityId);
    if (parentEntityId === undefined) parentEntityId = null;
    parentEntityId = Entity._getPropertyId(parentEntityId);

    if (parentEntityId !== null && Entity._entities[parentEntityId] === undefined) {
        Entity.create(parentEntityId);
    }

    if (Entity._entities[newEntityId] === undefined) {
        var entity;

        if (parentEntityId === null) {
            entity = new Entity(newEntityId, parentEntityId);
        } else {
            entity = Object.create(Entity._entities[parentEntityId]);
            var implementation = Entity._findImplementation(newEntityId);
            for (var prop in implementation) {
                entity[prop] = implementation[prop];
            }
        }
        entity.id = newEntityId;
        entity.parentId = parentEntityId;

        Entity._entities[newEntityId] = entity;
    } else {
        Entity._entities[newEntityId].parentId = parentEntityId;
    }

    return Entity._entities[newEntityId];
};

Entity.defineImplementationForEntity = function(entityId, implementation) {
    Entity._implementations[entityId] = implementation;
};

Entity._findImplementation = function(entityId) {
    if (Entity._implementations[entityId] !== undefined) {
        return Entity._implementations[entityId];
    }
    return {};
};

/**
 * @param propertyId {string}
 * @param value
 * @private
 */
Entity._checkValue = function(entity, propertyId, value) {
    if (value === null) return null;

    var property = Entity.get(propertyId);
    if (property.is(CoreId.BOOLEAN)) {
        if (!(typeof value === 'boolean' || value instanceof Boolean))
            throw new TypeError('Value for "'+propertyId+'" must be boolean but was ' + value);
    } else if (property.is(CoreId.INT)) {
        if (!(typeof value === 'number' || value instanceof Number)) {
            throw new TypeError('Value for "'+propertyId+'" must be int but was ' + value);
        }
        if (value % 1 !== 0) {
            throw new TypeError('Value for "' + propertyId + '" must be int but was ' + value);
        }
    } else if (property.is(CoreId.FLOAT)) {
        if (!(typeof value === 'number' || value instanceof Number)) {
            throw new TypeError('Value for "' + propertyId + '" must be number but was ' + value);
        }
    } else if (property.is(CoreId.STRING)) {
        if (!(typeof value === 'string' || value instanceof String)) {
            throw new TypeError('Value for "' + propertyId + '" must be string but was ' + value);
        }
    } else {
        var valueEntity = Entity.get(value);
        if (!valueEntity.is(property)) {
            if (!property.hasProperty(CoreId.C_COMMANDED) || !property[CoreId.C_COMMANDED] || !valueEntity.is(property.parentId)) {
                throw new TypeError('Value for "' + propertyId + '" must be "'+property.id+'" but was ' + valueEntity.id);
            }
        }
    }

    if (property.checkValue !== undefined) {
        property.checkValue(property, entity, value);
    }

    if (property.changeValue !== undefined) {
        value = property.changeValue(property, entity, value);
    }

    return value;
};

Entity._getPropertyId = function(property) {
    if (property === null) return property;
    if (typeof property === 'string' || property instanceof String) {
        return property;
    } else if (typeof property === 'object' || property instanceof Object) {
        return property.id;
    }
    return property;
};

Entity._initValues();

// #Node.js
try {
    module.exports = {Entity: Entity, CoreId:CoreId};
} catch(e) {}
// Node.js#