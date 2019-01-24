import { window, workspace, ExtensionContext } from "vscode";
import { terminal } from "./extension";

export const BASE_STORAGE_PATH = __dirname.replace(/\\/g, "/") + "/";

export function getPassword() {
  const options = {
    placeHolder: "Enter Password",
    password: true,
    ignoreFocusOut: true
  };

  return window.showInputBox(options);
}

export function getUserName() {
  const options = {
    placeHolder: "Enter Username",
    ignoreFocusOut: true
  };

  return window.showInputBox(options);
}

export function getSnippetId() {
  const options = {
    placeHolder: "Enter Encoded Snippet Id",
    ignoreFocusOut: true
  };

  return window.showInputBox(options);
}

/**
 * Backups the extensions in extensions.list file
 */
export function backupExtensions() {
  terminal.sendText(
    "code --list-extensions > " + BASE_STORAGE_PATH + "extensions.list"
  );
}

/**
 * Install extensions from extensions.list file
 */
export function installExtensions(docPath: string) {
  workspace.openTextDocument(docPath).then(
    document => {
      let text: string = document.getText();
      let extensions: string[] = text.split("\n");
      delete extensions[extensions.length - 1]; // Remove last element which is ""

      extensions.map((extension: string) => {
        console.log("Installing --- " + extension);
        terminal.sendText("code --install-extension " + extension);
      });

      // commands.executeCommand("workbench.action.reloadWindow");
    },
    error => console.log(error)
  );
}

export function saveState(context: ExtensionContext, key: string, value: any) {
  context.workspaceState.update(key, value);
}
