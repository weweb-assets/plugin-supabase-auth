<template>
    <button v-if="!isOauth" class="ww-editor-button -secondary" @click="connect" type="button">
        <wwEditorIcon name="logos/supabase" class="ww-editor-button-icon -left" />
        Connect Supabase
    </button>
    <span v-if="!isOauth" class="my-4 border-top-primary"></span>
    <div class="flex items-center">
        <wwEditorFormRow :label="isOauth ? 'Access token' : 'Personal Access Token'" class="w-100">
            <template #append-label>
                <a class="ww-editor-link ml-2" href="https://supabase.com/dashboard/account/tokens" target="_blank">
                    Find it here
                </a>
            </template>
            <wwEditorInput
                type="query"
                placeholder="sbp_bdd0********4f23"
                :model-value="settings.privateData.accessToken"
                :disabled="isOauth"
                @update:modelValue="changeAccessToken"
            ></wwEditorInput>
        </wwEditorFormRow>
        <button v-if="isOauth" type="button" class="ww-editor-button -secondary -small -icon ml-2 mt-2" @click="unlink">
            <wwEditorIcon name="unbind" medium />
        </button>
    </div>
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
        };
    },
    computed: {
        isOauth() {
            return this.settings.privateData.accessToken?.startsWith('sbp_oauth');
        },
    },
    mounted() {
        if (!this.settings.privateData.accessToken && wwLib.wwPlugins?.supabase?.settings?.privateData?.accessToken) {
            this.changeAccessToken(wwLib.wwPlugins.supabase.settings.privateData.accessToken);
        }
    },
    methods: {
        changeAccessToken(accessToken) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, accessToken },
            });
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
