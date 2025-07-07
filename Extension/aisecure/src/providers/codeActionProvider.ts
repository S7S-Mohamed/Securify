import * as vscode from 'vscode';
import { getFixFromAI } from '../api';

export function registerCodeActions(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            ['javascript', 'python'],
            {
                provideCodeActions(document, range, context) {
                    return context.diagnostics
                        .filter(diag => diag.source === 'secureCode')
                        .map(diag => {
                            const action = new vscode.CodeAction(
                                'Fix with AI',
                                vscode.CodeActionKind.QuickFix
                            );
                            action.command = {
                                command: 'secureCodeFixer.fixWithAI',
                                title: 'Fix with AI',
                                arguments: [document.uri, diag.range]
                            };
                            return action;
                        });
                }
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('secureCodeFixer.fixWithAI', 
            async (uri: vscode.Uri, range: vscode.Range) => {
            const document = await vscode.workspace.openTextDocument(uri);
            const code = document.getText(range);
            
            const fix = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating secure fix...'
            }, async () => {
                return await getFixFromAI(context, code, document.languageId);
            });

            if (fix) {
                const edit = new vscode.WorkspaceEdit();
                
                // Final cleanup of any markdown remnants
                const cleanFix = fix
                    .replace(/```[\s\S]*?\n/, '') // Remove opening ```
                    .replace(/\n```$/, '')        // Remove closing ```
                    .trim();

                edit.replace(uri, range, cleanFix);
                await vscode.workspace.applyEdit(edit);
            }
        })
    );
}