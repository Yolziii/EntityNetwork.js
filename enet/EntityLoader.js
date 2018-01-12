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
    EntityLoader.proceedDocumentJustEntities(dataObject);
    EntityLoader.proceedDocumentAllProperties(dataObject);
};

EntityLoader.proceedDocumentsArray = function(dataObjectsArray) {
    EntityLoader._unnamed = 0;
    var i;
    for (i = 0; i<dataObjectsArray.length; i++) {
        EntityLoader.proceedDocumentJustEntities(dataObjectsArray[i]);
    }
    for (i = 0; i<dataObjectsArray.length; i++) {
        EntityLoader.proceedDocumentAllProperties(dataObjectsArray[i]);
    }
};

EntityLoader.proceedDocumentJustEntities = function(dataObject) {
    for (var entityId in dataObject) { // Make all entities first
        var entityOb = dataObject[entityId];
        var parentEntityId = entityOb.is === undefined ? 'entity' : entityOb.is;
        if (parentEntityId === null) parentEntityId = undefined;
        var entity = Entity.contains(entityId)
            ? Entity.get(entityId)
            : Entity.create(entityId, parentEntityId);
    }
};

EntityLoader.proceedDocumentAllProperties = function(dataObject) {
    for (var entityId in dataObject) { // Then add properties to entities
        var entityOb = dataObject[entityId];
        //if (entityOb.constructor !== undefined) continue;

        var entity = Entity.get(entityId);

        EntityLoader._proceedProperties(entity, entityOb);
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

        EntityLoader._proceedProperties(subEntity, subEntityObj);

        isMultiple
            ? entity.addValue(propertyId, subEntity)
            : entity.setValue(propertyId, subEntity);
    }
};

EntityLoader._proceedProperties = function(entity, entityObject) {
    for (var propertyId in entityObject) {
        if (propertyId === 'is') continue;
        if (propertyId === 'id') continue;

        var value = entityObject[propertyId];
        EntityLoader._proceedValue(entity, propertyId, value, false);
    }
};

// #export modules
try {
    var Entity = require('./Entity.js');
    var CoreId = require('./CoreId.js');

    module.exports = EntityLoader;
} catch(e) {}
// export modules#