import { ssrCompile } from 'vue-template-compiler';

export const WysiwygAttr = (config = {}) => ({
    name: 'wysiwyg-attr',

    functional: true,

    props: {
        html: {
            type: String,
            default: '',
        },
        tag: {
            type: String,
            default: 'div',
        },
    },

    render(h, { props }) {
        const html = props.html.replace(/\r?\n|\r/g, '');

        const compiled = ssrCompile(`<${ props.tag }>${ html }</${ props.tag }>`);

        /**
         * Convert a node to vue render functions.
         *
         * @param {object} node
         *
         * @returns {object}
         */
        function toVdom(node) {
            const { style, ...attrs } = node.attrsMap || {};

            const props = {};

            let { tag } = node;

            const appUrl = config.APP_URL || process.env.APP_URL;
            const apiUrl = config.API_URL || process.env.API_URL;

            if (
                tag === 'a'
                && attrs.href
                && (
                    attrs.href.startsWith(appUrl)
                    || attrs.href.startsWith(apiUrl)
                    || attrs.href.startsWith('/')
                )
            ) {
                tag = 'nuxt-link';
                props.to = attrs.href
                    .replace(appUrl, '')
                    .replace(apiUrl, '');

                delete attrs.href;
            }

            return node.text
                ? node.text
                : h(tag, {
                    attrs,
                    props,
                    style,
                }, (node.children || [])
                    .map(toVdom));
        }

        const output = compiled.ast.children[0].children
            .map(toVdom);

        return h(props.tag, {
            class: 'wysiwyg-attr',
        }, output)
    },
});

export default WysiwygAttr();
