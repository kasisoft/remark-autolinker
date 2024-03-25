import { Node, Parent } from 'unist';
import { Text, Link } from 'mdast';

import { RemarkAutolinkerOptions } from '$main/datatypes';
import { getTextChildren } from '$main/astutils';


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

        start = index + word.length;

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
    const texts = getTextChildren(paragraph);
    for (let i = texts.length - 1; i >= 0 ; i--) {
        const textNode: Text = texts[i];
        // split the text according to the identified link terms
        const partitioned: string[] | null = partitionText(state, textNode.value, all);
        if (partitioned) {
            // build nodes per textual portion which can either be a text or a link
            const nodes = buildNodes(state, partitioned, all);
            // replace the text by the newly created nodes
            paragraph.children.splice(i, 1, ...nodes);
        }
    }
}
