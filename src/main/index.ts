import { Parent, Node } from 'unist';

import { debug, debugConfiguration } from '$main/log';
import { locateParagraphs } from '$main/astutils';
import { Debug, Link, newRemarkAutolinkerOptions, RemarkAutolinkerOptions } from '$main/datatypes';
import { autolinkParagraph, autolinkTextBlock, buildInitialState } from '$main/autolinker';

export { RemarkAutolinkerOptions } from '$main/datatypes';

const DEFAULT_OPTIONS: RemarkAutolinkerOptions = {
    debug           : Debug.None,
    debugPosition   : false,
    all             : false,
    caseInsensitive : false,
    links           : [],
};

export function autolinkText(text: string, options: RemarkAutolinkerOptions = DEFAULT_OPTIONS): (string|Link)[] {

    const config = newRemarkAutolinkerOptions({...DEFAULT_OPTIONS, ...options});
    if ((config.debug & Debug.Default) != 0) {
        debugConfiguration(DEFAULT_OPTIONS, options, config);
    }

    const autolinkState = buildInitialState(config);

    return autolinkTextBlock(text, autolinkState, config.all);

}

// https://unifiedjs.com/learn/guide/create-a-plugin/
export function remarkAutolinker(options: RemarkAutolinkerOptions = DEFAULT_OPTIONS) {

    const config = newRemarkAutolinkerOptions({...DEFAULT_OPTIONS, ...options});
    if ((config.debug & Debug.Default) != 0) {
        debugConfiguration(DEFAULT_OPTIONS, options, config);
    }

    function impl(config: RemarkAutolinkerOptions, tree: Parent) {
        const autolinkState = buildInitialState(config);
        const paragraphs = locateParagraphs(tree);
        paragraphs.forEach(p => autolinkParagraph(autolinkState, p, config.all));
    }

    function logBefore(config: RemarkAutolinkerOptions, tree: Parent) {
        if ((config.debug & Debug.RootBefore) != 0) {
            debug('Markdown Tree (before)', filterTree(tree, config.debugPosition));
        }
    }

    function logAfter(config: RemarkAutolinkerOptions, tree: Parent) {
        if ((config.debug & Debug.RootAfter) != 0) {
            debug('Markdown Tree (after)', filterTree(tree, config.debugPosition));
        }
    }

    function filterTree(tree: Parent, debugPosition: boolean) {
        if (!debugPosition) {
            const cloned = JSON.parse(JSON.stringify(tree));
            removePosition(cloned);
            return cloned;
        }
        return tree;
    }

    function removePosition(node: Node) {
        if (node.position) {
            node.position = undefined;
        }
        if ((node as Parent).children) {
            const children = (node as Parent).children;
            for (let i = 0; i < children.length; i++) {
                removePosition(children[i]);
            }
        }
    }

    return function (tree: Parent) {
        logBefore(config, tree);
        impl(config, tree);
        logAfter(config, tree);
    }

}
