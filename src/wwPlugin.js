/* wwEditor:start */
import './components/Configuration/SettingsEdit.vue';
import './components/Configuration/SettingsSummary.vue';
import './components/Redirections/SettingsEdit.vue';
import './components/Redirections/SettingsSummary.vue';
import './components/RoleTable/SettingsEdit.vue';
import './components/RoleTable/SettingsSummary.vue';
import './components/Functions/SignUp.vue';
import './components/Functions/SignOut.vue';
import './components/Functions/SignInEmail.vue';
import './components/Functions/SignInPhone.vue';
import './components/Functions/SignInMagicLink.vue';
import './components/Functions/SignInOIDC.vue';
import './components/Functions/SignInOTP.vue';
import './components/Functions/SignInProvider.vue';
import './components/Functions/SignInSSO.vue';
import './components/Functions/VerifyOTP.vue';
import './components/Functions/ResendOTP.vue';
import './components/Functions/UpdateUser.vue';
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
        { label: 'Given name', key: 'given_name' },
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
    getProjectId() {
        return this.privateInstance?.supabaseUrl.split('https://')[1].split('.')[0];
    },
    async adminGetUsers() {
        const response = await this.privateInstance.auth.admin.listUsers({
            page: 1,
            perPage: 100,
        });
        if (response.error) throw new Error(response.error.message, { cause: response.error });
        return await Promise.all(
            response.data.users.map(async user => ({
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

        const response = await this.privateInstance.auth.admin.createUser({
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

        const response = await this.privateInstance.auth.admin.updateUserById(user.id, {
            email: data.email,
            email_confirm: true,
            user_metadata: { ...attributes, name: data.name },
        });
        if (response.error) throw new Error(response.error.message, { cause: response.error });
        return {
            ...response.data.user,
            ...response.data.user.user_metadata,
            enabled: true,
            createdAt: response.data.user.created_at,
            updatedAt: response.data.user.updated_at,
        };
    },
    async adminUpdateUserPassword(user, password) {
        const { error } = await this.privateInstance.auth.admin.updateUserById(user.id, {
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
        const response = await this.privateInstance
            .from(this.settings.publicData.userRoleTable)
            .delete()
            .match({ userId: user.id });
        if (response.error) throw new Error(response.error.message, { cause: response.error });
        for (const role of roles) {
            const { error } = await this.privateInstance
                .from(this.settings.publicData.userRoleTable)
                .insert({ roleId: role.id, userId: user.id });
            if (error) throw new Error(error.message, { cause: error });
        }
    },
    async adminDeleteUser(user) {
        const { error } = await this.privateInstance.auth.admin.deleteUser(user.id);
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
            .insert([{ name }])
            .select();
        if (error) throw new Error(error.message, { cause: error });
        return { ...roles[0], createdAt: roles[0].created_at };
    },
    async adminUpdateRole(roleId, name) {
        const { data: roles, error } = await this.privateInstance
            .from(this.settings.publicData.roleTable)
            .update({ name })
            .match({ id: roleId })
            .select();
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

            this.publicInstance = createClient(projectUrl, publicApiKey, {
                auth: {
                    storageKey: wwLib.wwWebsiteData.getInfo().id,
                },
            });

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
    async signUp({ type = 'email', email, phone, channel, password, metadata, redirectPage, captchaToken }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        try {
            const user_metadata = Array.isArray(metadata)
                ? metadata.reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {})
                : metadata;
            const websiteId = wwLib.wwWebsiteData.getInfo().id;
            const emailRedirectTo =
                redirectPage &&
                (wwLib.manager
                    ? `${window.location.origin}/${websiteId}/${redirectPage}`
                    : `${window.location.origin}${wwLib.wwPageHelper.getPagePath(redirectPage)}`);

            const { data, error } = await this.publicInstance.auth.signUp(
                type === 'email'
                    ? { email, password, options: { captchaToken, data: user_metadata, emailRedirectTo } }
                    : { phone, password, options: { channel, captchaToken, data: user_metadata, emailRedirectTo } }
            );
            if (error) throw new Error(error.message, { cause: error });
            return data;
        } catch (err) {
            this.signOut();
            throw err;
        }
    },

    async signInEmail({ email, password }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!email || !password) throw new Error('Email and Password are required.');
        try {
            const { data, error } = await this.publicInstance.auth.signInWithPassword({ email, password });
            if (error) throw new Error(error.message, { cause: error });
            return await this.refreshAuthUser(data?.session);
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    async signInPhone({ phone, password }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!phone || !password) throw new Error('Phone and Password are required.');
        try {
            const { data, error } = await this.publicInstance.auth.signInWithPassword({ phone, password });
            if (error) throw new Error(error.message, { cause: error });
            return await this.refreshAuthUser(data?.session);
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    async signInOIDC({ token, provider, access_token, nonce, captchaToken }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!token || !provider) throw new Error('Token and Provider are required.');
        try {
            const { data, error } = await this.publicInstance.auth.signInWithIdToken({
                token,
                provider,
                access_token,
                nonce,
                options: { captchaToken },
            });
            if (error) throw new Error(error.message, { cause: error });
            return await this.refreshAuthUser(data?.session);
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    async signInMagicLink({ email, redirectPage, captchaToken }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!email) throw new Error('Email is required.');
        const websiteId = wwLib.wwWebsiteData.getInfo().id;
        const emailRedirectTo = wwLib.manager
            ? `${window.location.origin}/${websiteId}/${redirectPage}`
            : `${window.location.origin}${wwLib.wwPageHelper.getPagePath(redirectPage)}`;

        const { data, error } = await this.publicInstance.auth.signInWithOtp({
            email,
            options: { emailRedirectTo, captchaToken },
        });
        if (error) throw new Error(error.message, { cause: error });
        return data;
    },
    async signInOTP({ type = 'phone', email, phone, channel, captchaToken, shouldCreateUser = true }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (type === 'email' && !email) throw new Error('Email is required.');
        else if (type === 'phone' && !phone) throw new Error('Phone is required.');

        try {
            const { data, error } = await this.publicInstance.auth.signInWithOtp(
                type === 'email'
                    ? { email, options: { captchaToken, shouldCreateUser } }
                    : { phone, options: { channel, captchaToken, shouldCreateUser } }
            );
            if (error) throw new Error(error.message, { cause: error });
            return data?.session ? await this.refreshAuthUser(data?.session) : data;
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    async signInProvider({ provider, redirectPage, queryParams, scopes, skipBrowserRedirect }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!provider) throw new Error('Provider is required.');
        const websiteId = wwLib.wwWebsiteData.getInfo().id;
        const redirectTo = wwLib.manager
            ? `${window.location.origin}/${websiteId}/${redirectPage}`
            : `${window.location.origin}${wwLib.wwPageHelper.getPagePath(redirectPage)}`;
        const { data, error } = await this.publicInstance.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo,
                scopes,
                queryParams: Array.isArray(queryParams)
                    ? queryParams.reduce((result, param) => ({ ...result, [param.key]: param.value }))
                    : queryParams,
                skipBrowserRedirect,
            },
        });
        if (error) throw new Error(error.message, { cause: error });
        return data;
    },
    async signInSSO({ domain, providerId }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!domain && !providerId) throw new Error('Domain or ProviderId is required.');

        try {
            const { data, error } = await supabase.auth.signInWithSSO(domain ? { domain } : { providerId });

            if (error) throw new Error(error.message, { cause: error });
            if (data?.url) {
                // redirect the user to the identity provider's authentication flow
                window.location.href = data.url;
            }
        } catch (err) {
            this.signOut();
            throw err;
        }
    },
    async verifyOTP({ type, email, phone, token, tokenHash }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        const isEmail = ['email', 'recovery', 'invite', 'email_change'].includes(type);
        const isPhone = ['sms', 'phone_change'].includes(type);
        if (isEmail && !email) throw new Error('Email is required.');
        else if (isPhone && !phone) throw new Error('Phone is required.');
        try {
            const {
                data: { session },
                error,
            } = await this.publicInstance.auth.verifyOtp({
                type,
                ...(isEmail ? { email } : null),
                ...(isPhone ? { phone } : null),
                ...(token ? { token } : null),
                ...(tokenHash ? { token_hash: tokenHash } : null),
            });
            if (error) throw new Error(error.message, { cause: error });
            return await this.refreshAuthUser(session);
        } catch (err) {
            this.signOut();
            throw err;
        }
    },

    async resendOTP({ type, email, phone, redirectPage }) {
        const isEmail = ['email', 'recovery', 'invite', 'email_change'].includes(type);
        const isPhone = ['sms', 'phone_change'].includes(type);
        if (isEmail && !email) throw new Error('Email is required.');
        else if (isPhone && !phone) throw new Error('Phone is required.');
        const websiteId = wwLib.wwWebsiteData.getInfo().id;
        const redirectTo = wwLib.manager
            ? `${window.location.origin}/${websiteId}/${redirectPage}`
            : `${window.location.origin}${wwLib.wwPageHelper.getPagePath(redirectPage)}`;
        const { data, error } = await this.publicInstance.auth.resend({
            type,
            ...(isEmail ? { email } : null),
            ...(isPhone ? { phone } : null),
            options: {
                emailRedirectTo: redirectTo,
            },
        });
        if (error) throw new Error(error.message, { cause: error });
        return data;
    },

    signOut() {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');

        wwLib.wwVariable.updateValue(`${this.id}-user`, null);
        wwLib.wwVariable.updateValue(`${this.id}-isAuthenticated`, false);
        const path = wwLib.manager ? '/' + wwLib.wwWebsiteData.getInfo().id : '/';
        window.vm.config.globalProperties.$cookie.removeCookie('sb-access-token', {
            path,
            domain: window.location.hostname,
        });
        window.vm.config.globalProperties.$cookie.removeCookie('sb-refresh-token', {
            path,
            domain: window.location.hostname,
        });
        // For safari
        window.vm.config.globalProperties.$cookie.removeCookie('sb-access-token', {
            path,
            domain: '.' + window.location.hostname,
        });
        window.vm.config.globalProperties.$cookie.removeCookie('sb-refresh-token', {
            path,
            domain: '.' + window.location.hostname,
        });
        this.publicInstance.auth.signOut();
    },
    // Ensure Retro compatibility for the workflow action fetchUser
    fetchUser() {
        return this.refreshAuthUser();
    },
    async refreshAuthUser(_session) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');

        const { data } = await this.publicInstance.auth.getSession();
        const session = _session || data.session;
        const user = session ? session.user : data.user;
        if (!user) {
            this.signOut();
            return false;
        }
        user.roles = await this.getUserRoles(user.id);
        user._session = {
            access_token: session.access_token,
            token_type: session.token_type,
            expires_in: session.expires_in,
            refresh_token: session.refresh_token,
        };
        wwLib.wwVariable.updateValue(`${this.id}-user`, user);
        wwLib.wwVariable.updateValue(`${this.id}-isAuthenticated`, true);
        setCookies(session);
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
    async updateUserMeta({ email, phone, metadata }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');

        const user_metadata = (metadata || []).reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {});

        const { data: result, error } = await this.publicInstance.auth.updateUser({
            email,
            phone,
            data: user_metadata,
        });
        if (error) throw new Error(error.message, { cause: error });
        return result;
    },
    async updateUserPassword({ oldPassword, newPassword }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!this.user) throw new Error('User not authenticated.');

        const { error: signInError } = await this.publicInstance.auth.signInWithPassword({
            ...(this.user.email ? { email: this.user.email } : this.user.phone ? { phone: this.user.phone } : null),
            password: oldPassword,
        });
        if (signInError) throw new Error(signInError.message, { cause: signInError });

        const { data: result, error } = await this.publicInstance.auth.updateUser({ password: newPassword });
        if (error) throw new Error(error.message, { cause: error });
        return result;
    },
    async resetPasswordForEmail({ email, redirectPage }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        const websiteId = wwLib.wwWebsiteData.getInfo().id;
        const redirectTo = wwLib.manager
            ? `${window.location.origin}/${websiteId}/${redirectPage}`
            : `${window.location.origin}${wwLib.wwPageHelper.getPagePath(redirectPage)}`;
        const { error } = await this.publicInstance.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw new Error(error.message, { cause: error });
    },
    async confirmPassword({ newPassword }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        const { data } = await this.publicInstance.auth.getSession();
        if (!data?.session?.access_token) throw new Error('No access token provided.');

        const { error } = await this.publicInstance.auth.updateUser({ password: newPassword });
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
    const { data } = await axios.get(`${url}/rest/v1/`, { headers: { apiKey } });
    return data;
};
/* wwEditor:end */

const setCookies = session => {
    const path = wwLib.manager ? '/' + wwLib.wwWebsiteData.getInfo().id : '/';
    window.vm.config.globalProperties.$cookie.setCookie('sb-access-token', session.access_token, {
        expire: session.expires_in,
        path,
        domain: window.location.hostname,
        secure: true,
        sameSite: 'Lax',
    });
    window.vm.config.globalProperties.$cookie.setCookie('sb-refresh-token', session.refresh_token, {
        expire: session.expires_in,
        path,
        domain: window.location.hostname,
        secure: true,
        sameSite: 'Lax',
    });
};
