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
        label="Password"
        type="query"
        :model-value="password"
        bindable
        required
        placeholder="Enter a password"
        @update:modelValue="setPassword"
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
    computed: {
        email() {
            return this.args.email;
        },
        password() {
            return this.args.password;
        },
        captchaToken() {
            return this.args.captchaToken;
        },
    },
    methods: {
        setEmail(email) {
            this.$emit('update:args', { ...this.args, email });
        },
        setPassword(password) {
            this.$emit('update:args', { ...this.args, password });
        },
        setCaptchaToken(captchaToken) {
            this.$emit('update:args', { ...this.args, captchaToken });
        },
    },
};
</script>
