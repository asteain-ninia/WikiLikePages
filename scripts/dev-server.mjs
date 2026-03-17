import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const requestedPort = Number.parseInt(process.env.PORT ?? "4173", 10);
const port = Number.isNaN(requestedPort) ? 4173 : requestedPort;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function getContentType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function resolveRequestPath(urlPathname) {
  const sanitizedPath = decodeURIComponent(urlPathname).replace(/^\/+/, "");
  const requestedPath = sanitizedPath || "index.html";
  const absolutePath = path.resolve(projectRoot, requestedPath);

  if (!absolutePath.startsWith(projectRoot)) {
    return null;
  }

  return absolutePath;
}

async function resolveFilePath(absolutePath) {
  try {
    const stats = await stat(absolutePath);
    if (stats.isDirectory()) {
      return path.join(absolutePath, "index.html");
    }

    return absolutePath;
  } catch {
    return absolutePath;
  }
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const absolutePath = resolveRequestPath(requestUrl.pathname);

    if (!absolutePath) {
      response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    const filePath = await resolveFilePath(absolutePath);
    const fileContent = await readFile(filePath);

    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": getContentType(filePath),
    });
    response.end(fileContent);
  } catch (error) {
    const statusCode = error?.code === "ENOENT" ? 404 : 500;
    response.writeHead(statusCode, { "content-type": "text/plain; charset=utf-8" });
    response.end(statusCode === 404 ? "Not Found" : "Internal Server Error");
  }
});

server.listen(port, () => {
  console.log(`WikiLikePages dev server: http://localhost:${port}`);
});
