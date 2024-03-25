import { Parent } from 'unist';

export enum Debug {
    None         = 0,
    Default      = 1 << 0,
    RootBefore   = 1 << 1,
    RootAfter    = 1 << 2,
    All          = Default | RootBefore | RootAfter
} /* ENDENUM */

export interface Link {
    key: string,
    link: string,
} /* ENDINTERFACE */

export interface RemarkAutolinkerOptions {
    debug           : Debug|'None'|'Default'|'RootBefore'|'RootAfter'|'All'|string[],
    all             : boolean,
    caseInsensitive : boolean,
    links           : Link[],
} /* ENDINTERFACE */

export function remarkAutolinker(options?: RemarkAutolinkerOptions): (tree: Parent) => void;
