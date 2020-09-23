<script>
    import VNode from 'virtual-dom/vnode/vnode';
    import VText from 'virtual-dom/vnode/vtext';
    import htmlToVdom from 'html-to-vdom';

    const convertHTML = htmlToVdom({
        VNode,
        VText,
    });

    /**
     * Convert a node to vue render functions.
     *
     * @param {Function} h
     * @param {object} node
     *
     * @returns {object}
     */
    function toVdom(h, node) {
        const { attributes, ...properties } = node.properties || {};

        const attrs = {
            ...attributes,
            ...properties,
        };
        const props = {};

        let { tagName } = node;

        const appUrl = process.env.APP_URL;
        const apiUrl = process.env.API_URL;

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
            }, (node.children || []).map((node) => toVdom(h, node)));
    }

    export default {
        name: 'wysiwyg-attr',

        functional: true,

        props: {
            html: {
                type: String,
                default: '',
            },
        },

        render(h, { props }) {
            const vDom = convertHTML(props.html);

            return (Array.isArray(vDom) ? vDom : [vDom])
                .map((node) => toVdom(h, node));
        },
    };
</script>
