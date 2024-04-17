import { expect, test } from 'vitest';

import { Debug, RemarkAutolinkerOptions } from '$main/datatypes';
import { remarkAutolinker } from '$main/index';
import { listTestPairs, loadResource, runTransformer } from '$test/testutils';

const DEFAULT_OPTIONS: RemarkAutolinkerOptions = {
    debug           : Debug.None,
    all             : false,
    caseInsensitive : false,
    links           : [
        { key: 'My Link', link: 'https://www.mylink.test' },
        { key: 'Site', link: 'https://www.site.test' },
        { key: 'Titled Link', link: 'https://www.gollum.test' },
        { key: 'mailto--', link: 'mailto://frog@insect.com' },
        { key: 'Java', link: 'https://www.java.com/de/' },
        { key: 'Spring', link: 'https://spring.io/' },
        { key: 'Spring Boot', link: 'https://spring.io/projects/spring-boot' }
    ],
};

function runTransformerImpl(location: string, config: RemarkAutolinkerOptions): string {
    return runTransformer(location, remarkAutolinker, config);
}

function cfg(caseInsensitive: boolean, all: boolean): RemarkAutolinkerOptions {
    return {
        ...DEFAULT_OPTIONS,
        caseInsensitive,
        all
    };
}

// we're collecting all markdowns within the autolinker dir. some flags will
// be provided through the filename:
//
//   _a : all = true, replace all
//   _i : case insensitive = true, replace no matter the case
//
const PAIRS = listTestPairs('autolinker');
const TEST_AUTOLINKER_PAIRS = Array.from(PAIRS.keys())
    .map(key => { return { input: key, expected: PAIRS.get(key) } })
    ;

for (const tc of TEST_AUTOLINKER_PAIRS) {
    test(`autolink(${tc.input})`, () => {
        const all             = tc.input.indexOf('_a') != -1;
        const caseInsensitive = tc.input.indexOf('_i') != -1;
        const value           = runTransformerImpl(tc.input, cfg(caseInsensitive, all));
        const expected        = loadResource(tc.expected as string);
        expect(value).toBe(expected);
    });
}
