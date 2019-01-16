import { ExtensionContext } from "vscode";
var https = require("https");

import { terminal } from "./extension";
import { BASE_STORAGE_PATH } from "./helpers";

function saveSnippet(context: ExtensionContext) {
  const username = context.workspaceState.get("username");
  const password = context.workspaceState.get("password");

  var base64encodedData = new Buffer(username + ":" + password).toString(
    "base64"
  );

  var options = {
    host: "api.bitbucket.org",
    port: 443,
    path: "/2.0/snippets/" + username,
    method: "POST",
    headers: {
      Authorization: "Basic " + base64encodedData
    }
  };

  var req = https.request(options, function(res: any) {
    console.log("STATUS: " + res.statusCode);
    console.log("HEADERS: " + JSON.stringify(res.headers));
    res.setEncoding("utf8");
    res.on("data", function(chunk: any) {
      const data = JSON.parse(chunk);
      const title = data.title ? data.title : "untitled-snippet";

      if (data && data.links.clone && data.links.clone.length) {
        const cloneLink = data.links.clone[0].href;

        terminal.show(true);
        terminal.sendText(
          "cd " +
            BASE_STORAGE_PATH +
            "; rm -rf " +
            title +
            "; git clone " +
            cloneLink
        );
        setTimeout(() => {
          terminal.sendText(
            "mv " +
              BASE_STORAGE_PATH +
              "extensions.list " +
              BASE_STORAGE_PATH +
              title +
              ";" +
              " cd " +
              BASE_STORAGE_PATH +
              title +
              "; git add .; git commit -m 'adding settings file'; git push"
          );
        }, 5000);
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

export function uploadData(context: ExtensionContext) {
  saveSnippet(context);
}
