<template>
    <wwEditorInputRow
        label="New email"
        type="query"
        :model-value="email"
        bindable
        placeholder="Enter an email"
        @update:modelValue="setEmail"
    />
    <wwEditorInputRow
        label="New phone"
        type="query"
        :model-value="phone"
        bindable
        placeholder="Enter a phone number"
        @update:modelValue="setPhone"
    />
    <wwEditorInputRow
        label="Metadata"
        type="array"
        :model-value="metadata"
        bindable
        @update:modelValue="setMetadata"
        @add-item="setMetadata([...(metadata || []), {}])"
    >
        <template #default="{ item, setItem }">
            <wwEditorInputRow
                type="query"
                placeholder="Enter a key"
                small
                bindable
                :model-value="item.key"
                @update:model-value="setItem({ ...item, key: $event })"
            />
            <wwEditorInputRow
                :model-value="item.value"
                type="query"
                placeholder="Enter a value"
                small
                bindable
                @update:model-value="setItem({ ...item, value: $event })"
            />
        </template>
    </wwEditorInputRow>
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
        phone() {
            return this.args.phone;
        },
        metadata() {
            return this.args.metadata || [];
        },
    },
    methods: {
        setEmail(email) {
            this.$emit('update:args', { ...this.args, email });
        },
        setPhone(phone) {
            this.$emit('update:args', { ...this.args, phone });
        },
        setMetadata(metadata) {
            this.$emit('update:args', { ...this.args, metadata });
        },
    },
};
</script>
