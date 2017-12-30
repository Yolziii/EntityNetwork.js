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

// #export modules
try {
    module.exports = EntityErrorId;
} catch(e) {}
// export modules#