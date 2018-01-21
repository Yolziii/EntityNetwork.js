// #import modules
try {
    var chai = require('chai');
    var fs = require('fs');
    var EntityLoader = require('../enet/EntityLoader');
    var Entity = require('../enet/Entity');
    var CoreId = require('../enet/CoreId');



    var assert = chai.assert;
} catch (e) {
}
// import modules#

var dataObject = {
    card_class: {},
    class_warrior: {is : "card_class"},
    class_wizard: {is : "card_class"},
    class_god: {is : "class_wizard"},

    card : {
        "mana": 0
    },
    card_spell : {
        "is":"card"
    },
    card_character : {
        is: "card",
        health:0,
        attack: 0,
        card_class: null,
        ability: null
    },

    health: {is: "int", min_value: 0},
    attack: {is: "int", min_value: 0},
    mana: {is: "int", min_value: 0},

    name: {is: "string", single_line: true},
    id: {is: "string", single_line: true},

    ability: {multiple_value: true},
    some_ability: {is: "ability"},

    LightFlash : {
        is:"ability",
        strong: null
    },
    strong: {is: "int", min_value: 0},

    "Abra-cadabra!": {
        is: "card_spell",
        name: "Абра-кадабра",
        mana: 2
    },

    Gendalf: {
        is: "card_character",
        name: "Гендальф",
        mana: 5,
        health: 6,
        attack: 2,
        card_class: "class_wizard",
        ability: {
            is: "some_ability",
            id: "LightFlash",
            strong: 5
        }
    },

    Thor: {
        is: "card_character",
        name: "Тор",
        mana: 9,
        health: 12,
        attack: 8,
        card_class: "class_god",
        ability: [
            {id: "Thor's jump", strong: 3},
            {id: "Thor's hammer", strong: 10}
        ],
        counteract: "LightFlash"
    },

    counteract: {is: "ability", c_commanded: true}
};
var dataObject2 = {
    "Abra-cadabra!": {
        name: "Абра-кадабра 2"
    }
};


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

    COUNTERACT: 'counteract'
};

describe('EntityLoader', function () {
    before(function () {
        Entity.clear();
        EntityLoader.proceedDocumentObject(dataObject);
        EntityLoader.proceedDocumentObject(dataObject2);
    });

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

    it('Change parent for inline entity', function () {
        var lightFlash = Entity.get(CardId.ABILITY_LIGHT_FLASH);
        assert.isTrue(lightFlash.is('some_ability'));
        assert.equal(5, lightFlash.strong);
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


    it('Batch loading, link from one file to another', function () {
        var dataOne = {
            "a": {"is": "b"}
        };

        var dataTwo = {
            "b": {}
        };

        EntityLoader.proceedDocumentsArray([dataOne, dataTwo]);
        assert.isTrue(Entity.contains('a'));
        assert.isTrue(Entity.contains('b'));
        assert.isTrue(Entity.get('a').is('b'));
    });

    it('Parse entity literal', function () {
        var wolf = EntityLoader.createEntity({is: "card", id: "wolf", health: 10});

        assert.equal('wolf', wolf.id);
        assert.equal(10, wolf.health);
        assert.isTrue(wolf.is(CardId.CARD));
    });
});