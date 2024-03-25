import { expect } from 'vitest';
import { fileURLToPath } from 'url';
import { unified } from 'unified';
import { Parent } from 'unist';

import remarkFrontmatter from 'remark-frontmatter';
import remarkStringify from 'remark-stringify';
import parse from 'remark-parse'
import path from 'path';
import fs from 'fs';


const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const DIR_RESOURCES = path.resolve(path.join(__dirname, 'resources'));

export function loadResource(location: string): string {
    const result = path.join(DIR_RESOURCES, location);
    expect(fs.existsSync(result)).toBe(true);
    return fs.readFileSync(result, 'utf-8');
}

export function listTestPairs(dir: string): Map<string, string> {
    const result = new Map<string, string>();
    const resourcedir = path.join(DIR_RESOURCES, dir);
    fs.readdirSync(resourcedir)
        // .filter(file => file.endsWith('_i.md'))
        .filter(file => path.extname(file) === '.md')
        // we're just assuming there is an expected counterpart
        .forEach(file => result.set(`${dir}/${file}`, `${dir}/${file}.expected`))
        ;
    return result;
}

export type PLUGIN_FUNC = (tree: Parent) => void;

export function runTransformer<C>(location: string, plugin: (cfg: C) => PLUGIN_FUNC, config: C): string {
    const fileContent = loadResource(location);
    const vfile = unified()
        .use(parse)
        .use(remarkFrontmatter)
        .use(remarkStringify)
        .use(plugin, config)
        .processSync(fileContent)
        ;
    const value = vfile.value as string;
    return value;
}
