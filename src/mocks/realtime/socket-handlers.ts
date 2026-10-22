import { toSocketIo } from "@mswjs/socket.io-binding";
import { ws } from "msw";
import { getOwnerForToken } from "mocks/mock-database";
import { subscribeToRealtime } from "mocks/realtime/event-bus";

// Mocked Socket.IO server running in the page (MSW WebSocket interception), so it also works in the demo build.
// The binding answers the Engine.IO/Socket.IO handshake itself; it has no rooms or broadcast, so per-user delivery
// is done by the event bus with the session token each connection subscribes with.

// MSW strips the "/socket.io/" prefix before matching, so the link is the app origin itself.
const realtimeLink = ws.link(window.location.origin.replace(/^http/, "ws"));
// Engine.IO ping packet. The binding never pings, and socket.io-client drops a connection that stays silent
// for longer than pingInterval + pingTimeout (30s).
const engineIoPingPacket = "2";
const heartbeatIntervalMs = 20_000;

interface OpenConnection {
  close: () => void;
}

const openConnections = new Set<OpenConnection>();
let isRealtimeAvailable = true;

// Scenario action: drop every connection and refuse new ones until restored (the client keeps retrying).
export const dropRealtime = () => {
  isRealtimeAvailable = false;
  openConnections.forEach((connection) => connection.close());
};

export const restoreRealtime = () => {
  isRealtimeAvailable = true;
};

export const isRealtimeConnected = () => isRealtimeAvailable;

export const socketHandlers = [
  realtimeLink.addEventListener("connection", (connection) => {
    // Any other socket on the same origin (e.g. Vite HMR) goes to the real server untouched.
    if (!connection.client.url.pathname.startsWith("/socket.io")) {
      connection.server.connect();
      return;
    }
    if (!isRealtimeAvailable) {
      connection.client.close();
      return;
    }
    const io = toSocketIo(connection);
    let sessionToken: string | null = null;

    io.client.on("session:subscribe", (_event, token: unknown) => {
      sessionToken = typeof token === "string" && token ? token : null;
    });

    const unsubscribe = subscribeToRealtime({
      getOwnerId: () => getOwnerForToken(sessionToken),
      send: (eventName, event) => io.client.emit(eventName, event),
    });
    const heartbeat = setInterval(
      () => connection.client.send(engineIoPingPacket),
      heartbeatIntervalMs,
    );
    const openConnection: OpenConnection = {
      close: () => connection.client.close(),
    };
    openConnections.add(openConnection);

    connection.client.addEventListener("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
      openConnections.delete(openConnection);
    });
  }),
];