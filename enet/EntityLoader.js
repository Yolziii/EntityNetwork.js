//= require CoreId.js

// #import modules
try {
    var Entity = require('./Entity.js');
    var CoreId = require('./CoreId.js');

    module.exports = EntityLoader;
} catch(e) {}
// import modules#

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
    else id = parent + '#' + (EntityLoader._unnamed++);

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

// #export modules
try {
    module.exports = EntityLoader;
} catch(e) {}
// export modules#