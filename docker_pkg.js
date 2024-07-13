#!/usr/bin/env node
const pkg = require("./package.json");
const fs = require("fs");
const exec = require("node:child_process").exec;

const dockerDir = process.cwd() + "/docker";
// console.log(fs);
if (!fs.existsSync(dockerDir)) {
  fs.mkdirSync(dockerDir);
}


const newDeps = {
  "name": "docker_pkg",
  "version": "1.0.0",
  dependencies: pkg.dependencies,
  devDependencies: pkg.devDependencies,
};

if (!fs.existsSync(dockerDir + "/old.json")) {
  fs.writeFileSync(dockerDir + "/old.json", JSON.stringify(newDeps, undefined, 2));
}


fs.writeFileSync(dockerDir + "/new.json", JSON.stringify(newDeps, undefined, 2));


const child = exec("docker compose -f compose.yaml up -d --build", (err, result) => {
  // fs.unlinkSync(dockerDir + "/new.json");
  // fs.writeFileSync(dockerDir + "/old.json", JSON.stringify(newDeps, undefined, 2));
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
});

child.stdout.on("data", console.log);