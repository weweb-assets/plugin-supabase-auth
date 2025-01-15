<template>
    <div class="flex items-center body-2 mb-2" :class="{ 'content-success': settings.privateData.accessToken }">
        <wwEditorIcon :name="settings.privateData.accessToken ? 'bind' : 'unbind'" class="mr-2" />
        <div class="text-ellipsis">
            {{ settings.privateData.accessToken ? 'Account connected' : 'No account connected' }}
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
