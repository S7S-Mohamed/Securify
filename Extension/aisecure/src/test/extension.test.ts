import assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { getFixFromAI, registerSetApiKeyCommand } from '../api';
import { registerDiagnostics, registerConfigurePatternsCommand } from '../diagnostics/diagnostics';
import { registerCodeActions } from '../providers/codeActionProvider';
import 'mocha';
import axios from 'axios';

suite('Secure Code Fixer Extension Test Suite', () => {
    let sandbox: sinon.SinonSandbox;
    let mockContext: vscode.ExtensionContext;

    suiteSetup(async () => {
        sandbox = sinon.createSandbox();
        mockContext = {
            secrets: {
                get: async () => 'test-key',
                store: async () => {},
                delete: async () => {},
                onDidChange: new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event
            },
            subscriptions: [],
            workspaceState: { get: () => undefined, update: () => Promise.resolve(), keys: () => [] },
            globalState: { 
                get: () => undefined, 
                update: () => Promise.resolve(), 
                keys: () => [],
                setKeysForSync: () => {}
            } as vscode.Memento,
        } as unknown as vscode.ExtensionContext;
    });

    suiteTeardown(() => sandbox.restore());

    test('getFixFromAI returns valid fix', async () => {
        sandbox.stub(axios, 'post').resolves({ data: { candidates: [{
            content: { parts: [{ text: 'safeCode();' }] }
        }]}});
        
        const fix = await getFixFromAI(mockContext, 'eval("test")', 'javascript');
        assert.strictEqual(fix, 'safeCode();');
    });
});