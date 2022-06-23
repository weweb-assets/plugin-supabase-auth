<template>
    <div class="flex items-center body-2 mb-2">
        <wwEditorIcon name="link" class="mr-2" />
        <div class="text-ellipsis">{{ settings.publicData.projectUrl }}</div>
    </div>
    <div class="flex items-center body-2 mb-2">
        <wwEditorIcon name="key" class="mr-2" />
        <div class="text-ellipsis">{{ settings.publicData.apiKey }}</div>
    </div>
    <div class="flex items-center body-2">
        <wwEditorIcon name="key" class="mr-2" />
        <div class="text-ellipsis">{{ (settings.privateData.apiKey || '').replace(/./g, '*') }}</div>
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
