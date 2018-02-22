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
    EXPAND_VALUE: 'expand_value',
    C_COMMANDED: 'c_commanded',     // relation "constituent command", like in linguistic

    REGEXP: 'regexp',

    UNIQUE: 'unique',
    ACTIVE_PROPERTY: 'active_property',

    CLONE_VALUES_FOR_CHILDREN: 'clone_for_children', // All properties of entity, that mark by this tag will be copied for any child, and its children will clone their properties to their children too
    INHERIT_CLONED_VALUES: 'inherit_cloned_values',  // With this tag when entity is copied its values for children, entity-values will be cloning too by inherit original values
    UNCLONABLE_VALUE: 'unclonable_value',            // Entities with this tag won't be cloned as values
    UNCLONABLE_PROPERTY: 'unclonable_property',      // Values for properties with this tag won't be cloned

    HEADER_PROPERTIES: []
};

const headers = [
    CoreId.C_COMMANDED,
    CoreId.MULTIPLE_VALUE,

    CoreId.CLONE_VALUES_FOR_CHILDREN,
    CoreId.INHERIT_CLONED_VALUES,
    CoreId.UNCLONABLE_VALUE
];

for (var i=0; i<headers.length; i++) {
    CoreId.HEADER_PROPERTIES.push(headers[i]);
}

// #Node.js
try {
    module.exports = CoreId;
} catch(e) {}
// Node.js#
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


//= require CoreId.js
//= require active_property.js



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


//= require CoreId.js



function EntityLoader() {
}

EntityLoader._unnamed = 0;

EntityLoader.proceedDocumentObject = function(dataObject) {
    EntityLoader._proceedDocumentHeaders(dataObject);
    EntityLoader._proceedDocumentFull(dataObject);
};

EntityLoader.proceedDocumentsArray = function(dataObjectsArray) {
    EntityLoader._unnamed = 0;
    var i;
    for (i = 0; i<dataObjectsArray.length; i++) {
        EntityLoader._proceedDocumentHeaders(dataObjectsArray[i]);
    }
    for (i = 0; i<dataObjectsArray.length; i++) {
        EntityLoader._proceedDocumentFull(dataObjectsArray[i]);
    }
};

EntityLoader.createEntity = function(entityLiteral) {
    var parentId = CoreId.ENTITY;
    if (entityLiteral.is !== undefined) {
        parentId = entityLiteral.is;
    }

    var id;
    if (entityLiteral.id !== undefined) id = entityLiteral.id;
    else id = parentId + '#' + (EntityLoader._unnamed++);

    var entity = EntityLoader._proceedHeader(id, parentId, entityLiteral);
    EntityLoader._proceedProperties(entity, entityLiteral, false);

    return entity;
};

EntityLoader._proceedDocumentHeaders = function(dataObject) {
    for (var entityId in dataObject) { // Make all entities first
        var entityOb = dataObject[entityId];
        var parentEntityId = entityOb.is === undefined ? 'entity' : entityOb.is;
        if (parentEntityId === null) parentEntityId = undefined;

        EntityLoader._proceedHeader(entityId, parentEntityId, entityOb);
    }
};

EntityLoader._proceedHeader = function(entityId, parentEntityId, entityLiteral) {
    var entity = Entity.contains(entityId)
        ? Entity.get(entityId)
        : Entity.create(entityId, parentEntityId);
    EntityLoader._proceedProperties(entity, entityLiteral, true);
    return entity;
};

EntityLoader._proceedDocumentFull = function(dataObject) {
    for (var entityId in dataObject) { // Then add properties to entities
        var entityOb = dataObject[entityId];
        //if (entityOb.constructor !== undefined) continue;

        var entity = Entity.get(entityId);

        EntityLoader._proceedProperties(entity, entityOb, false);
    }
};

EntityLoader._proceedValue = function(entity, propertyId, value, isMultiple) {
    if ((typeof value === 'boolean' || value instanceof Boolean) ||
        (typeof value === 'number' || value instanceof Number) ||
        value === null) {
        isMultiple
            ? entity.addValue(propertyId, value)
            : entity.setValue(propertyId, value);
        return;
    }

    if (typeof value === 'string' || value instanceof String) {
        if (Entity.contains(value)) {
            value = Entity.get(value);
        }
        isMultiple
            ? entity.addValue(propertyId, value)
            : entity.setValue(propertyId, value);
        return;
    }

    if (Array.isArray(value)) {
        entity.removeProperty(propertyId);
        entity[propertyId] = [];
        for (var i=0; i<value.length; i++) {
            EntityLoader._proceedValue(entity, propertyId, value[i], true);
        }
        return;
    }

    if (typeof value === 'object' || value instanceof Object && (value.id !== undefined || value['is'] !== undefined)) {
        var subEntityObj = value;
        var parent = (subEntityObj['is'] !== undefined) ? subEntityObj['is'] : propertyId
        var id = (value.id !== undefined) ? value.id : parent + '#' + (++EntityLoader._unnamed);

        var subEntity = Entity.create(id, parent); // If it already exists, then just change the parent

        EntityLoader._proceedProperties(subEntity, subEntityObj, false);

        isMultiple
            ? entity.addValue(propertyId, subEntity)
            : entity.setValue(propertyId, subEntity);
    }
};

EntityLoader._proceedProperties = function(entity, entityObject, coreOnly) {
    for (var propertyId in entityObject) {
        if (propertyId === 'is') continue;
        if (propertyId === 'id') continue;
        if (coreOnly && CoreId.HEADER_PROPERTIES.indexOf(propertyId) === -1) continue;

        var value = entityObject[propertyId];
        EntityLoader._proceedValue(entity, propertyId, value, false);
    }
};


function EntityError(id, message) {
    this.id = id;
    this.message = message;
}


var EntityErrorId = {
    UnknownEntity: 1,
    UndefinedProperty: 2,

    NotBoolean: 10,
    NotInt: 11,
    NotFloat: 12,
    NotString: 13,
    NotParticularEntity: 14,

    NotMultiple: 50,

    ConditionMaxValue: 100,
    ConditionMinValue: 101,

    ConditionRegexp: 110,
    ConditionMaxLength: 111,
    ConditionMinLength: 112,
    ConditionSingleLine: 113,

    RegexpForStringsOnly: 200,
    SingleLineForStringsOnly: 201,
    MaxLengthForStringsOnly: 202,
    MinLengthForStringsOnly: 203,

    NotUniqueValue: 1000
};




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




var DataType_Int = {
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

