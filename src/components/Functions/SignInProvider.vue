<template>
    <wwEditorInputRow
        label="Provider"
        type="select"
        :model-value="provider"
        :options="providers"
        bindable
        required
        placeholder="Select a provider"
        @update:modelValue="setProvider"
    />
    <a
        v-if="provider"
        class="ww-editor-link my-2"
        :href="`https://supabase.com/docs/guides/auth/auth-${provider}`"
        target="_blank"
    >
        See documentation
    </a>
    <wwEditorInputRow
        required
        type="select"
        label="Redirect to"
        :options="pagesOptions"
        :actions="pageActions"
        :model-value="redirectPage"
        placeholder="Select a page"
        bindable
        @update:modelValue="setRedirectPage"
        @action="onAction"
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
            providers: [
                { label: 'Apple', value: 'apple', icon: 'apple' },
                { label: 'Azure', value: 'azure', icon: 'azure' },
                { label: 'Bitbucket', value: 'bitbucket', icon: 'bitbucket' },
                { label: 'Discord', value: 'discord', icon: 'discord' },
                { label: 'Facebook', value: 'facebook', icon: 'facebook' },
                { label: 'GitHub', value: 'gitHub', icon: 'gitHub' },
                { label: 'GitLab', value: 'gitLab', icon: 'gitLab' },
                { label: 'Google', value: 'google', icon: 'google' },
                { label: 'Keycloak', value: 'keycloak', icon: 'keycloak' },
                { label: 'Linkedin', value: 'linkedin', icon: 'linkedin' },
                { label: 'Notion', value: 'notion', icon: 'notion' },
                { label: 'Twitch', value: 'twitch', icon: 'twitch' },
                { label: 'Twitter', value: 'twitter', icon: 'twitter' },
                { label: 'Slack', value: 'slack', icon: 'slack' },
                { label: 'Spotify', value: 'spotify', icon: 'spotify' },
                { label: 'WorkOS', value: 'workos', icon: 'workos' },
                { label: 'Zoom', value: 'zoom', icon: 'zoom' },
            ],
            pageActions: [{ icon: 'add', label: 'Create page', onAction: this.createPage }],
        };
    },
    computed: {
        provider() {
            return this.args.provider;
        },
        redirectPage() {
            return this.args.redirectPage;
        },
        pagesOptions() {
            return wwLib.wwWebsiteData
                .getPages()
                .filter(page => !page.cmsDataSetPath)
                .map(page => ({ label: page.name, value: page.id }));
        },
    },
    methods: {
        setProvider(provider) {
            this.$emit('update:args', { ...this.args, provider });
        },
        setRedirectPage(redirectPage) {
            this.$emit('update:args', { ...this.args, redirectPage });
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
