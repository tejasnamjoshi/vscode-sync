"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, commands, Terminal, ExtensionContext } from "vscode";
import { backupExtensions, setBasePath } from "./helpers";
import { readList } from "./downloadSettings";
import { uploadData } from "./saveSettings";

// var request = require("request");
export const terminal: Terminal = window.createTerminal("vscode-sync");

function saveList(context: ExtensionContext) {
  backupExtensions();
  uploadData(context);
}

export function activate(context: ExtensionContext) {
  setBasePath();

  let disposable = commands.registerCommand(
    "extension.readExtensionsList",
    () => {
      readList(context);
    }
  );

  let disposable2 = commands.registerCommand(
    "extension.saveExtensionsList",
    () => {
      saveList(context);
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
}

export function deactivate() {}
