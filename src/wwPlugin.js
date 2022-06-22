/* wwEditor:start */
import './components/Configuration/SettingsEdit.vue';
import './components/Configuration/SettingsSummary.vue';
import './components/Redirections/SettingsEdit.vue';
import './components/Redirections/SettingsSummary.vue';
import './components/RoleTable/SettingsEdit.vue';
import './components/RoleTable/SettingsSummary.vue';
import './components/Functions/SignUp.vue';
import './components/Functions/SignInEmail.vue';
import './components/Functions/SignInMagicLink.vue';
import './components/Functions/SignInProvider.vue';
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
        /* wwFront:start */
        await this.load(settings.publicData.projectUrl, settings.publicData.apiKey);
        /* wwFront:end */
        /* wwEditor:start */
        await this.load(settings.publicData.projectUrl, settings.privateData.apiKey);
        /* wwEditor:end */
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
    ],
    async adminGetUsers() {
        const response = await this.instance.auth.api.listUsers();
        if (response.error) throw new Error(response.error.message, { cause: response.error });
        return await Promise.all(
            response.data.map(async user => ({
                ...user,
                ...user.user_metadata,
                enabled: true,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
                roles: await this.getUserRoles(user.id),
            }))
        );
    },
    async adminCreateUser(data) {
        const attributes = data.attributes.reduce(
            (obj, attribute) => ({ ...obj, [attribute.key]: attribute.value }),
            {}
        );

        const response = await this.instance.auth.api.createUser({
            email: data.email,
            email_confirm: true,
            password: data.password,
            user_metadata: { ...attributes, name: data.name },
        });
        if (response.error) throw new Error(response.error.message, { cause: response.error });
        return {
            ...response.data,
            ...response.data.user_metadata,
            enabled: true,
            createdAt: response.data.created_at,
            updatedAt: response.data.updated_at,
            roles: [],
        };
    },
    async adminUpdateUser(user, data) {
        const attributes = data.attributes.reduce(
            (obj, attribute) => ({ ...obj, [attribute.key]: attribute.value }),
            {}
        );

        const response = await this.instance.auth.api.updateUserById(user.id, {
            email: data.email,
            email_confirm: true,
            user_metadata: { ...attributes, name: data.name },
        });
        if (response.error) throw new Error(response.error.message, { cause: response.error });
        return {
            ...response.data,
            ...response.data.user_metadata,
            enabled: true,
            createdAt: response.data.created_at,
            updatedAt: response.data.updated_at,
        };
    },
    async adminUpdateUserPassword(user, password) {
        const { error } = await this.instance.auth.api.updateUserById(user.id, {
            password: password,
        });
        if (error) throw new Error(error.message, { cause: error });
    },
    async adminUpdateUserRoles(user, roles) {
        if (!this.settings.privateData.roleTable) {
            const text = 'No valid User Role table defined in Supabase Auth plugin configuration.';
            wwLib.wwNotification.open({ text, color: 'red' });
            throw new Error(text);
        }
        for (const role of roles) {
            const { error } = await this.instance
                .from(this.settings.privateData.userRoleTable)
                .upsert({ id: role.id, roleId: role.id, userId: user.id });
            if (error) throw new Error(error.message, { cause: error });
        }
    },
    async adminDeleteUser(user) {
        const { error } = await this.instance.auth.api.deleteUser(user.id);
        if (error) throw new Error(error.message, { cause: error });
    },
    /* Roles */
    async adminGetRoles() {
        if (!this.settings.privateData.roleTable) return [];
        const { data: roles, error } = await this.instance.from(this.settings.privateData.roleTable).select();
        if (error) throw new Error(error.message, { cause: error });
        return roles.map(role => ({ ...role, createdAt: role.created_at }));
    },
    async adminCreateRole(name) {
        if (!this.settings.privateData.roleTable) {
            const text = 'No valid Role table defined in Supabase Auth plugin configuration.';
            wwLib.wwNotification.open({ text, color: 'red' });
            throw new Error(text);
        }
        const { data: roles, error } = await this.instance.from(this.settings.privateData.roleTable).insert([{ name }]);
        if (error) throw new Error(error.message, { cause: error });
        return { ...roles[0], createdAt: roles[0].created_at };
    },
    async adminUpdateRole(roleId, name) {
        const { data: roles, error } = await this.instance
            .from(this.settings.privateData.roleTable)
            .update({ name })
            .match({ id: roleId });
        if (error) throw new Error(error.message, { cause: error });
        return { ...roles[0], createdAt: roles[0].created_at };
    },
    async adminDeleteRole(roleId) {
        const { error } = await this.instance.from(this.settings.privateData.roleTable).delete().match({ id: roleId });
        if (error) throw new Error(error.message, { cause: error });
    },
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Supabase Auth API
    \================================================================================================*/
    async load(projectUrl, apiKey) {
        try {
            if (!projectUrl || !apiKey) return;
            this.instance = createClient(projectUrl, apiKey);
            /* wwEditor:start */
            await this.fetchDoc(projectUrl, apiKey);
            /* wwEditor:end */
            if (!this.instance) throw new Error('Invalid Supabase Auth configuration.');
        } catch (err) {
            this.instance = null;
            this.doc = null;
            wwLib.wwLog.error(err);
            /* wwEditor:start */
            wwLib.wwNotification.open({ text: 'Invalid Supabase Auth configuration.', color: 'red' });
            /* wwEditor:end */
        }
    },
    async signInEmail({ email, password }) {
        if (!this.instance) throw new Error('Invalid Supabase Auth configuration.');
        try {
            const { error } = await this.instance.auth.signIn({ email, password });
            if (error) throw new Error(error.message, { cause: error });
            return await this.fetchUser();
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    async signInMagicLink({ email }) {
        if (!this.instance) throw new Error('Invalid Supabase Auth configuration.');
        try {
            const { error } = await this.instance.auth.signIn({ email });
            if (error) throw new Error(error.message, { cause: error });
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    async signInProvider({ provider }) {
        if (!this.instance) throw new Error('Invalid Supabase Auth configuration.');
        const { error } = await this.instance.auth.signIn({ provider });
        if (error) throw new Error(error.message, { cause: error });
    },
    async signUp({ email, password, metadata }) {
        if (!this.instance) throw new Error('Invalid Supabase Auth configuration.');
        try {
            const user_metadata = metadata.reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {});

            const { user, error } = await this.instance.auth.signUp({ email, password }, { data: user_metadata });
            if (error) throw new Error(error.message, { cause: error });
            return user;
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    signOut() {
        if (!this.instance) throw new Error('Invalid Supabase Auth configuration.');
        wwLib.wwVariable.updateValue(`${this.id}-user`, null);
        wwLib.wwVariable.updateValue(`${this.id}-isAuthenticated`, false);
        this.instance.auth.signOut();
    },
    async fetchUser() {
        if (!this.instance) throw new Error('Invalid Supabase Auth configuration.');
        try {
            const user = this.instance.auth.user();
            if (!user) throw new Error('No user authenticated.');
            user.roles = await this.getUserRoles(user.id);
            wwLib.wwVariable.updateValue(`${this.id}-user`, user);
            wwLib.wwVariable.updateValue(`${this.id}-isAuthenticated`, true);
            return user;
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    async getUserRoles(userId) {
        if (!this.instance) throw new Error('Invalid Supabase Auth configuration.');
        const roles = this.settings.privateData.userRoleTable
            ? (
                  await this.instance
                      .from(this.settings.privateData.userRoleTable)
                      .select('role:roleId(*)')
                      .eq('userId', userId)
              ).data.map(({ role }) => role)
            : [];
        return roles;
    },
    async updateUserMeta({ email, metadata }) {
        if (!this.instance) throw new Error('Invalid Supabase Auth configuration.');

        const user_metadata = metadata.reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {});

        const { data: result, error } = await this.instance.auth.update({ email, data: user_metadata });
        if (error) throw new Error(error.message, { cause: error });
        return result;
    },
    async updateUserPassword({ oldPassword, newPassword }) {
        if (!this.instance) throw new Error('Invalid Supabase Auth configuration.');
        if (!this.user) throw new Error('User not authenticated.');

        await this.signIn({ email: this.user.email, password: oldPassword });

        const { data: result, error } = await this.instance.auth.update({ password: newPassword });
        if (error) throw new Error(error.message, { cause: error });
        return result;
    },
    async resetPasswordForEmail({ email }) {
        if (!this.instance) throw new Error('Invalid Supabase Auth configuration.');

        const { error } = await this.instance.auth.api.resetPasswordForEmail(email);
        if (error) throw new Error(error.message, { cause: error });
    },
    async confirmPassword({ newPassword }) {
        const router = wwLib.manager ? wwLib.getEditorRouter() : wwLib.getFrontRouter();
        const { access_token, type } = router.currentRoute.value.query;
        if (!access_token) throw new Error('No access token provided.');
        if (type !== 'recovery') throw new Error('Access token type must be recovery.');

        const { error } = await this.instance.auth.api.updateUser(access_token, { password: newPassword });
        if (error) throw new Error(error.message, { cause: error });
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
