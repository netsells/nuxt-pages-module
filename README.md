# Nuxt Hatchly Pages Module

> Module to easily integrate with Hatchly pages

## Installation

```bash
yarn add @hatchly/nuxt-pages-module
```

Register the module in your nuxt applications config file:

```js
module.exports = {
    // Nuxt config
    modules: [
        // Other Modules
        '@hatchly/nuxt-pages-module',
    ],
};
```

## Config

Supply your graphql endpoint to the module via the `publicRuntimeConfig` and `privateRuntimeConfig` objects, e.g.:

```js
module.exports = {
    /** ... */
    publicRuntimeConfig: {
        /** ... */
        GRAPHQL_ENDPOINT: process.env.API_GRAPHQL_URL,
    },
    /** ... */
    privateRuntimeConfig: {
        /** ... */
        GRAPHQL_ENDPOINT: process.env.API_GRAPHQL_URL,
    },
};
```

If the api is accessible on an internal address, you can skip dns lookup and replace the env variable in `privateRuntimeConfig` object with a different variable pointing to this address. 

## Features

### GraphqlQL request client

This module will automatically install and register the [nuxt-graphql-request](https://www.npmjs.com/package/nuxt-graphql-request) module and set up the client.

It will also provide a helper for interacting with the client:

```js
export default {
    async asyncData({ app }) {
        const data = await app.$hatchlyGraphQL(HomepageQuery, {
            uri: $route.params.article,
        });
    
        return data;
    },
};
```

This method accepts the following arguments:

`$hatchlyGraphQL(query, variables)`

#### `query`

> The GraphQL query for the client.

- Default: `undefined`
- Type: `string` or GraphQL AST
- `required`

#### `variables`

> Variables to pass into the query.

- Default: `{}`
- Type: `object`

### `$attr` Helper

This module provides an `$attr()` helper method to the Vue instance. This is the safer way of accessing attributes. This is essentially a wrapper around the `lodash/get` method, with a bit of extra flavour.

#### Usage

The default usage for this component assumes that your page data is available as `this.page` within your page-level component, so ensure your data from GraphQL is returned in this form for this usage.

```vue
<!-- Get a single value -->
<h1>{{ $attr('header.title') }}</h1>

<!-- Get a single value with fallback value -->
<h2>{{ $attr('header.subtitle', 'My subtitle') }}</h2>

<!-- This is especially useful when performing loops where the data may not exist -->
<ul>
    <li 
        v-for="item in $attr('content.items', [])" 
        :key="item.title"
    >
        {{ item.title }}
    </li>
</ul>
```

If your top level data is different to `page` you can specify a different object as the first argument, and the other arguments will shift accordingly.

```vue
<h1>{{ $attr(pageData, 'header.title') }}</h1>
```

You can also use this in sub components/loops as a safe alternative to nested data structures, where the first argument would be whatever dataset you were accessing.

```vue
<ul>
    <li 
        v-for="item in $attr('content.items', [])" 
        :key="item.title"
    >
        {{ $attr(item, 'image.name') }}
    </li>
</ul>
```

##### Convenience modifiers

By default this method will do the following things to certain attribute types:

- RepeatableSections will return the `instance` automatically instead of having to access the full `$attr('attribute.path.instance', [])` path.
- If accessing a page uri, it will automatically prefix the path with a `/` in order to ensure correct navigations within the router.
- If accessing a `page-link` object, it will automatically prefix the uri with a `/` in order to ensure correct navigations within the router.
- For attributes that return a nested `value` property, we return this by default instead of having to access the full `$attr('attribute.path.value')` path.

### WYSIWYG Attribute Component

When using WYSIWYG attributes, it's recommended to use the provided `<wysiwyg-attr />` component rather than manually binding to an element with `v-html`. This component will convert the html to render functions and return the content within a tag you have provided, or div by default. Using render functions allows the html to be rendered as elements within the virtual dom that can easily inherit styling. It also allows for converting internal links to router transitions, rather than forcing an entirely new page load.

```vue
<wysiwyg-attr
    :html="$attr('body.content')"
/>
```

This component accepts two props:

#### `html`

> The value of your wysiwyg attribute.

- Default: `''`
- Type: `string`

#### `tag`

> The tag of the wrapper component.

- Default: `'div'`
- Type: `string`

## Storybook

This module exposes a storybook integration to add the `$attr` global and the `WysiwygAttr` component. Simply pull the following module into your project, in the `preview.js` file for example:

```js
import '@hatchly/nuxt-pages-module/storybook';
``` 
