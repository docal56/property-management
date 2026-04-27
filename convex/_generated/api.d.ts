/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents from "../agents.js";
import type * as clerk_webhook from "../clerk/webhook.js";
import type * as conversations from "../conversations.js";
import type * as elevenlabs_adapter from "../elevenlabs/adapter.js";
import type * as elevenlabs_dataCollection from "../elevenlabs/dataCollection.js";
import type * as elevenlabs_webhook from "../elevenlabs/webhook.js";
import type * as extraction_llm from "../extraction/llm.js";
import type * as extraction_summary from "../extraction/summary.js";
import type * as http from "../http.js";
import type * as issueUpdates from "../issueUpdates.js";
import type * as issues from "../issues.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_channels from "../lib/channels.js";
import type * as lib_elevenlabs from "../lib/elevenlabs.js";
import type * as lib_publicIds from "../lib/publicIds.js";
import type * as orgs from "../orgs.js";
import type * as users from "../users.js";
import type * as webhookEvents from "../webhookEvents.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  "clerk/webhook": typeof clerk_webhook;
  conversations: typeof conversations;
  "elevenlabs/adapter": typeof elevenlabs_adapter;
  "elevenlabs/dataCollection": typeof elevenlabs_dataCollection;
  "elevenlabs/webhook": typeof elevenlabs_webhook;
  "extraction/llm": typeof extraction_llm;
  "extraction/summary": typeof extraction_summary;
  http: typeof http;
  issueUpdates: typeof issueUpdates;
  issues: typeof issues;
  "lib/auth": typeof lib_auth;
  "lib/channels": typeof lib_channels;
  "lib/elevenlabs": typeof lib_elevenlabs;
  "lib/publicIds": typeof lib_publicIds;
  orgs: typeof orgs;
  users: typeof users;
  webhookEvents: typeof webhookEvents;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
