<template>
    <wwEditorInputRow
        label="Origin"
        type="select"
        placeholder="Select the otp origin"
        required
        :model-value="type"
        :options="[
            { label: 'Email Sign Up | Sign In', value: 'email' },
            { label: 'Email change', value: 'email_change' },
            { label: 'Recovery', value: 'recovery' },
            { label: 'Invite', value: 'invite' },
            { label: 'Phone Sign Up | Sign In', value: 'sms' },
            { label: 'Phone change', value: 'phone_change' },
        ]"
        @update:modelValue="setArg('type', $event)"
    >
    </wwEditorInputRow>
    <wwEditorInputRow
        v-if="['email', 'recovery', 'invite', 'email_change'].includes(type)"
        label="Email"
        type="query"
        :model-value="email"
        bindable
        required
        placeholder="Enter used email"
        @update:modelValue="setArg('email', $event)"
    />
    <wwEditorInputRow
        v-else
        label="Phone"
        type="query"
        :model-value="phone"
        bindable
        required
        placeholder="Enter used phone number"
        @update:modelValue="setArg('phone', $event)"
    />
    <wwEditorInputRow
        label="Token (OTP)"
        type="query"
        :model-value="token"
        bindable
        required
        placeholder="Enter token"
        @update:modelValue="setArg('token', $event)"
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
        token() {
            return this.args.token;
        },
    },
    methods: {
        setArg(arg, value) {
            this.$emit('update:args', { ...this.args, [arg]: value });
        },
    },
};
</script>
