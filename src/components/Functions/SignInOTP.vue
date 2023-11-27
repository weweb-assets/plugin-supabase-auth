<template>
    <wwEditorInputRow label="Type">
        <wwEditorInputRadio
            :model-value="type"
            :choices="[
                { label: 'Email', value: 'email', default: true },
                { label: 'Phone', value: 'phone' },
            ]"
            small
            @update:modelValue="setArg('type', $event)"
        />
    </wwEditorInputRow>
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
    <template v-else>
        <wwEditorInputRow
            label="Phone"
            type="query"
            :model-value="phone"
            bindable
            required
            placeholder="Enter a phone number"
            @update:modelValue="setArg('phone', $event)"
        />
        <wwEditorFormRow label="Channel">
            <div class="flex items-center justify-between">
                <wwEditorInputRow
                    type="select"
                    placeholder="Select a channel"
                    bindable
                    :options="[
                        { label: 'Whatsapp', value: 'whatsapp' },
                        { label: 'SMS', value: 'sms', default: true },
                    ]"
                    :model-value="channel"
                    @update:modelValue="setArg('channel', $event)"
                />
                <wwEditorQuestionMark
                    tooltip-position="top-left"
                    forced-content="To use the whatsapp channel you may need further configuration. [See documentation](https://supabase.com/docs/guides/auth/phone-login/twilio#whatsapp-otp-logins)."
                    class="ml-2"
                />
            </div>
        </wwEditorFormRow>
    </template>
    <wwEditorFormRow label="Should create user" required>
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="onoff"
                bindable
                :model-value="shouldCreateUser"
                @update:modelValue="setArg('shouldCreateUser', $event)"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="If the user doesn't exist, it will signup the user instead. To restrict this behaviour, you can set it to `false`."
                class="ml-2"
            />
        </div>
    </wwEditorFormRow>

    <wwEditorInputRow
        label="Captcha Token"
        type="query"
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
        channel() {
            return this.args.channel;
        },
        shouldCreateUser() {
            return this.args.shouldCreateUser ?? true;
        },
        captchaToken() {
            return this.args.captchaToken;
        },
    },
    methods: {
        setArg(arg, value) {
            this.$emit('update:args', { ...this.args, [arg]: value });
        },
    },
};
</script>
