<template>
    <wwEditorInputRow label="Type">
        <wwEditorInputRadio
            :model-value="type"
            :choices="[
                { label: 'Phone', value: 'phone', default: true },
                { label: 'Email', value: 'email' },
            ]"
            small
            @update:modelValue="setArg('type', $event)"
        />
    </wwEditorInputRow>

    <wwEditorFormRow v-if="type === 'email'" label="Email" required>
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="query"
                :model-value="email"
                bindable
                placeholder="Enter an email"
                @update:modelValue="setArg('email', $event)"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                :forced-content="`To send users a one-time code instead of a magic link, modify the [magic link email template](https://supabase.com/dashboard/project/${projectId}/auth/templates) to include {{ .Token }} instead of {{ .ConfirmationURL }}`"
                class="ml-2 text-blue-500"
            />
        </div>
    </wwEditorFormRow>
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
                <wwEditorInput
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
                    forced-content="See supabase Twilio Phone Auth Guide for details about configuring WhatsApp sign in. [See documentation](https://supabase.com/docs/guides/auth/phone-login/twilio#whatsapp-otp-logins)."
                    class="ml-2"
                />
            </div>
        </wwEditorFormRow>
    </template>
    <wwEditorFormRow label="Should create user">
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="onoff"
                bindable
                small
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

    <wwEditorFormRow label="Captcha Token">
        <div class="flex items-center justify-between">
            <wwEditorInput
                type="query"
                :model-value="captchaToken"
                bindable
                placeholder="Enter a captcha token"
                @update:modelValue="setArg('captchaToken', $event)"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="Verification token received when the user completes the captcha on the site. [Enable captcha protection](https://supabase.com/docs/guides/auth/auth-captcha)"
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
        type() {
            return this.args.type || 'phone';
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
        projectId() {
            return this.plugin.getProjectId();
        },
    },
    methods: {
        setArg(arg, value) {
            this.$emit('update:args', { ...this.args, [arg]: value });
        },
    },
};
</script>
