<template>
    <div class="flex items-center body-2">
        <wwEditorIcon name="data" class="mr-2" />
        <div class="text-ellipsis">{{ settings.privateData.roleTable }}</div>
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
}
</style>
