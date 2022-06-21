<template>
    <wwEditorFormRow label="Page to redirect when user is not signed-in">
        <div class="flex items-center body-2">
            <wwEditorIcon name="document" class="mr-2" />
            <div class="text-ellipsis">{{ getPageFromId(settings.publicData.afterNotSignInPageId).name }}</div>
        </div>
    </wwEditorFormRow>
</template>

<script>
export default {
    props: {
        settings: { type: Object, required: true },
    },
    computed: {
        pages() {
            return wwLib.wwWebsiteData.getPages();
        },
    },
    methods: {
        getPageFromId(id) {
            return this.pages.find(page => page && page.id === id) || {};
        },
    },
};
</script>

<style lang="scss" scoped>
.text-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
