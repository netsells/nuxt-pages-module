<template>
    <component
        :is="tag"
        class="wysiwyg-attr"
        v-html="html"
    />
</template>

<script>
    export default {
        name: 'wysiwyg-attr',

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

        mounted() {
            this.enableClickHandlers();
        },

        destroy() {
            (this.clickHandlers || []).forEach((element) => {
                element.removeEventListener(this.internalClickHandler);
            });
        },

        methods: {
            enableClickHandlers() {
                this.clickHandlers = [
                    ...this.$el.querySelectorAll('a[href^="<%- options.apiBase %>"]'),
                    ...this.$el.querySelectorAll('a[href^="/"]'),
                ].map((element) => {
                    element.addEventListener('click', this.internalClickHandler);

                    return element;
                });
            },

            /**
             * Handle the click event and trigger an internal navigation.
             *
             * @param {MouseEvent} e
             */
            internalClickHandler(e) {
                const { currentTarget } = e;

                if (e.metaKey) {
                    return;
                }

                if (currentTarget.target && currentTarget.target !== '_self') {
                    return;
                }

                e.preventDefault();

                let link = currentTarget.href;

                [
                    '<%- options.apiBase %>',
                    '<%- process.env.APP_URL %>',
                ].forEach((url) =>
                    link = link.replace(url, '')
                );

                this.$router.push(link);
            },
        },
    };
</script>
