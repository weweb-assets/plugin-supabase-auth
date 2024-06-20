<template>
    <wwEditorInputRow
        label="Origin"
        type="select"
        placeholder="Select the otp origin"
        required
        :model-value="type"
        :options="[
            { label: 'Email Sign Up', value: 'signup' },
            { label: 'Email change', value: 'email_change' },
            { label: 'Phone Sign Up', value: 'sms' },
            { label: 'Phone change', value: 'phone_change' },
        ]"
        @update:modelValue="setArg('type', $event)"
    >
    </wwEditorInputRow>
    <wwEditorInputRow
        v-if="['signup', 'email_change'].includes(type)"
        label="Email"
        type="query"
        :model-value="email"
        bindable
        required
        placeholder="Enter used email"
        @update:modelValue="setArg('email', $event)"
    />
    <wwEditorInputRow
        v-else
        label="Phone"
        type="query"
        :model-value="phone"
        bindable
        required
        placeholder="Enter used phone number"
        @update:modelValue="setArg('phone', $event)"
    />
    <wwEditorInputRow
        v-if="type === 'signup'"
        label="Email redirect to"
        type="select"
        placeholder="Select a page"
        bindable
        :options="pagesOptions"
        :actions="pageActions"
        :model-value="redirectPage"
        @update:modelValue="setArg('redirectPage', $event)"
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
            pageActions: [{ icon: 'add', label: 'Create page', onAction: this.createPage }],
        };
    },
    computed: {
        type() {
            return this.args.type;
        },
        email() {
            return this.args.email;
        },
        phone() {
            return this.args.phone;
        },
        redirectPage() {
            return this.args.redirectPage;
        },
        pagesOptions() {
            return wwLib.wwWebsiteData
                .getPages()
                .filter(page => !page.cmsDataSetPath)
                .map(page => ({ label: page.name, value: page.id }));
        },
    },
    methods: {
        setArg(arg, value) {
            this.$emit('update:args', { ...this.args, [arg]: value });
        },
        createPage() {
            // eslint-disable-next-line vue/custom-event-name-casing
            wwLib.$emit('wwTopBar:open', 'WEBSITE_PAGES');
            // eslint-disable-next-line vue/custom-event-name-casing
            wwLib.$emit('wwTopBar:pages:setPage', undefined);
            // eslint-disable-next-line vue/custom-event-name-casing
            this.$nextTick(() => wwLib.$emit('wwTopBar:pages:setMenu', 'ww-page-create'));
        },
        onAction(action) {
            action.onAction && action.onAction();
        },
    },
};
</script>
