import { expect, test } from 'vitest';

import { Debug, parseDebug } from '$main/datatypes';

const TESTS_PARSE_DEBUG = [

    { value: Debug.None, expected: 0 },
    { value: Debug.Default, expected: 1 },
    { value: Debug.RootBefore, expected: 2 },
    { value: Debug.RootAfter, expected: 4 },
    { value: Debug.All, expected: 7 },

    { value: 'None', expected: 0 },
    { value: 'Default', expected: 1 },
    { value: 'RootBefore', expected: 2 },
    { value: 'RootAfter', expected: 4 },
    { value: 'All', expected: 7 },

    { value: ['None', 'None'], expected: 0 },
    { value: ['Default', 'Default'], expected: 1 },
    { value: ['RootBefore', 'RootBefore'], expected: 2 },
    { value: ['RootAfter', 'RootAfter'], expected: 4 },
    { value: ['All', 'All'], expected: 7 },

    { value: ['None', 'Default'], expected: 1 },
    { value: ['Default', 'All'], expected: 7 },
    { value: ['RootBefore', 'RootAfter'], expected: 6 },

];

for (const tc of TESTS_PARSE_DEBUG) {
    test(`parseDebug(${tc.value})`, () => {
        const debugNum  = parseDebug(tc.value);
        expect(debugNum).toBe(tc.expected);
    });
}
