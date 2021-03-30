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

    render(h, { props, data }) {
        const wrapper = (children = []) => h(props.tag, {
            class: 'wysiwyg-attr',
            ...data,
        }, children);

        if (!props.html) {
            return wrapper();
        }

        const html = props.html;

        const { ast } = ssrCompile(`<${ props.tag }>${ html }</${ props.tag }>`);

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

        if (!ast.children || !ast.children.length) {
            return wrapper();
        }

        const output = ast.children[0].children
            .map(toVdom);

        return wrapper(output);
    },
});

export default WysiwygAttr();
