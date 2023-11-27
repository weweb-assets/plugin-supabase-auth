export default {
    editor: {
        settings: [
            {
                label: 'Configuration',
                icon: 'advanced',
                edit: () => import('./src/components/Configuration/SettingsEdit.vue'),
                summary: () => import('./src/components/Configuration/SettingsSummary.vue'),
                getIsValid(settings) {
                    return (
                        !!settings.publicData.projectUrl &&
                        !!settings.publicData.apiKey &&
                        !!settings.privateData.apiKey
                    );
                },
            },
            {
                label: 'Define redirections (URLs)',
                icon: 'open-out',
                edit: () => import('./src/components/Redirections/SettingsEdit.vue'),
                summary: () => import('./src/components/Redirections/SettingsSummary.vue'),
                getIsValid(settings) {
                    const { afterNotSignInPageId } = settings.publicData;
                    return !!afterNotSignInPageId;
                },
            },
            {
                label: 'Roles tables',
                icon: 'data',
                edit: () => import('./src/components/RoleTable/SettingsEdit.vue'),
                summary: () => import('./src/components/RoleTable/SettingsSummary.vue'),
                getIsValid() {
                    return true;
                },
            },
        ],
        designSystemId: '290de5c1-a7fb-49a7-88bb-6acd08576c07',
    },
    variables: [
        { name: 'user', value: 'user', type: 'object', defaultValue: null },
        { name: 'isAuthenticated', value: 'isAuthenticated', type: 'boolean', defaultValue: false },
    ],
    actions: [
        {
            name: 'Sign Up',
            code: 'signUp',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignUp.vue'),
            getIsValid({ provider, token }) {
                return !!provider && !!token;
            },
            /* wwEditor:end */
        },
        {
            name: 'Sign Out',
            code: 'signOut',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignOut.vue'),
            /* wwEditor:end */
        },
        {
            name: 'Login with Email and Password',
            code: 'signInEmail',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInEmail.vue'),
            getIsValid({ email, password }) {
                return !!email && !!password;
            },
            /* wwEditor:end */
        },
        {
            name: 'Login with Phone and Password',
            code: 'signInPhone',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInPhone.vue'),
            getIsValid({ phone, passowrd }) {
                return !!phone && !!passowrd;
            },
            /* wwEditor:end */
        },
        {
            name: 'Login with OAuth Provider',
            code: 'signInProvider',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInProvider.vue'),
            getIsValid({ provider }) {
                return !!provider;
            },
            /* wwEditor:end */
        },
        {
            name: 'Login with One-Time Password',
            code: 'signInOTP',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInOTP.vue'),
            getIsValid({ email, redirectPage }) {
                return !!phone && !!redirectPage;
            },
            /* wwEditor:end */
        },
        {
            name: 'Login with Magic Link',
            code: 'signInMagicLink',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInMagicLink.vue'),
            getIsValid({ email, redirectPage }) {
                return !!email && !!redirectPage;
            },
            /* wwEditor:end */
        },
        {
            name: 'Login with OIDC Token',
            code: 'signInOIDC',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInOIDC.vue'),
            getIsValid({ provider, token }) {
                return !!provider && !!token;
            },
            /* wwEditor:end */
        },
        {
            name: 'Login with Enterprise SSO',
            code: 'signInSSO',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInSSO.vue'),
            getIsValid({ domain, providerId }) {
                return !!domain || !!providerId;
            },
            /* wwEditor:end */
        },
        {
            name: 'Verify OTP',
            code: 'verifyOTP',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/VerifyOTP.vue'),
            getIsValid({ type, email, phone, token, tokenHash }) {
                return !!type && (!!email || !!phone) && (!!token || !!tokenHash);
            },
            /* wwEditor:end */
        },
        {
            name: 'Resend OTP',
            code: 'resendOTP',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/ResendOTP.vue'),
            getIsValid({ type, email, phone }) {
                return !!type && (!!email || !!phone);
            },
            /* wwEditor:end */
        },
        {
            name: 'Logout',
            code: 'signOut',
        },
        {
            name: 'Fetch User',
            code: 'fetchUser',
        },
        {
            name: 'Update User Metadata',
            code: 'updateUserMeta',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/UpdateUserMeta.vue'),
            getIsValid({ email }) {
                return !!email;
            },
            /* wwEditor:end */
        },
        {
            name: 'Change Password',
            code: 'updateUserPassword',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/ChangePassword.vue'),
            getIsValid({ oldPassword, newPassword }) {
                return !!oldPassword && !!newPassword;
            },
            /* wwEditor:end */
        },
        {
            name: 'Forgot Password',
            code: 'resetPasswordForEmail',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/ForgotPassword.vue'),
            getIsValid({ email, redirectPage }) {
                return !!email && !!redirectPage;
            },
            /* wwEditor:end */
        },
        {
            name: 'Confirm Password',
            code: 'confirmPassword',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/ConfirmPassword.vue'),
            getIsValid({ newPassword }) {
                return !!newPassword;
            },
            /* wwEditor:end */
        },
    ],
};
