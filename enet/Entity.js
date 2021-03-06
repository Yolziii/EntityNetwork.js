//= require CoreId.js
//= require active_property.js

// #import modules
try {
    var CoreId = require('./CoreId.js');
    //var EntityLoader = require('./EntityLoader');
    var EntityError = require('./EntityError');
    var EntityErrorId = require('./EntityErrorId');

    var DataType_Int = require('./core_entities/int');
    var DataType_Float = require('./core_entities/float');
    var DataType_String = require('./core_entities/string');

    var Property_SingleLine = require('./core_entities/single_line');
    var Property_Regexp = require('./core_entities/regexp');
    var Property_Unique = require('./core_entities/unique');
    var Property_ActiveProperty = require('./core_entities/active_property');
} catch(e) {}
// import modules#

//========================================================================================================================================================================
// Object members
//========================================================================================================================================================================
function Entity() {}

Entity.prototype.is = function(entityOrId) {
    var parent = entityOrId;
    if (typeof parent === 'string' || parent instanceof String) {
        parent = Entity._entities[entityOrId];
    }

    var me = this;
    while (true) {
        if (me.parentId === parent.id || me.id === parent.id) return true;
        if (me.parentId === null) return false;
        me = Entity._entities[me.parentId];
    }
};

Entity.prototype.isFor = function(entityOrId) {
    var child = entityOrId;
    if (typeof child === 'string' || child instanceof String) {
        child = Entity._entities[entityOrId];
    }

    var me = this;
    while (true) {
        if (me.id === child.parentId) return true;
        if (child.parentId === null) return false;
        child =  Entity._entities[child.parentId];
    }
};

Entity.prototype.setValue = function(propertyOrId, value) {
    var propertyId = Entity._getPropertyId(propertyOrId);
    var property = Entity.get(propertyId);
    if (property.isMultiple()) {
        this.addValue(property, value);
    } else {
        value = Entity._proceedValue(this, propertyId, value);
        this[propertyId] = value;
    }
};

Entity.prototype.addValue = function(propertyOrId, value) {
    var propertyId = Entity._getPropertyId(propertyOrId);
    value = Entity._proceedValue(this, propertyId, value);

    var property = Entity.get(propertyId);
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

Entity.prototype.getValue = function(propertyOrId) {
    var propertyId = Entity._getPropertyId(propertyOrId);
    this._checkPropertyId(propertyId);
    return this[propertyId];
};

Entity.prototype.hasProperty = function(propertyOrId) {
    var propertyId = Entity._getPropertyId(propertyOrId);
    return this[propertyId] !== undefined;
};

Entity.prototype.isMultiple = function() {
    return this.hasProperty(CoreId.MULTIPLE_VALUE) && this[CoreId.MULTIPLE_VALUE];
};

Entity.prototype.contains = function(propertyOrId, value) {
    var propertyId = Entity._getPropertyId(propertyOrId);
    this._checkPropertyId(propertyId);

    if (Array.isArray(this[propertyId]) || this[propertyId] instanceof Array) {
        var toRemoveIndex = this[propertyId].indexOf(value);
        if (toRemoveIndex > -1) {
            return true;
        }
    } else if (this[propertyId] === value) {
        return true;
    }
    return false;
};

Entity.prototype.removeProperty = function(propertyOrId) {
    var propertyId = Entity._getPropertyId(propertyOrId);
    if (this[propertyId] === undefined || !this.hasOwnProperty(propertyId)) return;

    // TODO Tell to property about it
    delete this[propertyId];
};

Entity.prototype.removeValue = function(propertyOrId, value) {
    var propertyId = Entity._getPropertyId(propertyOrId);
    if (this[propertyId] === undefined || !this.hasOwnProperty(propertyId)) return;

    if (Array.isArray(this[propertyId]) || this[propertyId] instanceof Array) {
        var toRemoveIndex = this[propertyId].indexOf(value);
        if (toRemoveIndex > -1) {
            // TODO Tell to value about it
            this[propertyId].splice(toRemoveIndex, 1);
            if (this[propertyId].length === 1) {
                this[propertyId] = this[propertyId][0];
            }
        }
    } else if (this[propertyId] === value) {
        // TODO Tell to value about it
        this.removeProperty(propertyId);
    }
};

Entity.prototype._checkPropertyId = function(propertyID) {
    if (this[propertyID] === undefined)  {
        throw new EntityError(
            EntityErrorId.UndefinedProperty,
            'Undefined property "'+propertyID+'"');
    }
};

Entity.prototype.isEntityId = function(name) {
    if (typeof this[name] === 'function' || this[name] instanceof Function) return false;
    if (name.indexOf('_') === 0) return false;
    if (name === 'id' || name === 'parentId') return false;
    if (!Entity.contains(name)) return false;

    return true;
};

Entity.prototype._cloneValuesTo = function(child) {
    for (var propertyId in this) {
        if (!this.isEntityId(propertyId)) continue;
        if (CoreId.hasOwnProperty(propertyId)) continue; // Do not clone CoreId properties

        var property = Entity.get(propertyId);
        if (property.hasProperty(CoreId.UNCLONABLE_PROPERTY) && property[CoreId.UNCLONABLE_PROPERTY]) return value;

        if (property.isMultiple() && this[propertyId] != null) {
            for (var v=0; v<this[propertyId].length; v++) {
                var value = this._cloneValue(this[propertyId][v]);
                child.addValue(propertyId, value);
            }
        } else {
            var value = this._cloneValue(this[propertyId]);
            child.setValue(propertyId, value);
        }
    }
};

Entity.prototype._cloneValue = function(value) {
    if (!(typeof value === 'object' || value instanceof Object) || value === null) {
        return value;
    }

    if (!this.hasProperty(CoreId.INHERIT_CLONED_VALUES) || !this[CoreId.INHERIT_CLONED_VALUES]) return value;
    if (value.hasProperty(CoreId.UNCLONABLE_VALUE) && value[CoreId.UNCLONABLE_VALUE]) return value;

    var newValue = Entity.create(value.id + "&" + (Entity._copied++), value);
    value._cloneValuesTo(newValue);

    return newValue;
};

Entity.prototype.clone = function() {
    var clone = Entity.create(this.id + "#" + (++Entity._unnamed), this.parentId);
    this._cloneValuesTo(clone);
    return clone;
};

//========================================================================================================================================================================
// "Static" members
//========================================================================================================================================================================
Entity._entities = {};
Entity._implementations = {};
Entity._copied = 0;
Entity.copyValues = false;

Entity.clear = function() {
    Entity._entities = {};
    Entity._implementations = {};
    Entity._copied = 0;

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
    Entity.defineImplementationForEntity(CoreId.ACTIVE_PROPERTY, Property_ActiveProperty);

    var entity = Entity.create(CoreId.ENTITY, null);
    /*EntityLoader.proceedDocumentObject({
        datatype: {},
        bool: {is: CoreId.DATA_TYPE},
        int: {is: CoreId.DATA_TYPE},
        float: {is: CoreId.DATA_TYPE},
        string: {is: CoreId.DATA_TYPE},

        active_property: {is: CoreId.BOOLEAN},

        max_value: {is: CoreId.INT},
        min_value: {is: CoreId.INT},
        max_length: {is: CoreId.INT},
        min_length: {is: CoreId.INT},

        single_line: {is: CoreId.BOOLEAN},
        multiple_value: {is: CoreId.BOOLEAN},
        expand_value: {is: CoreId.BOOLEAN},

        c_commanded: {is: CoreId.BOOLEAN},

        regexp: {is: CoreId.STRING, single_line: true},

        // TODO: Scenarios with children
        unique: {is: CoreId.BOOLEAN, active_property: true}
    });*/

    var dataType = Entity.create(CoreId.DATA_TYPE, entity);
    Entity.create(CoreId.BOOLEAN, dataType);
    Entity.create(CoreId.INT, dataType);
    Entity.create(CoreId.FLOAT, dataType);
    Entity.create(CoreId.STRING, dataType);

    Entity.create(CoreId.ACTIVE_PROPERTY, CoreId.BOOLEAN);

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

    // TODO: Scenarios with children?
    var unique = Entity.create(CoreId.UNIQUE, CoreId.BOOLEAN);
    unique.setValue(CoreId.ACTIVE_PROPERTY, true);

    Entity.create(CoreId.CLONE_VALUES_FOR_CHILDREN, CoreId.BOOLEAN);
    Entity.create(CoreId.INHERIT_CLONED_VALUES, CoreId.BOOLEAN);
    Entity.create(CoreId.UNCLONABLE_VALUE, CoreId.BOOLEAN);
    Entity.create(CoreId.UNCLONABLE_PROPERTY, CoreId.BOOLEAN);
};

Entity.get = function(entityOrId) {
    var entityId = Entity._getPropertyId(entityOrId);
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
Entity.create = function(newEntityId, parentEntityOrId) {
    newEntityId = Entity._getPropertyId(newEntityId);
    if (parentEntityOrId === undefined) parentEntityOrId = null;
    var parentEntityId = Entity._getPropertyId(parentEntityOrId);

    if (parentEntityId !== null && Entity._entities[parentEntityId] === undefined) {
        Entity.create(parentEntityId);
    }

    var entity;
    if (Entity._entities[newEntityId] === undefined) {
        if (parentEntityId === null) {
            entity = new Entity(newEntityId, parentEntityId);
        } else {
            entity = Object.create(Entity._entities[parentEntityId]);
            var implementation = Entity._findImplementation(newEntityId);
            for (var prop in implementation) {
                entity[prop] = implementation[prop];
            }

            if (entity.init !== undefined) {
                entity.init();
            }
        }
        entity.id = newEntityId;
        entity.parentId = parentEntityId;

        Entity._entities[newEntityId] = entity;
    } else {
        entity = Entity._entities[newEntityId];
        entity.parentId = parentEntityId;
    }

    var parent = Entity._entities[parentEntityId];
    if (parent !== undefined) {
        if (parent.hasProperty(CoreId.CLONE_VALUES_FOR_CHILDREN)) {
            parent._cloneValuesTo(entity);
        }
    }

    return entity;
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
Entity._proceedValue = function(entity, propertyId, value) {
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
            if (value.is !== null && value.is === property.is) {
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
        value = valueEntity;
    }

    if (property.checkValueAsProperty !== undefined) {
        value = property.checkValueAsProperty(entity, value);
    }

    var active = Entity.get(CoreId.ACTIVE_PROPERTY); // TODO: value_active_property, entity_active_property
    if (active !== undefined) {
        var activeProperties = active.activeProperties();
        for (var i=0; i<activeProperties.length; i++) {
            if (property.hasProperty(activeProperties[i]) && property[activeProperties[i]]) {
                value = Entity.get(activeProperties[i]).checkValueAsActiveProperty(property, entity, value);
            }
        }
    }

    if (entity.checkValueAsEntity !== undefined) {
        value = entity.checkValueAsEntity(property, value);
    }

    return value;
};

Entity._getPropertyId = function(propertyOrId) {
    if (propertyOrId === null) return propertyOrId;
    if (typeof propertyOrId === 'string' || propertyOrId instanceof String) {
        return propertyOrId;
    } else if (typeof propertyOrId === 'object' || propertyOrId instanceof Object) {
        return propertyOrId.id;
    }
    return propertyOrId;
};

Entity.remove = function(entityOrId) {
    var entityId = Entity._getPropertyId(entityOrId);

    // TODO: Remove all properties and values
    delete Entity._entities[entityId];
};

Entity._initValues();

// #export modules
try {
    module.exports = Entity;
} catch(e) {}
// export modules#