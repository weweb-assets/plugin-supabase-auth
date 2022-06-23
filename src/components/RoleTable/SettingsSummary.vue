<template>
    <wwEditorFormRow label="Role table">
        <div class="flex items-center body-2 mb-2">
            <wwEditorIcon name="data" class="mr-2" />
            <div class="text-ellipsis">{{ settings.publicData.roleTable || 'none' }}</div>
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="User Role table">
        <div class="flex items-center body-2">
            <wwEditorIcon name="data" class="mr-2" />
            <div class="text-ellipsis">{{ settings.publicData.userRoleTable || 'none' }}</div>
        </div>
    </wwEditorFormRow>
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
