<template>
    <wwEditorFormRow class="w-100">
        <wwEditorInputRadio v-if="isConnected" v-model="selectMode" :disabled="isComingUp" :choices="[
            { label: 'Select a project', value: 'select' },
            { label: 'Create a project', value: 'create' },
        ]" />
    </wwEditorFormRow>
    <template v-if="selectMode === 'select' || !isConnected">
        <div class="flex items-center" v-if="isConnected">
            <wwEditorFormRow required label="Project URL" class="w-100">
                <wwEditorInput type="select" placeholder="https://your-project.supabase.co"
                    :model-value="settings.publicData.projectUrl" :options="projectsOptions"
                    @update:modelValue="changeProjectUrl" class="-full" />
            </wwEditorFormRow>
            <button type="button" class="ww-editor-button -primary -small -icon ml-2 mt-1" @click="refreshProjects">
                <wwEditorIcon name="refresh" medium />
            </button>
        </div>
        <button v-if="isConnected" @click="showSettings = !showSettings" class="ww-editor-button -secondary -small mb-2"
            type="button">
            {{ showSettings ? 'Close' : 'Open' }} settings
        </button>
        <template v-if="showSettings || !isConnected">
            <wwEditorInputRow
                label="Project URL"
                type="query"
                placeholder="https://your-project.supabase.co"
                :model-value="settings.publicData.projectUrl"
                @update:modelValue="changeProjectUrl"
            />
            <wwEditorInputRow 
                label="Custom Domain (optional)" 
                type="query" 
                placeholder="https://your-custom-domain.com"
                :model-value="settings.publicData.customDomain" 
                @update:modelValue="changeCustomDomain" 
            />
            <wwEditorInputRow
                label="Public API key"
                required
                type="query"
                placeholder="ey********"
                :model-value="settings.publicData.apiKey"
                @update:modelValue="changeApiKey"
            />
            <wwEditorFormRow label="Service role key">
                <div class="flex items-center">
                    <wwEditorInputText type="password" placeholder="ey********" large class="w-full"
                        :style="{ '-webkit-text-security': 'disc' }" :model-value="settings.privateData.apiKey"
                        @update:modelValue="changePrivateApiKey" />
                    <wwEditorQuestionMark tooltip-position="top-left"
                        forced-content="Required if you want to manage your users and roles from the Editor or restrict access to a page for a specific role."
                        class="ml-2" :class="{ 'text-yellow-500': !settings.privateData.apiKey }" />
                </div>
            </wwEditorFormRow>
            <wwEditorInputRow v-show="false" label="Connection string" type="query"
                placeholder="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"
                :model-value="settings.privateData.connectionString" @update:modelValue="changeConnectionString" />
            <wwEditorFormRow label="Database password" v-show="false">
                <template #append-label>
                    <a class="ww-editor-link ml-2"
                        :href="`https://supabase.com/dashboard/project/${projectRef}/settings/database`"
                        target="_blank">
                        Find it here
                    </a>
                </template>
                <div class="flex items-center">
                    <wwEditorInputText type="password" placeholder="Enter your database password"
                        :style="{ '-webkit-text-security': 'disc' }" large
                        :tooltip="`Required if you want Copilot to be able to update your database.`"
                        :model-value="settings.privateData.databasePassword" @update:modelValue="changeDatabasePassword"
                        class="w-full" />
                </div>
            </wwEditorFormRow>
        </template>
    </template>
    <template v-else-if="selectMode === 'create'">
        <div v-if="isComingUp" class="body-md flex items-center p-2">
            <wwLoaderSmall loading class="mr-2" />
            <div>We're now preparing your database. Please wait a few moments, it may take up to 1 minute.</div>
        </div>
        <template v-else>
            <wwEditorInputRow label="Project name" type="query" placeholder="My new project" required
                v-model="newProject.name" />
            <wwEditorInputRow label="Organization" type="select" placeholder="Select an organization" required
                v-model="newProject.organizationId"
                :options="organizations.map(org => ({ label: org.name, value: org.id }))" />
            <wwEditorInputRow label="Hosting region" type="select" placeholder="us-east-1" required
                v-model="newProject.region" :options="[
                    { label: 'us-east-1', value: 'us-east-1' },
                    { label: 'us-east-2', value: 'us-east-2' },
                    { label: 'us-west-1', value: 'us-west-1' },
                    { label: 'us-west-2', value: 'us-west-2' },
                    { label: 'ap-east-1', value: 'ap-east-1' },
                    { label: 'ap-southeast-1', value: 'ap-southeast-1' },
                    { label: 'ap-northeast-1', value: 'ap-northeast-1' },
                    { label: 'ap-northeast-2', value: 'ap-northeast-2' },
                    { label: 'ap-southeast-2', value: 'ap-southeast-2' },
                    { label: 'eu-west-1', value: 'eu-west-1' },
                    { label: 'eu-west-2', value: 'eu-west-2' },
                    { label: 'eu-west-3', value: 'eu-west-3' },
                    { label: 'eu-north-1', value: 'eu-north-1' },
                    { label: 'eu-central-1', value: 'eu-central-1' },
                    { label: 'eu-central-2', value: 'eu-central-2' },
                    { label: 'ca-central-1', value: 'ca-central-1' },
                    { label: 'ap-south-1', value: 'ap-south-1' },
                    { label: 'sa-east-1', value: 'sa-east-1' },
                ]" />
            <wwEditorFormRow label="Database password" required>
                <div class="flex items-center">
                    <wwEditorInputText :type="showDbPass ? 'text' : 'password'"
                        placeholder="Enter your database password"
                        :style="{ '-webkit-text-security': showDbPass ? 'none' : 'disc' }" large
                        v-model="newProject.dbPass" class="w-full" />
                    <button type="button" class="ww-editor-button -secondary -small -icon ml-2"
                        @click="showDbPass = !showDbPass">
                        <wwEditorIcon :name="showDbPass ? '16/eye' : '16/eye-off'" medium />
                    </button>
                </div>
            </wwEditorFormRow>
            <button class="ww-editor-button -primary" @click="createProject" type="button">Create project</button>
        </template>
    </template>
    <wwLoader :loading="isLoading && !isComingUp" />
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
            isComingUp: false,
            showSettings: false,
            showDbPass: false,
            selectMode: 'select',
            newProject: {
                name: '',
                region: 'us-east-1',
                organizationId: '',
                dbPass: '',
            },
            organizations: [],
        };
    },
    watch: {
        async selectMode(mode) {
            if (mode === 'create') {
                this.organizations = await this.fetchOrganizations();
                this.newProject = {
                    name: 'WeWeb - ' + wwLib.$store.getters['websiteData/getDesignInfo'].name,
                    region: 'us-east-1',
                    organizationId: this.organizations[0]?.id,
                    dbPass: wwLib.wwUtils.getUid(),
                };
            }
        },
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
        isConnected() {
            return this.settings.privateData.accessToken;
        },
    },
    mounted() {
        if (this.isConnected) {
            this.refreshProjects();
        } else {
            this.showSettings = true;
        }
        const isSettingsValid = this.settings.publicData.projectUrl && this.settings.publicData.apiKey;
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
                    apiKey: this.settings.privateData.apiKey || wwLib.wwPlugins.supabase.settings.privateData.apiKey,
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
            if (this.isConnected) {
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
        changeCustomDomain(customDomain) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, customDomain },
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
                    `${wwLib.wwApiRequests._getPluginsUrl()}/designs/${this.$store.getters['websiteData/getDesignInfo'].id
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
                    `${wwLib.wwApiRequests._getPluginsUrl()}/designs/${this.$store.getters['websiteData/getDesignInfo'].id
                    }/supabase/projects/${projectId}`
                );
                this.isLoading = false;
                return data?.data;
            } catch (error) {
                this.isLoading = false;
                throw error;
            }
        },
        async fetchOrganizations() {
            this.isLoading = true;
            try {
                const { data } = await wwAxios.get(
                    `${wwLib.wwApiRequests._getPluginsUrl()}/designs/${wwLib.$store.getters['websiteData/getDesignInfo'].id
                    }/supabase/organizations`
                );
                this.isLoading = false;
                return data?.data;
            } catch (error) {
                this.isLoading = false;
                throw error;
            }
        },
        async createProject() {
            this.isLoading = true;
            try {
                this.$emit('update:settings', {
                    ...this.settings,
                    publicData: { ...this.settings.publicData, projectUrl: '', apiKey: '' },
                    privateData: {
                        ...this.settings.privateData,
                        apiKey: '',
                        connectionString: '',
                        databasePassword: '',
                    },
                });
                const { data } = await wwAxios.post(
                    `${wwLib.wwApiRequests._getPluginsUrl()}/designs/${wwLib.$store.getters['websiteData/getDesignInfo'].id
                    }/supabase/projects`,
                    {
                        name: this.newProject.name,
                        organization_id: this.newProject.organizationId,
                        region: this.newProject.region,
                        db_pass: this.newProject.dbPass,
                    }
                );
                this.isLoading = false;
                this.isComingUp = true;
                const projectId = data?.data.id;
                const projectUrl = `https://${data?.data.id}.supabase.co`;

                let interval = setInterval(async () => {
                    await this.refreshProjects();
                    if (this.projects.find(project => project.id === data?.data.id)?.status === 'ACTIVE_HEALTHY') {
                        clearInterval(interval);

                        const { apiKeys, pgbouncer } = await this.fetchProject(projectId);
                        const apiKey = apiKeys.find(key => key.name === 'anon').api_key;
                        const privateApiKey = apiKeys.find(key => key.name === 'service_role').api_key;
                        const connectionString = pgbouncer.connection_string;
                        const databasePassword = this.newProject.dbPass;
                        this.$emit('update:settings', {
                            ...this.settings,
                            publicData: { ...this.settings.publicData, projectUrl, apiKey },
                            privateData: {
                                ...this.settings.privateData,
                                apiKey: privateApiKey,
                                connectionString: connectionString,
                                databasePassword,
                            },
                        });
                        this.isComingUp = false;
                        this.selectMode = 'select';
                    }
                }, 5000);
            } catch (error) {
                this.isLoading = false;
                throw error;
            }
        },
    },
};
</script>
