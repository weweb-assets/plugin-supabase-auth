<template>
    <wwEditorFormRow label="Role table">
        <div class="flex items-center">
            <wwEditorInputTextSelect
                class="w-100"
                placeholder="Select a table"
                :model-value="settings.publicData.roleTable"
                :options="tablesOptions"
                @update:modelValue="changePrivateSettings('roleTable', $event)"
            />
            <button type="button" class="ww-editor-button -primary -small -icon ml-2" @click="fetchTables">
                <wwEditorIcon name="refresh" medium />
            </button>
        </div>
    </wwEditorFormRow>
    <div v-if="settings.publicData.roleTable && !isRoleTableValid" class="body-2 text-error mb-2">
        Table must have columns "id" and "name".
    </div>
    <wwEditorFormRow label="User role table">
        <div class="flex items-center">
            <wwEditorInputTextSelect
                class="w-100"
                placeholder="Select a table"
                :model-value="settings.publicData.userRoleTable"
                :options="tablesOptions"
                @update:modelValue="changePrivateSettings('userRoleTable', $event)"
            />
            <button type="button" class="ww-editor-button -primary -small -icon ml-2" @click="fetchTables">
                <wwEditorIcon name="refresh" medium />
            </button>
        </div>
    </wwEditorFormRow>
    <div v-if="settings.publicData.userRoleTable && !isUserRoleTableValid" class="body-2 text-error mb-2">
        Table must have column "id", "roleId" and "userId".
    </div>
    <wwLoader :loading="isLoading" />
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
            isLoading: false,
            definitions: {},
        };
    },
    computed: {
        tablesOptions() {
            return [
                { label: 'None', value: null },
                ...Object.keys(this.definitions).map(tableName => ({
                    label: tableName,
                    value: tableName,
                })),
            ];
        },
        isRoleTableValid() {
            const table = this.definitions[this.settings.publicData.roleTable];
            if (!table) return false;
            const properties = Object.keys(table.properties);
            return properties.includes('id') && properties.includes('name');
        },
        isUserRoleTableValid() {
            const table = this.definitions[this.settings.publicData.userRoleTable];
            if (!table) return false;
            const properties = Object.keys(table.properties);
            return properties.includes('id') && properties.includes('roleId') && properties.includes('userId');
        },
    },
    mounted() {
        this.definitions = this.plugin.doc.definitions || {};
    },
    methods: {
        async fetchTables() {
            try {
                this.isLoading = true;
                await this.plugin.fetchDoc();
                this.definitions = this.plugin.doc.definitions || {};
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
        changePrivateSettings(key, value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, [key]: value },
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.text-error {
    color: var(--ww-color-red-500);
}
</style>
