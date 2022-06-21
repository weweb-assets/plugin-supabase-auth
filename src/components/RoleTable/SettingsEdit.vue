<template>
    <div class="flex items-center">
        <div class="w-100 -full">
            <wwEditorInputRow
                label="Role table"
                type="select"
                placeholder="Select a table"
                :model-value="settings.privateData.roleTable"
                :options="tablesOptions"
                @update:modelValue="changePrivateSettings('roleTable', $event)"
            />
        </div>
        <button type="button" class="ww-editor-button -small -primary ml-2 mt-3" @click="fetchTables">refresh</button>
    </div>
    <div v-if="settings.privateData.roleTable && isRoleTableValid" class="body-2 text-error mb-2">
        Table must have columns "id" and "name".
    </div>
    <div class="flex items-center">
        <div class="w-100 -full">
            <wwEditorInputRow
                label="User Role table"
                type="select"
                placeholder="Select a table"
                :model-value="settings.privateData.userRoleTable"
                :options="tablesOptions"
                @update:modelValue="changePrivateSettings('userRoleTable', $event)"
            />
        </div>
        <button type="button" class="ww-editor-button -small -primary ml-2 mt-3" @click="fetchTables">refresh</button>
    </div>
    <div v-if="settings.privateData.userRoleTable && isRoleTableValid" class="body-2 text-error mb-2">
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
            return Object.keys(this.definitions).map(tableName => ({
                label: tableName,
                value: tableName,
            }));
        },
        isRoleTableValid() {
            const table = this.definitions[this.settings.privateData.roleTable];
            if (!table) return false;
            const properties = Object.keys(table.properties);
            return properties.includes('id') && properties.includes('name');
        },
        isUserRoleTableValid() {
            const table = this.definitions[this.settings.privateData.userRoleTable];
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
                privateData: { ...this.settings.privateData, [key]: value },
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
