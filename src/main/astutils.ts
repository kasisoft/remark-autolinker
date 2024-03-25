import { Text } from 'mdast';
import { Node, Parent } from 'unist';
import { CONTINUE, visit } from 'unist-util-visit';


export function locateParagraphs(tree: Node): Parent[] {

    let result: Parent[] = [];
    visit(tree, 'paragraph', findParagraphNode);
    return result;

    function findParagraphNode(node: Parent) {
        result.push(node);
        return CONTINUE;
    }

}

export function getTextChildren(parent: Parent): Text[] {
    return getChildNodes<Text>(parent, 'text');
}

export function getChildNodes<T>(parent: Parent, type: string): T[] {
    const result: T[] = [];
    for (let i = 0; i < parent.children.length; i++) {
        const node: Node = parent.children[i];
        if (node.type === type) {
            result.push(node as T);
        }
    }
    return result;
}
