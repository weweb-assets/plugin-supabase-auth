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
            name: 'Login',
            code: 'signIn',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignIn.vue'),
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
            getIsValid({ email }) {
                return email;
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
