/**
 * Setup the plugin.
 *
 * @param {object} context
 * @param {object} context.app
 * @param {function} inject
 *
 * @returns {Promise<void>}
 */
export default async function({ app }, inject) {
    inject('hatchlyGraphQL', (query, variables = {}, config = {}) => {
        return app.apolloProvider.defaultClient.query({
            query,
            variables,
            ...config,
        });
    });
};
