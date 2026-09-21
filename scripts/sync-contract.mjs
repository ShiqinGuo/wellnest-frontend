import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const destination = "src/generated";
const check = process.argv.includes("--check");
const source = process.argv.find((value, index) => index > 1 && !value.startsWith("--"));
if (!check && !source) throw new Error("Specify a backend contracts directory or immutable HTTPS URL");
async function read(name) {
  if (check) return readFile(resolve(destination, name));
  if (source.startsWith("https://")) {
    const response = await fetch(`${source.replace(/\/$/, "")}/${name}`);
    if (!response.ok) throw new Error(`Contract download failed: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  }
  return readFile(resolve(source, name));
}
const raw = await read("manifest.json");
const manifest = JSON.parse(raw);
const artifacts = new Map();
for (const name of ["contract.ts", "openapi.json", "plan-fixtures.json"]) {
  const body = await read(name);
  if (createHash("sha256").update(body).digest("hex") !== manifest.sha256[name])
    throw new Error(`Contract checksum mismatch: ${name}`);
  artifacts.set(name, body);
}
if (!check) {
  await mkdir(destination, { recursive: true });
  for (const [name, body] of artifacts) await writeFile(resolve(destination, name), body);
  await writeFile(resolve(destination, "manifest.json"), raw);
}
console.log(`Contract ${manifest.version}: ${check ? "verified" : "synced"}`);
