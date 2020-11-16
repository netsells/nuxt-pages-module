import { resolve } from 'path';

/**
 * Register the module.
 */
export default function PagesModule() {
    this.addTemplate({
        src: resolve(__dirname, './logger.js'),
        fileName: './hatchly-pages/logger.js',
    });

    this.requireModule('nuxt-graphql-request');

    this.addTemplate({
        src: resolve(__dirname, './attr.js'),
        fileName: './hatchly-pages/attr.js',
    });

    const { dst } = this.addTemplate({
        src: resolve(__dirname, './plugin.js'),
        fileName: './hatchly-pages/plugin.js',
    });

    this.addTemplate({
        src: resolve(__dirname, './components/WysiwygAttr.js'),
        fileName: './hatchly-pages/components/WysiwygAttr.js',
    });

    this.options.plugins.push(resolve(this.options.buildDir, dst));
}
