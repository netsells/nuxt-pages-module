import Vue from 'vue';
import { WysiwygAttr } from './components/WysiwygAttr';
import './attr';

const cache = {};

/**
 * Setup the plugin.
 *
 * @param {object} context
 * @param {object} context.app
 * @param {object} context.$config
 * @param {function} inject
 *
 * @returns {Promise<void>}
 */
export default async function({ app, $config, $graphql }, inject) {
    inject('hatchlyGraphQL', (query, variables = {}) => {
        const cacheTimeout = (new Date()).setHours(-1);

        const key = [
            JSON.stringify(query),
            JSON.stringify(variables),
        ].join(':');

        const cachedEntry = cache[key];

        const request = $graphql.request(query, variables).then((data) => {
            cache[key] = {
                timestamp: (new Date()).getTime(),
                data,
            };

            return data;
        });

        if (!cachedEntry || cachedEntry.timestamp <= cacheTimeout) {
            return request;
        }

        return Promise.resolve(cachedEntry.data);
    });


    Vue.component('wysiwyg-attr', () => import('./components/WysiwygAttr').then(({ WysiwygAttr }) => WysiwygAttr($config)));
};
