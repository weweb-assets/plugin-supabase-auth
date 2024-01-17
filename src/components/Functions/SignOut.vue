<template>
    <!-- <wwEditorFormRow label="Scope">
        <div class="flex items-center justify-between">
            <wwEditorInput
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
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="Determines which sessions should be logged out. Global means all sessions by this account. Local means only this session. Others means all other sessions except the current one. When using others, there is no sign-out event fired on the current session!"
                class="ml-2"
            />
        </div>
    </wwEditorFormRow> -->
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        args: { type: Object, required: true },
    },
    emits: ['update:args'],
    // computed: {
    //     scope() {
    //         return this.args.scope || 'global';
    //     },
    // },
    // methods: {
    //     setScope(scope) {
    //         this.$emit('update:args', { ...this.args, scope });
    //     },
    // },
};
</script>
