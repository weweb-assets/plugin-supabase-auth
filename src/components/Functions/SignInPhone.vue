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
    },
    methods: {
        setPhone(phone) {
            this.$emit('update:args', { ...this.args, phone });
        },
        setPassword(password) {
            this.$emit('update:args', { ...this.args, password });
        },
    },
};
</script>
