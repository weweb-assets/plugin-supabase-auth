<template>
    <wwEditorFormRow label="Personal Access Token">
        <template #append-label>
            <a class="ww-editor-link ml-2" href="https://supabase.com/dashboard/account/tokens" target="_blank">
                Find it here
            </a>
        </template>
        <wwEditorInputRow
            type="query"
            placeholder="sbp_bdd0********4f23"
            :model-value="settings.privateData.accessToken"
            @update:modelValue="changeAccessToken"
        ></wwEditorInputRow>
    </wwEditorFormRow>
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
    methods: {
        changeAccessToken(accessToken) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, accessToken },
            });
        },
    },
};
</script>
