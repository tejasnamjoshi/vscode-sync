var https = require("https");

import {
  getUserName,
  getPassword,
  getSnippetId,
  saveState,
  installExtensions
} from "./helpers";
import { ExtensionContext } from "vscode";
import { terminal } from "./extension";

function readSnippet(context: ExtensionContext) {
  const username = context.workspaceState.get("username");
  const password = context.workspaceState.get("password");

  const snippetIdPromise = getSnippetId();

  snippetIdPromise.then((value: string | undefined) => {
    saveState(context, "snippetId", value);
    var base64encodedData = new Buffer(username + ":" + password).toString(
      "base64"
    );

    var options = {
      host: "api.bitbucket.org",
      port: 443,
      path: "/2.0/snippets/" + username + "/" + value,
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
          const cloneLink = data.links.clone[0].href;

          terminal.show(true);
          terminal.sendText(
            "cd C:/Users/TejasNamjoshi/; rm -rf vscode-sync; git clone " +
              cloneLink
          );
          setTimeout(() => installExtensions(), 5000);
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
  });
}

export function readList(context: ExtensionContext) {
  const username = context.workspaceState.get("username");
  const password = context.workspaceState.get("password");
  const snippetId = context.workspaceState.get("snippetId");

  if (!username || !password || !snippetId) {
    const usernamePromise = getUserName();
    usernamePromise.then(
      (value: string | undefined) => {
        saveState(context, "username", value);

        const passwordPromise = getPassword();
        passwordPromise.then((value: string | undefined) => {
          saveState(context, "password", value);
          readSnippet(context);
        });
      },
      error => console.log(error)
    );
  } else {
    readSnippet(context);
  }
}
