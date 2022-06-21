<template>
    <wwEditorInputRow
        label="New Password"
        type="query"
        :model-value="newPassword"
        bindable
        required
        placeholder="Enter the new password"
        @update:modelValue="setNewPassword"
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
        newPassword() {
            return this.args.newPassword;
        },
    },
    methods: {
        setNewPassword(newPassword) {
            this.$emit('update:args', { ...this.args, newPassword });
        },
    },
};
</script>
