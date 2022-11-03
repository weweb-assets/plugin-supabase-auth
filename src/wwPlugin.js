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
    privateInstance: null,
    publicInstance: null,
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
        await this.load(settings.publicData.projectUrl, settings.publicData.apiKey, settings.privateData.apiKey);
        /* wwEditor:end */
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
        const response = await this.privateInstance.auth.api.listUsers();
        if (response.error) throw new Error(response.error.message, { cause: response.error });
        return await Promise.all(
            response.data.map(async user => ({
                ...user,
                ...user.user_metadata,
                enabled: true,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
                roles: await this.adminGetUserRoles(user.id),
            }))
        );
    },
    async adminGetUserRoles(userId) {
        if (!this.privateInstance) throw new Error('Invalid Supabase Auth configuration.');
        const roles = this.settings.publicData.userRoleTable
            ? (
                  await this.privateInstance
                      .from(this.settings.publicData.userRoleTable)
                      .select('role:roleId(*)')
                      .eq('userId', userId)
              ).data.map(({ role }) => role)
            : [];
        return roles;
    },
    async adminCreateUser(data) {
        const attributes = data.attributes.reduce(
            (obj, attribute) => ({ ...obj, [attribute.key]: attribute.value }),
            {}
        );

        const response = await this.privateInstance.auth.api.createUser({
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

        const response = await this.privateInstance.auth.api.updateUserById(user.id, {
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
        const { error } = await this.privateInstance.auth.api.updateUserById(user.id, {
            password: password,
        });
        if (error) throw new Error(error.message, { cause: error });
    },
    async adminUpdateUserRoles(user, roles) {
        if (!this.settings.publicData.roleTable) {
            const text = 'No valid User Role table defined in Supabase Auth plugin configuration.';
            wwLib.wwNotification.open({ text, color: 'red' });
            throw new Error(text);
        }
        for (const role of user.roles || []) {
            const { error } = await this.privateInstance
                .from(this.settings.publicData.userRoleTable)
                .delete()
                .match({ roleId: role.id, userId: user.id });
            if (error) throw new Error(error.message, { cause: error });
        }
        for (const role of roles) {
            const { error } = await this.privateInstance
                .from(this.settings.publicData.userRoleTable)
                .upsert({ id: role.id, roleId: role.id, userId: user.id });
            if (error) throw new Error(error.message, { cause: error });
        }
    },
    async adminDeleteUser(user) {
        const { error } = await this.privateInstance.auth.api.deleteUser(user.id);
        if (error) throw new Error(error.message, { cause: error });
    },
    /* Roles */
    async adminGetRoles() {
        if (!this.settings.publicData.roleTable) return [];
        const { data: roles, error } = await this.privateInstance.from(this.settings.publicData.roleTable).select();
        if (error) throw new Error(error.message, { cause: error });
        return roles.map(role => ({ ...role, createdAt: role.created_at }));
    },
    async adminCreateRole(name) {
        if (!this.settings.publicData.roleTable) {
            const text = 'No valid Role table defined in Supabase Auth plugin configuration.';
            wwLib.wwNotification.open({ text, color: 'red' });
            throw new Error(text);
        }
        const { data: roles, error } = await this.privateInstance
            .from(this.settings.publicData.roleTable)
            .insert([{ name }]);
        if (error) throw new Error(error.message, { cause: error });
        return { ...roles[0], createdAt: roles[0].created_at };
    },
    async adminUpdateRole(roleId, name) {
        const { data: roles, error } = await this.privateInstance
            .from(this.settings.publicData.roleTable)
            .update({ name })
            .match({ id: roleId });
        if (error) throw new Error(error.message, { cause: error });
        return { ...roles[0], createdAt: roles[0].created_at };
    },
    async adminDeleteRole(roleId) {
        const { error } = await this.privateInstance
            .from(this.settings.publicData.roleTable)
            .delete()
            .match({ id: roleId });
        if (error) throw new Error(error.message, { cause: error });
    },
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Supabase Auth API
    \================================================================================================*/
    async load(projectUrl, publicApiKey, privateApiKey = null) {
        try {
            if (!projectUrl || !publicApiKey) return;

            /* wwEditor:start */
            if (!privateApiKey) return;
            this.privateInstance = createClient(projectUrl, privateApiKey);
            /* wwEditor:end */
            this.publicInstance = createClient(projectUrl, publicApiKey);

            // The same public instance must be shared between supabase and supabase auth
            if (wwLib.wwPlugins.supabase) wwLib.wwPlugins.supabase.syncInstance();
            /* wwEditor:start */
            await this.fetchDoc(projectUrl, privateApiKey || publicApiKey);
            /* wwEditor:end */
            if (!this.privateInstance && !this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
            await this.refreshAuthUser();
            this.publicInstance.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_OUT') return;
                if (event == 'USER_DELETED') return this.signOut();
                if (event == 'USER_UPDATED') {
                    this.refreshAuthUser(session);
                }
                if (event === 'SIGNED_IN') {
                    this.refreshAuthUser(session);
                }
                if (event == 'TOKEN_REFRESHED') {
                    setCookies(session);
                }
            });
        } catch (err) {
            this.publicInstance = null;
            this.privateInstance = null;
            this.doc = null;
            wwLib.wwLog.error(err);
            /* wwEditor:start */
            wwLib.wwNotification.open({ text: 'Invalid Supabase Auth configuration.', color: 'red' });
            /* wwEditor:end */
        }
    },
    async signInEmail({ email, password }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        try {
            const { session, error } = await this.publicInstance.auth.signIn({ email, password });
            if (error) throw new Error(error.message, { cause: error });
            return await this.refreshAuthUser(session);
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    async signInMagicLink({ email, redirectPage }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        try {
            const websiteId = wwLib.wwWebsiteData.getInfo().id;
            const redirectTo = wwLib.manager
                ? `${window.location.origin}/${websiteId}/${redirectPage}`
                : `${window.location.origin}${wwLib.wwPageHelper.getPagePath(redirectPage)}`;
            const { error } = await this.publicInstance.auth.signIn({ email }, { redirectTo });
            if (error) throw new Error(error.message, { cause: error });
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    async signInProvider({ provider, redirectPage }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        const websiteId = wwLib.wwWebsiteData.getInfo().id;
        const redirectTo = wwLib.manager
            ? `${window.location.origin}/${websiteId}/${redirectPage}`
            : `${window.location.origin}${wwLib.wwPageHelper.getPagePath(redirectPage)}`;
        const { error } = await this.publicInstance.auth.signIn({ provider }, { redirectTo });
        if (error) throw new Error(error.message, { cause: error });
    },
    async signUp({ email, password, metadata, redirectPage }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        try {
            const user_metadata = (metadata || []).reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {});
            const websiteId = wwLib.wwWebsiteData.getInfo().id;
            const redirectTo = wwLib.manager
                ? `${window.location.origin}/${websiteId}/${redirectPage}`
                : `${window.location.origin}${wwLib.wwPageHelper.getPagePath(redirectPage)}`;

            const { user, error } = await this.publicInstance.auth.signUp(
                { email, password },
                { data: user_metadata, redirectTo }
            );
            if (error) throw new Error(error.message, { cause: error });
            return user;
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    signOut() {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        wwLib.wwVariable.updateValue(`${this.id}-user`, null);
        wwLib.wwVariable.updateValue(`${this.id}-isAuthenticated`, false);
        window.vm.config.globalProperties.$cookie.removeCookie('sb-access-token', {
            path: '/',
            domain: window.location.hostname,
        });
        window.vm.config.globalProperties.$cookie.removeCookie('sb-refresh-token', {
            path: '/',
            domain: window.location.hostname,
        });
        // For safari
        window.vm.config.globalProperties.$cookie.removeCookie('sb-access-token', {
            path: '/',
            domain: '.' + window.location.hostname,
        });
        window.vm.config.globalProperties.$cookie.removeCookie('sb-refresh-token', {
            path: '/',
            domain: '.' + window.location.hostname,
        });
        this.publicInstance.auth.signOut();
    },
    async refreshAuthUser(session) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');

        const _session = session || this.publicInstance.auth.session();
        const user = _session ? _session.user : this.publicInstance.auth.user();
        if (!user) {
            this.signOut();
            return false;
        }
        user.roles = await this.getUserRoles(user.id);
        wwLib.wwVariable.updateValue(`${this.id}-user`, user);
        wwLib.wwVariable.updateValue(`${this.id}-isAuthenticated`, true);
        setCookies(_session);
        return user;
    },
    async getUserRoles(userId) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        const roles = this.settings.publicData.userRoleTable
            ? (
                  await this.publicInstance
                      .from(this.settings.publicData.userRoleTable)
                      .select('role:roleId(*)')
                      .eq('userId', userId)
              ).data.map(({ role }) => role)
            : [];
        return roles;
    },
    async updateUserMeta({ email, metadata }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');

        const user_metadata = (metadata || []).reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {});

        const { data: result, error } = await this.publicInstance.auth.update({ email, data: user_metadata });
        if (error) throw new Error(error.message, { cause: error });
        return result;
    },
    async updateUserPassword({ oldPassword, newPassword }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!this.user) throw new Error('User not authenticated.');

        await this.signIn({ email: this.user.email, password: oldPassword });

        const { data: result, error } = await this.publicInstance.auth.update({ password: newPassword });
        if (error) throw new Error(error.message, { cause: error });
        return result;
    },
    async resetPasswordForEmail({ email, redirectPage }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        const websiteId = wwLib.wwWebsiteData.getInfo().id;
        const redirectTo = wwLib.manager
            ? `${window.location.origin}/${websiteId}/${redirectPage}`
            : `${window.location.origin}${wwLib.wwPageHelper.getPagePath(redirectPage)}`;
        const { error } = await this.publicInstance.auth.api.resetPasswordForEmail(email, { redirectTo });
        if (error) throw new Error(error.message, { cause: error });
    },
    async confirmPassword({ newPassword }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        const { access_token } = this.publicInstance.auth.currentSession || {};
        if (!access_token) throw new Error('No access token provided.');

        const { error } = await this.publicInstance.auth.api.updateUser(access_token, { password: newPassword });
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
const setCookies = session => {
    window.vm.config.globalProperties.$cookie.setCookie('sb-access-token', session.access_token, {
        expire: session.expires_in,
        path: '/',
        domain: window.location.hostname,
        secure: true,
        sameSite: 'Lax',
    });
    window.vm.config.globalProperties.$cookie.setCookie('sb-refresh-token', session.refresh_token, {
        expire: session.expires_in,
        path: '/',
        domain: window.location.hostname,
        secure: true,
        sameSite: 'Lax',
    });
};
