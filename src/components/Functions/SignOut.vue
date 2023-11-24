<template>
    <wwEditorInputRow
        label="Scope"
        type="select"
        bindable
        :options="[
            { label: 'Global', value: 'global', default: true },
            { label: 'Local', value: 'local' },
            { label: 'Others', value: 'others' },
        ]"
        :model-value="scope"
        @update:modelValue="setScope"
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
        scope() {
            return this.args.scope || 'global';
        },
    },
    methods: {
        setScope(scope) {
            this.$emit('update:args', { ...this.args, scope });
        },
    },
};
</script>
