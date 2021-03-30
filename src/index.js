import { resolve } from 'path';
import logger from './logger';

/**
 * Register the module.
 *
 * @param {object} moduleOptions
 */
export default function PagesModule(moduleOptions = {}) {
    const hatchlyOptions = {
        ...this.options.hatchly || {},
    };

    const options = {
        cacheTimeout: 60 * 60, // 1 hour default
        ...hatchlyOptions,
        ...moduleOptions,
        ...(this.options.hatchly || {}).pages || {},
    };

    if (!options.cacheTimeout) {
        logger.info('Falsey cacheTimeout provided, cache will not be used.');
    }

    this.options.publicRuntimeConfig.GRAPHQL_ENDPOINT = this.options.publicRuntimeConfig.GRAPHQL_ENDPOINT
        || `${ process.env.API_URL_BROWSER || process.env.API_URL }/api/pages`;
    this.options.privateRuntimeConfig.GRAPHQL_ENDPOINT = this.options.privateRuntimeConfig.GRAPHQL_ENDPOINT
        || `${ process.env.API_URL }/api/pages`;

    this.addTemplate({
        src: resolve(__dirname, './logger.js'),
        fileName: './hatchly-pages/logger.js',
    });

    this.addTemplate({
        src: resolve(__dirname, './attr.js'),
        fileName: './hatchly-pages/attr.js',
    });

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
