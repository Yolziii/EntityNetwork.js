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



Entity.prototype.setValue = function(propertyOrPropertyId, value) {
    var propertyId = Entity._getPropertyId(propertyOrPropertyId);
    var property = Entity.get(propertyId);
    if (property.isMultiple()) {
        this.addValue(property, value);
    } else {
        value = Entity._checkValue(this, propertyId, value);
        this[propertyId] = value;
    }

    this._checkCopiedProperty(property);
};

Entity.prototype.addValue = function(propertyOrPropertyId, value) {
    var propertyId = Entity._getPropertyId(propertyOrPropertyId);
    value = Entity._checkValue(this, propertyId, value);

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

    this._checkCopiedProperty(property);
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

Entity.prototype.removeProperty = function(property) {
    property = Entity._getPropertyId(property);
    if (this[property] === undefined || !this.hasOwnProperty(property)) return;

    // TODO Tell to property about it
    delete this[property];
};

Entity.prototype.removeValue = function(property, value) {
    property = Entity._getPropertyId(property);
    if (this[property] === undefined || !this.hasOwnProperty(property)) return;

    if (Array.isArray(this[property]) || this[property] instanceof Array) {
        var toRemoveIndex = this[property].indexOf(value);
        if (toRemoveIndex > -1) {
            // TODO Tell to value about it
            this[property].splice(toRemoveIndex, 1);
            if (this[property].length === 1) {
                this[property] = this[property][0];
            }
        }
    } else if (this[property] === value) {
        // TODO Tell to value about it
        this.removeProperty(property);
    }
};

Entity.prototype._checkPropertyId = function(propertyID) {
    if (this[propertyID] === undefined)  {
        throw new EntityError(
            EntityErrorId.UndefinedProperty,
            'Undefined property "'+propertyID+'"');
    }
};


Entity.prototype.hasCopiedProperties = function() {
    return this.hasOwnProperty('_copiedProperties') && this._copiedProperties.length > 0;
};

Entity.prototype.copyCopiedPropertiesToChildren = function() {
    if (!this.hasOwnProperty('_children')) return;

    for(var p = 0; p < this._copiedProperties.length; p++) {
        for (var c = 0; c < this._children.length; c++) {
            var copiedProperty = this._copiedProperties[p];
            var child = this._children[c];
            child.setValue(copiedProperty, this[copiedProperty.id]);
        }
    }
};

Entity.prototype._checkCopiedProperty = function(property) {
    if (property.hasOwnProperty(CoreId.COPY_FOR_CHILDREN)) {
        if (!this.hasOwnProperty('_copiedProperties')) {
            this._copiedProperties = [];
        }

        if (this._copiedProperties.indexOf(property) === -1) {
            this._copiedProperties.push(property);
            this.copyCopiedPropertiesToChildren();
        }
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

    // TODO: Scenarios with children
    var unique = Entity.create(CoreId.UNIQUE, CoreId.BOOLEAN);
    unique.setValue(CoreId.ACTIVE_PROPERTY, true);

    var copyForChildren = Entity.create(CoreId.COPY_FOR_CHILDREN, CoreId.BOOLEAN);

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
        if (!parent.hasOwnProperty('_children')) {
            parent._children = [];
        }
        parent._children.push(entity);

        if (parent.hasCopiedProperties()) {
            parent.copyCopiedPropertiesToChildren();
        }
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

Entity._getPropertyId = function(property) {
    if (property === null) return property;
    if (typeof property === 'string' || property instanceof String) {
        return property;
    } else if (typeof property === 'object' || property instanceof Object) {
        return property.id;
    }
    return property;
};

Entity.remove = function(entityOrEntityId) {
    var entityId = Entity._getPropertyId(entityOrEntityId);

    var entity = Entity._entities[entityId];
    parent = Entity.get(entity.parentId);
    var index = parent._children.indexOf(entity);
    if (index > -1) {
        parent._children.splice(index, 1);
        if (parent._children.length === 0) {
            delete parent._children;
        }
    }

    // TODO: Remove all properties and values
    delete Entity._entities[entityId];
};

Entity._initValues();

// #export modules
try {
    module.exports = Entity;
} catch(e) {}
// export modules#