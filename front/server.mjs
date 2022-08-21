import express from "express";
import next from "next";
import https from "https";
import fs from "fs";

const port = parseInt(process.env.PORT || "3000");
const host = "0.0.0.0";
const app = next({
  dev: process.env.NODE_ENV !== "production",
});
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();
  const expressApp = express();
  expressApp.get("*", (req, res) => handle(req, res));
  // Use HTTPS if HTTPS option enabled
  const hasCertificates =
    fs.existsSync("./cert/localhost.key") &&
    fs.existsSync("./cert/localhost.crt");
  const useHttps = process.env.HTTPS === "true" && hasCertificates;
  if (useHttps) {
    const options = {
      key: fs.readFileSync("./cert/localhost.key"),
      cert: fs.readFileSync("./cert/localhost.crt"),
    };
    const server = https.createServer(options, expressApp);
    server.listen(port, host);
    console.log(`> Ready on https://localhost:${port}`);
  } else {
    expressApp.listen(port, host);
    console.log(`> Ready on http://localhost:${port}`);
  }
})();
