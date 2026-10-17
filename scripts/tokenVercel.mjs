import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const directorioProyecto = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const archivoTemporal = resolve(directorioProyecto, ".env.vercel.local");
const archivoEntornoLocal = resolve(directorioProyecto, ".env.local");
const archivoGitignore = resolve(directorioProyecto, ".gitignore");
const mensajeAviso =
  "Aviso: no se pudo renovar la conexión con Vercel. El envío de correos no funcionará en local.";
let fallo = false;

try {
  // Vercel renueva el token OIDC durante link, pero no lo incluye en el archivo de env pull.
  execSync("npx vercel link --project salvandoelsemestres --yes", {
    cwd: directorioProyecto,
    stdio: "ignore",
  });

  const contenidoGitignore = readFileSync(archivoGitignore, "utf8");
  const lineasGitignore = contenidoGitignore.split(/\r?\n/);
  const reglasEntorno = lineasGitignore.reduce(
    (indices, linea, indice) => (linea.trim() === ".env*" ? [...indices, indice] : indices),
    [],
  );
  if (reglasEntorno.length > 1) {
    lineasGitignore.splice(reglasEntorno[reglasEntorno.length - 1], 1);
    while (lineasGitignore.length > 1 && lineasGitignore.at(-1) === "" && lineasGitignore.at(-2) === "") {
      lineasGitignore.pop();
    }
    const separador = contenidoGitignore.includes("\r\n") ? "\r\n" : "\n";
    writeFileSync(archivoGitignore, lineasGitignore.join(separador), "utf8");
  }

  execSync("npx vercel env pull .env.vercel.local --yes", {
    cwd: directorioProyecto,
    stdio: "ignore",
  });

  const contenidoDescargado = readFileSync(archivoTemporal, "utf8");
  const lineaTemporal = contenidoDescargado
    .split(/\r?\n/)
    .find((linea) => /^VERCEL_OIDC_TOKEN\s*=/.test(linea));
  const contenidoActual = readFileSync(archivoEntornoLocal, "utf8");
  const coincidenciaActual = /^VERCEL_OIDC_TOKEN[^\r\n]*/m.exec(contenidoActual);
  const lineaToken = lineaTemporal ?? coincidenciaActual?.[0];
  if (!lineaToken || !lineaToken.slice(lineaToken.indexOf("=") + 1).trim()) {
    throw new Error("No se encontró VERCEL_OIDC_TOKEN.");
  }

  let contenidoActualizado;

  if (coincidenciaActual?.index !== undefined) {
    contenidoActualizado =
      contenidoActual.slice(0, coincidenciaActual.index) +
      lineaToken +
      contenidoActual.slice(coincidenciaActual.index + coincidenciaActual[0].length);
  } else {
    const separador = contenidoActual.includes("\r\n") ? "\r\n" : "\n";
    const sufijo = contenidoActual.length === 0 || /(?:\r\n|\n)$/.test(contenidoActual) ? "" : separador;
    contenidoActualizado = `${contenidoActual}${sufijo}${lineaToken}`;
  }

  writeFileSync(archivoEntornoLocal, contenidoActualizado, "utf8");
} catch {
  fallo = true;
} finally {
  try {
    if (existsSync(archivoTemporal)) rmSync(archivoTemporal);
  } catch {
    fallo = true;
  }
}

if (fallo) console.warn(mensajeAviso);
