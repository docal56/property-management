import { httpRouter } from "convex/server";
import { handleClerkWebhook } from "./clerk/webhook";
import { handleElevenLabsWebhook } from "./elevenlabs/webhook";
import { handleVapiWebhook } from "./vapi/webhook";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

http.route({
  path: "/elevenlabs-webhook",
  method: "POST",
  handler: handleElevenLabsWebhook,
});

http.route({
  path: "/vapi-webhook",
  method: "POST",
  handler: handleVapiWebhook,
});

export default http;
