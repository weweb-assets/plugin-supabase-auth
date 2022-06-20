/* wwEditor:start */
import './components/Configuration/SettingsEdit.vue';
import './components/Configuration/SettingsSummary.vue';
import './components/Redirections/SettingsEdit.vue';
import './components/Redirections/SettingsSummary.vue';
import './components/RoleTable/SettingsEdit.vue';
import './components/RoleTable/SettingsSummary.vue';
import './components/Functions/SignUp.vue';
import './components/Functions/SignIn.vue';
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
        this.fetchUser();
    },
    /*=============================================m_ÔÔ_m=============================================\
        Auth API
    \================================================================================================*/
    /* wwEditor:start */
    /* Users */
    userAttributes: [{ label: 'Phone', key: 'phone' }],
    async adminGetUsers() {
        const response = await this.instance.auth.api.listUsers();
        return response.data.map(user => ({
            ...user,
            enabled: true,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            name: user.user_metadata && user.user_metadata.name,
        }));
    },
    async adminCreateUser(data) {
        try {
            const response = await this.instance.auth.api.createUser({
                email: data.email,
                email_confirm: true,
                password: data.password,
                phone: data.userAttributes.phone,
                phone_confirm: true,
                user_metadata: { name: data.name },
            });
            return response.data;
        } catch (err) {
            if (err.response && err.response.data.message) throw new Error(err.response.data.message);
            throw err;
        }
    },
    async adminUpdateUser(user, data) {
        try {
            const response = await this.instance.auth.api.updateUserById(user.id, {
                email: data.email,
                email_confirm: true,
                phone: data.userAttributes.phone,
                phone_confirm: true,
                user_metadata: { name: data.name },
            });
            return response.data;
        } catch (err) {
            if (err.response && err.response.data.message) throw new Error(err.response.data.message);
            throw err;
        }
    },
    async adminUpdateUserPassword(user, password) {
        try {
            const response = await this.instance.auth.api.updateUserById(user.id, {
                password: data.password,
            });
            return response.data;
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
        const { data } = await this.instance.from(this.settings.privateData.roleTable).select();
        return data;
    },
    async adminCreateRole(name) {
        const { data } = await this.instance.from(this.settings.privateData.roleTable).insert([{ name }]);
        return data;
    },
    async adminUpdateRole(roleId, name) {
        const { data } = await this.instance
            .from(this.settings.privateData.roleTable)
            .update({ name })
            .match({ id: roleId });
        return data;
    },
    async adminDeleteRole(roleId) {
        const { data } = await this.instance.from(this.settings.privateData.roleTable).delete().match({ id: roleId });
        return data;
    },
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Supabase API
    \================================================================================================*/
    async load(projectUrl, publicApiKey, privateApiKey) {
        try {
            /* wwFront:start */
            if (!projectUrl || !publicApiKey) return;
            this.instance = createClient(projectUrl, publicApiKey);
            /* wwFront:end */
            /* wwEditor:start */
            if (!projectUrl || !privateApiKey) return;
            this.instance = createClient(projectUrl, privateApiKey);
            await this.fetchDoc(projectUrl, publicApiKey);
            /* wwEditor:end */
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
    fetchUser() {
        if (!this.instance) throw new Error('Invalid Supabase configuration.');
        try {
            const user = this.instance.auth.user();
            if (!user) throw new Error('No user authenticated.');
            wwLib.wwVariable.updateValue(`${this.id}-user`, user);
            wwLib.wwVariable.updateValue(`${this.id}-isAuthenticated`, true);
            return user;
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
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
