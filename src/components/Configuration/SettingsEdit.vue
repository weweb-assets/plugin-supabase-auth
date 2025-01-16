<template>
    <div class="flex items-center">
        <wwEditorFormRow v-if="settings.privateData.accessToken" required label="Project URL" class="w-100">
            <wwEditorInputRow
                type="select"
                placeholder="https://your-project.supabase.co"
                :model-value="settings.publicData.projectUrl"
                :options="projectsOptions"
                @update:modelValue="changeProjectUrl"
                class="-full"
            />
        </wwEditorFormRow>
        <button
            v-if="settings.privateData.accessToken"
            type="button"
            class="ww-editor-button -primary -small -icon ml-2 mt-1"
            @click="refreshProjects"
        >
            <wwEditorIcon name="refresh" medium />
        </button>
    </div>
    <wwEditorInputRow
        label="Project URL"
        type="query"
        placeholder="https://your-project.supabase.co"
        :disabled="settings.privateData.accessToken"
        :model-value="settings.publicData.projectUrl"
        @update:modelValue="changeProjectUrl"
    />
    <wwEditorInputRow
        label="Public API key"
        required
        type="query"
        placeholder="ey********"
        :model-value="settings.publicData.apiKey"
        @update:modelValue="changePublicApiKey"
    />
    <wwEditorFormRow label="Service role key (optional)" required>
        <div class="flex items-center">
            <wwEditorInputText
                type="password"
                placeholder="ey********"
                large
                class="w-full"
                :style="{ '-webkit-text-security': 'disc' }"
                :disabled="settings.privateData.accessToken"
                :model-value="settings.privateData.apiKey"
                @update:modelValue="changePrivateApiKey"
            />
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="Required if you want to manage your users and roles from the Editor or restrict access to a page for a specific role."
                class="ml-2"
                :class="{ 'text-yellow-500': !settings.privateData.apiKey }"
            />
        </div>
    </wwEditorFormRow>
    <wwEditorInputRow
        label="Connection string"
        required
        type="query"
        placeholder="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"
        :disabled="settings.privateData.accessToken"
        :model-value="settings.privateData.connectionString"
        @update:modelValue="changeConnectionString"
    />
    <wwEditorFormRow label="Database password" required>
        <template #append-label>
            <a
                class="ww-editor-link ml-2"
                :href="`https://supabase.com/dashboard/project/${projectRef}/settings/database`"
                target="_blank"
            >
                Find it here
            </a>
        </template>
        <wwEditorInputText
            type="password"
            placeholder="Enter your database password"
            :style="{ '-webkit-text-security': 'disc' }"
            large
            :tooltip="`Required if you want Copilot to be able to update your database.`"
            :model-value="settings.privateData.databasePassword"
            @update:modelValue="changeDatabasePassword"
            class="w-full"
        />
    </wwEditorFormRow>
    <wwLoader :loading="isLoading" />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    data() {
        return {
            projects: [],
            isLoading: false,
        };
    },
    computed: {
        projectRef() {
            return this.settings?.publicData?.projectUrl?.replace('https://', '').replace('.supabase.co', '');
        },
        projectsOptions() {
            return this.projects.map(project => ({
                label: `${project.name} (${project.id}) ${project.status === 'INACTIVE' ? '#PAUSED' : ''}`,
                value: `https://${project.id}.supabase.co`,
            }));
        },
    },
    mounted() {
        if (this.settings.privateData.accessToken) {
            this.refreshProjects();
        }
        const isSettingsValid =
            this.settings.publicData.projectUrl && this.settings.publicData.apiKey && this.settings.privateData.apiKey;
        const isOtherPluginSettingsValid =
            wwLib.wwPlugins.supabase &&
            wwLib.wwPlugins.supabase.settings.publicData.projectUrl &&
            wwLib.wwPlugins.supabase.settings.publicData.apiKey;
        if (!isSettingsValid && isOtherPluginSettingsValid) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: {
                    ...this.settings.publicData,
                    apiKey: wwLib.wwPlugins.supabase.settings.publicData.apiKey,
                    projectUrl: wwLib.wwPlugins.supabase.settings.publicData.projectUrl,
                },
                privateData: {
                    ...this.settings.privateData,
                    accessToken: wwLib.wwPlugins.supabase.settings.privateData.accessToken,
                    apiKey: wwLib.wwPlugins.supabase.settings.privateData.apiKey,
                    databasePassword: wwLib.wwPlugins.supabase.settings.privateData.databasePassword,
                    connectionString: wwLib.wwPlugins.supabase.settings.privateData.connectionString,
                },
            });
        }
    },
    methods: {
        async changeProjectUrl(projectUrl) {
            let apiKey = this.settings.publicData.apiKey;
            let privateApiKey = this.settings.privateData.apiKey;
            let connectionString = this.settings.privateData.connectionString;
            if (this.settings.privateData.accessToken) {
                const { apiKeys, pgbouncer } = await this.fetchProject(
                    projectUrl.replace('https://', '').replace('.supabase.co', '')
                );
                apiKey = apiKeys.find(key => key.name === 'anon').api_key;
                privateApiKey = apiKeys.find(key => key.name === 'service_role').api_key;
                connectionString = pgbouncer.connection_string;
            }
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, projectUrl, apiKey },
                privateData: {
                    ...this.settings.privateData,
                    apiKey: privateApiKey,
                    connectionString: connectionString,
                },
            });
        },
        changePublicApiKey(apiKey) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, apiKey },
            });
        },
        changePrivateApiKey(apiKey) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, apiKey },
            });
        },
        changeConnectionString(connectionString) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, connectionString },
            });
        },
        changeDatabasePassword(databasePassword) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, databasePassword },
            });
        },
        async refreshProjects() {
            this.isLoading = true;
            try {
                const { data } = await wwAxios.post(
                    `${wwLib.wwApiRequests._getPluginsUrl()}/designs/${
                        this.$store.getters['websiteData/getDesignInfo'].id
                    }/supabase/projects/list`,
                    { accessToken: this.settings.privateData.accessToken }
                );
                this.projects = data?.data;
                this.isLoading = false;
            } catch (error) {
                this.isLoading = false;
                throw error;
            }
        },
        async fetchProject(projectId) {
            this.isLoading = true;
            try {
                const { data } = await wwAxios.get(
                    `${wwLib.wwApiRequests._getPluginsUrl()}/designs/${
                        this.$store.getters['websiteData/getDesignInfo'].id
                    }/supabase/projects/${projectId}`
                );
                this.isLoading = false;
                return data?.data;
            } catch (error) {
                this.isLoading = false;
                throw error;
            }
        },
    },
};
</script>
