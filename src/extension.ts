"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  window,
  workspace,
  commands,
  Terminal,
  ExtensionContext
} from "vscode";
var https = require("https");
// var request = require("request");

let username: string | undefined, password: string | undefined;

function authenticate() {
  const usernamePromise = getUserName();

  usernamePromise.then(
    (value: string | undefined) => {
      username = value;
      const passwordPromise = getPassword();
      passwordPromise.then((value: string | undefined) => {
        password = value;
        readSnippet();
      });
    },
    error => console.log(error)
  );
}

function getPassword() {
  const options = {
    placeHolder: "Enter Password",
    password: true
  };

  return window.showInputBox(options);
}

function getUserName() {
  const options = {
    placeHolder: "Enter Username"
  };

  return window.showInputBox(options);
}

function readSnippet() {
  var base64encodedData = new Buffer(username + ":" + password).toString(
    "base64"
  );

  var options = {
    host: "api.bitbucket.org",
    port: 443,
    path: "/2.0/snippets/" + username + "/KeajAb",
    method: "GET",
    headers: {
      Authorization: "Basic " + base64encodedData,
      "Content-Type": "application/json"
    }
  };

  var req = https.request(options, function(res: any) {
    console.log("STATUS: " + res.statusCode);
    console.log("HEADERS: " + JSON.stringify(res.headers));
    res.setEncoding("utf8");
    res.on("data", function(chunk: any) {
      const data = JSON.parse(chunk);

      if (data && data.links.clone && data.links.clone.length) {
        // cloneRequiredSnippet(data.links.clone);
        const cloneLink = data.links.clone[0].href;
        const terminal: Terminal = window.createTerminal();
        terminal.sendText("cd ../.vscode; git clone " + cloneLink);
        installExtensions();
      }
    });
  });

  req.on("error", function(e: any) {
    console.log("problem with request: " + e.message);
  });

  // write data to request body
  req.write("data\n");
  req.write("data\n");
  req.end();
}

function readList() {
  // const password = getPassword() /* "c994PNmnPC42ZHSP38w2" */;
  authenticate();
  // installExtensions();
}

function saveList() {}

function installExtensions() {
  setTimeout(() => {
    const terminal: Terminal = window.createTerminal();
    // terminal.sendText("code --list-extensions > extensions.list");
    const docPath = __dirname + "/../.vscode/vscode-sync/extensions.list";

    workspace.openTextDocument(docPath).then(document => {
      let text: string = document.getText();
      let extensions: string[] = text.split("\n");
      delete extensions[extensions.length - 1]; // Remove last element which is ""

      extensions.map((extension: string) => {
        console.log("Installing --- " + extension);
        terminal.sendText("code --install-extension " + extension);
      });

      commands.executeCommand("workbench.action.reloadWindow");
    });
  }, 5000);
}

export function activate(context: ExtensionContext) {
  let disposable = commands.registerCommand(
    "extension.readExtensionsList",
    () => {
      readList();
    }
  );

  let disposable2 = commands.registerCommand(
    "extension.saveExtensionsList",
    () => {
      saveList();
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
}

export function deactivate() {}
