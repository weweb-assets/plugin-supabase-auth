<template>
    <wwEditorFormRow required label="Project URL">
        <template #append-label>
            <a
                class="ww-editor-link ml-2"
                href="https://supabase.com/docs/guides/with-expo#get-the-api-keys"
                target="_blank"
            >
                Find it here
            </a>
        </template>
        <wwEditorInputRow
            type="query"
            placeholder="https://your-project.supabase.co"
            :model-value="settings.publicData.projectUrl"
            @update:modelValue="changeProjectUrl"
        />
    </wwEditorFormRow>
    <wwEditorInputRow
        label="Public API key"
        required
        type="query"
        placeholder="ey********"
        :model-value="settings.publicData.apiKey"
        @update:modelValue="changePublicApiKey"
    />
    <wwEditorFormRow required label="Private API key">
        <wwEditorInputText
            type="text"
            placeholder="ey********"
            :model-value="settings.privateData.apiKey"
            :style="{ '-webkit-text-security': isKeyVisible ? 'none' : 'disc' }"
            large
            @update:modelValue="changePrivateApiKey"
        />
    </wwEditorFormRow>
    <div class="flex items-center">
        <wwEditorInputSwitch v-model="isKeyVisible" />
        <span class="ml-2 body-2">Show private api key</span>
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
        };
    },
    mounted() {
        const isSettingsValid =
            this.settings.publicData.projectUrl && this.settings.publicData.apiKey && this.settings.privateData.apiKey;
        const isOtherPluginSettingsValid =
            wwLib.wwPlugins.supabase &&
            wwLib.wwPlugins.supabase.settings.publicData.projectUrl &&
            wwLib.wwPlugins.supabase.settings.publicData.apiKey;
        if (!isSettingsValid && isOtherPluginSettingsValid) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: {
                    ...this.settings.publicData,
                    apiKey: wwLib.wwPlugins.supabase.settings.publicData.apiKey,
                    projectUrl: wwLib.wwPlugins.supabase.settings.publicData.projectUrl,
                },
            });
        }
    },
    methods: {
        changeProjectUrl(projectUrl) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, projectUrl },
            });
            this.$nextTick(this.loadInstance);
        },
        changePublicApiKey(apiKey) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, apiKey },
            });
            this.$nextTick(this.loadInstance);
        },
        changePrivateApiKey(apiKey) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, apiKey },
            });
            this.$nextTick(this.loadInstance);
        },
        loadInstance() {
            this.plugin.load(
                this.settings.publicData.projectUrl,
                this.settings.publicData.apiKey,
                this.settings.privateData.apiKey
            );
        },
    },
};
</script>
