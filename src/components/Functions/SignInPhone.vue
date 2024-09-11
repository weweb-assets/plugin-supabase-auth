<template>
    <wwEditorInputRow
        label="Phone"
        type="query"
        :model-value="phone"
        bindable
        required
        placeholder="Enter a phone number"
        @update:modelValue="setPhone"
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
        phone() {
            return this.args.phone;
        },
        password() {
            return this.args.password;
        },
        captchaToken() {
            return this.args.captchaToken;
        },
    },
    methods: {
        setPhone(phone) {
            this.$emit('update:args', { ...this.args, phone });
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
