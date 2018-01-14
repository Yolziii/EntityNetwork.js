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
    C_COMMANDED: 'c_commanded',     // relation "constituent command", like in linguistic

    REGEXP: 'regexp',

    UNIQUE: 'unique',
    ACTIVE_PROPERTY: 'active_property',

    CLONE_VALUES_FOR_CHILDREN: 'clone_for_children', // All properties of entity, that mark by this tag will be copied for any child, and its children will clone their properties to their children too
    INHERIT_CLONED_VALUES: 'inherit_cloned_values'   // With this tag when entity is copied its values for children, entity-values will be cloning too by inherit original values
};

// #Node.js
try {
    module.exports = CoreId;
} catch(e) {}
// Node.js#