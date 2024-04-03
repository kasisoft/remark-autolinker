import { arrayOf, type } from 'arktype';
import { CheckResult } from 'arktype/internal/traverse/traverse.js';

import { error } from '$main/log';

export enum Debug {
    None         = 0,
    Default      = 1 << 0,
    RootBefore   = 1 << 1,
    RootAfter    = 1 << 2,
    All          = Default | RootBefore | RootAfter
} /* ENDENUM */

export function parseDebug(val: any): number {
    if (typeof val === 'string') {
        switch (val) {
            case 'None': return Debug.None;
            case 'Default': return Debug.Default;
            case 'RootBefore': return Debug.RootBefore;
            case 'RootAfter': return Debug.RootAfter;
            case 'All': return Debug.All;
        }
    } else if (Array.isArray(val)) {
        const asArray: string[] = val;
        return asArray.map(v => parseDebug(v)).reduce((a, b) => a | b, 0);
    }
    // we know from arktype that it's a number
    return val as number;
}

export const LinkDef = type({
    "key"  : "string",
    "link" : "string"
});

export const RemarkAutolinkerOptionsDef = type({
    "debug"           : ["(number|'None'|'Default'|'RootBefore'|'RootAfter'|'All'|string[])", "|>", parseDebug],
    "debugPosition"   : "boolean",
    "all"             : "boolean",
    "caseInsensitive" : "boolean",
    "links"           : arrayOf(LinkDef),
});

export type Link = typeof LinkDef.infer;
export type RemarkAutolinkerOptions = typeof RemarkAutolinkerOptionsDef.infer;


function newObject<T>(obj: any, constructor: (value: any) => CheckResult<T>): T {
    const result = constructor(obj);
    if (result.problems) {
        const asText = JSON.stringify(result.problems);
        error("Failed to validate obj: " + asText);
        throw Error(asText);
    }
    return result.data;
}

export function newRemarkAutolinkerOptions(obj: any): RemarkAutolinkerOptions {
    return newObject(obj, RemarkAutolinkerOptionsDef);
}
