<template>
    <wwEditorFormRow label="OIDC ID Token" required>
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="query"
                :model-value="token"
                bindable
                placeholder="Enter a token"
                @update:modelValue="setArg('token', $event)"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="OIDC ID token issued by the specified provider. The `iss` claim in the ID token must match the supplied provider. Some ID tokens contain an `at_hash` which require that you provide an `access_token` value to be accepted properly. If the token contains a `nonce` claim you must supply the nonce used to obtain the ID token."
                class="ml-2"
            />
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Provider" required>
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="select"
                :model-value="provider"
                :options="providers"
                bindable
                placeholder="Select a provider"
                @update:modelValue="setArg('provider', $event)"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="Provider name or OIDC `iss` value identifying which provider should be used to verify the provided token. Supported names: `google`, `apple`, `azure`, `facebook`, `keycloak` (deprecated)."
                class="ml-2"
            />
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Access Token">
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="query"
                :model-value="accessToken"
                bindable
                placeholder="Enter an access_token"
                @update:modelValue="setArg('accessToken', $event)"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="If the ID token contains an `at_hash` claim, then the hash of this value is compared to the value in the ID token."
                class="ml-2"
            />
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Nonce">
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="query"
                :model-value="nonce"
                bindable
                placeholder="Enter a nonce"
                @update:modelValue="setArg('nonce', $event)"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="If the ID token contains a `nonce` claim, then the hash of this value is compared to the value in the ID token."
                class="ml-2"
            />
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Captcha Token">
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="query"
                :model-value="captchaToken"
                bindable
                placeholder="Enter a captcha token"
                @update:modelValue="setArg('captchaToken', $event)"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="Verification token received when the user completes the captcha on the site. [Enable captcha protection](https://supabase.com/docs/guides/auth/auth-captcha)"
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
                { label: 'Facebook', value: 'facebook', icon: 'facebook' },
                { label: 'Google', value: 'google', icon: 'google' },
                { label: 'Keycloak (deprecated)', value: 'keycloak', icon: 'keycloak' },
            ],
            pageActions: [{ icon: 'add', label: 'Create page', onAction: this.createPage }],
        };
    },
    computed: {
        token() {
            return this.args.token;
        },
        provider() {
            return this.args.provider;
        },
        accessToken() {
            return this.args.accessToken;
        },
        nonce() {
            return this.args.nonce;
        },
        captchaToken() {
            return this.args.captchaToken;
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
