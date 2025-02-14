<template>
    <wwEditorFormRow class="w-100">
        <wwEditorInputRadio
            class="mb-2"
            :model-value="connectionMode"
            :choices="[
                { label: 'Guided (recommended)', value: 'oauth', default: true },
                { label: 'Custom', value: 'custom' },
            ]"
            @update:modelValue="changeConnectionMode"
        />
    </wwEditorFormRow>

    <template v-if="connectionMode !== 'custom'">
        <div
            v-if="!accessToken"
            class="body-sm content-brand-secondary bg-brand-secondary border-brand-secondary p-2 mb-2 rounded-02"
        >
            <span>New! Connect or create an account to enable the Back-end panel and AI assistance.</span>
        </div>
        <div class="flex items-center">
            <button class="ww-editor-button -secondary" @click="connect" type="button" :disabled="!!accessToken">
                <wwEditorIcon name="logos/supabase" class="ww-editor-button-icon -left" />
                {{ accessToken ? 'Account connected' : 'Connect Supabase' }}
            </button>
            <button
                v-if="accessToken"
                type="button"
                class="ww-editor-button -secondary -small -icon ml-2"
                @click="unlink"
            >
                <wwEditorIcon name="unbind" medium />
            </button>
        </div>
    </template>
    <template v-else>
        <div class="body-sm content-secondary bg-secondary border-secondary p-2 rounded-02 mb-2">
            <span
                >Use this mode if you wish to connect to a self-hosted project, a local development project or don't
                want to connect your account</span
            >
        </div>
        <div class="body-sm content-warning-secondary bg-warning-secondary p-2 rounded-02">
            <span>Using this mode to connect your project disables the Back-end panel and AI assistance.</span>
        </div>
    </template>
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    data() {
        return {
            isKeyVisible: false,
            projects: [],
            isLoading: false,
            // keep track of the access token when switching mode
            storedAccessToken: '',
        };
    },
    computed: {
        isOauth() {
            return this.settings.privateData.accessToken?.startsWith('sbp_oauth');
        },
        connectionMode() {
            return this.settings.privateData.connectionMode;
        },
        accessToken() {
            return this.settings.privateData.accessToken;
        },
    },
    mounted() {
        if (!this.settings.privateData.accessToken && wwLib.wwPlugins?.supabase?.settings?.privateData?.accessToken) {
            this.changeAccessToken(wwLib.wwPlugins.supabase.settings.privateData.accessToken);
        }
    },
    methods: {
        changeConnectionMode(connectionMode) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: {
                    ...this.settings.privateData,
                    connectionMode,
                    accessToken: connectionMode === 'custom' ? '' : this.storedAccessToken,
                },
            });
        },
        changeAccessToken(accessToken) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, accessToken },
            });
            this.storedAccessToken = accessToken;
        },
        async connect() {
            this.isLoading = true;
            const redirectUri = window.location.origin + window.location.pathname;
            window.localStorage.setItem('supabase_oauth', true);
            const { data } = await wwAxios.post(
                `${wwLib.wwApiRequests._getPluginsUrl()}/designs/${
                    wwLib.$store.getters['websiteData/getDesignInfo'].id
                }/supabase/authorize`,
                { redirectUri, oauthRedirectUri: wwLib.wwApiRequests._getPluginsUrl() + '/supabase/redirect' }
            );
            if (!data?.data) throw new Error('No authorization URL returned');
            window.location.href = data?.data;
        },
        unlink() {
            this.changeAccessToken('');
        },
    },
};
</script>
