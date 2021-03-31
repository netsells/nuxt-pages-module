import get from 'lodash/get';
import Vue from 'vue';
import logger from './logger';
import attr from './attr';
import { WysiwygAttr } from './components/WysiwygAttr';

<% if (options.cacheTimeout) { %>
const cache = {};
<% } %>

/**
 * Setup the plugin.
 *
 * @param {object} context
 * @param {object} context.app
 * @param {object} context.$config
 * @param {object} context.route
 * @param {function} inject
 *
 * @returns {Promise<void>}
 */
export default async function({ app, $config, $graphql, route }, inject) {
    inject('hatchlyGraphQL', (query, variables = {}) => {
        <% if (!options.cacheTimeout) { %>
            return $graphql.request(query, variables);
        <% } else { %>
            const forceClear = route.query.cache === 'clear';

            const now = () => Math.round(new Date().getTime() / 1000);
            const generateCacheTimeout = () => now() + <%- options.cacheTimeout %>;

            const key = [
                JSON.stringify(query),
                JSON.stringify(variables),
            ].join(':');

            const cachedEntry = cache[key];

            const request = () => $graphql.request(query, variables).then((data) => {
                cache[key] = {
                    timestamp: generateCacheTimeout(),
                    data,
                };

                return data;
            });

            if (!cachedEntry || forceClear || !cachedEntry.timestamp || cachedEntry.timestamp <= now()) {
                if (forceClear) {
                    logger.log('Cache clear was forced');
                } else if (!cachedEntry) {
                    logger.log('Populating page cache for the first time');
                } else if (cachedEntry.timestamp <= now()) {
                    logger.log('Cache expired, fetching...');
                }

                return request();
            }

            const backgroundFetch = <%- !options.disableBackgroundFetch %>;

            if (backgroundFetch && process.server) {
                request();
            }

            return Promise.resolve(cachedEntry.data);
        <% } %>
    });

    Vue.prototype.$attr = attr;

    Vue.component('wysiwyg-attr', () => import('./components/WysiwygAttr').then(({ WysiwygAttr }) => WysiwygAttr($config)));
};
