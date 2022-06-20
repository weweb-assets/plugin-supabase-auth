<template>
    <wwEditorInputRow
        label="Project URL"
        required
        type="query"
        placeholder="https://your-project.supabase.co"
        :model-value="settings.publicData.projectUrl"
        @update:modelValue="changeProjectUrl"
    />
    <wwEditorInputRow
        label="Public API key"
        required
        type="query"
        placeholder="ey********"
        :model-value="settings.publicData.apiKey"
        @update:modelValue="changePublicApiKey"
    />
     <wwEditorInputRow
        label="Private API key"
        required
        type="query"
        placeholder="ey********"
        :model-value="settings.privateData.apiKey"
        @update:modelValue="changePrivateApiKey"
    />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    methods: {
        changeProjectUrl(projectUrl) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, projectUrl },
            });
            this.loadInstance();
        },
        changePublicApiKey(apiKey) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, apiKey },
            });
            this.loadInstance();
        },
        changePrivateApiKey(apiKey) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, apiKey },
            });
            this.loadInstance();
        },
        loadInstance() {
            if (!this.settings.publicData.projectUrl || !this.settings.publicData.apiKey || !this.settings.privateData.apiKey) return;
            this.plugin.load(this.settings.publicData.projectUrl, this.settings.publicData.apiKey, this.settings.privateData.apiKey);
        },
    },
};
</script>
