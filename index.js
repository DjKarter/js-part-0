// Test utils

const testBlock = (name) => {
    console.groupEnd();
    console.group(`# ${name}\n`);
};

const areEqual = (a, b) => {
    return typeof a === typeof b && a?.toString() === b?.toString();
    // Можно было также сделать отдельно для объектов и примитивных a.length === b.length && a.every((elem, i) => elem === b[i]);
};

const test = (whatWeTest, actualResult, expectedResult) => {
    if (areEqual(actualResult, expectedResult)) {
        console.log(`[OK] ${whatWeTest}\n`);
    } else {
        console.error(`[FAIL] ${whatWeTest}`);
        console.debug('Expected:');
        console.debug(expectedResult);
        console.debug('Actual:');
        console.debug(actualResult);
        console.log('');
    }
};

// Functions

const getType = (value) => {
    return typeof value;
};

const getTypesOfItems = (arr) => {
    return [...arr.reduce((acc, elem) => acc.add(getType(elem)), new Set([]))];
};

const allItemsHaveTheSameType = (arr) => {
    return getTypesOfItems(arr).length === 1;
};

const getRealType = (value) => {
    if (typeof value === 'bigint') {
        return 'bigint';
    } else if (value instanceof Date) {
        return 'date';
    } else if (value instanceof Array) {
        return 'array';
    } else if (isNaN(value) && typeof value === 'number') {
        return 'NaN';
    } else if (!isFinite(value) && typeof value === 'number') {
        return 'Infinity';
    } else if (value instanceof RegExp) {
        return 'regexp';
    } else if (value instanceof Set) {
        return 'set';
    } else if (value instanceof Map) {
        return 'map';
    } else if (typeof value === 'object' && !value) {
        return 'null';
    }
    return typeof value;
};

const getRealTypesOfItems = (arr) => {
    return [...arr.reduce((acc, elem) => acc.add(getRealType(elem)), new Set([]))];
};

const everyItemHasAUniqueRealType = (arr) => {
    return getRealTypesOfItems(arr).length === arr.length;
};

const countRealTypes = (arr) => {
    return Object.entries(
        arr.reduce((acc, elem) => {
            acc[getRealType(elem)] = typeof acc[getRealType(elem)] !== 'undefined' ? acc[getRealType(elem)] + 1 : 1;
            return acc;
        }, {})
    ).sort();
};

// Tests

testBlock('getType');

test('Boolean', getType(true), 'boolean');
test('Number', getType(123), 'number');
test('String', getType('whoo'), 'string');
test('Array', getType([]), 'object');
test('Object', getType({}), 'object');
test(
    'Function',
    getType(() => {}),
    'function'
);
test('Undefined', getType(undefined), 'undefined');
test('Null', getType(null), 'object');

testBlock('allItemsHaveTheSameType');

test('All values are numbers', allItemsHaveTheSameType([11, 12, 13]), true);

test('All values are strings', allItemsHaveTheSameType(['11', '12', '13']), true);

test(
    'All values are strings but wait',
    allItemsHaveTheSameType(['11', new String('12'), '13']),
    false
    // What the result? Answer: new String('12) creates an object => false
);

test(
    'Values like a number',
    allItemsHaveTheSameType([123, 123 / 'a', 1 / 0]),
    true
    // What the result? Answer: NaN in JS is a number that is not a legal number(but number) and Infinite is number too => true
);

test('Values like an object', allItemsHaveTheSameType([{}]), true);

testBlock('getTypesOfItems VS getRealTypesOfItems');

let undefinedValue;

const knownTypes = [
    true,
    69,
    '777',
    ['0', '_', '0'],
    { work: 'isOver' },
    function (word) {
        return `The word '${word}' sounds beautiful!`;
    },
    undefinedValue,
    null,
    1 / ['заяц'],
    (5 / 0) * 2 + 100 - 3 + 72,
    new Date(),
    /\w+/,
    new Set(),
    new Map(),
    BigInt(8800555),
    // Add values of different types like boolean, object, date, NaN and so on
];

test('Check basic types', getTypesOfItems(knownTypes), [
    'boolean',
    'number',
    'string',
    'object',
    'function',
    'undefined',
    'bigint',
]);

test('Check real types', getRealTypesOfItems(knownTypes), [
    'boolean',
    'number',
    'string',
    'array',
    'object',
    'function',
    'undefined',
    'null',
    'NaN',
    'Infinity',
    'date',
    'regexp',
    'set',
    'map',
    'bigint',
]);

testBlock('everyItemHasAUniqueRealType');

test('All value types in the array are unique', everyItemHasAUniqueRealType([true, 123, '123']), true);

test('Two values have the same type', everyItemHasAUniqueRealType([true, 123, '123' === 123]), false);

test('There are no repeated types in knownTypes', everyItemHasAUniqueRealType(knownTypes), true);

testBlock('countRealTypes');

test('Count unique types of array items', countRealTypes([true, null, !null, !!null, {}]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

test('Counted unique types are sorted', countRealTypes([{}, null, true, !null, !!null]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

testBlock('mySillyTests');
test(
    'All value types do not equal all real value types',
    getRealTypesOfItems([1, 1 / 0, 120 / 'beda']) === getTypesOfItems([1, 1 / 0, 120 / 'beda']),
    false
);

test('String (not string) type in absent', getRealTypesOfItems([new String(123), 'myBad']), ['object', 'string']);

test('Data', getRealType(new Date()), 'date');

test(
    'Nested array with values has array type',
    getRealTypesOfItems([[[0, ''], [{}], new Set([1, 2, 3])], [new Date()]]),
    ['array']
);
