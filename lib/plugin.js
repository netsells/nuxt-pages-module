import get from 'lodash/get';
import Vue from 'vue';
import logger from './logger';
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

    /**
     * Return the `value.value` as a convenience.
     *
     * @param {object|string|number} value
     *
     * @return {object|string|number}
     */
    function getNestedValue(value) {
        if (value && value.value) {
            value = value.value;
        }

        return value;
    }

    /**
     * Format uri with preceding and proceeding slashes.
     *
     * @param {object|string|number} value
     * @param {string} path
     *
     * @return {object|string|number}
     */
    function formatUri(value, path) {
        if (value && value.uri) {
            value.uri = `/${ value.uri }`;
        }

        if (
            value
            && path.endsWith
            && path.endsWith('.uri')
            && value.startsWith
            && !value.startsWith('')
        ) {
            value = `/${ value }`;
        }

        return value;
    }

    /**
     * If the attribute is a repeatable we'll return
     * the `instance` array as a convenience.
     *
     * @param {object|string|number} value
     *
     * @return {object|string|number}
     */
    function getRepeatableInstance(value) {
        if (value && value.instance && Array.isArray(value.instance)) {
            value = value.instance;
        }

        return value;
    }

    Vue.prototype.$attr = function(...args) {
        let context = this.page || {};
        let [path, fallback] = args;

        if (typeof args[0] === 'object') {
            context = args[0];
            path = args[1];
            fallback = args[2];
        }

        let value = get(context, path, fallback);

        value = getNestedValue(value);
        value = formatUri(value, path);
        value = getRepeatableInstance(value);

        return value;
    };

    Vue.component('wysiwyg-attr', () => import('./components/WysiwygAttr').then(({ WysiwygAttr }) => WysiwygAttr($config)));
};
