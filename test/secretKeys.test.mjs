import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../src/wwPlugin.js', import.meta.url), 'utf8');
const USER = '11111111-1111-4111-8111-111111111111';
function fixture(privateApiKey = 'sb_secret_fixture') {
    const clients = [],
        requests = [],
        browserCalls = [];
    const config = { privateApiKey, publicApiKey: 'sb_publishable_fixture', projectUrl: 'https://fixture.supabase.co' };
    const compiled = source.replace(/^import\s[\s\S]*?;$/gm, '').replace('export default {', 'const plugin = {');
    const { plugin } = vm.runInNewContext(`${compiled}\n;({plugin})`, {
        getCurrentSupabaseSettings: () => config,
        resolveRuntimeProjectUrl: value => value.projectUrl,
        createClient: (_url, key) => {
            clients.push(key);
            return { auth: { onAuthStateChange() {}, admin: { listUsers: async () => ({ data: { users: [] } }) } } };
        },
        wwLib: {
            wwWebsiteData: { info: { id: 'qa-project' } },
            wwPlugins: {},
            wwLog: {
                error(error) {
                    throw error;
                },
            },
            wwNotification: { open() {} },
        },
        window: {},
        console: { warn() {} },
        axios: {
            get: async (...args) => {
                browserCalls.push(args);
                return { data: { paths: {} } };
            },
        },
    });
    plugin.requestAPI = async request => {
        requests.push(request);
        const data = request.path.endsWith('/schema')
            ? { paths: {} }
            : request.path.endsWith('/listUsers')
              ? [{ id: USER }]
              : [];
        return { data: { data } };
    };
    return { plugin, clients, requests, browserCalls };
}

test('creates only the public SDK instance with new keys and loads schema via the server', async () => {
    const { plugin, clients, requests, browserCalls } = fixture();
    await plugin.load('https://fixture.supabase.co', 'sb_publishable_fixture', 'sb_secret_fixture');
    assert.deepEqual(clients, ['sb_publishable_fixture']);
    assert.equal(plugin.privateInstance, null);
    assert.equal(requests[0].path, '/legacy/supabaseAuth/schema');
    assert.equal(browserCalls.length, 0);
    assert.equal(typeof plugin._adminGetUsers, 'function');
});

test('preserves the private SDK and direct schema request for a legacy key', async () => {
    const { plugin, clients, requests, browserCalls } = fixture('legacy-jwt');
    await plugin.load('http://localhost:54321', 'sb_publishable_fixture', 'legacy-jwt');
    assert.deepEqual(clients, ['legacy-jwt', 'sb_publishable_fixture']);
    assert.equal(browserCalls.length, 1);
    assert.equal(requests.length, 0);
    await plugin._adminGetUsers();
    assert.equal(requests.length, 0);
});

const cases = [
    ['_adminGetUsers', [], 'listUsers'],
    ['_adminGetUserRoles', [USER], 'getUserRoles'],
    ['_adminCreateUser', [{ email: 'qa@example.test', name: 'QA', attributes: [], password: 'fixture' }], 'createUser'],
    ['_adminUpdateUser', [{ id: USER }, { email: 'qa@example.test', name: 'QA', attributes: [] }], 'updateUser'],
    ['_adminUpdateUserPassword', [{ id: USER }, 'fixture'], 'updatePassword'],
    ['_adminUpdateUserRoles', [{ id: USER }, [{ id: 2 }]], 'updateUserRoles'],
    ['_adminDeleteUser', [{ id: USER }], 'deleteUser'],
    ['_adminGetRoles', [], 'listRoles'],
    ['_adminCreateRole', ['reader'], 'createRole'],
    ['_adminUpdateRole', [2, 'reader'], 'updateRole'],
    ['_adminDeleteRole', [2], 'deleteRole'],
];
for (const [method, args, operation] of cases)
    test(`routes ${method} through the allowlisted server operation`, async () => {
        const { plugin, requests } = fixture();
        plugin.switchAdmin(true);
        await plugin[method](...args);
        assert.equal(requests[0].path, `/legacy/auth/admin/${operation}`);
        assert.equal(requests[0].method, 'POST');
        assert.equal(requests[0].headers['X-WeWeb-Editor-Request'], '1');
        assert.equal(JSON.stringify(requests).includes('sb_secret_'), false);
        if (method === '_adminGetUsers') assert.equal(requests[1].path, '/legacy/auth/admin/getUserRoles');
    });

test('removes server proxy helpers and secret SDK initialization from the published plugin', () => {
    const published = source.replace(/\/\* wwEditor:start \*\/[\s\S]*?\/\* wwEditor:end \*\//g, '');
    assert.equal(published.includes('async requestLegacyAdmin('), false);
    assert.equal(published.includes("path: '/legacy/supabaseAuth/schema'"), false);
    assert.equal(published.includes('createClient(runtimeProjectUrl, effectivePrivateKey)'), false);
    assert.equal(published.includes('this.publicInstance = createClient'), true);
});
