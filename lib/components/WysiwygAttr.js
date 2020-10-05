import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import htmlToVdom from 'html-to-vdom';

const convertHTML = htmlToVdom({
    VNode,
    VText,
});

export const WysiwygAttr = (config = {}) => ({
    name: 'wysiwyg-attr',

    functional: true,

    props: {
        html: {
            type: String,
            default: '',
        },
    },

    render(h, { props }) {
        if (!props.html) {
            return h('span');
        }

        /**
         * Convert a node to vue render functions.
         *
         * @param {object} node
         *
         * @returns {object}
         */
        function toVdom(node) {
            const { attributes, style, ...properties } = node.properties || {};

            const attrs = {
                ...attributes,
                ...properties,
            };
            const props = {};

            let { tagName } = node;

            const appUrl = config.APP_URL || process.env.APP_URL;
            const apiUrl = config.API_URL || process.env.API_URL;

            if (
                tagName === 'a'
                && attrs.href
                && (
                    attrs.href.startsWith(appUrl)
                    || attrs.href.startsWith(apiUrl)
                )
            ) {
                tagName = 'nuxt-link';
                props.to = attrs.href
                    .replace(appUrl, '')
                    .replace(apiUrl, '');

                delete attrs.href;
            }

            return node.text
                ? node.text
                : h(tagName, {
                    attrs,
                    props,
                    style,
                }, (node.children || []).map(toVdom));
        }

        const vDom = convertHTML(props.html);

        return (Array.isArray(vDom) ? vDom : [vDom])
            .map(toVdom);
    },
});

export default WysiwygAttr();
