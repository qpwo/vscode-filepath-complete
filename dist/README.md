# VSCode Shell Completions

A Visual Studio Code extension that provides tab-completion (IntelliSense) for file and directory paths in shell scripts (`.sh`).

## How It Works

The extension determines the current working directory for completions by searching upwards from your cursor's position for the last `cd` command. All subsequent path completions will be relative to that directory.

For example, in a file `script.sh`:

# Completions here will be from the workspace root (or home dir)
ls D # -> Documents/

cd ~/Projects/my-project

# Completions from here on will be inside ~/Projects/my-project
cat s # -> src/
cat src/m # -> src/main.js

If no `cd` command is found above the cursor, the extension defaults to using the path of the current workspace folder. If no workspace is open, it falls back to the user's home directory.
