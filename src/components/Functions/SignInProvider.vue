<template>
    <wwEditorInputRow
        label="Provider"
        type="select"
        :model-value="provider"
        :options="providers"
        bindable
        required
        placeholder="Select a provider"
        @update:modelValue="setProvider"
    />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        args: { type: Object, required: true },
    },
    emits: ['update:args'],
    data() {
        return {
            providers: [
                { label: 'Google', value: 'google', icon: 'google' },
                { label: 'Google', value: 'google', icon: 'google' },
            ],
        };
    },
    computed: {
        provider() {
            return this.args.provider;
        },
    },
    methods: {
        setProvider(provider) {
            this.$emit('update:args', { ...this.args, provider });
        },
    },
};
</script>
