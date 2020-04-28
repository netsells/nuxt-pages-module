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
    modules: {
        // Other Modules
        ['@hatchly/nuxt-pages-module', {
            // Options
        }],
    },

    hatchly: {
        pages: {
            // Options can also be defined here
        },
    },
};
```

Add the API url to your .env:

```
API_BASE=http://my-application.localhost
```

## Options

The options object can contain the following values: 

```js
{
    apiBase: '',
    apiPath: '',
    apiUrl: '',
    graphQLPath: '',
},
```

Each option is described below.

### `apiBase`

> The url of your Hatchly site. This is should be updated in your .env rather than hardcoding a value here.

- Default: `process.env.API_BASE`
- Type: `string`

### `apiPath`

> The path to the api modules `hatchly-path` value. This can be modified in the Hatchly api config file, so make sure this path corresponds to that value.

- Default: `'api'`
- Alias: `hatchly.apiPath`
- Type: `string`

### `apiUrl`

> The full api url prefix for the hatchly pages endpoint. By default this is made up of the `apiBase`, `apiUrl` and `graphQLPath`, but can be overwritten in full.

- Default: `${ process.env.API_BASE }/api/pages`
- Type: `string`

### `graphQLPath`

> The path to the graphQL endpoint.

- Default: `pages`
- Type: `string`

## Features

### Apollo

This module will automatically install and register the `@nuxtjs/apollo` module and set up the default client.

It will also provide a helper for interacting with the client, so instead of doing this:

```js
async asyncData({ app, $route }) {
    const client = app.apolloProvider.defaultClient;

    const { data } = await client.query({
        query: ArticleQuery,
        variables: {
            uri: $route.params.article,
        },
    });

    return data;
},
```

You can instead use the helper:

```js
async asyncData({ app }) {
    const { data } = await app.$hatchlyGraphQL(HomepageQuery, {
        uri: $route.params.article,
    });

    return data;
},
```

This method accepts the following arguments:

`$hatchlyGraphQL(query, variables, config)`

#### `query`

> The GraphQL query for the apollo client.

- Default: `undefined`
- Type: `string`
- `required`

#### `variables`

> Variables to pass into the query.

- Default: `{}`
- Type: `object`

#### `config`

> Additional config to pass into the `query()` method on the Apollo client.

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

##### Convenience modifiers

By default this method will do the following things to certain attribute types:

- RepeatableSections will return the `instance` automatically instead of having to access the full `$attr('attribute.path.instance', [])` path.
- If accessing a page uri, it will automatically prefix the path with a `/` in order to ensure correct navigations within the router.
- If accessing a `page-link` object, it will automatically prefix the uri with a `/` in order to ensure correct navigations within the router.
- For attributes that return a nested `value` property, we return this by default instead of having to access the full `$attr('attribute.path.value')` path.
