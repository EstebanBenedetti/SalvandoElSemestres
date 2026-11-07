import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { pbkdf2Sync } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const databaseUrl = process.env.E2E_DATABASE_URL;
if (!databaseUrl || !/(e2e|test)/i.test(new URL(databaseUrl).pathname)) {
  throw new Error("El servidor E2E solo puede usar una base cuyo nombre incluya e2e o test.");
}
if (process.env.POSTGRES_URL_NON_POOLING !== databaseUrl) {
  throw new Error("POSTGRES_URL_NON_POOLING debe coincidir con E2E_DATABASE_URL.");
}

const email = "docente.e2e@notaflux.test";
const password = "e2e-local-password-123";
const userId = "11111111-1111-4111-8111-111111111111";
const salt = "e2e00000000000000000000000000000";
const user = {
  id: userId,
  nombre: "Docente E2E",
  email,
  password_hash: `${salt}:${pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex")}`,
  rol: "usuario",
  activo: true,
  ultimo_login: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

const supabase = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  if (url.pathname !== "/rest/v1/usuarios") {
    sendJson(response, 404, { message: "E2E mock route not found" });
    return;
  }

  if (request.method === "GET") {
    const matches = [
      ["id", user.id],
      ["email", user.email],
      ["nombre", user.nombre],
    ].every(([column, value]) => {
      const filter = url.searchParams.get(column);
      return filter === null || filter === `eq.${value}`;
    });

    if (!matches) {
      sendJson(response, 406, { code: "PGRST116", message: "No user found" });
      return;
    }

    sendJson(response, 200, user);
    return;
  }

  if (request.method === "PATCH") {
    request.resume();
    request.on("end", () => {
      response.writeHead(204);
      response.end();
    });
    return;
  }

  sendJson(response, 405, { message: "E2E mock method not allowed" });
});

await new Promise((resolveListen, rejectListen) => {
  supabase.once("error", rejectListen);
  supabase.listen(54321, "127.0.0.1", resolveListen);
});

const next = spawn(
  process.execPath,
  [resolve(root, "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", "3101"],
  { cwd: root, env: process.env, stdio: "inherit" },
);

let shuttingDown = false;
function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  next.kill("SIGTERM");
  supabase.close(() => {
    process.exitCode = exitCode;
  });
}

next.once("error", () => shutdown(1));
next.once("exit", (code) => shutdown(code ?? 0));
process.once("SIGINT", () => shutdown(0));
process.once("SIGTERM", () => shutdown(0));