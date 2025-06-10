import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function activate(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerCompletionItemProvider(
        'shellscript',
        {
            async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const lineText = document.lineAt(position.line).text;
                const textBeforeCursor = lineText.substring(0, position.character);
                const words = textBeforeCursor.split(/\s+/);
                const currentWord = words.pop() || '';

                const cwd = findCwd(document, position);
                const partialPath = currentWord.startsWith('~') ? path.join(os.homedir(), currentWord.substring(1)) : currentWord;
                const targetPath = path.resolve(cwd, partialPath);

                let dirToList = targetPath;
                let isPathItself = false;

                try {
                    const stats = await fs.promises.stat(dirToList);
                    if (stats.isDirectory()) {
                        isPathItself = true;
                    } else {
                        dirToList = path.dirname(dirToList);
                    }
                } catch (e) {
                    dirToList = path.dirname(dirToList);
                }

                try {
                    const entries = await fs.promises.readdir(dirToList, { withFileTypes: true });
                    const prefix = isPathItself ? '' : path.basename(currentWord);

                    return entries.filter(e => e.name.startsWith(prefix)).map(entry => {
                        const kind = entry.isDirectory() ? vscode.CompletionItemKind.Folder : vscode.CompletionItemKind.File;
                        let completion = entry.name;
                        const item = new vscode.CompletionItem(completion, kind);

                        if (entry.isDirectory()) {
                            item.insertText = completion + '/';
                        } else {
                            item.insertText = completion;
                        }

                        item.sortText = (entry.isDirectory() ? 'a_' : 'b_') + entry.name;
                        return item;
                    });
                } catch (err) {
                    return [];
                }
            }
        },
        ' ', '/', '~'
    );

    context.subscriptions.push(provider);
}
function findCwd(document: vscode.TextDocument, position: vscode.Position): string {
    const textBefore = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    const lines = textBefore.split('\n');
    const cdPaths: string[] = [];

    const cdPattern = /^\s*cd\s+((~|\.\.?|[\/\w.-]+)(?:[\/\w.-]+)*|"[^"]+"|\'[^\']+\')/;
    for (const line of lines) {
        const match = line.match(cdPattern);
        if (match?.[1]) {
            let p = match[1].trim();
            if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
                p = p.substring(1, p.length - 1);
            }
            cdPaths.push(p);
        }
    }

    let currentPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || os.homedir();

    for (const cdPath of cdPaths) {
        const expandedPath = cdPath.startsWith('~') ? path.join(os.homedir(), cdPath.substring(1)) : cdPath;
        if (path.isAbsolute(expandedPath)) {
            currentPath = expandedPath;
        } else {
            currentPath = path.resolve(currentPath, expandedPath);
        }
    }

    return currentPath;
}
export function deactivate() {}
