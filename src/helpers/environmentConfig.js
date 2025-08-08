/**
 * Gets the configuration for a specific environment with fallback support
 * @param {Object} settings - Plugin settings
 * @param {string} requestedEnv - The environment to get config for ('production', 'staging', 'editor')
 * @returns {Object|null} - Environment configuration or null
 */
export function getEnvironmentConfig(settings, requestedEnv = 'production') {
    const envPriority = {
        'editor': ['editor', 'staging', 'production'],
        'staging': ['staging', 'production'],
        'production': ['production']
    };
    
    const fallbackChain = envPriority[requestedEnv] || ['production'];
    
    // Try new multi-environment format first
    if (settings?.publicData?.environments) {
        for (const env of fallbackChain) {
            if (settings.publicData.environments[env]) {
                return {
                    publicData: settings.publicData.environments[env],
                    privateData: settings.privateData?.environments?.[env] || {}
                };
            }
        }
    }
    
    // Fallback to legacy format (acts as production)
    if (settings?.publicData?.projectUrl) {
        return {
            publicData: {
                projectUrl: settings.publicData.projectUrl,
                apiKey: settings.publicData.apiKey,
                customDomain: settings.publicData.customDomain
            },
            privateData: {
                connectionMode: settings.privateData?.connectionMode,
                accessToken: settings.privateData?.accessToken,
                refreshToken: settings.privateData?.refreshToken,
                apiKey: settings.privateData?.apiKey,
                databasePassword: settings.privateData?.databasePassword,
                connectionString: settings.privateData?.connectionString
            }
        };
    }
    
    return null;
}

/**
 * Detects the current WeWeb environment
 * @returns {string} - 'production', 'staging', or 'editor'
 */
export function getCurrentEnvironment() {
    // In the editor
    if (window.location.hostname === 'editor.weweb.io' || 
        window.location.hostname === 'editor-staging.weweb.io' ||
        window.location.hostname.includes('localhost')) {
        return 'editor';
    }
    
    // Check for staging indicators
    if (window.location.hostname.includes('-staging') ||
        window.location.hostname.includes('weweb-preview.io')) {
        return 'staging';
    }
    
    // Default to production
    return 'production';
}

/**
 * Checks if an environment is configured
 * @param {Object} settings - Plugin settings
 * @param {string} env - Environment to check
 * @returns {boolean}
 */
export function isEnvironmentConfigured(settings, env) {
    if (!settings?.publicData?.environments?.[env]) {
        return false;
    }
    
    const envConfig = settings.publicData.environments[env];
    return !!(envConfig.projectUrl && envConfig.apiKey);
}

/**
 * Gets all configured environments
 * @param {Object} settings - Plugin settings
 * @returns {Array<string>} - Array of configured environment names
 */
export function getConfiguredEnvironments(settings) {
    const environments = [];
    
    // Check new format
    if (settings?.publicData?.environments) {
        for (const env of ['production', 'staging', 'editor']) {
            if (isEnvironmentConfigured(settings, env)) {
                environments.push(env);
            }
        }
    }
    // Check legacy format (counts as production)
    else if (settings?.publicData?.projectUrl && settings?.publicData?.apiKey) {
        environments.push('production');
    }
    
    return environments;
}