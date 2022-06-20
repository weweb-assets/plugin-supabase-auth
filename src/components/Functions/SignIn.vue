<template>
    <wwEditorInputRow
        label="Email"
        type="query"
        :model-value="email"
        bindable
        required
        placeholder="Enter a email"
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
    },
    methods: {
        setEmail(email) {
            this.$emit('update:args', { ...this.args, email });
        },
        setPassword(password) {
            this.$emit('update:args', { ...this.args, password });
        },
    },
};
</script>
