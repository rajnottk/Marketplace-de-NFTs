import { setupWorker } from "msw/browser";
import { handlers } from "mocks/rest/handlers";

export const worker = setupWorker(...handlers);