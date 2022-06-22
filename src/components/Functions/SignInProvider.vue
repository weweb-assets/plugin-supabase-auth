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
        class="ww-editor-link ml-2"
        :href="`https://supabase.com/docs/guides/auth/auth-${provider}`"
        target="_blank"
    >
        See documentation
    </a>
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
        };
    },
    computed: {
        provider() {
            return this.args.provider;
        },
    },
    methods: {
        setProvider(provider) {
            this.$emit('update:args', { ...this.args, provider });
        },
    },
};
</script>
