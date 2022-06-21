<template>
    <wwEditorInputRow
        label="Old Password"
        type="query"
        :model-value="oldPassword"
        bindable
        required
        placeholder="Enter the old password"
        @update:modelValue="setOldPassword"
    />
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
        oldPassword() {
            return this.args.oldPassword;
        },
        newPassword() {
            return this.args.newPassword;
        },
    },
    methods: {
        setOldPassword(oldPassword) {
            this.$emit('update:args', { ...this.args, oldPassword });
        },
        setNewPassword(newPassword) {
            this.$emit('update:args', { ...this.args, newPassword });
        },
    },
};
</script>
