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

EntityLoader.proceedJsonDocument = function(dataJson) {
    var data = JSON.parse(dataJson);
    EntityLoader.proceedDocumentObject(data);
};

EntityLoader.proceedDocumentObject = function(dataObject) {
    for (var entityId in dataObject) { // Make all entities first
        var entityOb = dataObject[entityId];
        var parentEntityId = entityOb.is === undefined ? 'entity' : entityOb.is;
        if (parentEntityId == null) parentEntityId = undefined;
        var entity = Entity.contains(entityId)
            ? Entity.get(entityId)
            : Entity.create(entityId, parentEntityId);
    }

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

    if (typeof value === 'object' || value instanceof Object && value.id !== undefined) {
        var subEntityObj = value;
        var subEntity = Entity.contains(subEntityObj.id)
            ? Entity.get(subEntityObj.id)
            : Entity.create(subEntityObj.id, propertyId);

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