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
        label="Metadata"
        type="array"
        :model-value="metadata"
        bindable
        @update:modelValue="setMetadata"
        @add-item="setMetadata([...(metadata || []), {}])"
    >
        <template #default="{ item, setItem }">
            <wwEditorInputRow
                :model-value="item.key"
                type="select"
                :options="userMetadataOptions"
                small
                placeholder="Select an attribute"
                @update:model-value="setItem({ ...item, key: $event })"
            />
            <wwEditorInputRow
                :model-value="item.value"
                type="query"
                small
                bindable
                placeholder="Enter a value"
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
        metadata() {
            return this.args.metadata || [];
        },
        userMetadataOptions() {
            return this.plugin.userAttributes.map(attribute => ({
                label: attribute.label,
                value: attribute.key,
            }));
        },
    },
    methods: {
        setEmail(email) {
            this.$emit('update:args', { ...this.args, email });
        },
        setMetadata(metadata) {
            this.$emit('update:args', { ...this.args, metadata });
        },
    },
};
</script>
