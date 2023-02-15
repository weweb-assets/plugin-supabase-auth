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
            /* wwEditor:end */
        },
        {
            name: 'Login with email',
            code: 'signInEmail',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInEmail.vue'),
            /* wwEditor:end */
        },
        {
            name: 'Login with magic link',
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
            name: 'Login with provider',
            code: 'signInProvider',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInProvider.vue'),
            getIsValid({ provider, redirectPage }) {
                return !!provider && !!redirectPage;
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
