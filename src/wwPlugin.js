/* wwEditor:start */
import './components/Configuration/SettingsEdit.vue';
import './components/Configuration/SettingsSummary.vue';
import './components/Redirections/SettingsEdit.vue';
import './components/Redirections/SettingsSummary.vue';
import './components/RoleTable/SettingsEdit.vue';
import './components/RoleTable/SettingsSummary.vue';
import './components/Functions/SignUp.vue';
import './components/Functions/SignIn.vue';
import './components/Functions/UpdateUserMeta.vue';
import './components/Functions/ChangePassword.vue';
import './components/Functions/ConfirmPassword.vue';
import './components/Functions/ForgotPassword.vue';
/* wwEditor:end */
import { createClient } from '@supabase/supabase-js';

export default {
    instance: null,
    /* wwEditor:start */
    doc: null,
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Plugin API
    \================================================================================================*/
    async onLoad(settings) {
        await this.load(settings.publicData.projectUrl, settings.publicData.apiKey, settings.privateData.apiKey);
        await this.fetchUser();
    },
    /*=============================================m_ÔÔ_m=============================================\
        Auth API
    \================================================================================================*/
    /* wwEditor:start */
    /* Users */
    userAttributes: [
        { label: 'Name', key: 'name' },
        { label: 'Picture', key: 'picture' },
        { label: 'Given name', key: 'gisven_name' },
        { label: 'Family name', key: 'family_name' },
        { label: 'Middle name', key: 'middle_name' },
        { label: 'Nickname', key: 'nickname' },
        { label: 'Profile URL', key: 'profile' },
        { label: 'Website URL', key: 'website' },
        { label: 'Gender', key: 'gender' },
        { label: 'Birthdate', key: 'birthdate' },
        { label: 'Zoneinfo', key: 'zoneinfo' },
        { label: 'Locale', key: 'locale' },
        { label: 'Address', key: 'address' },
        { label: 'Phone', key: 'phone' },
    ],
    async adminGetUsers() {
        const response = await this.instance.auth.api.listUsers();
        return await Promise.all(
            response.data.map(async user => ({
                ...user,
                enabled: true,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
                name: user.user_metadata && user.user_metadata.name,
                roles: this.settings.privateData.userRoleTable
                    ? await this.instance.from(this.settings.privateData.userRoleTable).select().eq('userId', user.id)
                          .data
                    : [],
            }))
        );
    },
    async adminCreateUser(data) {
        try {
            const attributes = data.attributes.reduce(
                (obj, attribute) => ({ ...obj, [attribute.Name]: attribute.Value }),
                {}
            );
            const phone = attributes.phone;
            delete attributes.phone;

            const response = await this.instance.auth.api.createUser({
                email: data.email,
                email_confirm: true,
                password: data.password,
                phone,
                phone_confirm: !!phone,
                user_metadata: { ...attributes, name: data.name },
            });
            return {
                ...response.data,
                enabled: true,
                createdAt: response.data.created_at,
                updatedAt: response.data.updated_at,
                name: response.data.user_metadata && response.data.user_metadata.name,
                roles: [],
            };
        } catch (err) {
            if (err.response && err.response.data.message) throw new Error(err.response.data.message);
            throw err;
        }
    },
    async adminUpdateUser(user, data) {
        try {
            const attributes = data.attributes.reduce(
                (obj, attribute) => ({ ...obj, [attribute.Name]: attribute.Value }),
                {}
            );
            const phone = attributes.phone;
            delete attributes.phone;

            const response = await this.instance.auth.api.updateUserById(user.id, {
                email: data.email,
                email_confirm: true,
                phone,
                phone_confirm: !!phone,
                user_metadata: { ...attributes, name: data.name },
            });
            return {
                ...response.data,
                enabled: true,
                createdAt: response.data.created_at,
                updatedAt: response.data.updated_at,
                name: response.data.user_metadata && response.data.user_metadata.name,
            };
        } catch (err) {
            if (err.response && err.response.data.message) throw new Error(err.response.data.message);
            throw err;
        }
    },
    async adminUpdateUserPassword(user, password) {
        try {
            await this.instance.auth.api.updateUserById(user.id, {
                password: password,
            });
        } catch (err) {
            if (err.response && err.response.data.message) throw new Error(err.response.data.message);
            throw err;
        }
    },
    async adminUpdateUserRoles(user, roles) {
        try {
            if (!this.settings.privateData.roleTable) {
                const text = 'No valid User Role table defined in Supabase plugin configuration.';
                wwLib.wwNotification.open({ text, color: 'red' });
                throw new Error(text);
            }
            for (const role of roles) {
                await this.instance
                    .from(this.settings.privateData.userRoleTable)
                    .upsert({ id: role.id, roleId: role.id, userId: user.id });
            }
        } catch (err) {
            if (err.response && err.response.data.message) throw new Error(err.response.data.message);
            throw err;
        }
    },
    async adminDeleteUser(user) {
        try {
            await this.instance.auth.api.deleteUser(user.id);
        } catch (err) {
            if (err.response && err.response.data.message) throw new Error(err.response.data.message);
            throw err;
        }
    },
    /* Roles */
    async adminGetRoles() {
        if (!this.settings.privateData.roleTable) return [];
        const { data: roles, error } = await this.instance.from(this.settings.privateData.roleTable).select();
        if (error) throw error;
        return roles.map(role => ({ ...role, createdAt: role.created_at }));
    },
    async adminCreateRole(name) {
        if (!this.settings.privateData.roleTable) {
            const text = 'No valid Role table defined in Supabase plugin configuration.';
            wwLib.wwNotification.open({ text, color: 'red' });
            throw new Error(text);
        }
        const {
            data: [role],
        } = await this.instance.from(this.settings.privateData.roleTable).insert([{ name }]);
        return { ...role, createdAt: role.createdAt };
    },
    async adminUpdateRole(roleId, name) {
        const {
            data: [role],
        } = await this.instance.from(this.settings.privateData.roleTable).update({ name }).match({ id: roleId });
        return { ...role, createdAt: role.createdAt };
    },
    async adminDeleteRole(roleId) {
        const {
            data: [role],
        } = await this.instance.from(this.settings.privateData.roleTable).delete().match({ id: roleId });
        return { ...role, createdAt: role.createdAt };
    },
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Supabase API
    \================================================================================================*/
    async load(projectUrl, publicApiKey, privateApiKey) {
        const options = { cookieOptions: {} };
        try {
            /* wwFront:start */
            if (!projectUrl || !publicApiKey) return;
            this.instance = createClient(projectUrl, publicApiKey, options);
            /* wwFront:end */
            /* wwEditor:start */
            if (!projectUrl || !privateApiKey) return;
            this.instance = createClient(projectUrl, privateApiKey, options);
            await this.fetchDoc(projectUrl, publicApiKey);
            /* wwEditor:end */
            if (!this.instance) throw new Error('Invalid Supabase configuration.');
        } catch (err) {
            this.instance = null;
            this.doc = null;
            wwLib.wwLog.error(err);
            /* wwEditor:start */
            wwLib.wwNotification.open({ text: 'Invalid Supabase configuration.', color: 'red' });
            /* wwEditor:end */
        }
    },
    async signIn({ email, password }) {
        if (!this.instance) throw new Error('Invalid Supabase configuration.');
        try {
            await this.instance.auth.signIn({ email, password });
            return await this.fetchUser();
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    async signUp({ email, password, name }) {
        if (!this.instance) throw new Error('Invalid Supabase configuration.');
        try {
            const { user } = await this.instance.auth.signUp({ email, password }, { data: { name } });
            return user;
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    signOut() {
        if (!this.instance) throw new Error('Invalid Supabase configuration.');
        wwLib.wwVariable.updateValue(`${this.id}-user`, null);
        wwLib.wwVariable.updateValue(`${this.id}-isAuthenticated`, false);
        this.instance.auth.signOut();
    },
    async fetchUser() {
        if (!this.instance) throw new Error('Invalid Supabase configuration.');
        try {
            const user = this.instance.auth.user();
            if (!user) throw new Error('No user authenticated.');
            user.roles = this.settings.privateData.userRoleTable
                ? await this.instance.from(this.settings.privateData.userRoleTable).select().eq('userId', user.id).data
                : [];
            wwLib.wwVariable.updateValue(`${this.id}-user`, user);
            wwLib.wwVariable.updateValue(`${this.id}-isAuthenticated`, true);
            return user;
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    async updateUserMeta({ email, metadata }) {
        if (!this.instance) throw new Error('Invalid Supabase configuration.');

        const user_metadata = metadata.reduce((obj, item) => ({ ...obj, [item.Name]: item.Value }), {});

        const phone = user_metadata.phone;
        delete user_metadata.phone;

        const { data: result, error } = await this.instance.auth.update({ email, phone, user_metadata });
        if (error) throw error;
        return result;
    },
    async updateUserPassword({ oldPassword, newPassword }) {
        if (!this.instance) throw new Error('Invalid Supabase configuration.');

        await this.signIn({ email: this.user.email, password: oldPassword });

        const { data: result, error } = await this.instance.auth.update({ password: newPassword });
        if (error) throw error;
        return result;
    },
    async resetPasswordForEmail({ email }) {
        if (!this.instance) throw new Error('Invalid Supabase configuration.');

        const { data: result, error } = await this.instance.auth.api.resetPasswordForEmail(email);
        if (error) throw error;
        return result;
    },
    async confirmPassword() {},
    /* wwEditor:start */
    async fetchDoc(projectUrl = this.settings.publicData.projectUrl, apiKey = this.settings.publicData.apiKey) {
        this.doc = await getDoc(projectUrl, apiKey);
    },
    /* wwEditor:end */
};

/* wwEditor:start */
const getDoc = async (url, apiKey) => {
    const { data } = await axios.get(`${url}/rest/v1/?apikey=${apiKey}`);
    return data;
};
/* wwEditor:end */
