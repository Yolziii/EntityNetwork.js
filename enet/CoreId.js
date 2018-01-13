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
    C_COMMANDED: 'c_commanded',     // relation c-command

    REGEXP: 'regexp',

    UNIQUE: 'unique',
    ACTIVE_PROPERTY: 'active_property',

    COPY_FOR_CHILDREN: 'copy_for_children'
};

// #Node.js
try {
    module.exports = CoreId;
} catch(e) {}
// Node.js#