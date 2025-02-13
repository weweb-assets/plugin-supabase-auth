<template>
    <div class="flex items-center body-2 mb-2">
        <wwEditorIcon name="database" class="mr-2" />
        <div class="mr-2 content-secondary">project</div>
        <div class="text-ellipsis">{{ settings.publicData.projectUrl }}</div>
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
</template>

<script>
export default {
    props: {
        settings: { type: Object, required: true },
    },
};
</script>

<style lang="scss" scoped>
.text-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
