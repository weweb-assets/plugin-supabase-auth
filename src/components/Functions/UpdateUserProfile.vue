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
        label="Name"
        type="query"
        :model-value="name"
        bindable
        placeholder="Enter a name"
        @update:modelValue="setName"
    />
    <wwEditorInputRow
        label="Custom attributes"
        type="array"
        :model-value="attributes"
        bindable
        @update:modelValue="setAttributes"
        @add-item="setAttributes([...(attributes || []), { type: 'string' }])"
    >
        <template #default="{ item, setItem }">
            <wwEditorInputRow
                :model-value="item.key"
                type="select"
                :options="userAttributesOptions"
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
        name() {
            return this.args.name;
        },
        attributes() {
            return this.args.attributes || [];
        },
        userAttributesOptions() {
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
        setName(name) {
            this.$emit('update:args', { ...this.args, name });
        },
        setAttributes(attributes) {
            this.$emit('update:args', { ...this.args, attributes });
        },
    },
};
</script>
