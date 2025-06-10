#!/usr/bin/env bash
set -exuo pipefail

echo "Compiling extension..."
pnpm install # Ensure devDependencies like typescript are installed
pnpm run compile

echo "Packaging extension..."
# Use npx to run vsce from the project root
# --no-dependencies skips running 'npm install' which is what we want
npx --yes @vscode/vsce package --no-dependencies
VSIX_PATH=$(find . -maxdepth 1 -name "*.vsix" | head -n 1)
if [ -z "$VSIX_PATH" ]; then
    echo "Error: .vsix file not found in root directory."
    exit 1
fi
echo "Packaged to $VSIX_PATH"

echo "Uninstalling old version..."
code --uninstall-extension qpwo.vscode-shell-completions --force || echo "Old version not found, continuing..."

echo "Installing new version..."
code --install-extension "$VSIX_PATH" --force

echo "Setting up test directory..."
TMPDIR="/tmp/vsc-test-$(date +%s)"
mkdir -p "$TMPDIR/project/src"
touch "$TMPDIR/project/src/main.js"
touch "$TMPDIR/project/README.md"
touch "$TMPDIR/other_file.txt"

cat > "$TMPDIR/test.sh" << EOF
#!/bin/bash
# Test file for shell completions

# Completions should be from $TMPDIR
ls o # should suggest other_file.txt
ls p # should suggest project/

cd project

# Completions should be from $TMPDIR/project
ls s # should suggest src/
ls R # should suggest README.md

cd src

# Completions should be from $TMPDIR/project/src
cat m # should suggest main.js

cd ../.. # back to $TMPDIR

# Completions should be from $TMPDIR again
ls p # should suggest project/
EOF

echo "Test setup complete. Opening VS Code in $TMPDIR"
echo "Check completions in test.sh"
code "$TMPDIR"
# Cleanup vsix file
rm "$VSIX_PATH"
