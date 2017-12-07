var chai = require('chai');
var fs = require('fs');
var EntityLoader = require('../enet/EntityLoader.js').EntityLoader;
var entityModule = require('../enet/Entity.js');
var Entity = entityModule.Entity;
var CoreId = entityModule.CoreId;

var assert = chai.assert;

// TODO: Run all tests from text.html

const CardId = {
    CARD: 'card',
    MANA: 'mana',

    CARD_CLASS: 'card_class',
    CLASS_WIZARD: 'class_wizard',

    CHAR_GENDALF: 'Gendalf',
    CHAR_THOR: 'Thor',

    ABILITY: 'ability',
    ABILITY_LIGHT_FLASH: 'LightFlash',
    ABILITY_THOR_JUMP: 'Thor\'s jump',
    ABILITY_THOR_HAMMER: 'Thor\'s hammer',
};

describe('Entity network', function() {
    before(function() {
        Entity.clear();
        var dataObject = JSON.parse(fs.readFileSync('./test/test.EntityLoader.json', 'utf8'));
        EntityLoader.proceedDocumentObject(dataObject);
    });

    describe('EntityLoader', function() {
        it('Card is present', function() {
            assert.isTrue(Entity.contains(CardId.CARD));
        });

        it('Card is entity', function() {
            var card = Entity.get(CardId.CARD);
            assert.equal(CoreId.ENTITY, card.parentId);
        });

        it('Card has mana', function() {
            var card = Entity.get(CardId.CARD);
            assert.isTrue(card.hasProperty(CardId.MANA));
            assert.equal(0, card.mana);
        });

        it('Wizard is card class', function() {
            var wizard = Entity.get(CardId.CLASS_WIZARD);
            assert.isTrue(wizard.is(CardId.CARD_CLASS));
        });

        it('Gendalf has ability LightFlash', function() {
            var gendalf = Entity.get(CardId.CHAR_GENDALF);

            var ability = gendalf.ability;
            assert.equal(CardId.ABILITY_LIGHT_FLASH, ability.id);
        });

        it('Thor has 2 abilities', function() {
            var thor = Entity.get(CardId.CHAR_THOR);

            var abilities = thor.ability;
            assert.isTrue(Array.isArray(abilities));
            assert.isTrue(thor.isMultiple('ability'));
            assert.equal(CardId.ABILITY_THOR_JUMP, abilities[0].id);
            assert.equal(CardId.ABILITY_THOR_HAMMER, abilities[1].id);
        });
    });
});