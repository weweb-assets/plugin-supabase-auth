<template>
    <wwEditorFormRow label="Type">
        <wwEditorInputRadio
            :model-value="type"
            :choices="[
                { label: 'Email', value: 'email' },
                { label: 'Phone', value: 'phone' },
            ]"
            small
            @update:modelValue="setArg('type', $event)"
        />
    </wwEditorFormRow>
    <wwEditorInputRow
        v-if="type === 'email'"
        label="Email"
        type="query"
        :model-value="email"
        bindable
        required
        placeholder="Enter an email"
        @update:modelValue="setArg('email', $event)"
    />
    <wwEditorInputRow
        v-else
        label="Phone"
        type="query"
        :model-value="phone"
        bindable
        required
        placeholder="Enter a phone number"
        @update:modelValue="setArg('phone', $event)"
    />
    <wwEditorInputRow
        label="Password"
        type="query"
        :model-value="password"
        bindable
        required
        placeholder="Enter a password"
        @update:modelValue="setArg('password', $event)"
    />
    <wwEditorInputRow
        v-if="type === 'email'"
        label="Email redirect to"
        type="select"
        placeholder="Select a page"
        bindable
        :options="pagesOptions"
        :actions="pageActions"
        :model-value="redirectPage"
        @update:modelValue="setArg('redirectPage', $event)"
    />
    <wwEditorInputRow
        v-if="type === 'phone'"
        label="Channel"
        type="query"
        placeholder="whatsapp"
        bindable
        :model-value="channel"
        @update:modelValue="setArg('channel', $event)"
    />
    <wwEditorInputRow
        label="Metadata"
        type="array"
        :model-value="metadata"
        bindable
        @update:modelValue="setArg('metadata', $event)"
        @add-item="setArg('metadata', [...(metadata || []), {}])"
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
    <wwEditorInputRow
        label="Captcha token"
        type="query"
        placeholder="Select a page"
        bindable
        :model-value="captchaToken"
        @update:modelValue="setArg('captchaToken', $event)"
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
            return this.args.type || 'email';
        },
        email() {
            return this.args.email;
        },
        phone() {
            return this.args.phone;
        },
        password() {
            return this.args.password;
        },
        metadata() {
            return this.args.metadata || [];
        },
        channel() {
            return this.args.channel;
        },
        redirectPage() {
            return this.args.redirectPage;
        },
        captchaToken() {
            return this.args.captchaToken;
        },
        userMetadataOptions() {
            return this.plugin.userAttributes.map(attribute => ({
                label: attribute.label,
                value: attribute.key,
            }));
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
