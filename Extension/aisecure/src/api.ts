import * as vscode from 'vscode';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getFixFromAI(
    context: vscode.ExtensionContext,
    code: string,
    language: string
): Promise<string | null> {
    try {
        const apiKey = await context.secrets.get('secureCodeFixer.apiKey');
        if (!apiKey) {
            vscode.window.showErrorMessage('Google API key not configured');
            return null;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Modified prompt to get code-only responses
        const prompt = `Fix security vulnerabilities in this ${language} code. 
            Return ONLY the corrected code in a markdown code block. 
            No explanations. No text before/after code block.

            Vulnerable Code:
            \`\`\`${language}
            ${code}
            \`\`\`
            
            Fixed Code:`;

        const result = await model.generateContent(prompt);
        const fullResponse = await result.response.text();

        // Extract code block from markdown response
        const codeBlockRegex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\\n\`\`\``);
        const match = fullResponse.match(codeBlockRegex);

        return match ? match[1].trim() : null;

    } catch (error) {
        const err = error as Error;
        vscode.window.showErrorMessage(`AI Fix Failed: ${err.message}`);
        return null;
    }
}

export function registerSetApiKeyCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('secureCodeFixer.setApiKey', async () => {
            const apiKey = await vscode.window.showInputBox({
                prompt: 'Enter your Google AI Studio API key',
                placeHolder: 'AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                password: true,
                ignoreFocusOut: true,
                validateInput: value => {
                    if (!value?.trim()) return 'API key cannot be empty';
                    if (!/^AIzaSy[A-Za-z0-9-_]{33}$/.test(value)) return 'Invalid Google API key format';
                    return null;
                }
            });

            if (apiKey) {
                await context.secrets.store('secureCodeFixer.apiKey', apiKey);
                vscode.window.showInformationMessage('🔒 Google API key stored securely');
            }
        })
    );
}