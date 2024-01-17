<template>
    <wwEditorFormRow required label="Provider">
        <template #append-label>
            <a
                class="ww-editor-link ml-2"
                :href="
                    provider
                        ? `https://supabase.com/docs/guides/auth/auth-${provider}`
                        : 'https://supabase.com/docs/guides/auth#social-auth'
                "
                target="_blank"
            >
                See documentation
            </a>
        </template>
        <wwEditorInput
            type="select"
            :model-value="provider"
            :options="providers"
            bindable
            placeholder="Select a provider"
            @update:modelValue="setArg('provider', $event)"
        />
    </wwEditorFormRow>
    <wwEditorInputRow
        required
        type="select"
        label="Redirect to"
        :options="pagesOptions"
        :actions="pageActions"
        :model-value="redirectPage"
        placeholder="Select a page"
        bindable
        @update:modelValue="setArg('redirectPage', $event)"
        @action="onAction"
    />
    <wwEditorInputRow
        label="Query Parameters"
        type="array"
        :model-value="queryParams"
        bindable
        @update:modelValue="setArg('queryParams', $event)"
        @add-item="setArg('queryParams', [...(headers || []), {}])"
    >
        <template #default="{ item, setItem }">
            <wwEditorInputRow
                type="query"
                :model-value="item.key"
                label="Key"
                placeholder="Parameter name"
                bindable
                small
                @update:modelValue="setItem({ ...item, key: $event })"
            />
            <wwEditorInputRow
                type="query"
                :model-value="item.value"
                label="Value"
                placeholder="Parameter value"
                bindable
                small
                @update:modelValue="setItem({ ...item, value: $event })"
            />
        </template>
    </wwEditorInputRow>
    <wwEditorFormRow label="Scopes">
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="query"
                :model-value="scopes"
                bindable
                placeholder="Enter scopes"
                @update:modelValue="setArg('scopes', $event)"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="A space-separated list of scopes granted to the OAuth application."
                class="ml-2"
            />
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="skipBrowserRedirect">
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="onoff"
                :model-value="skipBrowserRedirect"
                bindable
                small
                @update:modelValue="setArg('skipBrowserRedirect', $event)"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="If set to true does not immediately redirect the current browser context to visit the OAuth authorization page for the provider."
                class="ml-2"
            />
        </div>
    </wwEditorFormRow>
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
                { label: 'Figma', value: 'figma', icon: 'figma' },
                { label: 'GitHub', value: 'gitHub', icon: 'gitHub' },
                { label: 'GitLab', value: 'gitLab', icon: 'gitLab' },
                { label: 'Google', value: 'google', icon: 'google' },
                { label: 'Kakao', value: 'kakao', icon: 'kakao' },
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
        queryParams() {
            return this.args.queryParams;
        },
        scopes() {
            return this.args.scopes;
        },
        skipBrowserRedirect() {
            return this.args.skipBrowserRedirect;
        },
        pagesOptions() {
            return wwLib.wwWebsiteData
                .getPages()
                .filter(page => !page.cmsDataSetPath && !page.pageUserGroups.some(item => !!item))
                .map(page => ({ label: page.name, value: page.id }));
        },
    },
    methods: {
        setArg(arg, value) {
            this.$emit('update:args', { ...this.args, [arg]: value });
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
