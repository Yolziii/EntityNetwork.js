//= require CoreId.js

// #import modules
try {
    var CoreId = require('./CoreId.js');
    var EntityError = require('./EntityError');
    var EntityErrorId = require('./EntityErrorId');

    var DataType_Int = require('./core_entities/int');
    var DataType_Float = require('./core_entities/float');
    var DataType_String = require('./core_entities/string');

    var Property_SingleLine = require('./core_entities/single_line');
    var Property_Regexp = require('./core_entities/regexp');
    var Property_Unique = require('./core_entities/unique');
} catch(e) {}
// import modules#

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
    var propertyId = Entity._getPropertyId(property);
    property = Entity.get(propertyId);
    if (property.isMultiple()) {
        this.addValue(property, value);
    } else {
        value = Entity._checkValue(this, propertyId, value);
        this[propertyId] = value;
    }
};

Entity.prototype.addValue = function(property, value) {
    var propertyId = Entity._getPropertyId(property);
    value = Entity._checkValue(this, propertyId, value);

    property = Entity.get(propertyId);
    if (!property.isMultiple()) {
        throw new EntityError(
            EntityErrorId.NotMultiple,
            'Property "'+propertyId+'" must has "multiple_value=true" to store several values!');
    }

    if (this[propertyId] === undefined) {
        this[propertyId] = [value];
    } else if (this.hasOwnProperty(propertyId)) {
        this[propertyId].push(value);
    } else {
        if (property.hasProperty(CoreId.EXPAND_VALUE) && property[CoreId.EXPAND_VALUE]) {
            this[propertyId] = this[propertyId].slice();
            this[propertyId].push(value);
        } else {
            this[propertyId] = [value];
        }
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

Entity.prototype.isMultiple = function() {
    return this.hasProperty(CoreId.MULTIPLE_VALUE) && this[CoreId.MULTIPLE_VALUE];
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
        throw new EntityError(
            EntityErrorId.UndefinedProperty,
            'Undefined property "'+propertyID+'"');
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
    Entity.defineImplementationForEntity(CoreId.INT, DataType_Int);
    Entity.defineImplementationForEntity(CoreId.FLOAT, DataType_Float);
    Entity.defineImplementationForEntity(CoreId.STRING, DataType_String);
    Entity.defineImplementationForEntity(CoreId.SINGLE_LINE, Property_SingleLine);
    Entity.defineImplementationForEntity(CoreId.REGEXP, Property_Regexp);
    Entity.defineImplementationForEntity(CoreId.UNIQUE, Property_Unique);

    // TODO: Load from core.json?
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
    Entity.create(CoreId.EXPAND_VALUE, CoreId.BOOLEAN);

    var regexp = Entity.create(CoreId.REGEXP, CoreId.STRING);
    regexp.setValue(CoreId.SINGLE_LINE, true);

    Entity.create(CoreId.C_COMMANDED, CoreId.BOOLEAN);

    Entity.create(CoreId.UNIQUE, CoreId.BOOLEAN);
};

Entity.get = function(entityId) {
    entityId = Entity._getPropertyId(entityId);
    if (Entity._entities[entityId] === undefined) {
        throw new EntityError(
            EntityErrorId.UnknownEntity,
            'Unknown entity "'+entityId+'"');
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
            throw new EntityError(
                EntityErrorId.NotBoolean,
                'Value for "'+propertyId+'" must be boolean but was ' + value);
    } else if (property.is(CoreId.INT)) {
        if (!(typeof value === 'number' || value instanceof Number)) {
            throw new EntityError(
                EntityErrorId.NotInt,
                'Value for "'+propertyId+'" must be int but was ' + value);
        }
        if (value % 1 !== 0) {
            throw new EntityError(
                EntityErrorId.NotInt,
                'Value for "' + propertyId + '" must be int but was ' + value);
        }
    } else if (property.is(CoreId.FLOAT)) {
        if (!(typeof value === 'number' || value instanceof Number)) {
            throw new EntityError(
                EntityErrorId.NotFloat,
                'Value for "' + propertyId + '" must be number but was ' + value);
        }
    } else if (property.is(CoreId.STRING)) {
        if (!(typeof value === 'string' || value instanceof String)) {
            if (value.is !== null && typeof  value.is === 'function' && value.is(CoreId.ENTITY)) {
                value = value.id;
            } else {
                throw new EntityError(
                    EntityErrorId.NotString,
                    'Value for "' + propertyId + '" must be string but was ' + value);
            }
        }
    } else {
        var valueEntity = Entity.get(value);
        if (!valueEntity.is(property)) {
            if (!property.hasProperty(CoreId.C_COMMANDED) || !property[CoreId.C_COMMANDED] || !valueEntity.is(property.parentId)) {
                throw new EntityError(
                    EntityErrorId.NotParticularEntity,
                    'Value for "' + propertyId + '" must be "'+property.id+'" but was ' + valueEntity.id);
            }
        }
    }

    if (property.checkValueAsProperty !== undefined) {
        value = property.checkValueAsProperty(entity, value);
    }

    // TODO: Check methods in all properties?
    if (property.hasProperty(CoreId.UNIQUE) && property[CoreId.UNIQUE]) {
        Entity.get(CoreId.UNIQUE).checkUniqueValue(property, value);
    }

    if (entity.checkValueAsEntity !== undefined) {
        value = entity.checkValueAsEntity(property, value);
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

// #export modules
try {
    module.exports = Entity;
} catch(e) {}
// export modules#