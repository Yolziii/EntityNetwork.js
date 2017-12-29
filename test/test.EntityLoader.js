// #Node.js
try {
    var chai = require('chai');
    var fs = require('fs');
    var EntityLoader = require('../enet/EntityLoader');
    var Entity = require('../enet/Entity');
    var CoreId = require('../enet/CoreId');

    var test_EntityLoader = fs.readFileSync('./test/test.EntityLoader.json', 'utf8');
    var dataObject = JSON.parse(test_EntityLoader);

    var test_EntityLoader2 = fs.readFileSync('./test/test.EntityLoader2.json', 'utf8');
    var dataObject2 = JSON.parse(test_EntityLoader2);

    var assert = chai.assert;
} catch (e) {
}
// Node.js#


const CardId = {
    CARD: 'card',
    MANA: 'mana',
    NAME: 'name',

    CARD_CLASS: 'card_class',
    CLASS_WIZARD: 'class_wizard',

    CHAR_GENDALF: 'Gendalf',
    CHAR_THOR: 'Thor',

    ABILITY: 'ability',
    ABILITY_LIGHT_FLASH: 'LightFlash',
    ABILITY_THOR_JUMP: 'Thor\'s jump',
    ABILITY_THOR_HAMMER: 'Thor\'s hammer',

    ABRA_CADABRA: 'Abra-cadabra!',

    COUNTERACT: 'counteract',
};

describe('Entity network', function () {
    before(function () {
        Entity.clear();
        EntityLoader.proceedDocumentObject(dataObject);
        EntityLoader.proceedDocumentObject(dataObject2);
    });

    describe('EntityLoader', function () {
        it('Card is present', function () {
            assert.isTrue(Entity.contains(CardId.CARD));
        });

        it('Card is entity', function () {
            var card = Entity.get(CardId.CARD);
            assert.equal(CoreId.ENTITY, card.parentId);
        });

        it('Card has mana', function () {
            var card = Entity.get(CardId.CARD);
            assert.isTrue(card.hasProperty(CardId.MANA));
            assert.equal(0, card.mana);
        });

        it('Wizard is card class', function () {
            var wizard = Entity.get(CardId.CLASS_WIZARD);
            assert.isTrue(wizard.is(CardId.CARD_CLASS));
        });

        it('Gendalf has ability LightFlash', function () {
            var gendalf = Entity.get(CardId.CHAR_GENDALF);

            var ability = gendalf.ability[0];
            assert.equal(CardId.ABILITY_LIGHT_FLASH, ability.id);
        });

        it('Thor has 2 abilities', function () {
            var thor = Entity.get(CardId.CHAR_THOR);

            var abilities = thor.ability;
            assert.isTrue(Array.isArray(abilities));
            assert.equal(CardId.ABILITY_THOR_JUMP, abilities[0].id);
            assert.equal(CardId.ABILITY_THOR_HAMMER, abilities[1].id);
        });

        it('Thor counteract LightFlash', function () {
            var thor = Entity.get(CardId.CHAR_THOR);
            assert.equal(CardId.ABILITY_LIGHT_FLASH, thor.counteract[0].id);
        });

        it('Update existing entity', function () {
            var abracadabra = Entity.get(CardId.ABRA_CADABRA);
            assert.equal("Абра-кадабра 2", abracadabra.name);
            assert.equal("card_spell", abracadabra.parentId);
        });
    });
});