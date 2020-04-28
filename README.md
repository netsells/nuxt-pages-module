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

- Default: `'_hatchly/api'`
- Alias: `hatchly.apiPath`
- Type: `string`

### `apiUrl`

> The full api url prefix for hatchly-api routes. By default this is made up of the `apiBase` and the `apiUrl`, but can be overwritten in full.

- Default: `${ process.env.API_BASE }/_hatchly/api`
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

