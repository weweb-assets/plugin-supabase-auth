export default {
    features: {
        auth: true,
    },
    editor: {
        settings: [
            {
                label: 'Connection',
                icon: 'advanced',
                edit: () => import('./src/components/Configuration/ConnectionEdit.vue'),
                summary: () => import('./src/components/Configuration/ConnectionSummary.vue'),
                getIsValid(settings) {
                    return !!settings.privateData.accessToken;
                },
                onSave: 'onSave',
            },
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
                onSave: 'onSave',
            },
            {
                label: 'Roles tables (optional)',
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
            getIsValid({ email, phone, password }) {
                return (!!email || !!phone) && !!password;
            },
            copilot: {
                description: "Creates a new user account with email/phone and password",
                returns: "object",
                schema: {
                    type: { type: "string", description: "Authentication type - email or phone", bindable: true },
                    email: { type: "string", description: "User's email address (required for email type)", bindable: true },
                    phone: { type: "string", description: "User's phone number (required for phone type)", bindable: true },
                    password: { type: "string", description: "User's password", bindable: true },
                    metadata: { type: "array", description: "Additional user metadata key-value pairs", bindable: true },
                    redirectPage: { type: "string", description: "Page ID to redirect after signup", bindable: true },
                    captchaToken: { type: "string", description: "Verification token from captcha", bindable: true }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Sign Out',
            code: 'signOut',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignOut.vue'),
            copilot: {
                description: "Signs out the current user",
                returns: "void"
            },
            /* wwEditor:end */
        },
        {
            name: 'Sign In | Email and Password',
            code: 'signInEmail',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInEmail.vue'),
            getIsValid({ email, password }) {
                return !!email && !!password;
            },
            copilot: {
                description: "Signs in a user using email and password",
                returns: "object",
                schema: {
                    email: { type: "string", description: "User's email address", bindable: true },
                    password: { type: "string", description: "User's password", bindable: true },
                    captchaToken: { type: "string", description: "Verification token from captcha", bindable: true }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Sign In | Phone and Password',
            code: 'signInPhone',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInPhone.vue'),
            getIsValid({ phone, password }) {
                return !!phone && !!password;
            },
            copilot: {
                description: "Signs in a user using phone number and password",
                returns: "object",
                schema: {
                    phone: { type: "string", description: "User's phone number", bindable: true },
                    password: { type: "string", description: "User's password", bindable: true },
                    captchaToken: { type: "string", description: "Verification token from captcha", bindable: true }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Sign In | OAuth Provider',
            code: 'signInProvider',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInProvider.vue'),
            getIsValid({ provider }) {
                return !!provider;
            },
            copilot: {
                description: "Signs in a user using an OAuth provider",
                returns: "object",
                schema: {
                    provider: { type: "string", description: "OAuth provider name", bindable: true },
                    redirectPage: { type: "string", description: "Page ID to redirect after signin", bindable: true },
                    queryParams: { type: "array", description: "Additional query parameters for OAuth URL", bindable: true },
                    scopes: { type: "string", description: "Space-separated OAuth scopes", bindable: true },
                    skipBrowserRedirect: { type: "boolean", description: "Skip automatic browser redirect", bindable: true }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Sign In | One-Time Password',
            code: 'signInOTP',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInOTP.vue'),
            getIsValid({ email, phone }) {
                return !!email || !!phone;
            },
            copilot: {
                description: "Signs in a user using a one-time password",
                returns: "object",
                schema: {
                    type: { type: "string", description: "Authentication type - email or phone", bindable: true },
                    email: { type: "string", description: "User's email address (for email type)", bindable: true },
                    phone: { type: "string", description: "User's phone number (for phone type)", bindable: true },
                    channel: { type: "string", description: "Delivery channel for OTP (sms/whatsapp)", bindable: true },
                    captchaToken: { type: "string", description: "Verification token from captcha", bindable: true },
                    shouldCreateUser: { type: "boolean", description: "Create new user if not exists", bindable: true }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Sign In | Magic Link',
            code: 'signInMagicLink',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInMagicLink.vue'),
            getIsValid({ email, redirectPage }) {
                return !!email && !!redirectPage;
            },
            copilot: {
                description: "Sends a magic link to user's email for passwordless signin",
                returns: "object",
                schema: {
                    email: { type: "string", description: "User's email address", bindable: true },
                    redirectPage: { type: "string", description: "Page ID to redirect after signin", bindable: true },
                    captchaToken: { type: "string", description: "Verification token from captcha", bindable: true }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Sign In | OIDC Token',
            code: 'signInOIDC',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInOIDC.vue'),
            getIsValid({ provider, token }) {
                return !!provider && !!token;
            },
            copilot: {
                description: "Signs in a user using an OIDC ID token",
                returns: "object",
                schema: {
                    token: { type: "string", description: "OIDC ID token", bindable: true },
                    provider: { type: "string", description: "OIDC provider name", bindable: true },
                    access_token: { type: "string", description: "Access token for token verification", bindable: true },
                    nonce: { type: "string", description: "Nonce used to obtain ID token", bindable: true },
                    captchaToken: { type: "string", description: "Verification token from captcha", bindable: true }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Sign In | SAML 2.0 SSO',
            code: 'signInSSO',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignInSSO.vue'),
            getIsValid({ domain, providerId }) {
                return !!domain || !!providerId;
            },
            copilot: {
                description: "Initiates SAML 2.0 SSO authentication flow",
                returns: "object",
                schema: {
                    domain: { type: "string", description: "Email domain for SSO provider", bindable: true },
                    providerId: { type: "string", description: "UUID of SSO provider", bindable: true }
                }
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
            copilot: {
                description: "Verifies a one-time password token",
                returns: "object",
                schema: {
                    type: { type: "string", description: "Type of OTP verification", bindable: true },
                    email: { type: "string", description: "User's email address", bindable: true },
                    phone: { type: "string", description: "User's phone number", bindable: true },
                    token: { type: "string", description: "OTP token to verify", bindable: true },
                    tokenHash: { type: "string", description: "Hash of the OTP token", bindable: true }
                }
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
            copilot: {
                description: "Resends a one-time password",
                returns: "object",
                schema: {
                    type: { type: "string", description: "Type of OTP to resend", bindable: true },
                    email: { type: "string", description: "User's email address", bindable: true },
                    phone: { type: "string", description: "User's phone number", bindable: true },
                    redirectPage: { type: "string", description: "Page ID to redirect for email verification", bindable: true }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Fetch User',
            code: 'fetchUser',
            /* wwEditor:start */
            copilot: {
                description: "Fetches the current user's data",
                returns: "object"
            },
            /* wwEditor:end */
        },
        {
            name: 'Update User',
            code: 'updateUserMeta',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/UpdateUser.vue'),
            copilot: {
                description: "Updates the current user's metadata",
                returns: "object",
                schema: {
                    email: { type: "string", description: "New email address", bindable: true },
                    phone: { type: "string", description: "New phone number", bindable: true },
                    metadata: { type: "array", description: "New metadata key-value pairs", bindable: true }
                }
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
            copilot: {
                description: "Changes the current user's password",
                returns: "object",
                schema: {
                    oldPassword: { type: "string", description: "Current password", bindable: true },
                    newPassword: { type: "string", description: "New password", bindable: true }
                }
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
            copilot: {
                description: "Sends a password reset email",
                returns: "void",
                schema: {
                    email: { type: "string", description: "User's email address", bindable: true },
                    redirectPage: { type: "string", description: "Page ID to redirect after reset", bindable: true }
                }
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
            copilot: {
                description: "Confirms a new password after reset",
                returns: "void",
                schema: {
                    newPassword: { type: "string", description: "New password to set", bindable: true }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Refresh session',
            code: 'refreshSession',
            isAsync: true,
            /* wwEditor:start */
            copilot: {
                description: "Refreshes the current authentication session",
                returns: "void"
            },
            /* wwEditor:end */
        },
    ],
};