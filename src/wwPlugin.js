/* wwEditor:start */
import './components/Configuration/ConnectionEdit.vue';
import './components/Configuration/ConnectionSummary.vue';
import './components/Configuration/SettingsEdit.vue';
import './components/Configuration/SettingsSummary.vue';
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
import { getCurrentSupabaseSettings, resolveRuntimeProjectUrl } from './helpers/environmentConfig';

export default {
    privateInstance: null,
    publicInstance: null,
    /* wwEditor:start */
    doc: null,
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Plugin API
    \================================================================================================*/
    async _onLoad(settings) {
        const config = getCurrentSupabaseSettings('supabaseAuth');

        /* wwFront:start */
        await this.load(config.projectUrl, config.publicApiKey);
        /* wwFront:end */
        /* wwEditor:start */
        if (wwLib.editor?.isolatedCanvas) {
            await this.load(config.projectUrl, config.publicApiKey);
            return;
        }
        // check oauth in local storage
        const isConnecting = window.localStorage.getItem('supabaseAuth_oauth');
        // get code params from url
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (isConnecting && code) {
            window.localStorage.removeItem('supabaseAuth_oauth');
            await wwAxios.post(
                `${wwLib.wwApiRequests._getPluginsUrl()}/designs/${
                    (wwLib.wwWebsiteData.info || {}).id
                }/supabase/connect`,
                { code, redirectUri: wwLib.wwApiRequests._getPluginsUrl() + '/supabase/redirect' }
            );
            wwLib.wwNotification.open({ text: 'Your supabase account has been linked.', color: 'green' });
            wwLib.$emit('wwTopBar:open', 'WEBSITE_PLUGINS');
            wwLib.$emit('wwTopBar:plugins:setPlugin', wwLib.wwPlugins.supabaseAuth.id);
        }
        await this.load(config.projectUrl, config.publicApiKey, config.privateApiKey);
        /* wwEditor:end */
    },
    async _initAuth() {
        await this.refreshAuthUser();
    },
    _getUserRoles() {
        return this.user?.roles || [];
    },
    _matchRoles(roles) {
        return roles.every(role => this.user?.roles?.map(({ id }) => id).includes(role));
    },
    /*=============================================m_ÔÔ_m=============================================\
        Auth API
    \================================================================================================*/
    /* wwEditor:start */
    onPreviewSettingsChanged() {
        window.location.reload();
    },
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
        return this.publicInstance?.supabaseUrl.split('https://')[1].split('.')[0];
    },
    switchAdmin(isEnabled) {
        if (isEnabled) Object.assign(this, adminFunctions);
        else {
            for (const key in adminFunctions) {
                if (this.hasOwnProperty(key)) delete this[key];
            }
            this._adminGetUsers =
                'Please add your service role key in the supabase auth plugin configuration to manage users here.';
            this._adminGetRoles =
                'Please add your service role key in the supabase auth plugin configuration to manage roles here.';
        }
    },
    async requestAPI({ method, path, data, params, signal, headers }) {
        // Get current environment and send it explicitly
        const config = getCurrentSupabaseSettings('supabaseAuth');
        const currentEnv = config.environment; // 'editor', 'staging', or 'production'

        return await wwAxios({
            method,
            url: `${wwLib.wwApiRequests._getPluginsUrl()}/designs/${
                (wwLib.wwWebsiteData.info || {}).id
            }/supabase${path}`,
            data,
            params: {
                ...params,
                wwEnv: currentEnv, // Send environment explicitly
            },
            headers,
            signal, // Support AbortController signal
        });
    },
    async requestLegacyAdmin(operation, input = {}) {
        try {
            const { data } = await this.requestAPI({
                method: 'POST',
                path: `/legacy/auth/admin/${operation}`,
                data: input,
                headers: { 'X-WeWeb-Editor-Request': '1' },
            });
            return data.data;
        } catch (error) {
            const message = error.response?.data?.message;
            if (typeof message === 'string' && message) {
                // Admin callers pass Error.message to notifications that render HTML. Provider explanations are text.
                const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
                throw new Error(message.replace(/[&<>"']/g, character => entities[character]));
            }
            throw error;
        }
    },
    async syncSettings(settings) {
        await this.requestAPI({
            method: 'POST',
            path: '/sync',
            data: { source: 'supabaseAuth', settings },
        });
    },
    // driver: core, roles
    async install(driver = 'core') {
        await this.requestAPI({
            method: 'POST',
            path: '/install',
            data: { driver },
        });
    },
    getCurrentSupabaseSettings(pluginName = 'supabaseAuth') {
        return getCurrentSupabaseSettings(pluginName);
    },
    async onSave(settings) {
        await this.syncSettings(settings);
        if (settings.privateData.accessToken && settings.publicData.projectUrl) {
            await this.install();
        }
        const config = getCurrentSupabaseSettings('supabaseAuth');
        const runtimeProjectUrl = resolveRuntimeProjectUrl(config);
        await this.load(runtimeProjectUrl, config.publicApiKey, config.privateApiKey);
    },
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Supabase Auth API
    \================================================================================================*/
    async load(projectUrl, publicApiKey, privateApiKey = null) {
        try {
            const config = getCurrentSupabaseSettings('supabaseAuth');
            const runtimeProjectUrl = resolveRuntimeProjectUrl(config) || projectUrl;
            const effectivePublicKey = config?.publicApiKey || publicApiKey;
            if (!runtimeProjectUrl || !effectivePublicKey) return;

            /* wwEditor:start */
            // Projects still using the previous editor configure their administrator client here.
            if (!wwLib.editor?.isolatedCanvas) {
                const effectivePrivateKey = config?.privateApiKey || privateApiKey;
                this.privateInstance =
                    effectivePrivateKey && !effectivePrivateKey.startsWith('sb_secret_')
                        ? createClient(runtimeProjectUrl, effectivePrivateKey)
                        : null;
                this.switchAdmin(!!effectivePrivateKey);
            }
            /* wwEditor:end */

            let auth = { storageKey: wwLib.wwWebsiteData.info.id };
            /* wwEditor:start */
            if (wwLib.editor?.isolatedCanvas) {
                auth = await wwLib.editor.supabasePreviewAuth(
                    runtimeProjectUrl,
                    effectivePublicKey,
                    config.resolvedEnvironment,
                    true
                );
            }
            /* wwEditor:end */
            const client = createClient(runtimeProjectUrl, effectivePublicKey, { auth });
            this.authRevision = (this.authRevision || 0) + 1;
            this.publicInstance = client;

            // The same public instance must be shared between supabase and supabase auth
            if (wwLib.wwPlugins.supabase) wwLib.wwPlugins.supabase.syncInstance();
            /* wwEditor:start */
            if (!wwLib.editor?.isolatedCanvas) await this.fetchDoc();
            /* wwEditor:end */
            if (!this.privateInstance && !this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
            client.auth.onAuthStateChange((event, session) => {
                if (client !== this.publicInstance) return;
                if (event === 'SIGNED_IN' && session?.user?.id !== this.authSubject) {
                    this.authRevision++;
                    this.authSubject = session?.user?.id;
                }
                if (event === 'SIGNED_OUT' || event === 'USER_DELETED') return clearLocalUser(this);
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
            let emailRedirectTo;
            /* wwEditor:start */
            if (type === 'email' && wwLib.editor?.isolatedCanvas) emailRedirectTo = previewEmailReturn(redirectPage);
            /* wwEditor:end */
            if (!emailRedirectTo && redirectPage) emailRedirectTo = appReturnUrl(redirectPage);

            const { data, error } = await this.publicInstance.auth.signUp(
                type === 'email'
                    ? { email, password, options: { captchaToken, data: user_metadata, emailRedirectTo } }
                    : { phone, password, options: { channel, captchaToken, data: user_metadata, emailRedirectTo } }
            );
            if (error) throw new Error(error.message, { cause: error });
            return data;
        } catch (err) {
            wwLib.wwLog.error(err);
            throw err;
        }
    },

    async signInEmail({ email, password, captchaToken }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!email || !password) throw new Error('Email and Password are required.');
        try {
            const { data, error } = await this.publicInstance.auth.signInWithPassword({
                email,
                password,
                options: { captchaToken },
            });
            if (error) throw new Error(error.message, { cause: error });
            return await this.refreshAuthUser(data?.session);
        } catch (err) {
            wwLib.wwLog.error(err);
            throw err;
        }
    },
    async signInPhone({ phone, password, captchaToken }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!phone || !password) throw new Error('Phone and Password are required.');
        try {
            const { data, error } = await this.publicInstance.auth.signInWithPassword({
                phone,
                password,
                options: { captchaToken },
            });
            if (error) throw new Error(error.message, { cause: error });
            return await this.refreshAuthUser(data?.session);
        } catch (err) {
            wwLib.wwLog.error(err);
            throw err;
        }
    },
    async signInOIDC({ token, provider, access_token, accessToken, nonce, captchaToken }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!token || !provider) throw new Error('Token and Provider are required.');
        try {
            const { data, error } = await this.publicInstance.auth.signInWithIdToken({
                token,
                provider,
                access_token: access_token ?? accessToken,
                nonce,
                options: { captchaToken },
            });
            if (error) throw new Error(error.message, { cause: error });
            return await this.refreshAuthUser(data?.session);
        } catch (err) {
            wwLib.wwLog.error(err);
            throw err;
        }
    },
    async signInMagicLink({ email, redirectPage, captchaToken }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!email) throw new Error('Email is required.');
        const emailRedirectTo = appReturnUrl(redirectPage, true);

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
            let emailRedirectTo;
            /* wwEditor:start */
            // A numeric code can be verified inside the embedded canvas. Email links
            // can return only to the top-level preview that owns the PKCE verifier.
            if (type === 'email' && wwLib.editor?.isolatedCanvas) {
                emailRedirectTo =
                    window.parent === window
                        ? previewEmailReturn()
                        : new URL('/auth/preview/signin', window.location.origin).href;
            }
            /* wwEditor:end */
            const { data, error } = await this.publicInstance.auth.signInWithOtp(
                type === 'email'
                    ? { email, options: { captchaToken, shouldCreateUser, emailRedirectTo } }
                    : { phone, options: { channel, captchaToken, shouldCreateUser } }
            );
            if (error) throw new Error(error.message, { cause: error });
            return data?.session ? await this.refreshAuthUser(data?.session) : data;
        } catch (err) {
            wwLib.wwLog.error(err);
            throw err;
        }
    },
    async signInProvider({ provider, redirectPage, queryParams, scopes, skipBrowserRedirect }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!provider) throw new Error('Provider is required.');
        const redirectTo = appReturnUrl(redirectPage);
        try {
            const { data, error } = await this.publicInstance.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo,
                    scopes,
                    queryParams: Array.isArray(queryParams)
                        ? Object.fromEntries(queryParams.map(param => [param.key, param.value]))
                        : queryParams,
                    skipBrowserRedirect,
                },
            });
            if (error) throw new Error(error.message, { cause: error });
            return data;
        } catch (err) {
            wwLib.wwLog.error(err);
            throw err;
        }
    },
    async signInSSO({ domain, providerId }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        if (!domain && !providerId) throw new Error('Domain or ProviderId is required.');

        try {
            const input = domain ? { domain } : { providerId };
            /* wwEditor:start */
            if (wwLib.editor?.isolatedCanvas) input.options = { redirectTo: appReturnUrl() };
            /* wwEditor:end */
            const { data, error } = await this.publicInstance.auth.signInWithSSO(input);

            if (error) throw new Error(error.message, { cause: error });
            if (data?.url) {
                // redirect the user to the identity provider's authentication flow
                window.location.href = data.url;
            }
        } catch (err) {
            wwLib.wwLog.error(err);
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
            wwLib.wwLog.error(err);
            throw err;
        }
    },

    async resendOTP({ type, email, phone, redirectPage }) {
        const isEmail = ['signup', 'email_change'].includes(type);
        const isPhone = ['sms', 'phone_change'].includes(type);
        if (isEmail && !email) throw new Error('Email is required.');
        else if (isPhone && !phone) throw new Error('Phone is required.');
        const redirectTo = appReturnUrl(redirectPage, isEmail);
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

    async signOut() {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');

        const client = this.publicInstance;
        this.authRevision = (this.authRevision || 0) + 1;
        const revision = this.authRevision;
        const { error } = await client.auth.signOut();
        if (error) throw new Error(error.message, { cause: error });
        if (client === this.publicInstance && this.authRevision === revision) clearLocalUser(this);
    },
    // Ensure Retro compatibility for the workflow action fetchUser
    fetchUser() {
        return this.refreshAuthUser();
    },
    async refreshAuthUser(_session) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');

        const client = this.publicInstance;
        const revision = this.authRevision;
        const { data } = await client.auth.getSession();
        if (client !== this.publicInstance || revision !== this.authRevision) return false;
        const session = data.session;
        if (_session && _session.user?.id !== session?.user?.id) return false;
        const user = session?.user;
        const currentUser = wwLib.wwVariable.getValue(`${this.id}-user`);
        if (!user) {
            clearLocalUser(this);
            return false;
        }
        const roles = await this.getUserRoles(user.id);
        if (client !== this.publicInstance || revision !== this.authRevision) return false;
        const { data: current } = await client.auth.getSession();
        if (client !== this.publicInstance || revision !== this.authRevision || current.session?.user?.id !== user.id)
            return false;
        const latest = current.session;
        return publishSession(this, latest, currentUser, roles);
    },
    async getUserRoles(userId) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        const roles = this.settings.publicData.userRoleTable
            ? (
                  await this.publicInstance
                      .from(this.settings.publicData.userRoleTable)
                      .select(`role:${this.settings.publicData.userRoleTableRoleColumn || 'roleId'}(*)`)
                      .eq(this.settings.publicData.userRoleTableUserColumn || 'userId', userId)
              ).data.map(({ role }) => role)
            : [];
        return roles;
    },
    async updateUserMeta({ email, phone, metadata }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');

        const user_metadata = (metadata || []).reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {});

        let options;
        /* wwEditor:start */
        if (email && wwLib.editor?.isolatedCanvas) options = { emailRedirectTo: previewEmailReturn() };
        /* wwEditor:end */
        const { data: result, error } = await this.publicInstance.auth.updateUser(
            { email, phone, data: user_metadata },
            options
        );
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

        const { data: result, error } = await this.publicInstance.auth.updateUser({
            password: newPassword,
            current_password: oldPassword,
        });
        if (error) throw new Error(error.message, { cause: error });
        return result;
    },
    async resetPasswordForEmail({ email, redirectPage }) {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        const redirectTo = appReturnUrl(redirectPage, true);
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
    async refreshSession() {
        if (!this.publicInstance) throw new Error('Invalid Supabase Auth configuration.');
        const client = this.publicInstance;
        const revision = this.authRevision;
        const { data, error } = await client.auth.refreshSession();
        if (error) throw new Error(error.message, { cause: error });
        if (client !== this.publicInstance || revision !== this.authRevision || !data.session?.user) return;
        const currentUser = wwLib.wwVariable.getValue(`${this.id}-user`);
        if (currentUser?.id === data.session.user.id) {
            publishSession(this, data.session, currentUser, currentUser.roles);
        } else {
            await this.refreshAuthUser(data.session);
        }
    },
    /* wwEditor:start */
    async fetchDoc() {
        const config = getCurrentSupabaseSettings('supabaseAuth');
        const runtimeProjectUrl = resolveRuntimeProjectUrl(config);
        const logContext = {
            env: config.environment,
            resolvedEnv: config.resolvedEnvironment,
            projectUrl: config.projectUrl,
            runtimeProjectUrl,
            projectRef: config.projectRef,
            baseProjectRef: config.baseProjectRef,
            branch: config.branch,
            branchSlug: config.branchSlug,
            hasPrivateApiKey: !!config.privateApiKey,
        };
        if (!runtimeProjectUrl || !config.privateApiKey) {
            if (config.publicApiKey && !config.privateApiKey) {
                if (window.userflow) window.userflow.start('ed437bfc-3661-4604-86e5-b8baf5367da8');
            }
            console.warn('[Supabase auth plugin] fetchDoc skipped', {
                reason: 'Missing projectUrl or privateApiKey',
                ...logContext,
            });
            return;
        }

        if (config.privateApiKey.startsWith('sb_secret_')) {
            const { data } = await this.requestAPI({ method: 'GET', path: '/legacy/supabaseAuth/schema' });
            this.doc = data.data;
            return;
        }

        try {
            try {
                const doc = await getDoc(runtimeProjectUrl, config.privateApiKey, {
                    branchSlug: config.branchSlug,
                });
                this.doc = doc;
            } catch (error) {
                if (config.publicApiKey) {
                    const doc = await getDoc(runtimeProjectUrl, config.publicApiKey, {
                        branchSlug: config.branchSlug,
                    });
                    this.doc = doc;
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.warn('[Supabase auth plugin] fetchDoc failed', {
                projectUrl: runtimeProjectUrl,
                status: error?.response?.status,
                message: error?.message,
                responseError: error?.response?.data?.message,
            });
            throw error;
        }
    },
    /* wwEditor:end */
};

/* wwEditor:start */
const getDoc = async (url, apiKey, { branchSlug } = {}) => {
    try {
        const headers = {
            apikey: apiKey,
            Authorization: `Bearer ${apiKey}`,
        };
        const { data } = await axios.get(`${url}/rest/v1/`, { headers });
        return data;
    } catch (error) {
        console.warn('[Supabase auth plugin] fetchDoc request error', {
            url,
            status: error?.response?.status,
            message: error?.message,
            responseError: error?.response?.data?.message,
        });
        throw error;
    }
};
/* wwEditor:end */

/* wwEditor:start */
function previewEmailReturn(page) {
    return wwLib.editor.previewEmailReturn(page || wwLib.store.websiteData.page.id);
}
/* wwEditor:end */

function appReturnUrl(page, email = false) {
    /* wwEditor:start */
    if (wwLib.editor?.isolatedCanvas) {
        if (email) return previewEmailReturn(page);
        return wwLib.editor.previewPageUrl(page || wwLib.store.websiteData.page.id);
    }
    /* wwEditor:end */
    return wwLib.manager
        ? `${window.location.origin}/${page}`
        : `${window.location.origin}${wwLib.wwPageHelper.getPagePath(page)}`;
}

function publishSession(plugin, session, previous, roles) {
    const sameUser = previous?.id === session.user.id ? previous : undefined;
    const user = {
        ...session.user,
        roles,
        _session: {
            access_token: session.access_token,
            expires_in: session.expires_in,
            expires_at: session.expires_at,
            provider_token: session.provider_token || sameUser?._session?.provider_token,
            refresh_token: session.refresh_token,
            token_type: session.token_type,
        },
    };
    plugin.user = user;
    plugin.isAuthenticated = true;
    setCookies(session);
    return user;
}

function clearLocalUser(plugin) {
    plugin.authRevision = (plugin.authRevision || 0) + 1;
    plugin.authSubject = null;
    plugin.user = null;
    plugin.isAuthenticated = false;
    /* wwEditor:start */
    if (wwLib.editor?.isolatedCanvas) return;
    /* wwEditor:end */
    const path = wwLib.manager ? '/' + wwLib.wwWebsiteData.info.id : '/';
    // Older Safari versions stored the cookies with a leading dot.
    for (const domain of [window.location.hostname, '.' + window.location.hostname]) {
        for (const name of ['sb-access-token', 'sb-refresh-token']) {
            window.vm.config.globalProperties.$cookie.removeCookie(name, { path, domain });
        }
    }
}

const setCookies = session => {
    /* wwEditor:start */
    // Published page access checks consume these cookies. Isolated preview uses the tab's SDK session.
    if (wwLib.editor?.isolatedCanvas) return;
    /* wwEditor:end */
    const path = wwLib.manager ? '/' + wwLib.wwWebsiteData.info.id : '/';
    window.vm.config.globalProperties.$cookie.setCookie('sb-access-token', session.access_token, {
        expire: session.expires_in,
        path,
        domain: window.location.hostname,
        secure: true,
        sameSite: 'Lax',
    });
    window.vm.config.globalProperties.$cookie.setCookie('sb-refresh-token', session.refresh_token, {
        expire: '1y',
        path,
        domain: window.location.hostname,
        secure: true,
        sameSite: 'Lax',
    });
};

/* wwEditor:start */
const adminFunctions = {
    async _adminGetUsers() {
        if (getCurrentSupabaseSettings('supabaseAuth').privateApiKey?.startsWith('sb_secret_'))
            return this.requestLegacyAdmin('listUsersWithRoles');
        if (!this.privateInstance) throw new Error('Invalid Supabase Auth configuration.');
        const response = await this.privateInstance.auth.admin.listUsers({
            page: 1,
            perPage: 10000,
        });
        if (response.error) throw new Error(response.error.message, { cause: response.error });
        return await Promise.all(
            response.data.users.map(async user => ({
                ...user.user_metadata,
                ...user,
                enabled: true,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
                roles: await this._adminGetUserRoles(user.id),
            }))
        );
    },
    async _adminGetUserRoles(userId) {
        if (getCurrentSupabaseSettings('supabaseAuth').privateApiKey?.startsWith('sb_secret_'))
            return this.requestLegacyAdmin('getUserRoles', { userId });
        if (!this.privateInstance) throw new Error('Invalid Supabase Auth configuration.');
        const roles = this.settings.publicData.userRoleTable
            ? (
                  await this.privateInstance
                      .from(this.settings.publicData.userRoleTable)
                      .select(`role:${this.settings.publicData.userRoleTableRoleColumn || 'roleId'}(*)`)
                      .eq(this.settings.publicData.userRoleTableUserColumn || 'userId', userId)
              ).data.map(({ role }) => role)
            : [];
        return roles;
    },
    async _adminCreateUser(data) {
        if (getCurrentSupabaseSettings('supabaseAuth').privateApiKey?.startsWith('sb_secret_'))
            return this.requestLegacyAdmin('createUser', data);
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
            ...response.data?.user?.user_metadata,
            ...response.data?.user,
            enabled: true,
            createdAt: response.data.created_at,
            updatedAt: response.data.updated_at,
            roles: [],
        };
    },
    async _adminUpdateUser(user, data) {
        if (getCurrentSupabaseSettings('supabaseAuth').privateApiKey?.startsWith('sb_secret_'))
            return this.requestLegacyAdmin('updateUser', { ...data, userId: user.id });
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
            ...response.data.user.user_metadata,
            ...response.data.user,
            enabled: true,
            createdAt: response.data.user.created_at,
            updatedAt: response.data.user.updated_at,
        };
    },
    async _adminUpdateUserPassword(user, password) {
        if (getCurrentSupabaseSettings('supabaseAuth').privateApiKey?.startsWith('sb_secret_'))
            return this.requestLegacyAdmin('updatePassword', { userId: user.id, password });
        const { error } = await this.privateInstance.auth.admin.updateUserById(user.id, {
            password: password,
        });
        if (error) throw new Error(error.message, { cause: error });
    },
    async _adminUpdateUserRoles(user, roles) {
        if (getCurrentSupabaseSettings('supabaseAuth').privateApiKey?.startsWith('sb_secret_'))
            return this.requestLegacyAdmin('updateUserRoles', { userId: user.id, roles });
        if (!this.settings.publicData.roleTable) {
            const text = 'No valid User Role table defined in Supabase Auth plugin configuration.';
            wwLib.wwNotification.open({ text, color: 'red' });
            throw new Error(text);
        }
        const response = await this.privateInstance
            .from(this.settings.publicData.userRoleTable)
            .delete()
            .match({ [this.settings.publicData.userRoleTableUserColumn || 'userId']: user.id });
        if (response.error) throw new Error(response.error.message, { cause: response.error });
        for (const role of roles) {
            const { error } = await this.privateInstance.from(this.settings.publicData.userRoleTable).insert({
                [this.settings.publicData.userRoleTableRoleColumn || 'roleId']: role.id,
                [this.settings.publicData.userRoleTableUserColumn || 'userId']: user.id,
            });
            if (error) throw new Error(error.message, { cause: error });
        }
    },
    async _adminDeleteUser(user) {
        if (getCurrentSupabaseSettings('supabaseAuth').privateApiKey?.startsWith('sb_secret_'))
            return this.requestLegacyAdmin('deleteUser', { userId: user.id });
        const { error } = await this.privateInstance.auth.admin.deleteUser(user.id);
        if (error) throw new Error(error.message, { cause: error });
    },
    /* Roles */
    async _adminGetRoles() {
        if (getCurrentSupabaseSettings('supabaseAuth').privateApiKey?.startsWith('sb_secret_'))
            return this.requestLegacyAdmin('listRoles');
        if (!this.settings.publicData.roleTable) return [];
        const { data: roles, error } = await this.privateInstance.from(this.settings.publicData.roleTable).select();
        if (error) throw new Error(error.message, { cause: error });
        return roles.map(role => ({
            ...role,
            name: role[this.settings.publicData.roleTableNameColumn || 'name'],
            createdAt: role.created_at,
        }));
    },
    async _adminCreateRole(name) {
        if (getCurrentSupabaseSettings('supabaseAuth').privateApiKey?.startsWith('sb_secret_'))
            return this.requestLegacyAdmin('createRole', { name });
        if (!this.settings.publicData.roleTable) {
            const text = 'No valid Role table defined in Supabase Auth plugin configuration.';
            wwLib.wwNotification.open({ text, color: 'red' });
            throw new Error(text);
        }
        const { data: roles, error } = await this.privateInstance
            .from(this.settings.publicData.roleTable)
            .insert([{ [this.settings.publicData.roleTableNameColumn || 'name']: name }])
            .select();
        if (error) throw new Error(error.message, { cause: error });
        return {
            ...roles[0],
            name: roles[0][this.settings.publicData.roleTableNameColumn || 'name'],
            createdAt: roles[0].created_at,
        };
    },
    async _adminUpdateRole(roleId, name) {
        if (getCurrentSupabaseSettings('supabaseAuth').privateApiKey?.startsWith('sb_secret_'))
            return this.requestLegacyAdmin('updateRole', { roleId, name });
        const { data: roles, error } = await this.privateInstance
            .from(this.settings.publicData.roleTable)
            .update({ name })
            .match({ id: roleId })
            .select();
        if (error) throw new Error(error.message, { cause: error });
        return {
            ...roles[0],
            name: roles[0][this.settings.publicData.roleTableNameColumn || 'name'],
            createdAt: roles[0].created_at,
        };
    },
    async _adminDeleteRole(roleId) {
        if (getCurrentSupabaseSettings('supabaseAuth').privateApiKey?.startsWith('sb_secret_'))
            return this.requestLegacyAdmin('deleteRole', { roleId });
        const { error } = await this.privateInstance
            .from(this.settings.publicData.roleTable)
            .delete()
            .match({ id: roleId });
        if (error) throw new Error(error.message, { cause: error });
    },
};
/* wwEditor:end */
