import { resolve } from 'path';
import get from 'lodash/get';
import logger from './logger';

/**
 * Trim start and end slashes.
 *
 * @param {string} str
 *
 * @return {string}
 */
const trim = (str = '') => {
    if (str.endsWith('/')) {
        str = str
            .split('/')
            .slice(0, -1)
            .join('/');
    }

    if (str.startsWith('/')) {
        const parts = str.split('/');
        parts.unshift();
        str = parts.join('/');
    }

    return str;
};

/**
 * Register the module.
 *
 * @param {object} moduleOptions
 */
export default function PagesModule(moduleOptions = {}) {
    const hatchlyOptions = {
        apiPath: 'api',
        ...this.options.hatchly || {},
    };

    const options = {
        apiBase: process.env.API_BASE,
        graphQLPath: 'pages',
        ...hatchlyOptions,
        ...moduleOptions,
        ...(this.options.hatchly || {}).pages || {},
    };

    if (!options.apiBase) {
        logger.error('No apiBase found.');
        process.exit(1);
    }

    options.apiBase = trim(options.apiBase);
    options.apiPath = trim(options.apiPath);
    options.graphQLPath = trim(options.graphQLPath);

    options.apiUrl = options.apiUrl
        || `${ options.apiBase }/${ options.apiPath }/${ options.graphQLPath }`;

    this.addTemplate({
        src: resolve(__dirname, './logger.js'),
        fileName: './hatchly-pages/logger.js',
    });

    this.options.graphql = {
        endpoint: options.apiUrl,
        ...get(this.options, 'graphql', {}),
    };

    this.requireModule('nuxt-graphql-request');

    const { dst } = this.addTemplate({
        src: resolve(__dirname, './plugin.js'),
        fileName: './hatchly-pages/plugin.js',
        options,
    });

    this.addTemplate({
        src: resolve(__dirname, './components/WysiwygAttr.js'),
        fileName: './hatchly-pages/components/WysiwygAttr.js',
        options,
    });

    this.options.plugins.push(resolve(this.options.buildDir, dst));
}
