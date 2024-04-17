# remark-autolinker

[![Build][build-badge]][build]
[![StandWithUkraine][ukraine-svg]][ukraine-readme]

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Usage](#usage)
* [Direct Usage](#direct-usage)
* [Configuration](#configuration)
* [Contributing](#contributing)
* [Thanks](#thanks)
* [License](#license)


## What is this?

This plugin is part of the [remark] plugin infrastructure used by components such as [mdsvex]. Using [markdown] to write your content is a nice and convenient way to edit your content.
Typically your writing content for a certain domain so you obviously would repeat several links across all your pages. Although unproblematic this plugin provides you with a lazy solution for this.
It allows to setup a global configuration providing terms that shall be used to generate links.
Here is a little example:


```markdown
---
title: example
---
My main programming language is Java.
```

Using a corresponding configuration you can automatically link the term _Java_ to generate the following [markdown]:

```markdown
---
title: example
---
My main programming language is [Java](https://www.java.com/de/).
```

Obviously it's up to you which terms should be linked automatically.


## When should I use this?

Whenever you like to conveniently generate links. This plugin isn't necessary but it's very helpful do stop repeating yourself.


## Install

This package is [ESM only][esmonly]. In Node.js (version 18+), install with [pnpm]:

```js
pnpm i -D @kasisoft/remark-autolinker
```


## Usage

* Setup your _Svelte_ project and install _mdsvex_ (see [mdsvexdocs])
* Your project will now contain a file named __mdsvex.config.js__.
    * Import the plugin:
        ```js
        import { remarkAutolinker } from '@kasisoft/remark-autolinker';
        ```
    * Update the array of _remark_ plugins with a configuration:
        ```js
        // RemarkAutolinkerOptions
        const myconfig = {
            debug: ['RootBefore', 'RootAfter'],
            all: false,
            caseInsensitive: false,
            links: [
                { key: 'Java', link: 'https://www.java.com/de/' },
                ...
            ],
        };
        const config = defineConfig({
            ...
            remarkPlugins: [
                [remarkAutolinker, myconfig]
            ],
            ...
        });
        ```


## Direct Usage

It's possible to use the autolinking functionality directly like this:

* Import the functionality:
  ```js
  import { autolinkText } from '@kasisoft/remark-autolinker';
  ```
* Run the transformation of a text:
  ```js
    // RemarkAutolinkerOptions
    const myconfig = {
        debug: ['RootBefore', 'RootAfter'],
        all: false,
        caseInsensitive: false,
        links: [
            { key: 'Java', link: 'https://www.java.com/de/' },
            ...
        ],
    };
  const mytext: string = 'Some text...';
  const transformed: (string|Link)[] = autolinkText(mytext, myconfig);
  // each autolinked element is of type Link whereas non-matching
  // elements remain simple text.
  ```


### Configuration

The configuration is fully typed using [Typescript].
__RemarkAutolinkerOptions__ is defined as followed:

```typescript
export interface Link {

    /* The term to be replaced by a Link */
    key: string,

    /* The link itself */
    link: string,

} /* ENDINTERFACE */

export interface RemarkAutolinkerOptions {

    /* Debug.{None, Default, RootBefore, RootAfter, All}
     * It's okay to use a list of string values for the debugging levels.
     * For instance: ['RootBefore', 'RootAfter']
     */
    debug           : Debug|'None'|'Default'|'RootBefore'|'RootAfter'|'All'|string[];

    /* By default only the first occurrance will be changed into a link.
     * If enabled all occurrences will be changed.
     */
    all             : boolean;

    /* By default the replacement requires a case sensitive match.
     * If enabled it will match independently of case sensitivity.
     */
    caseInsensitive : boolean;

    /* This is the list of links to define the terms that should be linked automatically. */
    links           : Link[];

} /* ENDINTERFACE */
```

* __debug__ : Debug - Combine flags of __Debug__ in order to generate debug statements:
  * Debug.None: no output (just a convenience value)
  * Debug.Default: some basic output
  * Debug.RootBefore: prints the ast before the transformation
  * Debug.RootAfter: prints the ast after the transformation
  * Debug.All: enables all outputs (convenience value)
  * Using an array of strings representing these debug settings is also possible. For instance:
    * ['RootBefore', 'RootAfter']
* __all__ : Enables the automatic linking for all occurrences within the text.
* __caseInsensitive__ : Enables case insensitive matching.
* __links__ : The list of links to be used for the automatic linking.


## Contributing

If you want to contribute I'm happy for any kind of feedback or bug reports.
Please create issues and pull requests as you like but be aware that it may take some time
for me to react.


## Thanks

* [Svelte] - For providing a great, fast and easy comprehensible framework.
* [MSDVEX][mdsvex] - For the nice intergration of _Markdown_ in _Svelte_
* [remark] - For a great platform to modify/transform the content.


## License

[MIT][license] © [Kasisoft.com](https://kasisoft.com) - <daniel.kasmeroglu@kasisoft.com>


<!-- Definitions -->

[build]: https://github.com/kasisoft/remark-autolinker/actions
[build-badge]: https://github.com/kasisoft/remark-autolinker/actions/workflows/remark-autolinker.yml/badge.svg

[esmonly]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
[license]: https://github.com/kasisoft/remark-autolinker/blob/main/license
[markdown]: https://markdown.de/
[mdsvex]: https://mdsvex.com
[mdsvexdocs]: https://mdsvex.com/docs
[pnpm]: https://pnpm.io/
[remark]: https://github.com/remarkjs
[svelte]: https://svelte.dev/
[typescript]: https://www.typescriptlang.org/

[ukraine-readme]: https://github.com/vshymanskyy/StandWithUkraine/blob/main/docs/README.md
[ukraine-svg]: https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg
