import * as vscode from 'vscode';
import * as esprima from 'esprima'; // For JavaScript AST analysis

const diagnosticCollection = vscode.languages.createDiagnosticCollection('secureCode');

// Define insecure patterns for different languages (default, user-configurable)
const defaultInsecurePatterns: { [language: string]: RegExp[] } = {
    javascript: [
        // --- Dynamic Code Execution ---
        /eval\(/g,           // Unsafe eval() usage
        /setTimeout\s*\(\s*['"`](.*?)\s*['"`]/g, // setTimeout/setInterval with string arguments
        /setInterval\s*\(\s*['"`](.*?)\s*['"`]/g, // setInterval with string arguments
        /new\s+Function\(/g, // Using new Function()
        
        // --- Cross-Site Scripting (XSS) ---
        /document\.write\(/g, // Potential XSS with document.write()
        /innerHTML\s*=/g,    // Potential XSS with innerHTML. Sanitize user input.
        /outerHTML\s*=/g,    // Potential XSS with outerHTML. Sanitize user input.
        /insertAdjacentHTML\(/g, // Potential XSS
        /location\.href\s*=\s*['"`]?javascript:/g, // JavaScript URI injection
        /history\.pushState\([^,]*?,[^,]*?,.*?['"`]?javascript:/g, // PushState JavaScript URI injection
        
        // --- Command Injection (Node.js specific) ---
        /child_process\.execSync\(/g, // Synchronous command execution
        /child_process\.exec\(/g,    // Asynchronous command execution
        /child_process\.spawnSync\(/g, // Synchronous process spawning
        /child_process\.spawn\(/g,   // Asynchronous process spawning
        /child_process\.fork\(/g,    // Forking processes
        
        // --- Unsafe Deserialization ---
        // Example for a specific library (less common now but pattern based)
        // /node-serialize\.unserialize\(/g, 

        // --- Directory Traversal / File System Access ---
        // Direct path manipulation or sensitive file operations
        /fs\.readFileSync\(/g,  // Reading files - potential path traversal if path is user-controlled
        /fs\.writeFileSync\(/g, // Writing files - potential path traversal
        /fs\.appendFileSync\(/g, // Appending to files - potential path traversal
        /fs\.unlinkSync\(/g,   // Deleting files synchronously
        /fs\.rmSync\(/g,       // Removing files/directories synchronously (newer Node.js)
        /path\.join\([^)]*?['"]\.\.\//g, // Using '..' in path.join (Node.js)
        
        // --- Prototype Pollution (basic regex detection) ---
        /Object\.prototype\.__proto__\s*=/g, // Direct __proto__ assignment
        /Object\.assign\(\s*\{\},\s*.*?\s*,\s*.*?__proto__\s*:\s*.*?\)/g, // Object.assign with __proto__
        /merge\(\s*\{\},\s*.*?\s*,\s*.*?__proto__\s*:\s*.*?\)/g, // Common merge function with __proto__
        
        // --- Insecure Cryptography / Hashing ---
        /crypto\.createHash\(['"]md5['"]\)/g, // MD5 (weak hashing algorithm)
        /crypto\.createHash\(['"]sha1['"]\)/g, // SHA1 (weak hashing algorithm)
        /crypto\.createDecipher\(/g, // Deprecated/insecure crypto (Node.js)
        /crypto\.createDecipheriv\(/g, // Deprecated/insecure crypto (Node.js)
        
        // --- Regex Injection (if regex is built from user input) ---
        /new\s+RegExp\(.*?,.*?user_input/g, // Simplified, hard to catch with just regex

    ],
    python: [
        // --- SQL Injection ---
        /f"(SELECT|INSERT|UPDATE|DELETE).*?\{.*?\}"/gi, // Unsafe SQL interpolation (f-string)
        /('%s'|'\?').*?%\s*\(.*?\)/g, // Unsafe SQL interpolation (old-style % formatting)
        /\.execute\(\s*f".*?\{.*?\}"/g, // Unsafe SQL interpolation in cursor.execute (f-string)
        /\.execute\(\s*['"].*?(['"]\s*\+\s*.*?['"]\s*\+)/g, // String concatenation in execute
        
        // --- Command Injection ---
        /os\.system\(/g,         // Command injection risk with os.system
        /subprocess\.run\([^,]*?shell=True/g, // subprocess.run with shell=True
        /subprocess\.call\(/g,   // subprocess.call
        /subprocess\.check_call\(/g, // subprocess.check_call
        /subprocess\.getoutput\(/g, // subprocess.getoutput
        /subprocess\.getstatusoutput\(/g, // subprocess.getstatusoutput
        
        // --- Unsafe Deserialization ---
        /pickle\.load\(/g,       // Unsafe pickle deserialization
        /pickle\.loads\(/g,      // Unsafe pickle deserialization
        /yaml\.load\(/g,         // Unsafe YAML deserialization (without safe_load)
        /jsonpickle\.decode\(/g, // Unsafe jsonpickle deserialization
        
        // --- Dynamic Evaluation ---
        /eval\(/g,               // Unsafe eval() usage
        /exec\(/g,               // Unsafe exec() usage
        
        // --- Directory Traversal / File Operations ---
        /open\([^,]*?\s*(['"]w|['"]a|['"]x|['"]w\+|['"]a\+|['"]x\+)/g, // Open file in write/append/exclusive mode (potential overwrite/creation)
        /os\.path\.join\([^)]*?\.\.\//g, // Directory traversal using os.path.join
        /\.\.\/\.\.\//g,         // Common directory traversal pattern in string literals
        /shutil\.rmtree\(/g,     // Deleting directory trees
        /os\.remove\(/g,         // Deleting files
        /os\.unlink\(/g,         // Deleting files (alias for os.remove)
        /os\.rename\(/g,         // Renaming/moving files (potential path traversal)
        /os\.system\(['"].*?\.py['"]\)/g, // Arbitrary script execution (e.g., via dynamic import)
        /send_from_directory\([^,]*?,.*?request\.args\.get/g, // Flask send_from_directory with unsanitized input
        
        // --- Insecure Direct Object Reference (IDOR) ---
        // These are very generic and prone to false positives, as IDOR needs data flow analysis.
        // They catch direct use of common ID names from request objects.
        /(id|user_id|account_id|doc_id)\s*=\s*(request\.(args|form|json)\.get|request\.args|request\.form|request\.json)/g,
        /\.get_object\(\s*['"]id['"]\s*=\s*.*?request\.(args|form|json)\.get/g, // Common ORM pattern

        // --- XML External Entity (XXE) Injection ---
        /xml\.etree\.ElementTree\.parse\(/g, // Potential XXE if DTD processing enabled
        /xml\.dom\.minidom\.parse\(/g,     // Potential XXE if DTD processing enabled
        /lxml\.etree\.parse\(/g,         // Potential XXE if parser not configured safely
        
        // --- Regex Injection (simple example) ---
        /re\.compile\(.*?user_input/g, // Simplified, hard to catch with just regex
    ]
};

// Load user-configured patterns from settings
function getInsecurePatterns(language: string): RegExp[] {
    const config = vscode.workspace.getConfiguration('secureCodeFixer');
    const userPatternStrings = config.get<string[]>(`insecurePatterns.${language}`, []);
    // Convert string patterns to RegExp objects
    const userPatterns = userPatternStrings ? userPatternStrings.map(pattern => {
        try {
            return new RegExp(pattern, 'g');
        } catch (e) {
            vscode.window.showErrorMessage(`Invalid regex pattern: ${pattern}. Using default patterns instead.`);
            return null;
        }
    }).filter((pattern): pattern is RegExp => pattern !== null) : []; // Filter out nulls in case of invalid regex.

    return [...(defaultInsecurePatterns[language] || []), ...userPatterns]; // Ensure it handles undefined language
}

export function registerDiagnostics(context: vscode.ExtensionContext) {
    let debounceTimeout: NodeJS.Timeout | undefined;

    const analyze = (document: vscode.TextDocument) => {
        const language = document.languageId;
        if (!['javascript', 'python'].includes(language)) {
            // Clear diagnostics for unsupported languages
            diagnosticCollection.set(document.uri, []);
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();

        if (language === 'javascript') {
            try {
                const ast = esprima.parseScript(text, { tolerant: true, loc: true });
                // Check for eval() in AST
                findEval(ast, document, diagnostics);

                // Also use pattern matching for other insecure patterns
                const patterns = getInsecurePatterns(language);
                findPatterns(text, document, patterns, diagnostics);
            } catch (error) {
                const err = error as Error;
                // Only show parsing error if it's not due to an empty or malformed file
                if (text.trim().length > 0) {
                    vscode.window.showErrorMessage(`Secure Code Fixer: Failed to parse JavaScript: ${err.message}`);
                }
            }
        } else if (language === 'python') {
            try {
                // Use pattern matching for Python until we have proper AST parser integration
                const patterns = getInsecurePatterns(language);
                findPatterns(text, document, patterns, diagnostics);
            } catch (error) {
                const err = error as Error;
                // Only show parsing error if it's not due to an empty or malformed file
                if (text.trim().length > 0) {
                     vscode.window.showErrorMessage(`Secure Code Fixer: Failed to process Python: ${err.message}`);
                }
            }
        }

        diagnosticCollection.set(document.uri, diagnostics);
    };

    // Helper function to recursively find eval() in AST
    function findEval(node: any, document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]) {
        if (!node) return;

        // Check if the node is an eval call
        if (node.type === 'CallExpression' &&
            node.callee &&
            node.callee.type === 'Identifier' &&
            node.callee.name === 'eval') {

            const startPos = new vscode.Position(
                (node.loc?.start?.line ?? 1) - 1,
                node.loc?.start?.column ?? 0
            );
            const endPos = new vscode.Position(
                (node.loc?.end?.line ?? 1) - 1,
                node.loc?.end?.column ?? 0
            );
            const range = new vscode.Range(startPos, endPos);

            const diagnostic = new vscode.Diagnostic(
                range,
                'Insecure eval() detected',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.source = 'secureCode'; // Add source for code action filtering
            diagnostics.push(diagnostic);
        }

        // Recursively process all properties
        for (const key in node) {
            if (typeof node[key] === 'object' && node[key] !== null) {
                findEval(node[key], document, diagnostics);
            } else if (Array.isArray(node[key])) {
                node[key].forEach((item: any) => findEval(item, document, diagnostics));
            }
        }
    }

    // Helper function to find patterns using regex
    function findPatterns(
        text: string,
        document: vscode.TextDocument,
        patterns: RegExp[],
        diagnostics: vscode.Diagnostic[]
    ) {
        patterns.forEach(pattern => {
            pattern.lastIndex = 0; // Reset the regex
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);

                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Insecure pattern detected: ${match[0]}`,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.source = 'secureCode'; // Add source for code action filtering
                diagnostics.push(diagnostic);
            }
        });
    }

    // Subscribe to document changes with debouncing
    const changeListener = vscode.workspace.onDidChangeTextDocument(event => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(() => analyze(event.document), 500);
    });

    // Subscribe to document open
    const openListener = vscode.workspace.onDidOpenTextDocument(analyze);

    // Initial check for open documents
    vscode.workspace.textDocuments.forEach(analyze);

    // Register the event listeners with the extension context
    context.subscriptions.push(changeListener, openListener, diagnosticCollection);
}

/**
 * Registers a command to configure insecure patterns via settings UI.
 */
export function registerConfigurePatternsCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('secureCodeFixer.configurePatterns', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'secureCodeFixer.insecurePatterns');
        })
    );
}