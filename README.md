# vscode shell script file/dir intellisense

`code --install-extension qpwo.shell-filepath-intellisense`

vscode extension to tab-complete (intellisense) filenames in shell scripts. based on last 'cd' command before cursor.

![](shot2.png)

![](shot1.png)

![](shot3.png)

For example, if you are editing script.sh:

```sh
cd ~/git/vscode-shell-completions
cat R # hit tab here and see README.md etc
```

It is based on last cd command before the line where your cursor is.

Thats it.
