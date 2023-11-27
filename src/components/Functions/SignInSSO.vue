<template>
    <wwEditorFormRow label="Domain">
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="query"
                :model-value="domain"
                bindable
                placeholder="Enter a domain"
                @update:modelValue="setArg('domain', $event)"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="If you've associated an email domain to the identity provider, you can use the domain property to start a sign-in flow. [Learn more](https://supabase.com/docs/reference/javascript/auth-signinwithsso?example=sign-in-with-provider-uuid)"
                class="ml-2"
            />
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Provider UUID">
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="query"
                :model-value="providerId"
                bindable
                placeholder="Enter a provider uuid"
                @update:modelValue="setArg('providerId', $event)"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="In case you need to use a different way to start the authentication flow with an identity provider, you can use the providerId property. [Learn more](https://supabase.com/docs/reference/javascript/auth-signinwithsso?example=sign-in-with-provider-uuid)"
                class="ml-2"
            />
        </div>
    </wwEditorFormRow>
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        args: { type: Object, required: true },
    },
    emits: ['update:args'],
    computed: {
        domain() {
            return this.args.domain;
        },
        providerId() {
            return this.args.providerId;
        },
    },
    methods: {
        setArg(arg, value) {
            this.$emit('update:args', { ...this.args, [arg]: value });
        },
    },
};
</script>
