<template>
    <!-- Environment Tabs -->
    <div class="environment-tabs-container">
        <wwEditorFormRow label="Environment Configuration" class="w-100">
            <div class="ww-tabs-header">
                <div
                    v-for="env in environments"
                    :key="env"
                    :class="['ww-tab-item', { 'ww-tab-active': activeEnvironment === env }]"
                    @click="activeEnvironment = env"
                >
                    <span class="ww-tab-label">
                        {{ capitalize(env) }}
                    </span>
                    <span v-if="!isEnvironmentConfigured(env) && env !== 'production'" class="ww-tab-optional">
                        Optional
                    </span>
                </div>
            </div>
        </wwEditorFormRow>
    </div>

    <!-- Environment Configuration -->
    <div v-for="env in environments" :key="`config-${env}`" v-show="activeEnvironment === env">
        <!-- Connection Mode Selector -->
        <wwEditorFormRow label="Connection Mode" class="w-100 mb-3">
            <wwEditorInputRadio
                :model-value="getConnectionMode(env)"
                :choices="[
                    { label: 'Guided (recommended)', value: 'oauth', default: true },
                    { label: 'Custom', value: 'custom' },
                ]"
                @update:modelValue="mode => changeConnectionMode(env, mode)"
            />
        </wwEditorFormRow>

        <!-- OAuth Connection -->
        <template v-if="getConnectionMode(env) === 'oauth'">
            <div
                v-if="!hasOAuthToken()"
                class="body-sm content-brand-secondary bg-brand-secondary border-brand-secondary p-2 mb-2 rounded-02"
            >
                <span>Connect to enable the Back-end panel and AI assistance.</span>
            </div>
            <div class="flex items-center justify-center mb-3">
                <button
                    class="ww-editor-button -secondary"
                    @click="connect"
                    type="button"
                    :disabled="!!hasOAuthToken()"
                >
                    <wwEditorIcon name="logos/supabase" class="ww-editor-button-icon -left" />
                    {{ hasOAuthToken() ? 'Account connected' : 'Connect Supabase' }}
                </button>
                <button
                    v-if="hasOAuthToken()"
                    type="button"
                    class="ww-editor-button -secondary -small -icon ml-2"
                    @click="disconnect"
                >
                    <wwEditorIcon name="unbind" medium />
                </button>
            </div>

            <!-- Project Selection/Creation for OAuth mode -->
            <template v-if="hasOAuthToken()">
                <wwEditorFormRow class="w-100">
                    <wwEditorInputRadio
                        v-model="selectModes[env]"
                        :disabled="isComingUp"
                        :choices="[
                            { label: 'Select a project', value: 'select' },
                            { label: 'Create a project', value: 'create' },
                        ]"
                    />
                </wwEditorFormRow>

                <!-- Select Project -->
                <template v-if="selectModes[env] === 'select'">
                    <div
                        v-if="hasOAuthToken() && !hasProjectConfig(env)"
                        class="body-sm content-secondary bg-secondary border-secondary p-2 rounded-02 mb-2"
                    >
                        Select a Supabase project to finish configuring this environment.
                    </div>
                    <div class="flex items-center">
                        <wwEditorFormRow :required="env === 'production'" label="Project URL" class="w-100">
                            <wwEditorInput
                                type="select"
                                placeholder="https://your-project.supabase.co"
                                :model-value="getProjectSelectValue(env)"
                                :options="projectsOptions"
                                @update:modelValue="val => changeProjectUrl(val, env)"
                                class="-full"
                            />
                        </wwEditorFormRow>
                        <button
                            type="button"
                            class="ww-editor-button -primary -small -icon ml-2 mt-1"
                            @click="refreshProjects"
                        >
                            <wwEditorIcon name="refresh" medium />
                        </button>
                    </div>

                    <!-- Branch selection (guided) -->
                    <div v-if="shouldShowBranchSelect(env)" class="flex items-center mt-2">
                        <wwEditorFormRow label="Branch" class="w-100">
                            <wwEditorInput
                                type="select"
                                placeholder="Default (main)"
                                :model-value="selectedBranches?.[env] || ''"
                                :options="branchOptions(env)"
                                @update:modelValue="val => changeBranch(val, env)"
                                class="-full"
                            />
                        </wwEditorFormRow>
                        <button
                            type="button"
                            class="ww-editor-button -primary -small -icon ml-2 mt-1"
                            @click="loadBranches(env)"
                        >
                            <wwEditorIcon name="refresh" medium />
                        </button>
                        <div v-if="branchErrors?.[env]" class="body-xs content-tertiary ml-2 mt-1">
                            {{ branchErrors[env] }}
                        </div>
                    </div>

                    <button
                        @click="showSettings[env] = !showSettings[env]"
                        class="ww-editor-button -secondary -small mb-2"
                        type="button"
                    >
                        {{ showSettings[env] ? 'Close' : 'Open' }} settings
                    </button>

                    <template v-if="showSettings[env]">
                        <wwEditorInputRow
                            label="Project URL"
                            type="query"
                            placeholder="https://your-project.supabase.co"
                            :required="env === 'production'"
                            :model-value="getCurrentEnvConfig(env).projectUrl"
                            @update:modelValue="val => changeProjectUrl(val, env)"
                        />

                        <wwEditorInputRow
                            label="Public API key"
                            :required="env === 'production'"
                            type="query"
                            placeholder="Enter your public API key"
                            :model-value="getCurrentEnvConfig(env).apiKey"
                            @update:modelValue="val => changeApiKey(val, env)"
                        />

                        <wwEditorFormRow label="Service role key">
                            <div class="flex items-center">
                                <wwEditorInputText
                                    type="password"
                                    placeholder="Enter your service role key"
                                    large
                                    class="w-full"
                                    :style="{ '-webkit-text-security': 'disc' }"
                                    :model-value="getCurrentEnvPrivateConfig(env).apiKey"
                                    @update:modelValue="val => changePrivateApiKey(val, env)"
                                />
                                <wwEditorQuestionMark
                                    tooltip-position="top-left"
                                    forced-content="Required if you want to manage your users and roles from the Editor or restrict access to a page for a specific role."
                                    class="ml-2"
                                    :class="{ 'text-yellow-500': !getCurrentEnvPrivateConfig(env).apiKey }"
                                />
                            </div>
                        </wwEditorFormRow>
                    </template>
                </template>

                <!-- Create Project -->
                <template v-else-if="selectModes[env] === 'create'">
                    <div v-if="isComingUp" class="body-md flex items-center p-2">
                        <wwLoaderSmall loading class="mr-2" />
                        <div>
                            We're now preparing your database. Please wait a few moments, it may take up to 1 minute.
                        </div>
                    </div>
                    <template v-else>
                        <wwEditorInputRow
                            label="Project name"
                            type="query"
                            placeholder="My new project"
                            required
                            v-model="newProjects[env].name"
                        />
                        <wwEditorInputRow
                            label="Organization"
                            type="select"
                            placeholder="Select an organization"
                            required
                            v-model="newProjects[env].organizationId"
                            :options="organizations.map(org => ({ label: org.name, value: org.id }))"
                        />
                        <wwEditorInputRow
                            label="Hosting region"
                            type="select"
                            placeholder="us-east-1"
                            required
                            v-model="newProjects[env].region"
                            :options="[
                                { label: 'us-east-1', value: 'us-east-1' },
                                { label: 'us-west-1', value: 'us-west-1' },
                                { label: 'eu-west-1', value: 'eu-west-1' },
                                { label: 'eu-central-1', value: 'eu-central-1' },
                                { label: 'ap-southeast-1', value: 'ap-southeast-1' },
                                { label: 'ap-northeast-1', value: 'ap-northeast-1' },
                            ]"
                        />
                        <wwEditorFormRow label="Database password" required>
                            <div class="flex items-center">
                                <wwEditorInputText
                                    :type="showDbPass ? 'text' : 'password'"
                                    placeholder="Enter your database password"
                                    :style="{ '-webkit-text-security': showDbPass ? 'none' : 'disc' }"
                                    large
                                    v-model="newProjects[env].dbPass"
                                    class="w-full"
                                />
                                <button
                                    type="button"
                                    class="ww-editor-button -secondary -small -icon ml-2"
                                    @click="showDbPass = !showDbPass"
                                >
                                    <wwEditorIcon :name="showDbPass ? '16/eye' : '16/eye-off'" medium />
                                </button>
                            </div>
                        </wwEditorFormRow>
                        <button class="ww-editor-button -primary" @click="createProject(env)" type="button">
                            Create project for {{ capitalize(env) }}
                        </button>
                    </template>
                </template>
            </template>
        </template>

        <!-- Custom Connection Mode -->
        <template v-else>
            <div class="body-sm content-secondary bg-secondary border-secondary p-2 rounded-02 mb-2">
                <span
                    >Use this mode for self-hosted projects, local development, or if you don't want to connect your
                    account.</span
                >
            </div>
            <div class="body-sm content-warning-secondary bg-warning-secondary p-2 rounded-02 mb-3">
                <span>Using this mode disables the Back-end panel and AI assistance.</span>
            </div>

            <wwEditorInputRow
                label="Project URL"
                type="query"
                placeholder="https://your-project.supabase.co"
                :required="env === 'production'"
                :model-value="getCurrentEnvConfig(env).projectUrl"
                @update:modelValue="val => changeProjectUrl(val, env)"
            />

            <wwEditorInputRow
                label="Custom Domain (optional)"
                type="query"
                placeholder="https://your-custom-domain.com"
                :model-value="getCurrentEnvConfig(env).customDomain"
                @update:modelValue="val => changeCustomDomain(val, env)"
            />

            <wwEditorInputRow
                label="Public API key"
                :required="env === 'production'"
                type="query"
                placeholder="Enter your public API key"
                :model-value="getCurrentEnvConfig(env).apiKey"
                @update:modelValue="val => changeApiKey(val, env)"
            />

            <wwEditorFormRow label="Service role key">
                <div class="flex items-center">
                    <wwEditorInputText
                        type="password"
                        placeholder="Enter your service role key"
                        large
                        class="w-full"
                        :style="{ '-webkit-text-security': 'disc' }"
                        :model-value="getCurrentEnvPrivateConfig(env).apiKey"
                        @update:modelValue="val => changePrivateApiKey(val, env)"
                    />
                    <wwEditorQuestionMark
                        tooltip-position="top-left"
                        forced-content="Required if you want to manage your users and roles from the Editor or restrict access to a page for a specific role."
                        class="ml-2"
                        :class="{ 'text-yellow-500': !getCurrentEnvPrivateConfig(env).apiKey }"
                    />
                </div>
            </wwEditorFormRow>
        </template>

        <!-- Clear Environment Button at the bottom for optional environments -->
        <div v-if="env !== 'production' && isEnvironmentConfigured(env)" class="flex justify-center mt-4 pt-4 border-t">
            <button
                type="button"
                class="ww-editor-button -tertiary -alert"
                @click="clearEnvironment(env)"
                title="Clear this environment's configuration"
            >
                <wwEditorIcon name="trash" small />
                <span class="ml-1">Clear {{ capitalize(env) }} configuration</span>
            </button>
        </div>
    </div>

    <wwLoader :loading="isLoading && !isComingUp" />
</template>

<script>
import { isEnvironmentConfigured } from '../../helpers/environmentConfig';

export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    data() {
        return {
            environments: ['production', 'staging', 'editor'],
            activeEnvironment: 'production',
            selectModes: {
                production: 'select',
                staging: 'select',
                editor: 'select',
            },
            showSettings: {
                production: false,
                staging: false,
                editor: false,
            },
            projects: [],
            isLoading: false,
            isComingUp: false,
            showDbPass: false,
            organizations: [],
            newProjects: {
                production: {
                    name: '',
                    region: 'us-east-1',
                    organizationId: '',
                    dbPass: '',
                },
                staging: {
                    name: '',
                    region: 'us-east-1',
                    organizationId: '',
                    dbPass: '',
                },
                editor: {
                    name: '',
                    region: 'us-east-1',
                    organizationId: '',
                    dbPass: '',
                },
            },
            branches: {},
            selectedBranches: {},
            branchErrors: {},
            branchChangeAbortController: null, // AbortController for cancelling in-flight requests
        };
    },
    watch: {
        selectModes: {
            async handler(newModes) {
                // Check if any environment switched to 'create' mode
                for (const env of this.environments) {
                    if (newModes[env] === 'create' && this.organizations.length === 0) {
                        await this.fetchOrganizations();
                        // Initialize new project data for this environment
                        this.newProjects[env] = {
                            name: `WeWeb - ${wwLib.$store.getters['websiteData/getDesignInfo'].name} (${this.capitalize(
                                env
                            )})`,
                            region: 'us-east-1',
                            organizationId: this.organizations[0]?.id || '',
                            dbPass: wwLib.wwUtils.getUid(),
                        };
                    }
                }
            },
            deep: true,
        },
    },
    computed: {
        isValid() {
            // Prevent saving while branch change is in progress
            return !this.branchChangeAbortController;
        },
        projectRef() {
            const config = this.getCurrentEnvConfig();
            return config?.projectUrl?.replace('https://', '').replace('.supabase.co', '');
        },
        projectsOptions() {
            return this.projects
                .map(project => ({
                    label: `${project.name} (${project.id}) ${project.status === 'INACTIVE' ? '#PAUSED' : ''}`,
                    value: `https://${project.id}.supabase.co`,
                }))
                .sort((a, b) => (a.label.includes('#PAUSED') ? 1 : 0) - (b.label.includes('#PAUSED') ? 1 : 0));
        },
        branchOptions() {
            return env => {
                const items = this.branches?.[env] || [];
                if (items.length === 0) return [];
                return items.map(b => ({
                    label: `${b.name}${b.is_default ? ' (default)' : ''}`,
                    value: b.project_ref || b.ref || b.id || b.name,
                }));
            };
        },
    },
    async mounted() {
        // Check if this is a fresh install and try to sync from Supabase plugin
        const isFreshInstall =
            !this.settings.publicData?.environments &&
            !this.settings.publicData?.projectUrl &&
            !this.settings.privateData?.accessToken;

        if (isFreshInstall) {
            await this.syncFromOtherPlugin('supabase');
        }

        // Initialize multi-environment structure if needed
        if (!this.settings.publicData?.environments) {
            this.migrateToMultiEnv();
        }

        this.sanitizeEnvironmentTokens();

        // Check if OAuth is connected and refresh projects
        if (this.hasOAuthToken()) {
            this.refreshProjects();
        }

        // Proactively load branches for existing project URLs
        this.$nextTick(async () => {
            try {
                for (const env of this.environments) {
                    const url = this.getCurrentEnvConfig(env)?.projectUrl;
                    if (url) await this.loadBranches(env);
                }
            } catch (_) {}
        });
    },
    methods: {
        sanitizeEnvironmentTokens() {
            const envConfigs = this.settings.privateData?.environments;
            if (!envConfigs) return;

            let hasChanges = false;
            const sanitizedEnvs = {};

            this.environments.forEach(env => {
                const config = envConfigs[env];
                if (!config) return;
                const hasLegacyAccess = Object.hasOwn(config, 'accessToken');
                const hasLegacyRefresh = Object.hasOwn(config, 'refreshToken');
                if (hasLegacyAccess || hasLegacyRefresh) {
                    const { accessToken: _legacyAccess, refreshToken: _legacyRefresh, ...rest } = config;
                    sanitizedEnvs[env] = rest;
                    hasChanges = true;
                }
            });

            if (!hasChanges) return;

            const newSettings = {
                ...this.settings,
                privateData: {
                    ...this.settings.privateData,
                    environments: {
                        ...envConfigs,
                        ...sanitizedEnvs,
                    },
                },
            };

            this.$emit('update:settings', newSettings);
        },
        capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        isEnvironmentConfigured(env) {
            return isEnvironmentConfigured(this.settings, env);
        },

        getConnectionMode(env) {
            const privateConfig = this.getCurrentEnvPrivateConfig(env);
            return privateConfig?.connectionMode || 'oauth';
        },

        hasOAuthToken() {
            // Single OAuth across environments: rely on global token only
            return this.settings.privateData?.accessToken?.startsWith('sbp_oauth');
        },

        hasProjectConfig(env) {
            const config = this.getCurrentEnvConfig(env);
            return !!config?.projectUrl;
        },

        getProjectSelectValue(env) {
            const config = this.getCurrentEnvConfig(env);
            if (!config) return '';
            const baseRef =
                config.baseProjectRef || config.projectUrl?.replace('https://', '').replace('.supabase.co', '');
            return baseRef ? `https://${baseRef}.supabase.co` : config.projectUrl;
        },

        shouldShowBranchSelect(env) {
            const config = this.getCurrentEnvConfig(env);
            const branchCount = this.branches?.[env]?.length || 0;
            return this.hasOAuthToken() && !!config?.projectUrl && branchCount > 0;
        },

        getCurrentEnvConfig(env = this.activeEnvironment) {
            if (this.settings.publicData?.environments?.[env]) {
                return this.settings.publicData.environments[env];
            }
            // Fallback to legacy format for production
            if (env === 'production' && this.settings.publicData?.projectUrl) {
                return {
                    projectUrl: this.settings.publicData.projectUrl,
                    apiKey: this.settings.publicData.apiKey,
                    customDomain: this.settings.publicData.customDomain,
                };
            }
            return {};
        },

        getCurrentEnvPrivateConfig(env = this.activeEnvironment) {
            if (this.settings.privateData?.environments?.[env]) {
                const {
                    accessToken: _legacyAccess,
                    refreshToken: _legacyRefresh,
                    ...rest
                } = this.settings.privateData.environments[env] || {};
                return rest;
            }
            // Fallback to legacy format for production
            if (env === 'production' && this.settings.privateData) {
                return {
                    connectionMode: this.settings.privateData.connectionMode || 'oauth',
                    apiKey: this.settings.privateData.apiKey,
                    databasePassword: this.settings.privateData.databasePassword,
                    connectionString: this.settings.privateData.connectionString,
                };
            }
            return {};
        },

        migrateToMultiEnv() {
            // Migrate legacy config to multi-environment structure
            const connectionMode = this.settings.privateData?.connectionMode || 'oauth';
            const newSettings = {
                ...this.settings,
                publicData: {
                    ...this.settings.publicData,
                    environments: {
                        production: {
                            projectUrl: this.settings.publicData?.projectUrl || '',
                            apiKey: this.settings.publicData?.apiKey || '',
                            customDomain: this.settings.publicData?.customDomain || '',
                        },
                    },
                },
                privateData: {
                    ...this.settings.privateData,
                    environments: {
                        production: {
                            connectionMode: connectionMode,
                            apiKey: this.settings.privateData?.apiKey || '',
                            databasePassword: this.settings.privateData?.databasePassword || '',
                            connectionString: this.settings.privateData?.connectionString || '',
                        },
                    },
                },
            };
            this.$emit('update:settings', newSettings);
        },

        changeConnectionMode(env, mode) {
            this.updateEnvironmentConfig(env, {
                privateData: {
                    connectionMode: mode,
                },
            });
        },

        async connect() {
            this.isLoading = true;
            const redirectUri = window.location.origin + window.location.pathname;
            window.localStorage.setItem('supabase_oauth', true);
            const { data } = await wwAxios.post(
                `${wwLib.wwApiRequests._getPluginsUrl()}/designs/${
                    wwLib.$store.getters['websiteData/getDesignInfo'].id
                }/supabase/authorize`,
                { redirectUri, oauthRedirectUri: wwLib.wwApiRequests._getPluginsUrl() + '/supabase/redirect' }
            );
            if (!data?.data) throw new Error('No authorization URL returned');
            window.location.href = data?.data;
        },

        disconnect() {
            // Clear OAuth tokens from all environments
            const newSettings = {
                ...this.settings,
                privateData: {
                    ...this.settings.privateData,
                    accessToken: '',
                    refreshToken: '',
                    environments: {
                        ...this.settings.privateData?.environments,
                    },
                },
            };

            // Clear tokens from all environments
            this.environments.forEach(env => {
                if (newSettings.privateData.environments?.[env]) {
                    delete newSettings.privateData.environments[env].accessToken;
                    delete newSettings.privateData.environments[env].refreshToken;
                }
            });

            this.$emit('update:settings', newSettings);
        },

        async changeProjectUrl(projectUrl, env) {
            // Skip if no project URL is provided
            if (!projectUrl) {
                this.updateEnvironmentConfig(env, {
                    publicData: { projectUrl: '', apiKey: '' },
                    privateData: { apiKey: '', connectionString: '' },
                });
                return;
            }

            const currentConfig = this.getCurrentEnvConfig(env);
            if ((currentConfig?.projectUrl || '') === projectUrl) {
                // No change detected; avoid re-fetching
                return;
            }

            this.isLoading = true;
            try {
                let apiKey = this.getCurrentEnvConfig(env).apiKey;
                let privateApiKey = this.getCurrentEnvPrivateConfig(env).apiKey;
                let connectionString = this.getCurrentEnvPrivateConfig(env).connectionString;
                let baseProjectRef = projectUrl.replace('https://', '').replace('.supabase.co', '');

                // Reset branch state while loading new project data (prevents showing stale options)
                const branchCopy = { ...(this.branches || {}) };
                branchCopy[env] = [];
                this.branches = branchCopy;
                const errorCopy = { ...(this.branchErrors || {}) };
                delete errorCopy[env];
                this.branchErrors = errorCopy;
                const selectedCopy = { ...(this.selectedBranches || {}) };
                selectedCopy[env] = '';
                this.selectedBranches = selectedCopy;

                if (this.hasOAuthToken() && this.getConnectionMode(env) === 'oauth') {
                    const projectData = await this.fetchProject(
                        projectUrl.replace('https://', '').replace('.supabase.co', '')
                    );

                    if (projectData) {
                        apiKey = projectData.apiKeys?.find(key => key.name === 'anon')?.api_key || apiKey;
                        privateApiKey =
                            projectData.apiKeys?.find(key => key.name === 'service_role')?.api_key || privateApiKey;
                        connectionString = projectData.pgbouncer?.connection_string || connectionString;
                        baseProjectRef =
                            projectData.project?.parent_project_ref ||
                            projectData.project?.ref ||
                            projectData.project?.id ||
                            baseProjectRef;
                    }
                }

                this.updateEnvironmentConfig(env, {
                    publicData: { projectUrl, apiKey, baseProjectRef, branch: null, branchSlug: null },
                    privateData: { apiKey: privateApiKey, connectionString },
                });

                // Load branches
                await this.$nextTick();
                await this.loadBranches(env, baseProjectRef);
            } finally {
                this.isLoading = false;
            }
        },

        async loadBranches(env, overrideRef = '') {
            try {
                const cfg = this.getCurrentEnvConfig(env);
                const baseRef =
                    overrideRef ||
                    cfg.baseProjectRef ||
                    cfg.projectUrl?.replace('https://', '').replace('.supabase.co', '');
                const ref = baseRef;
                const paramsBaseRef = cfg.baseProjectRef || overrideRef || '';
                if (!ref || !this.hasOAuthToken()) return;
                const { data } = await wwLib.wwPlugins.supabase.requestAPI({
                    method: 'GET',
                    path: `/projects/${ref}/branches`,
                    params: { baseProjectRef: paramsBaseRef },
                });
                const branches = data?.data || [];
                this.branches = { ...(this.branches || {}), [env]: branches };
                const errors = { ...(this.branchErrors || {}) };
                delete errors[env];
                this.branchErrors = errors;

                const defaultBranch = branches.find(b => b.is_default);
                const defaultValue = defaultBranch?.project_ref || defaultBranch?.ref || defaultBranch?.id || '';
                const currentSelection = this.selectedBranches?.[env];
                const savedSelection = this.getCurrentEnvConfig(env)?.branch || '';
                const targetSelection = currentSelection || savedSelection || '';
                const selectionExistsInList =
                    targetSelection &&
                    branches.some(b => (b.project_ref || b.ref || b.id || b.name) === targetSelection);

                let nextSelection = '';
                let shouldFetchBranchData = false;

                if (selectionExistsInList) {
                    nextSelection = targetSelection;
                } else if (defaultValue) {
                    nextSelection = defaultValue;
                    // Auto-selected default branch needs data fetched
                    shouldFetchBranchData = !savedSelection;
                }

                if (nextSelection || currentSelection || savedSelection) {
                    this.selectedBranches = { ...(this.selectedBranches || {}), [env]: nextSelection };

                    // If we auto-selected a default branch, fetch its data
                    if (shouldFetchBranchData && nextSelection) {
                        await this.changeBranch(nextSelection, env);
                    }
                }
            } catch (e) {
                const msg = e?.response?.data?.error || e?.message || 'Unable to load branches';
                this.branches = { ...(this.branches || {}), [env]: [] };
                this.branchErrors = { ...(this.branchErrors || {}), [env]: msg };
                console.warn('[Supabase auth plugin] loadBranches error', { env, status: e?.response?.status, msg });
            }
        },

        // removed features gating; we call /branches directly

        async changeBranch(branchValue, env) {
            // Cancel any in-flight branch change request
            if (this.branchChangeAbortController) {
                this.branchChangeAbortController.abort();
            }

            // Create new AbortController for this request
            this.branchChangeAbortController = new AbortController();
            const signal = this.branchChangeAbortController.signal;

            // Set flag to prevent saving while branch change is in progress
            this.setLoadingFlag(true);
            this.isLoading = true;

            try {
                this.selectedBranches = { ...(this.selectedBranches || {}), [env]: branchValue || '' };

                const baseRef =
                    this.getCurrentEnvConfig(env).baseProjectRef ||
                    this.getCurrentEnvConfig(env).projectUrl?.replace('https://', '').replace('.supabase.co', '');
                if (!baseRef) return;

                let targetRef = baseRef;
                let branchSlug = '';
                if (branchValue) {
                    const branchList = this.branches?.[env] || [];
                    const matchedBranch = branchList.find(
                        it => (it.project_ref || it.ref || it.id || it.name) === branchValue
                    );
                    targetRef = matchedBranch?.project_ref || matchedBranch?.ref || branchValue;
                    branchSlug = matchedBranch?.name || '';
                }

                const effectiveBranchSlug = branchValue
                    ? branchSlug || this.getCurrentEnvConfig(env)?.branchSlug || ''
                    : '';
                const projectData = await this.fetchProject(baseRef, {
                    branchSlug: effectiveBranchSlug,
                    branchRef: branchValue ? targetRef : '',
                    signal, // Pass AbortController signal
                });

                const apiKey = projectData?.apiKeys?.find(key => key.name === 'anon')?.api_key;
                const privateApiKey = projectData?.apiKeys?.find(key => key.name === 'service_role')?.api_key;
                const connectionString = projectData?.pgbouncer?.connection_string;
                const resolvedBranchRef = branchValue
                    ? projectData?.branchRef ||
                      projectData?.project?.project_ref ||
                      projectData?.project?.ref ||
                      targetRef
                    : '';
                const runtimeRef = resolvedBranchRef || baseRef;
                const projectUrl = `https://${runtimeRef}.supabase.co`;
                const displayAnonKey = apiKey || this.getCurrentEnvConfig(env).apiKey;
                const displayServiceKey = privateApiKey || this.getCurrentEnvPrivateConfig(env).apiKey;

                this.updateEnvironmentConfig(env, {
                    publicData: {
                        projectUrl,
                        apiKey: displayAnonKey,
                        branch: resolvedBranchRef || null,
                        branchSlug: effectiveBranchSlug || null,
                        baseProjectRef: baseRef,
                    },
                    privateData: {
                        apiKey: displayServiceKey,
                        connectionString: connectionString || this.getCurrentEnvPrivateConfig(env).connectionString,
                    },
                });

                await this.loadBranches(env, baseRef);
            } catch (error) {
                // Ignore abort errors silently
                if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
                    return;
                }
                throw error;
            } finally {
                // Clear loading flag when complete (success or abort)
                this.setLoadingFlag(false);
                this.isLoading = false;

                // Clear abort controller if this request completed
                if (this.branchChangeAbortController?.signal === signal) {
                    this.branchChangeAbortController = null;
                }
            }
        },

        setLoadingFlag(isLoading) {
            // Emit settings update with loading flag
            const newSettings = {
                ...this.settings,
                privateData: {
                    ...this.settings.privateData,
                    _isBranchChanging: isLoading || undefined, // undefined removes the key when false
                },
            };
            this.$emit('update:settings', newSettings);
        },

        changeApiKey(apiKey, env) {
            this.updateEnvironmentConfig(env, {
                publicData: { apiKey },
            });
        },

        changeApiKey(apiKey, env) {
            this.updateEnvironmentConfig(env, {
                publicData: { apiKey },
            });
        },

        changeCustomDomain(customDomain, env) {
            this.updateEnvironmentConfig(env, {
                publicData: { customDomain },
            });
        },

        changePrivateApiKey(apiKey, env) {
            this.updateEnvironmentConfig(env, {
                privateData: { apiKey },
            });
        },

        updateEnvironmentConfig(env, updates = {}) {
            const currentPrivateConfig = this.getCurrentEnvPrivateConfig(env) || {};
            const currentPublicConfig = this.getCurrentEnvConfig(env);
            const previousGlobalAccess = this.settings.privateData?.accessToken;
            const previousGlobalRefresh = this.settings.privateData?.refreshToken;

            const privateUpdates = { ...(updates.privateData || {}) };
            const updateAccessToken = Object.hasOwn(privateUpdates, 'accessToken')
                ? privateUpdates.accessToken
                : undefined;
            const updateRefreshToken = Object.hasOwn(privateUpdates, 'refreshToken')
                ? privateUpdates.refreshToken
                : undefined;

            if (Object.hasOwn(privateUpdates, 'accessToken')) delete privateUpdates.accessToken;
            if (Object.hasOwn(privateUpdates, 'refreshToken')) delete privateUpdates.refreshToken;

            const sanitizedCurrentPrivate = { ...currentPrivateConfig };
            delete sanitizedCurrentPrivate.accessToken;
            delete sanitizedCurrentPrivate.refreshToken;

            const newSettings = {
                ...this.settings,
                publicData: {
                    ...this.settings.publicData,
                    environments: {
                        ...this.settings.publicData?.environments,
                        [env]: {
                            ...currentPublicConfig,
                            ...(updates.publicData || {}),
                        },
                    },
                },
                privateData: {
                    ...this.settings.privateData,
                    environments: {
                        ...this.settings.privateData?.environments,
                        [env]: {
                            ...sanitizedCurrentPrivate,
                            ...privateUpdates,
                        },
                    },
                },
            };

            if (env === 'production') {
                const productionPublic = newSettings.publicData.environments.production || {};
                const productionPrivate = newSettings.privateData.environments.production || {};
                newSettings.publicData = {
                    ...newSettings.publicData,
                    projectUrl: productionPublic.projectUrl ?? newSettings.publicData.projectUrl,
                    apiKey: productionPublic.apiKey ?? newSettings.publicData.apiKey,
                    customDomain: productionPublic.customDomain ?? newSettings.publicData.customDomain,
                };
                newSettings.privateData = {
                    ...newSettings.privateData,
                    connectionMode: productionPrivate.connectionMode ?? newSettings.privateData.connectionMode,
                    apiKey: productionPrivate.apiKey ?? newSettings.privateData.apiKey,
                    databasePassword: productionPrivate.databasePassword ?? newSettings.privateData.databasePassword,
                    connectionString: productionPrivate.connectionString ?? newSettings.privateData.connectionString,
                    environments: newSettings.privateData.environments,
                };
            }

            const nextAccessToken = updateAccessToken !== undefined ? updateAccessToken : previousGlobalAccess;
            const nextRefreshToken = updateRefreshToken !== undefined ? updateRefreshToken : previousGlobalRefresh;

            if (nextAccessToken !== undefined) newSettings.privateData.accessToken = nextAccessToken;
            else delete newSettings.privateData.accessToken;

            if (nextRefreshToken !== undefined) newSettings.privateData.refreshToken = nextRefreshToken;
            else delete newSettings.privateData.refreshToken;

            this.$emit('update:settings', newSettings);
        },

        clearEnvironment(env) {
            if (env === 'production') {
                return;
            }

            if (
                !confirm(
                    `Are you sure you want to clear the ${env} environment configuration? This will remove all settings for this environment.`
                )
            ) {
                return;
            }

            const newSettings = {
                ...this.settings,
                publicData: {
                    ...this.settings.publicData,
                    environments: {
                        ...this.settings.publicData?.environments,
                        [env]: {
                            projectUrl: '',
                            apiKey: '',
                            customDomain: '',
                        },
                    },
                },
                privateData: {
                    ...this.settings.privateData,
                    environments: {
                        ...this.settings.privateData?.environments,
                        [env]: {
                            connectionMode: 'custom',
                            apiKey: '',
                            databasePassword: '',
                            connectionString: '',
                        },
                    },
                },
            };

            this.selectModes[env] = 'select';
            this.showSettings[env] = false;

            this.$emit('update:settings', newSettings);
        },

        async syncFromOtherPlugin(source) {
            try {
                await wwLib.wwPlugins.supabase.syncSettings(source);
            } catch (error) {
                console.warn('Failed to sync from other plugin:', error);
            }
        },

        async refreshProjects() {
            // Use OAuth token (shared across environments)
            const accessToken = this.settings.privateData?.accessToken;

            if (!accessToken) {
                return;
            }

            this.isLoading = true;
            try {
                const { data } = await wwLib.wwPlugins.supabase.requestAPI({
                    method: 'POST',
                    path: '/projects/list',
                    data: { accessToken },
                });
                this.projects = data?.data || [];
                this.isLoading = false;
            } catch (error) {
                this.isLoading = false;
                console.warn('Failed to refresh projects:', error);
            }
        },

        async fetchProject(projectId, { branchSlug = '', branchRef = '', signal = null } = {}) {
            if (!projectId) {
                return null;
            }

            try {
                const { data } = await wwLib.wwPlugins.supabase.requestAPI({
                    method: 'GET',
                    path: '/projects/' + projectId,
                    params:
                        branchSlug || branchRef
                            ? {
                                  ...(branchSlug ? { branch: branchSlug } : {}),
                                  ...(branchRef ? { branchRef } : {}),
                              }
                            : undefined,
                    signal, // Pass AbortController signal to requestAPI
                });
                return data?.data;
            } catch (error) {
                // Don't log abort errors
                if (error.name !== 'AbortError' && error.code !== 'ERR_CANCELED') {
                    console.warn(`Failed to fetch project ${projectId}:`, error);
                }
                return null;
            }
        },

        async fetchOrganizations() {
            this.isLoading = true;
            try {
                const { data } = await wwLib.wwPlugins.supabase.requestAPI({
                    method: 'GET',
                    path: '/organizations',
                });
                this.organizations = data?.data || [];
                if (this.organizations.length > 0) {
                    for (const env of this.environments) {
                        if (!this.newProjects[env].organizationId) {
                            this.newProjects[env].organizationId = this.organizations[0].id;
                        }
                    }
                }
                this.isLoading = false;
                return this.organizations;
            } catch (error) {
                this.isLoading = false;
                throw error;
            }
        },

        async createProject(env) {
            this.isLoading = true;
            try {
                const newProject = this.newProjects[env];

                this.updateEnvironmentConfig(env, {
                    publicData: { projectUrl: '', apiKey: '' },
                    privateData: {
                        apiKey: '',
                        connectionString: '',
                        databasePassword: '',
                    },
                });

                const { data } = await wwLib.wwPlugins.supabase.requestAPI({
                    method: 'POST',
                    path: '/projects',
                    data: {
                        name: newProject.name,
                        organization_id: newProject.organizationId,
                        region: newProject.region,
                        db_pass: newProject.dbPass,
                    },
                });

                this.isLoading = false;
                this.isComingUp = true;
                const projectId = data?.data.id;
                const projectUrl = `https://${data?.data.id}.supabase.co`;

                let interval = setInterval(async () => {
                    await this.refreshProjects();
                    if (this.projects.find(project => project.id === data?.data.id)?.status === 'ACTIVE_HEALTHY') {
                        clearInterval(interval);

                        const projectData = await this.fetchProject(projectId);
                        if (projectData) {
                            const apiKey = projectData.apiKeys?.find(key => key.name === 'anon')?.api_key;
                            const privateApiKey = projectData.apiKeys?.find(
                                key => key.name === 'service_role'
                            )?.api_key;
                            const connectionString = projectData.pgbouncer?.connection_string;
                            const databasePassword = newProject.dbPass;

                            this.updateEnvironmentConfig(env, {
                                publicData: { projectUrl, apiKey },
                                privateData: {
                                    apiKey: privateApiKey,
                                    connectionString: connectionString,
                                    databasePassword,
                                },
                            });

                            this.isComingUp = false;
                            this.selectModes[env] = 'select';
                        }
                    }
                }, 5000);
            } catch (error) {
                this.isLoading = false;
                this.isComingUp = false;
                throw error;
            }
        },
    },
};
</script>

<style scoped>
.ww-tabs-header {
    display: flex;
    border-bottom: 2px solid var(--ww-color-border);
    gap: 0;
    width: 100%;
}

.ww-tab-item {
    position: relative;
    padding: var(--ww-spacing-02) var(--ww-spacing-04);
    cursor: pointer;
    border: none;
    background: transparent;
    color: var(--ww-color-content-secondary);
    font-weight: var(--text-medium);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--ww-spacing-01);
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    flex: 1;
    min-width: 0;
}

.ww-tab-item:hover {
    color: var(--ww-color-content-primary);
    background: var(--ww-color-bg-hover);
}

.ww-tab-item.ww-tab-active {
    color: var(--ww-color-content-brand);
    border-bottom-color: var(--ww-color-border-brand);
    background: transparent;
}

.ww-tab-label {
    font-size: var(--text-sm-font-size);
}

.ww-tab-optional {
    font-size: var(--text-xs-font-size);
    color: var(--ww-color-content-tertiary);
    background: var(--ww-color-bg-tertiary);
    padding: 2px 6px;
    border-radius: var(--ww-border-radius-01);
}

.ww-tab-active .ww-tab-optional {
    background: var(--ww-color-bg-brand-secondary);
    color: var(--ww-color-content-brand);
}

.environment-tabs-container {
    margin-bottom: var(--ww-spacing-05);
}
</style>
