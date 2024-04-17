import { Node, Parent } from 'unist';
import { Text, Link } from 'mdast';

import { Link as TLink, RemarkAutolinkerOptions } from '$main/datatypes';

export interface AutolinkState {
    splitter: RegExp,                   // a regex matching all the keys
    linkMap: Map<string, string>,       // a map using the lower case key and the link
    tracker: Set<string>                // a collector to identify keys that have already been used
}

export function buildInitialState(config: RemarkAutolinkerOptions): AutolinkState {
    return {
        splitter: buildSplitterRegex(config),
        linkMap: buildLinkMap(config),
        tracker: new Set<string>()
    };
}

// make sure that no regex relevant letter disrupts the process
function quote(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSplitterRegex(config: RemarkAutolinkerOptions): RegExp {

    // make sure the longer literals come first to support greedy matches
    const splittingLiterals: string[] = config.links
        .map(link => link.key)
        .sort((a, b) => b.length - a.length)
        ;

    const escapedLiterals: string = splittingLiterals.map(quote).join('|');

    let flags: string = 'g';
    if (config.caseInsensitive) {
        flags = 'gi';
    }

    return new RegExp(`${escapedLiterals}`, flags);

}

function buildLinkMap(config: RemarkAutolinkerOptions): Map<string, string> {
    const result: Map<string, string> = new Map<string, string>();
    config.links.forEach(link => result.set(link.key.toLowerCase(), link.link));
    return result;
}

function optionalPush(result: string[], text: string, joined: boolean) {
    if ((result.length == 0) || (!joined)) {
        // there is no last text portion or we shall not join
        result.push(text);
        return;
    }
    result[result.length - 1] = result[result.length - 1] + text;
}

function partitionText(state: AutolinkState, text: string, all: boolean): string[] | null {

    const matches = [...text.matchAll(state.splitter)]
    if (matches.length == 0) {
        return null;
    }

    const result: string[] = [];
    let start: number = 0;
    let joined: boolean = false;

    for (let i = 0; i < matches.length; i++) {

        const word: string = matches[i][0];
        const index: number = matches[i].index;
        const end: number = index + word.length;

        const isValidStart = (index == 0) || /\W/.test(text.charAt(index - 1));
        const isValidEnd   = (end == text.length) || /\W/.test(text.charAt(end));

        if (!isValidStart || !isValidEnd) {
            // the term needs to be at the beginning or preceeded by whitespace
            // as well as finishing with the end or followed by a whitespace
            continue;
        }

        // there is some text before the link key
        if (index > start) {
            optionalPush(result, text.substring(start, index), joined);
            start = index;
        }

        if (state.tracker.has(word)) {
            // this one has already been processed
            if (all) {
                result.push(word);
                joined = false;
            } else {
                //  we're not linking this text so add it to the last text portion
                joined = true;
                optionalPush(result, word, joined);
            }
        } else {
            // add this linkable text
            result.push(word);
            state.tracker.add(word);
            joined = false;
        }

        start = end;

    }

    // there's some remaining text
    if (start < text.length) {
        optionalPush(result, text.substring(start), joined);
    }

    return result;

}

function buildTextNode(text: string): Text {
    return {
        "type": "text",
        "value": text
    };
}

function buildLinkNode(text: string, link: string): Link {
    return {
        "type": "link",
        "title": null,
        "url": link,
        "children": [buildTextNode(text)]
    };
}

function buildNodes(state: AutolinkState, text: string[], all: boolean): Node[] {
    const result: Node[] = [];
    for (let i = 0; i < text.length; i++) {
        const lowerKey: string = text[i].toLocaleLowerCase();
        if (state.linkMap.has(lowerKey)) {
            result.push(buildLinkNode(text[i], state.linkMap.get(lowerKey) as string))
            if (!all) {
                state.linkMap.delete(lowerKey);
            }
        } else {
            result.push(buildTextNode(text[i]));
        }
    }
    return result;
}

export function autolinkParagraph(state: AutolinkState, paragraph: Parent, all: boolean) {

    for (let i = paragraph.children.length - 1; i >= 0; i--) {
        const node: Node = paragraph.children[i];
        if (node.type === 'text') {
            const textNode: Text = node as Text;
            const partitioned: string[] | null = partitionText(state, textNode.value, all);
            if (partitioned) {
                // build nodes per textual portion which can either be a text or a link
                const nodes = buildNodes(state, partitioned, all);
                // replace the text by the newly created nodes
                paragraph.children.splice(i, 1, ...nodes);
            }
        }
    }

}

export function autolinkTextBlock(text: string, state: AutolinkState, all: boolean): (string|TLink)[] {

    const result: (string|TLink)[] = [];
    const partitioned: string[] | null = partitionText(state, text, all);
    if (partitioned) {

        for (let i = 0; i < partitioned.length; i++) {
            const lowerKey: string = partitioned[i].toLocaleLowerCase();
            if (state.linkMap.has(lowerKey)) {
                result.push({
                    "key": partitioned[i],
                    "link": state.linkMap.get(lowerKey) as string
                });
                if (!all) {
                    state.linkMap.delete(lowerKey);
                }
            } else {
                result.push(partitioned[i]);
            }
        }
    } else {
        result.push(text);
    }
    return result;

}
