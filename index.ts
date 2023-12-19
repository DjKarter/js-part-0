interface AreEqualProps {
    a: unknown;
    b: unknown;
}

interface TestProps {
    whatWeTest: string;
    actualResult: unknown;
    expectedResult: unknown;
}

interface UnknownValueProps {
    value: any;
}

interface UnknownArrProps {
    arr: any[];
}


const testBlock = (name:string) => {
    console.groupEnd();
    console.group(`# ${name}\n`);
};

const areEqual = (props: AreEqualProps): boolean => {
    return typeof props.a === typeof props.b && props.a?.toString() === props.b?.toString();
};

const test = (props: TestProps): void => {
    if (areEqual({ a: props.actualResult, b: props.expectedResult })) {
        console.log(`[OK] ${props.whatWeTest}\n`);
    } else {
        console.error(`[FAIL] ${props.whatWeTest}`);
        console.debug('Expected:');
        console.debug(props.expectedResult);
        console.debug('Actual:');
        console.debug(props.actualResult);
        console.log('');
    }
};


const getType = (props: UnknownValueProps): string => {
    return typeof props.value;
};



const getTypesOfItems = (props: UnknownArrProps): string[] => {
    return [...props.arr.reduce((acc, elem) => acc.add(getType({ value: elem })), new Set([]))];
};


const allItemsHaveTheSameType = (props: UnknownArrProps): boolean => {
    return getTypesOfItems({ arr: props.arr }).length === 1;
};



const getRealType = (props: UnknownValueProps): string => {
    if (typeof props.value === "bigint")
        return 'bigint';
    else if (props.value instanceof Date)
        return 'date';
    else if (props.value instanceof Array)
        return 'array'
    else if (isNaN(props.value) && typeof(props.value) === "number")
        return 'NaN'
    else if (!isFinite(props.value) && typeof(props.value) === "number")
        return 'Infinity'
    else if (props.value instanceof RegExp)
        return 'regexp'
    else if (props.value instanceof Set)
        return 'set'
    else if (props.value instanceof Map)
        return 'map'
    else if (typeof props.value === "object" && !props.value)
        return 'null'
    else
        return typeof props.value;
};


const getRealTypesOfItems = (props: UnknownArrProps): string[] => {
    return [...props.arr.reduce((acc, elem) => acc.add(getRealType({ value: elem })), new Set([]))];
};

const everyItemHasAUniqueRealType = (props: UnknownArrProps): boolean => {
    return getRealTypesOfItems({ arr: props.arr }).length === props.arr.length;
};

const countRealTypes = (props: UnknownArrProps): [string, unknown][] => {
    return Object.entries(props.arr.reduce((acc, elem) => {
        acc[getRealType({ value: elem })] = typeof acc[getRealType({ value: elem })] !== "undefined" ? acc[getRealType({ value: elem })] + 1 : 1;
        return acc;
    }, {})).sort();
};

// Tests

testBlock('getType');

test({ whatWeTest: 'Boolean', actualResult: getType({ value: true }), expectedResult: 'boolean' });
test({ whatWeTest: 'Number', actualResult: getType({ value: 123 }), expectedResult: 'number' });
test({ whatWeTest: 'String', actualResult: getType({ value: 'whoo' }), expectedResult: 'string' });
test({ whatWeTest: 'Array', actualResult: getType({ value: [] }), expectedResult: 'object' });
test({ whatWeTest: 'Object', actualResult: getType({ value: {} }), expectedResult: 'object' });
test({ whatWeTest: 'Function', actualResult: getType({ value: () => {} }), expectedResult: 'function' });
test({ whatWeTest: 'Undefined', actualResult: getType({ value: undefined }), expectedResult: 'undefined' });
test({ whatWeTest: 'Null', actualResult: getType({ value: null }), expectedResult: 'object' });

testBlock( 'allItemsHaveTheSameType' );

test({ whatWeTest: 'All values are numbers', actualResult: allItemsHaveTheSameType({ arr: [11, 12, 13] }), expectedResult: true });

test({ whatWeTest: 'All values are strings', actualResult: allItemsHaveTheSameType({ arr: ['11', '12', '13'] }), expectedResult: true });

test({ whatWeTest: 'All values are strings but wait', actualResult: allItemsHaveTheSameType({ arr: ['11', new String('12'), '13'] }), expectedResult: false });

test({ whatWeTest: 'Values like a number', actualResult: allItemsHaveTheSameType({ arr: [123, 123 / Number('a'), 1 / 0] }), expectedResult: true });

test({ whatWeTest: 'Values like an object', actualResult: allItemsHaveTheSameType({ arr: [{}] }), expectedResult: true });

testBlock('getTypesOfItems VS getRealTypesOfItems');

let undefinedValue:unknown;

const knownTypes: unknown[] = [
    true,
    69,
    '777',
    ['0', '_', '0'],
    { work: 'isOver' },
    function (word:unknown) {
        return `The word '${word}' sounds beautiful!`;
    },
    undefinedValue,
    null,
    1 / Number(['заяц']),
    5 / 0 * 2 + 100 - 3 + 72,
    new Date(),
    /\w+/,
    new Set(),
    new Map(),
    BigInt(8800555)
    // Add values of different types like boolean, object, date, NaN and so on
];

test({ whatWeTest: 'Check basic types', actualResult: getTypesOfItems({ arr: knownTypes }), expectedResult: [
        'boolean',
        'number',
        'string',
        'object',
        'function',
        'undefined',
        'bigint'
    ] });

test({ whatWeTest: 'Check real types', actualResult: getRealTypesOfItems({ arr: knownTypes }), expectedResult: [
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
        'bigint'
    ] });

testBlock('everyItemHasAUniqueRealType');

test({ whatWeTest: 'All value types in the array are unique', actualResult: everyItemHasAUniqueRealType({ arr: [true, 123, '123'] }), expectedResult: true });

test({ whatWeTest: 'Two values have the same type', actualResult: everyItemHasAUniqueRealType({ arr: [true, 123, Number('123') === 123] }), expectedResult: false });

test({ whatWeTest: 'There are no repeated types in knownTypes', actualResult: everyItemHasAUniqueRealType({ arr: knownTypes }), expectedResult: true });

testBlock('countRealTypes');

test({ whatWeTest: 'Count unique types of array items', actualResult: countRealTypes({ arr: [true, null, !null, !!null, {}] }), expectedResult: [
        ['boolean', 3],
        ['null', 1],
        ['object', 1],
    ] });

test({ whatWeTest: 'Counted unique types are sorted', actualResult: countRealTypes({ arr: [{}, null, true, !null, !!null] }), expectedResult: [
        ['boolean', 3],
        ['null', 1],
        ['object', 1],
    ] });

testBlock('mySillyTests');

test({ whatWeTest: 'All value types do not equal all real value types', actualResult: getRealTypesOfItems({ arr: [1, 1 / 0, 120 / Number('beda')] }) === getTypesOfItems({ arr: [1, 1 / 0, 120 / Number('beda')] }), expectedResult: false });

test({ whatWeTest: 'String (not string) type in absent', actualResult: getRealTypesOfItems({ arr: [new String(123), 'myBad'] }), expectedResult: ['object', 'string'] });

test({ whatWeTest: 'Data', actualResult: getRealType({ value: new Date() }), expectedResult: 'date' });

test({ whatWeTest: 'Nested array with values has array type', actualResult: getRealTypesOfItems({ arr: [[[0, ''],[{}], new Set([1, 2, 3])],[new Date()]] }), expectedResult: ['array'] });
