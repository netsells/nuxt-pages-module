import get from 'lodash/get';
import Vue from 'vue';
import WysiwygAttr from './components/WysiwygAttr';

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

    Vue.component('wysiwyg-attr', WysiwygAttr);
};
