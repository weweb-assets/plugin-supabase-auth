<template>
    <div class="flex items-center body-2 mb-2">
        <wwEditorIcon name="link" class="mr-2" />
        <div class="text-ellipsis">{{ settings.publicData.accessToken ? 'Linked' : 'Not linked' }}</div>
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
