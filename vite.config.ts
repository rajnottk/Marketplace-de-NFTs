import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { Server } from "socket.io";
import { defineConfig, type Plugin } from "vite";

const socketMockPlugin = (): Plugin => ({
  name: "kurio-socket-mock",
  configureServer: (server) => {
    if (!server.httpServer) return;
    const socketServer = new Server(server.httpServer, { cors: { origin: true } });
    socketServer.on("connection", (socket) => {
      socket.on("demo:nft-update", (event) => socketServer.emit("nft.updated", event));
      socket.on("demo:order-update", (event) => socketServer.emit("order.updated", event));
    });
  },
});

export default defineConfig({
  plugins: [react(), socketMockPlugin()],
  resolve: {
    alias: {
      assets: fileURLToPath(new URL("./src/assets", import.meta.url)),
      app: fileURLToPath(new URL("./src/app", import.meta.url)),
      mocks: fileURLToPath(new URL("./src/mocks", import.meta.url)),
      modules: fileURLToPath(new URL("./src/modules", import.meta.url)),
      shared: fileURLToPath(new URL("./src/shared", import.meta.url)),
      src: fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});