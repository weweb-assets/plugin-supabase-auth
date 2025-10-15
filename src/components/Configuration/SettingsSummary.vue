<template>
    <div v-if="isMultiEnv">
        <!-- Multi-environment summary -->
        <div v-for="(env, envName) in activeEnvironments" :key="envName" class="mb-3">
            <div class="label-sm content-secondary mb-1">{{ getEnvLabel(envName) }}</div>
            <div class="flex items-center body-2 mb-1">
                <wwEditorIcon name="database" class="mr-2" small />
                <div class="text-ellipsis">{{ env.projectUrl }}</div>
            </div>
            <div v-if="env.branchSlug" class="flex items-center body-2 mb-1">
                <wwEditorIcon name="16/branch" class="mr-2" small />
                <div class="text-ellipsis">{{ env.branchSlug }}</div>
            </div>
            <div v-if="env.customDomain" class="flex items-center body-2 mb-1">
                <wwEditorIcon name="globe" class="mr-2" small />
                <div class="text-ellipsis">{{ env.customDomain }}</div>
            </div>
        </div>
    </div>
    <div v-else>
        <!-- Legacy single environment summary -->
        <div class="flex items-center body-2 mb-2">
            <wwEditorIcon name="database" class="mr-2" />
            <div class="mr-2 content-secondary">project</div>
            <div class="text-ellipsis">{{ settings.publicData.projectUrl }}</div>
        </div>
        <div v-if="settings.publicData.customDomain" class="flex items-center body-2 mb-2">
            <wwEditorIcon name="globe" class="mr-2" />
            <div class="mr-2 content-secondary">custom domain</div>
            <div class="text-ellipsis">{{ settings.publicData.customDomain }}</div>
        </div>
        <div class="flex items-center body-2 mb-2">
            <wwEditorIcon name="key" class="mr-2" />
            <div class="mr-2 content-secondary">public</div>
            <div class="text-ellipsis">{{ settings.publicData.apiKey }}</div>
        </div>
        <div class="flex items-center body-2">
            <wwEditorIcon name="key" class="mr-2" />
            <div class="mr-2 content-secondary">service_role</div>
            <div class="text-ellipsis" :class="{ 'text-dark-400': !settings.privateData.apiKey }">
                {{ settings.privateData?.apiKey?.replace(/./g, '*') || 'No service role key provided' }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        settings: { type: Object, required: true },
    },
    computed: {
        isMultiEnv() {
            return !!this.settings.publicData?.environments;
        },
        activeEnvironments() {
            if (!this.isMultiEnv) return {};
            
            const envs = {};
            const environments = this.settings.publicData.environments;
            
            // Only show configured environments
            if (environments.production?.projectUrl) {
                envs.production = environments.production;
            }
            if (environments.staging?.projectUrl) {
                envs.staging = environments.staging;
            }
            if (environments.editor?.projectUrl) {
                envs.editor = environments.editor;
            }
            
            return envs;
        }
    },
    methods: {
        getEnvLabel(envName) {
            const labels = {
                production: 'Production',
                staging: 'Staging',
                editor: 'Editor'
            };
            return labels[envName] || envName;
        }
    }
};
</script>

<style lang="scss" scoped>
.text-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>