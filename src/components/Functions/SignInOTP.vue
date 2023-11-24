<template>
    <wwEditorInputRow label="Type">
        <wwEditorInputRadio
            :model-value="type"
            :choices="[
                { label: 'Email', value: 'email' },
                { label: 'Phone', value: 'phone' },
            ]"
            small
            @update:modelValue="setArg('type', $event)"
        />
    </wwEditorInputRow>
    <wwEditorInputRow
        v-if="type === 'email'"
        label="Email"
        type="query"
        :model-value="email"
        bindable
        required
        placeholder="Enter an email"
        @update:modelValue="setArg('email', $event)"
    />
    <template v-else>
        <wwEditorInputRow
            label="Phone"
            type="query"
            :model-value="phone"
            bindable
            required
            placeholder="Enter a phone number"
            @update:modelValue="setArg('phone', $event)"
        />
        <wwEditorInputRow
            label="Channel"
            type="query"
            placeholder="whatsapp"
            bindable
            :model-value="channel"
            @update:modelValue="setArg('channel', $event)"
        />
    </template>
    <wwEditorInputRow
        label="Signin or Signup"
        type="onoff"
        bindable
        :model-value="shouldCreateUser"
        @update:modelValue="setArg('shouldCreateUser', $event)"
    />
    <wwEditorInputRow
        label="Captcha Token"
        type="query"
        bindable
        :model-value="captchaToken"
        @update:modelValue="setArg('captchaToken', $event)"
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
        type() {
            return this.args.type;
        },
        email() {
            return this.args.email;
        },
        phone() {
            return this.args.phone;
        },
        channel() {
            return this.args.channel;
        },
        shouldCreateUser() {
            return this.args.shouldCreateUser ?? true;
        },
        captchaToken() {
            return this.args.captchaToken;
        },
    },
    methods: {
        setArg(arg, value) {
            this.$emit('update:args', { ...this.args, [arg]: value });
        },
    },
};
</script>
