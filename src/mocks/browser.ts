import { setupWorker } from "msw/browser";
import { resumePendingConfirmations } from "mocks/mock-database";
import { socketHandlers } from "mocks/realtime/socket-handlers";
import { handlers } from "mocks/rest/handlers";

export const worker = setupWorker(...handlers, ...socketHandlers);

// Pending orders persisted before a refresh keep being processed.
resumePendingConfirmations();