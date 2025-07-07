import * as vscode from 'vscode';
import { registerCodeActions } from './providers/codeActionProvider';
import { registerDiagnostics, registerConfigurePatternsCommand } from './diagnostics/diagnostics';
import { registerSetApiKeyCommand } from './api';

export function activate(context: vscode.ExtensionContext) {
    try {
        vscode.window.showInformationMessage('Secure Code Fixer is now active!');
        registerDiagnostics(context);
        registerCodeActions(context);
        registerSetApiKeyCommand(context);
        registerConfigurePatternsCommand(context); // Add command to configure patterns
    } catch (error) {
        const err = error as Error;
        vscode.window.showErrorMessage(`Error activating Secure Code Fixer: ${err.message}`);
    }
}

export function deactivate() {
    vscode.window.showInformationMessage('Secure Code Fixer is deactivated.');
    // Clean up any resources (e.g., event listeners, diagnostics)
    if (vscode.languages) {
        const diagnosticCollection = vscode.languages.createDiagnosticCollection('secureCode');
        if (diagnosticCollection) {
            diagnosticCollection.dispose();
        }
    }
}