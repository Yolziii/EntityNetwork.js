// #import modules
try {
    var chai = require('chai');
    var Entity = require('../enet/Entity');
    var CoreId = require('../enet/CoreId');
    var EntityErrorId = require('../enet/EntityErrorId');

    var assert = chai.assert;
} catch(e) {}
// import modules#

describe('Entity', function() {
    beforeEach(function() {
        Entity.clear();
    });


    describe('Parents and children', function() {
        it('Can\'t get not existing entity', function () {
            try {
                Entity.get("card");
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.UnknownEntity, e.id);
            }
        });

        it('Create entity', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            assert.equal("card", card.id);
        });

        it('Remove entity by itself', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            Entity.remove(card);
            assert.isFalse(Entity.contains('card'));
        });

        it('Remove entity by ID', function () {
            Entity.create("card", CoreId.ENTITY);
            Entity.remove('card');
            assert.isFalse(Entity.contains('card'));
        });

        it('Entity parent ID', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            assert.equal(CoreId.ENTITY, card.parentId);
        });

        it('Check then child inherits parent', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            assert.isTrue(card.is(CoreId.ENTITY));
        });

        it('Entity is entity', function () {
            var entity = Entity.get(CoreId.ENTITY);
            assert.isTrue(entity.is(entity));
        });

        it('Card is card', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            assert.isTrue(card.is(card));
        });

        it('Parent can be entity object', function () {
            var entity = Entity.get(CoreId.ENTITY);
            var card = Entity.create("card", entity);
            assert.equal("entity", card.parentId);
        });

        it('Check entity can be entity object', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var entity = Entity.get(CoreId.ENTITY);
            assert.isTrue(card.is(entity));
        });

        it('Entity "is" for card', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var entity = Entity.get(CoreId.ENTITY);
            assert.isTrue(entity.isFor(card));
        });

        it('Entity "is" for warrior', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            Entity.create("warrior", card);

            var entity = Entity.get(CoreId.ENTITY);
            assert.isTrue(entity.isFor('warrior'));
        });

        it('Entity not "is" for entity', function () {
            var entity = Entity.get(CoreId.ENTITY);
            assert.isFalse(entity.isFor(entity));
        });

        it('Card not "is" for card', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            assert.isFalse(card.isFor(card));
        });

        it('Create parent entity too', function () {
            var warrior = Entity.create("warrior", 'card');
            var card = Entity.get('card');

            assert.isTrue(warrior.is(card));
            assert.equal(undefined, card.parentId);
        });

        it('Update created parent', function () {
            var warrior = Entity.create("warrior", 'card');
            var card =Entity.create('card', CoreId.ENTITY);

            assert.isTrue(warrior.is(card));
            assert.equal(CoreId.ENTITY, card.parentId);
        });
    });

    describe('Properties and values', function() {
        it('Set value by method', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            Entity.create("strong", CoreId.INT);

            card.setValue("strong", 5);
            assert.equal(5, card.strong);
        });

        it('Get value', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            Entity.create("strong", CoreId.INT);

            card.setValue("strong", 5);
            assert.equal(5, card.getValue('strong'));
        });

        it('Set value directly', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            card.strong = 5;
            assert.equal(5, card.getValue('strong'));
        });

        it('Set value by property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var strong = Entity.create("strong", CoreId.INT);
            card.setValue(strong, 5);
            assert.equal(5, card.strong);
        });

        it('Has property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            Entity.create("strong", CoreId.INT);

            card.setValue("strong", 5);
            assert.isTrue(card.hasProperty("strong"));
        });

        it('Has property by property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var strong = Entity.create("strong", CoreId.INT);
            card.setValue(strong, 5);
            assert.isTrue(card.hasProperty(strong));
        });

        it('Remove value', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            Entity.create("strong", CoreId.INT);

            card.setValue("strong", 5);
            card.removeValue("strong", 5);

            assert.equal(undefined, card.strong);
        });

        it('Remove value by property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var strong = Entity.create("strong", CoreId.INT);
            card.setValue(strong, 5);
            card.removeValue(strong, 5);

            assert.equal(undefined, card.strong);
        });

        it('Remove property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            Entity.create("strong", CoreId.INT);
            card.setValue("strong", 5);
            card.removeProperty("strong");

            assert.equal(undefined, card.strong);
        });

        it('Remove property by property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var strong = Entity.create("strong", CoreId.INT);
            card.setValue(strong, 5);
            card.removeProperty(strong);

            assert.equal(undefined, card.strong);
        });

        it('Add 1 value', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var strong = Entity.create("strong", CoreId.INT);
            strong.setValue(CoreId.MULTIPLE_VALUE, true);

            card.addValue("strong", 1);
            assert.equal(1, card.strong[0]);
        });

        it('Add 1 value by property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var strong = Entity.create("strong", CoreId.INT);
            strong.setValue(CoreId.MULTIPLE_VALUE, true);

            card.addValue(strong, 1);
            assert.equal(1, card.strong);
        });

        it('Add 3 values', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var strong = Entity.create("strong", CoreId.INT);
            strong.setValue(CoreId.MULTIPLE_VALUE, true);

            card.addValue("strong", 1);
            card.addValue("strong", 2);
            card.addValue("strong", 3);
            assert.equal(1, card.strong[0]);
            assert.equal(2, card.strong[1]);
            assert.equal(3, card.strong[2]);
        });

        it('addValue() rewrite multiple value of its parent', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var warrior = Entity.create("warrior", card);
            var strong = Entity.create("strong", CoreId.INT);
            strong.setValue(CoreId.MULTIPLE_VALUE, true);

            card.addValue("strong", 1);
            warrior.addValue("strong", 2);

            assert.equal(1, card.strong[0]);
            assert.equal(2, warrior.strong[0]);

            warrior.addValue("strong", 3);
            assert.equal(3, warrior.strong[1]);
        });

        it('addValue() with "expand_value" expand multiple values', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var warrior = Entity.create("warrior", card);
            var strong = Entity.create("strong", CoreId.INT);
            strong.setValue(CoreId.MULTIPLE_VALUE, true);
            strong.setValue(CoreId.EXPAND_VALUE, true);

            card.addValue("strong", 1);
            warrior.addValue("strong", 2);

            assert.equal(1, warrior.strong[0]);
            assert.equal(2, warrior.strong[1]);
        });

        it('Do not expand parent property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var warrior = Entity.create("warrior", card);
            var strong = Entity.create("strong", CoreId.INT);
            strong.setValue(CoreId.MULTIPLE_VALUE, true);
            strong.setValue(CoreId.EXPAND_VALUE, true);

            card.addValue("strong", 10);
            warrior.addValue("strong", 20);

            assert.equal(1, card.strong.length);
            assert.equal(2, warrior.strong.length);
        });

        it('Contains one value', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            Entity.create("strong", CoreId.INT);

            card.setValue('strong', 1);
            assert.isTrue(card.contains('strong', 1));
        });

        it('Contains value in array', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var strong = Entity.create("strong", CoreId.INT);
            strong.setValue(CoreId.MULTIPLE_VALUE, true);

            card.addValue('strong', 1);
            card.addValue('strong', 2);
            assert.isTrue(card.contains('strong', 2));
        });

        it('Doesn\'t contains value', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            Entity.create("strong", CoreId.INT);

            card.setValue('strong', 1);
            assert.isFalse(card.contains('strong', 2));
        });

        it('isMultiple()', function () {
            var strong = Entity.create("strong", CoreId.INT);
            strong.setValue(CoreId.MULTIPLE_VALUE, true);

            assert.isTrue(strong.isMultiple());
        });

        it('!isMultiple()', function () {
            var strong = Entity.create("strong", CoreId.INT);
            assert.isFalse(strong.isMultiple());
        });

        it('Child inherits parent property', function () {
            Entity.create("health", CoreId.INT);

            var card = Entity.create("card", CoreId.ENTITY);
            var warrior = Entity.create("warrior", "card");
            card.setValue('health', 0);

            assert.equal(0, warrior.health);
        });

        it('Child rewrite parent property', function () {
            Entity.create("health", CoreId.INT);
            var card = Entity.create("card", CoreId.ENTITY);
            var warrior = Entity.create("warrior", "card");

            card.setValue('health', 0);
            warrior.setValue('health', 4);

            assert.equal(4, warrior.health);
        });

        it('changeValue()', function () {
            Entity.defineImplementationForEntity('prop', {
                checkValueAsProperty: function () {
                    return 'changed value';
                }
            });

            var prop = Entity.create('prop', CoreId.STRING);
            var changer = Entity.create("changer", CoreId.INT);
            changer.setValue(prop, 'original value');

            assert.equal('changed value', changer.prop);
        });
    });

    describe('Unknown property exceptions', function() {
        it('Unknown property from contains()', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            try {
                card.contains('strong', 1);
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.UndefinedProperty, e.id);
            }
        });

        it('Unknown property from getValue()', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            try {
                card.getValue('strong');
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.UndefinedProperty, e.id);
            }
        });

        it('Unknown property from getValue()', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            try {
                card.getValue('strong');
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.UndefinedProperty, e.id);
            }
        });

    });

    describe('Values types checking', function() {
        it('True for boolean-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var checked = Entity.create("checked", CoreId.BOOLEAN);
            card.setValue(checked, true);
            assert.isTrue(card.checked);
        });

        it('False for boolean-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var checked = Entity.create("checked", CoreId.BOOLEAN);
            card.setValue(checked, false);
            assert.isFalse(card.checked);
        });

        it('Null for boolean-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var checked = Entity.create("checked", CoreId.BOOLEAN);
            card.setValue(checked, null);
            assert.isNull(card.checked);
        });

        it('Something wrong for boolean-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var checked = Entity.create("checked", CoreId.BOOLEAN);

            try {
                card.setValue(checked, 1);
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.NotBoolean, e.id);
            }
        });

        it('Int for int-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var health = Entity.create("health", CoreId.INT);
            card.setValue(health, 123);
            assert.equal(123, card.health);
        });

        it('Null for int-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var health = Entity.create("health", CoreId.INT);
            card.setValue(health, null);
            assert.isNull(card.health);
        });

        it('Something wrong for int-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var health = Entity.create("health", CoreId.INT);

            try {
                card.setValue(health, "123");
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.NotInt, e.id);
            }
        });

        it('Float for int-property' , function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var health = Entity.create("health", CoreId.INT);

            try {
                card.setValue(health, 1.5);
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.NotInt, e.id);
            }
        });

        it('Number for float-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var rank = Entity.create("rank", CoreId.FLOAT);
            card.setValue(rank, 123.5);
            assert.equal(123.5, card.rank);
        });

        it('Null for float-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var rank = Entity.create("rank", CoreId.FLOAT);
            card.setValue(rank, null);
            assert.isNull(card.rank);
        });

        it('Something wrong for float-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var rank = Entity.create("rank", CoreId.FLOAT);

            try {
                card.setValue(rank, "123.4");
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.NotFloat, e.id);
            }
        });

        it('String for string-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var desc = Entity.create("desc", CoreId.STRING);
            card.setValue(desc, "string value");
            assert.equal("string value", card.desc);
        });

        it('Null for string-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var desc = Entity.create("desc", CoreId.STRING);
            card.setValue(desc, null);
            assert.isNull(card.desc);
        });

        it('Something wrong for string-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var desc = Entity.create("desc", CoreId.STRING);

            try {
                card.setValue(desc, 123);
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.NotString, e.id);
            }
        });

        it('Class for class-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var cardClass = Entity.create("card-class", CoreId.ENTITY);
            var classWarrior = Entity.create("class-warrior", cardClass);

            card.setValue(cardClass, classWarrior);
            assert.equal(classWarrior, card['card-class']);
        });

        it('Class for for class-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var cardClass = Entity.create("card-class", CoreId.ENTITY);

            card.setValue(cardClass, null);
            assert.isNull(card['card-class']);
        });

        it('Not-class for for class-property', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var cardClass = Entity.create("card-class", CoreId.ENTITY);
            var notClass = Entity.create("some entity", CoreId.ENTITY);

            try {
                card.setValue(cardClass, notClass);
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.NotParticularEntity, e.id);
            }
        });

        it('Convert entity value to string', function () {
            var card = Entity.create("card", CoreId.ENTITY);
            var name = Entity.create("name", CoreId.STRING);
            Entity.create("some name", CoreId.ENTITY);

            card.setValue(name, 'some name');
            assert.equal('some name', card.name);
        });
    });

    describe('Implementations', function() {
        it('Direct entity implementation', function () {
            Entity.defineImplementationForEntity('card', {
                iAmCard: function () {
                    return 'I am card';
                }
            });
            var card = Entity.create('card', CoreId.ENTITY);

            assert.isTrue(card.iAmCard !== undefined);
            assert.equal('I am card', card.iAmCard());
        });

        it('Children inherit parents implementations', function () {
            Entity.defineImplementationForEntity('card', {iAmCard:function(){return 'I am card';}});
            var card = Entity.create('card', CoreId.ENTITY);
            var warrior = Entity.create('warrior', card);
            var superWarrior = Entity.create('super-warrior', warrior);

            assert.isTrue(superWarrior.iAmCard !== undefined);
            assert.equal('I am card', superWarrior.iAmCard());
        });

        it('Children inherit parents implementations', function () {
            Entity.defineImplementationForEntity('card', {iAmCard:function(){return 'I am card';}});
            var card = Entity.create('card', CoreId.ENTITY);
            var warrior = Entity.create('warrior', card);
            var superWarrior = Entity.create('super-warrior', warrior);

            assert.isTrue(superWarrior.iAmCard !== undefined);
            assert.equal('I am card', superWarrior.iAmCard());
        });
    });

    describe('Conditions', function() {
        it('Max value for int', function () {
            var card = Entity.create('card', CoreId.ENTITY);
            var health = Entity.create('health', CoreId.INT);
            health.setValue(CoreId.MAX_VALUE, 10);

            try {
                card.setValue(health, 15);
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.ConditionMaxValue, e.id);
            }
        });

        it('Min value for int', function () {
            var card = Entity.create('card', CoreId.ENTITY);
            var health = Entity.create('health', CoreId.INT);
            health.setValue(CoreId.MIN_VALUE, 0);

            try {
                card.setValue(health, -5);
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.ConditionMinValue, e.id);
            }
        });

        it('Max value for float', function () {
            var card = Entity.create('card', CoreId.ENTITY);
            var rank = Entity.create('rank', CoreId.FLOAT);
            rank.setValue(CoreId.MAX_VALUE, 10);

            try {
                card.setValue(rank, 10.1);
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.ConditionMaxValue, e.id);
            }
        });

        it('Min value for int', function () {
            var card = Entity.create('card', CoreId.ENTITY);
            var rank = Entity.create('rank', CoreId.FLOAT);
            rank.setValue(CoreId.MIN_VALUE, 0);

            try {
                card.setValue(rank, -0.1);
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.ConditionMinValue, e.id);
            }
        });

        it('Max length for string', function () {
            var card = Entity.create('card', CoreId.ENTITY);
            var desc = Entity.create('desc', CoreId.STRING);
            desc.setValue(CoreId.MAX_LENGTH, 5);

            try {
                card.setValue(desc, "123456");
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.ConditionMaxLength, e.id);
            }
        });

        it('Min length for string', function () {
            var card = Entity.create('card', CoreId.ENTITY);
            var desc = Entity.create('desc', CoreId.STRING);
            desc.setValue(CoreId.MIN_LENGTH, 5);

            try {
                card.setValue(desc, "1234");
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.ConditionMinLength, e.id);
            }
        });

        it('Only single line string', function () {
            var card = Entity.create('card', CoreId.ENTITY);
            var desc = Entity.create('desc', CoreId.STRING);
            desc.setValue(CoreId.SINGLE_LINE, true);

            try {
                card.setValue(desc, "one\nsecond");
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.ConditionSingleLine, e.id);
            }
        });

        it('Without single_line strings can be multiline', function () {
            var card = Entity.create('card', CoreId.ENTITY);
            var desc = Entity.create('desc', CoreId.STRING);
            card.setValue(desc, "one\nsecond");
            assert.equal("one\nsecond", card.desc);
        });

        it('"regexp" to not string property', function () {
            var health = Entity.create('health', CoreId.INT);

            try {
                health.setValue(CoreId.REGEXP, "/a/g");
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.RegexpForStringsOnly, e.id);
            }
        });

        it('"single_line" to not string property', function () {
            var health = Entity.create('health', CoreId.INT);

            try {
                health.setValue(CoreId.SINGLE_LINE, true);
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.SingleLineForStringsOnly, e.id);
            }
        });

        it('Regular expression mismatch', function () {
            var email = Entity.create('email', CoreId.STRING);
            email.setValue(CoreId.REGEXP, '\\S+@\\S+\\.\\S+');

            var person = Entity.create('person');
            try {
                person.setValue(email, "not email");
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.ConditionRegexp, e.id);
            }
        });

        it('Regular expression match', function () {
            var email = Entity.create('email', CoreId.STRING);
            email.setValue(CoreId.REGEXP, '\\S+@\\S+\\.\\S+');

            var person = Entity.create('person');
            person.setValue(email, "name@domain.com");

            assert.equal("name@domain.com", person.email);
        });

        it('Not multiple value', function () {
            var card = Entity.create('card', CoreId.ENTITY);
            var health = Entity.create('health', CoreId.INT);
            try {
                card.addValue(health, 1);
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.NotMultiple, e.id);
            }
        });

        it('setValue() use addValue()', function () {
            var card = Entity.create('card', CoreId.ENTITY);
            var levels = Entity.create('levels', CoreId.INT);
            levels.setValue(CoreId.MULTIPLE_VALUE, true);

            card.setValue(levels, 1);
            assert.equal(1, card.levels[0]);
        });

        it('Not unique value', function () {

            var protocolId = Entity.create('protocol_id', CoreId.INT);
            protocolId.setValue(CoreId.UNIQUE, true);

            var state1 = Entity.create('state1', CoreId.ENTITY);
            state1.setValue(protocolId, 1);
            var state2 = Entity.create('state2', CoreId.ENTITY);
            try {
                state2.setValue(protocolId, 1);
                assert.isTrue(false);
            } catch (e) {
                assert.equal(EntityErrorId.NotUniqueValue, e.id);
            }
        });

        it('Not unique value 2', function () {

            var protocolId = Entity.create('protocol_id', CoreId.INT);
            protocolId.setValue(CoreId.UNIQUE, true);

            var state1 = Entity.create('state1', CoreId.ENTITY);
            state1.setValue(protocolId, 1);
            assert.equal(1, state1[protocolId.id]);
        });
    });

    describe('Cloning entities', function() {
        it('Clone simple properties', function () {
            var simpleProperty = Entity.create('simple property', CoreId.INT);

            var clonedEntity = Entity.create('cloned entity', CoreId.ENTITY);
            clonedEntity.setValue(CoreId.CLONE_VALUES_FOR_CHILDREN, true);
            clonedEntity.setValue(simpleProperty, 1);

            var clonedChild = Entity.create('cloned child', clonedEntity); // value 1 of simple property must be cloned to child
            clonedEntity.setValue(simpleProperty, 2);

            assert.equal(2, clonedEntity[simpleProperty.id]);
            assert.equal(1, clonedChild[simpleProperty.id]);
        });

        it('Clone simple multiple properties', function () {
            var simpleProperty = Entity.create('simple property', CoreId.INT);
            simpleProperty.setValue(CoreId.MULTIPLE_VALUE, true);

            var clonedEntity = Entity.create('cloned entity', CoreId.ENTITY);
            clonedEntity.setValue(CoreId.CLONE_VALUES_FOR_CHILDREN, true);
            clonedEntity.setValue(simpleProperty, 1);

            var clonedChild = Entity.create('cloned child', clonedEntity);
            clonedEntity.removeValue(simpleProperty, 1);
            clonedEntity.setValue(simpleProperty, 2);

            assert.equal(2, clonedEntity[simpleProperty.id][0]);
            assert.equal(1, clonedChild[simpleProperty.id][0]);
        });

        it('Clone entity properties', function () {
            var simpleProperty = Entity.create('simple property', CoreId.ENTITY);
            var simpleValue1 = Entity.create('simpleValue1', simpleProperty);
            var simpleValue2 = Entity.create('simpleValue2', simpleProperty);

            var clonedEntity = Entity.create('cloned entity', CoreId.ENTITY);
            clonedEntity.setValue(CoreId.CLONE_VALUES_FOR_CHILDREN, true);
            clonedEntity.setValue(simpleProperty, simpleValue1);

            var clonedChild = Entity.create('cloned child', clonedEntity);
            clonedEntity.setValue(simpleProperty, simpleValue2);

            assert.equal(simpleValue2, clonedEntity[simpleProperty.id]);
            assert.equal(simpleValue1, clonedChild[simpleProperty.id]);
        });

        it('Copy cloned entity values', function () {
            var simpleProperty = Entity.create('simple property', CoreId.ENTITY);
            var simpleValue = Entity.create('simpleValue', simpleProperty);

            var clonedEntity = Entity.create('cloned entity', CoreId.ENTITY);
            clonedEntity.setValue(CoreId.CLONE_VALUES_FOR_CHILDREN, true);
            clonedEntity.setValue(CoreId.INHERIT_CLONED_VALUES, true);
            clonedEntity.setValue(simpleProperty, simpleValue);

            var clonedChild = Entity.create('cloned child', clonedEntity);

            assert.isTrue(simpleValue.id !== clonedChild[simpleProperty.id].id);
        });

        it('Unclonable value', function () {
            var simpleProperty = Entity.create('simple property', CoreId.ENTITY);
            var unclonableValue = Entity.create('unclonable value', simpleProperty);
            unclonableValue.setValue(CoreId.UNCLONABLE_VALUE, true);

            var clonedEntity = Entity.create('cloned entity', CoreId.ENTITY);
            clonedEntity.setValue(CoreId.CLONE_VALUES_FOR_CHILDREN, true);
            clonedEntity.setValue(CoreId.INHERIT_CLONED_VALUES, true);
            clonedEntity.setValue(simpleProperty, unclonableValue);

            var clonedChild = Entity.create('cloned child', clonedEntity);

            assert.equal(unclonableValue.id, clonedChild[simpleProperty.id].id);
        });
    });
});