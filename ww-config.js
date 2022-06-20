export default {
    editor: {
        settings: [
            {
                label: 'Configuration',
                icon: 'advanced',
                edit: () => import('./src/components/Configuration/SettingsEdit.vue'),
                summary: () => import('./src/components/Configuration/SettingsSummary.vue'),
                getIsValid(settings) {
                    return !!settings.publicData.projectUrl && !!settings.publicData.apiKey && !!settings.privateData.apiKey;
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
            isAsync: true,
        },
        // {
        //     name: 'Update User Profile',
        //     code: 'updateUserProfile',
        //     isAsync: true,
        //     /* wwEditor:start */
        //     edit: () => import('./src/components/Functions/UpdateUserProfile.vue'),
        //     getIsValid({ email }) {
        //         return !!email;
        //     },
        //     /* wwEditor:end */
        // },
        // {
        //     name: 'Change Password',
        //     code: 'changePassword',
        //     isAsync: true,
        //     /* wwEditor:start */
        //     edit: () => import('./src/components/Functions/ChangePassword.vue'),
        //     getIsValid({ newPassword }) {
        //         return !!newPassword;
        //     },
        //     /* wwEditor:end */
        // },
        // {
        //     name: 'Forgot Password',
        //     code: 'forgotPassword',
        //     isAsync: true,
        //     /* wwEditor:start */
        //     edit: () => import('./src/components/Functions/ForgotPassword.vue'),
        //     getIsValid({ email }) {
        //         return email;
        //     },
        //     /* wwEditor:end */
        // },
        // {
        //     name: 'Confirm Password',
        //     code: 'confirmPassword',
        //     isAsync: true,
        //     /* wwEditor:start */
        //     edit: () => import('./src/components/Functions/ConfirmPassword.vue'),
        //     getIsValid({ newPassword }) {
        //         return !!newPassword;
        //     },
        //     /* wwEditor:end */
        // },
    ],
};
