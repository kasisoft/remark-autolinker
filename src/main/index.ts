import { Parent } from 'unist';

import { debug, debugConfiguration } from '$main/log';
import { locateParagraphs } from '$main/astutils';
import { Debug, newRemarkAutolinkerOptions, RemarkAutolinkerOptions } from '$main/datatypes';
import { autolinkParagraph, buildInitialState } from '$main/autolinker';

export { RemarkAutolinkerOptions } from '$main/datatypes';

const DEFAULT_OPTIONS: RemarkAutolinkerOptions = {
    debug           : Debug.None,
    all             : false,
    caseInsensitive : false,
    links           : [],
};

// https://unifiedjs.com/learn/guide/create-a-plugin/
export function remarkAutolinker(options: RemarkAutolinkerOptions = DEFAULT_OPTIONS) {

    const config = newRemarkAutolinkerOptions({...DEFAULT_OPTIONS, ...options});
    if ((config.debug & Debug.Default) != 0) {
        debugConfiguration(DEFAULT_OPTIONS, options, config);
    }

    const autolinkState = buildInitialState(config);

    function impl(config: RemarkAutolinkerOptions, tree: Parent) {
        const paragraphs = locateParagraphs(tree);
        paragraphs.forEach(p => autolinkParagraph(autolinkState, p, config.all));
    }

    function logBefore(config: RemarkAutolinkerOptions, tree: Parent) {
        if ((config.debug & Debug.RootBefore) != 0) {
            debug('Markdown Tree (before)', tree);
        }
    }

    function logAfter(config: RemarkAutolinkerOptions, tree: Parent) {
        if ((config.debug & Debug.RootAfter) != 0) {
            debug('Markdown Tree (after)', tree);
        }
    }

    return function (tree: Parent) {
        logBefore(config, tree);
        impl(config, tree);
        logAfter(config, tree);
    }

}
