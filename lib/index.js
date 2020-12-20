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
        apiUrl: process.env.API_URL || '${API_URL}',
        apiUrlBrowser: process.env.API_URL_BROWSER || '${API_URL_BROWSER}',
        graphQLPath: 'pages',
        cacheTimeout: 60 * 60, // 1 hour default
        ...hatchlyOptions,
        ...moduleOptions,
        ...(this.options.hatchly || {}).pages || {},
    };

    if (!options.cacheTimeout) {
        logger.info('Falsey cacheTimeout provided, cache will not be used.');
    }

    this.options.publicRuntimeConfig.hatchly = this.options.publicRuntimeConfig.hatchly || {};

    options.apiPath = trim(options.apiPath);
    options.graphQLPath = trim(options.graphQLPath);
    options.graphQLEndpoint = `${ options.apiUrl }/${ options.apiPath }/${ options.graphQLPath }`;

    this.options.publicRuntimeConfig.hatchly.pages = {
        ...this.options.publicRuntimeConfig.hatchly,
        ...options,
        apiUrl: options.apiUrlBrowser,
    };

    this.options.privateRuntimeConfig.hatchly.pages = {
        ...this.options.publicRuntimeConfig.hatchly,
        ...options,
    };

    this.options.publicRuntimeConfig.GRAPHQL_ENDPOINT = `${ options.apiUrl }/${ options.apiPath }/${ options.graphQLPath }`;
    this.options.privateRuntimeConfig.GRAPHQL_ENDPOINT = `${ options.apiUrlBrowser }/${ options.apiPath }/${ options.graphQLPath }`;

    this.addTemplate({
        src: resolve(__dirname, './logger.js'),
        fileName: './hatchly-pages/logger.js',
    });

    this.options.graphql = {
        endpoint: options.graphQLEndpoint,
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
