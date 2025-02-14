<template>
    <div
        v-if="canGenerate"
        class="p-3 border-brand-secondary content-brand-secondary rounded-02 flex flex-row body-sm mb-2 items-center"
    >
        You don't have roles and users_roles tables yet? We can generate them for you.
        <button type="button" class="ww-editor-button -secondary -small" @click="generateTables" :disabled="isLoading">
            Generate
        </button>
    </div>
    <wwEditorFormRow label="Roles table">
        <div class="flex items-center">
            <wwEditorInputTextSelect
                class="w-100"
                placeholder="Select a table"
                :options="tablesOptions"
                :model-value="settings.publicData.roleTable"
                @update:modelValue="changePublicSettings('roleTable', $event)"
            />
            <button type="button" class="ww-editor-button -primary -small -icon ml-2" @click="fetchTables">
                <wwEditorIcon name="refresh" medium />
            </button>
        </div>
    </wwEditorFormRow>
    <div v-if="settings.publicData.roleTable && !isRoleTableValid" class="body-sm content-warning mb-2">
        This table must have an "id" column.
    </div>
    <wwEditorInputRow
        label="Name column"
        type="select"
        placeholder="name"
        :options="roleTablePropertiesOptions"
        :model-value="settings.publicData.roleTableNameColumn"
        @update:modelValue="changePublicSettings('roleTableNameColumn', $event)"
    />
    <wwEditorFormRow label="Users-Roles table">
        <div class="flex items-center">
            <wwEditorInputTextSelect
                class="w-100"
                placeholder="Select a table"
                :options="tablesOptions"
                :model-value="settings.publicData.userRoleTable"
                @update:modelValue="changePublicSettings('userRoleTable', $event)"
            />
            <button type="button" class="ww-editor-button -primary -small -icon ml-2" @click="fetchTables">
                <wwEditorIcon name="refresh" medium />
            </button>
        </div>
    </wwEditorFormRow>
    <div v-if="settings.publicData.userRoleTable && !isUserRoleTableValid" class="body-sm content-warning mb-2">
        This table must have an "id" column.
    </div>
    <wwEditorInputRow
        label="Role ID column"
        type="select"
        placeholder="role_id"
        :options="userRoleTablePropertiesOptions"
        :model-value="settings.publicData.userRoleTableRoleColumn"
        @update:modelValue="changePublicSettings('userRoleTableRoleColumn', $event)"
    />
    <wwEditorInputRow
        label="User ID column"
        type="select"
        placeholder="user_id"
        :options="userRoleTablePropertiesOptions"
        :model-value="settings.publicData.userRoleTableUserColumn"
        @update:modelValue="changePublicSettings('userRoleTableUserColumn', $event)"
    />

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
        roleTablePropertiesOptions() {
            const table = this.definitions?.[this.settings.publicData?.roleTable];
            if (!table) return [];
            return Object.keys(table.properties).map(propName => ({
                label: propName,
                value: propName,
            }));
        },
        userRoleTablePropertiesOptions() {
            const table = this.definitions?.[this.settings.publicData?.userRoleTable];
            if (!table) return [];
            return Object.keys(table.properties).map(propName => ({
                label: propName,
                value: propName,
            }));
        },
        isRoleTableValid() {
            const table = this.definitions[this.settings.publicData.roleTable];
            if (!table) return false;
            const properties = Object.keys(table.properties);
            return properties.includes('id');
        },
        isUserRoleTableValid() {
            const table = this.definitions[this.settings.publicData.userRoleTable];
            if (!table) return false;
            const properties = Object.keys(table.properties);
            return properties.includes('id');
        },
        canGenerate() {
            return (
                wwLib.wwPlugins.supabase &&
                this.settings.privateData.accessToken &&
                !this.settings.publicData.roleTable &&
                !this.settings.publicData.userRoleTable
            );
        },
    },
    mounted() {
        this.definitions = this.plugin?.doc?.definitions || {};
    },
    methods: {
        async fetchTables() {
            try {
                this.isLoading = true;
                await this.plugin.fetchDoc();
                this.definitions = this.plugin?.doc?.definitions || {};
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
        changePublicSettings(key, value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, [key]: value },
            });
        },
        async generateTables() {
            this.isLoading = true;
            try {
                await wwLib.wwPlugins.supabase.install('roles');
                // wait 3 seconds for the table to be created
                await new Promise(resolve => setTimeout(resolve, 3000));
                await this.fetchTables();
                this.$emit('update:settings', {
                    ...this.settings,
                    publicData: {
                        ...this.settings.publicData,
                        roleTable: 'roles',
                        userRoleTable: 'users_roles',
                        roleTableNameColumn: 'name',
                        userRoleTableRoleColumn: 'role_id',
                        userRoleTableUserColumn: 'user_id',
                    },
                });
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.text-error {
    color: var(--ww-color-red-500);
}
</style>
