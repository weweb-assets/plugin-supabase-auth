<template>
    <wwEditorInputRow
        label="Email"
        type="query"
        :model-value="email"
        bindable
        required
        placeholder="Enter an email"
        @update:modelValue="setEmail"
    />
    <wwEditorInputRow
        required
        type="select"
        label="Email redirect to"
        :options="pagesOptions"
        :actions="pageActions"
        :model-value="redirectPage"
        placeholder="Select a page"
        bindable
        @update:modelValue="setRedirectPage"
        @action="onAction"
    />
    <wwEditorInputRow
        label="Captcha Token"
        type="query"
        :model-value="captchaToken"
        bindable
        placeholder="Enter a captcha token"
        tooltip="Verification token received when the user completes the captcha on the site. [Enable captcha protection](https://supabase.com/docs/guides/auth/auth-captcha)"
        @update:modelValue="setCaptchaToken"
    />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        args: { type: Object, required: true },
    },
    emits: ['update:args'],
    data() {
        return {
            pageActions: [{ icon: 'add', label: 'Create page', onAction: this.createPage }],
        };
    },
    computed: {
        email() {
            return this.args.email;
        },
        redirectPage() {
            return this.args.redirectPage;
        },
        captchaToken() {
            return this.args.captchaToken;
        },
        pagesOptions() {
            return wwLib.wwWebsiteData
                .getPages()
                .filter(page => !page.cmsDataSetPath)
                .map(page => ({ label: page.name, value: page.id }));
        },
    },
    methods: {
        setEmail(email) {
            this.$emit('update:args', { ...this.args, email });
        },
        setRedirectPage(redirectPage) {
            this.$emit('update:args', { ...this.args, redirectPage });
        },
        setCaptchaToken(captchaToken) {
            this.$emit('update:args', { ...this.args, captchaToken });
        },
        createPage() {
            // eslint-disable-next-line vue/custom-event-name-casing
            wwLib.$emit('wwTopBar:open', 'WEBSITE_PAGES');
            // eslint-disable-next-line vue/custom-event-name-casing
            wwLib.$emit('wwTopBar:pages:setPage', undefined);
            // eslint-disable-next-line vue/custom-event-name-casing
            this.$nextTick(() => wwLib.$emit('wwTopBar:pages:setMenu', 'ww-page-create'));
        },
        onAction(action) {
            action.onAction && action.onAction();
        },
    },
};
</script>
