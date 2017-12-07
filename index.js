var entityModule = require('./enet/Entity');
var EntityLoader = require('./enet/EntityLoader').EntityLoader;

var Entity = entityModule.Entity;
var CoreId = entityModule.CoreId;

module.exports = {
    Entity: Entity,
    CoreId: CoreId,
    EntityLoader: EntityLoader
};