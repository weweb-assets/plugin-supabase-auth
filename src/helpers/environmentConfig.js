/**
 * Gets the current Supabase settings for the active environment
 * Automatically detects the environment and returns the appropriate configuration
 * with intelligent fallback based on what's configured:
 * - If only production is configured: all environments use production
 * - If production + staging: editor uses staging, staging uses staging, production uses production
 * - If production + editor: editor uses editor, staging uses production, production uses production
 * - If all three: each uses its own configuration
 * 
 * @param {string} [pluginName='supabaseAuth'] - The plugin to get settings for ('supabase' or 'supabaseAuth')
 * @returns {Object} - Object with projectUrl, publicApiKey, privateApiKey, and other settings
 */
export function getCurrentSupabaseSettings(pluginName = 'supabaseAuth') {
    // Get the plugin settings
    const plugin = wwLib.wwPlugins[pluginName];
    if (!plugin?.settings) {
        return { 
            projectUrl: null, 
            publicApiKey: null, 
            privateApiKey: null,
            customDomain: null,
            environment: getCurrentEnvironment()
        };
    }
    
    const settings = plugin.settings;
    const currentEnv = getCurrentEnvironment();
    
    // Try new multi-environment format first
    if (settings?.publicData?.environments) {
        const envs = settings.publicData.environments;
        
        // Check which environments are configured
        const hasProduction = !!(envs.production?.projectUrl && envs.production?.apiKey);
        const hasStaging = !!(envs.staging?.projectUrl && envs.staging?.apiKey);
        const hasEditor = !!(envs.editor?.projectUrl && envs.editor?.apiKey);
        
        // Determine which environment config to use based on what's available
        let targetEnv = null;
        
        if (currentEnv === 'production') {
            // Production always uses production (if configured)
            if (hasProduction) targetEnv = 'production';
        } else if (currentEnv === 'staging') {
            // Staging prefers staging, falls back to production
            if (hasStaging) targetEnv = 'staging';
            else if (hasProduction) targetEnv = 'production';
        } else if (currentEnv === 'editor') {
            // Editor prefers editor, then staging, then production
            if (hasEditor) targetEnv = 'editor';
            else if (hasStaging) targetEnv = 'staging';
            else if (hasProduction) targetEnv = 'production';
        }
        
        // Return the configuration for the target environment
        if (targetEnv) {
            const envConfig = envs[targetEnv];
            const privateEnvConfig = settings.privateData?.environments?.[targetEnv];
            
            // Single OAuth across environments: use global tokens only
            const connectionMode = settings.privateData?.connectionMode || privateEnvConfig?.connectionMode || null;
            
            const inferredProjectRef =
                envConfig.projectUrl?.replace('https://', '').replace('.supabase.co', '') || envConfig.baseProjectRef || null;

            return {
                projectUrl: envConfig.customDomain || envConfig.projectUrl,
                projectRef: inferredProjectRef,
                baseProjectRef:
                    envConfig.baseProjectRef ||
                    inferredProjectRef ||
                    settings?.publicData?.projectUrl?.replace('https://', '').replace('.supabase.co', '') ||
                    null,
                branch: envConfig.branch || null,
                branchSlug: envConfig.branchSlug || null,
                publicApiKey: envConfig.apiKey,
                privateApiKey: privateEnvConfig?.apiKey || null,
                customDomain: envConfig.customDomain || null,
                connectionMode: connectionMode,
                accessToken: settings.privateData?.accessToken || null,
                refreshToken: settings.privateData?.refreshToken || null,
                databasePassword: privateEnvConfig?.databasePassword || null,
                connectionString: privateEnvConfig?.connectionString || null,
                environment: currentEnv,
                resolvedEnvironment: targetEnv // The actual environment config being used after fallback
            };
        }
    }
    
    // Fallback to legacy format (acts as production for all environments)
    if (settings?.publicData?.projectUrl && settings?.publicData?.apiKey) {
        const url = settings.publicData.projectUrl;
        const projectRef = url?.replace('https://', '').replace('.supabase.co', '') || null;
        return {
            projectUrl: settings.publicData.customDomain || url,
            projectRef,
            baseProjectRef: projectRef,
            branch: null,
            branchSlug: null,
            publicApiKey: settings.publicData.apiKey,
            privateApiKey: settings.privateData?.apiKey || null,
            customDomain: settings.publicData.customDomain || null,
            connectionMode: settings.privateData?.connectionMode || null,
            accessToken: settings.privateData?.accessToken || null,
            refreshToken: settings.privateData?.refreshToken || null,
            databasePassword: settings.privateData?.databasePassword || null,
            connectionString: settings.privateData?.connectionString || null,
            environment: currentEnv,
            resolvedEnvironment: 'production' // Legacy format is treated as production
        };
    }

    // No configuration found
    return { 
        projectUrl: null, 
        projectRef: null,
        baseProjectRef: null,
        branch: null,
        branchSlug: null,
        publicApiKey: null, 
        privateApiKey: null,
        customDomain: null,
        environment: currentEnv,
        resolvedEnvironment: null
    };
}

/**
 * Detects the current WeWeb environment
 * @returns {string} - 'production', 'staging', or 'editor'
 */
export function getCurrentEnvironment() {
    // Use WeWeb's official environment detection
    const env = wwLib.getEnvironment();
    
    // Map WeWeb's environment values to our three-environment model
    // 'preview' refers to apps hosted on weweb-preview.io (WeWeb's default hosting)
    // These are production apps without custom domains, so we map to 'production'
    if (env === 'editor') return 'editor';
    if (env === 'staging') return 'staging';
    // 'preview' and 'production' both map to production
    return 'production';
}

export function resolveRuntimeProjectUrl(config) {
    if (!config) return null;
    if (config.customDomain) return config.customDomain;
    if (config.branch) return `https://${config.branch}.supabase.co`;
    if (config.projectUrl) return config.projectUrl;
    if (config.projectRef) return `https://${config.projectRef}.supabase.co`;
    return null;
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
