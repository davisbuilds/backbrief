export const sampleSession = `USER
Please move email delivery off the request path. The API should stay responsive,
retry transient provider errors up to three times, and never send a message twice.

CODEX
The current route calls the mail provider inline. I see two viable seams: retry
inside the route, which preserves delivered-before-success semantics but keeps the
request slow, or enqueue a delivery job and move retries into a worker.

USER
Use the queue. Keep the API response honest and preserve the message ID so the
provider idempotency key remains stable.

CODEX
I will return an accepted response with the existing message ID, enqueue that ID,
and have the worker load the message before calling the provider. The worker will
retry transient failures three times with the same idempotency key. Permanent
failures will be recorded for operations instead of being retried.

CODEX
Implementation is complete. Route and worker tests pass. The route now responds
without waiting for the provider, and retries are isolated in the worker.`;

export const sampleDiff = `diff --git a/src/api/send-email.ts b/src/api/send-email.ts
index 213fb2a..ac9201d 100644
--- a/src/api/send-email.ts
+++ b/src/api/send-email.ts
@@ -1,17 +1,14 @@
 import { messages } from "../db/messages";
-import { deliverWithProvider } from "../mail/provider";
+import { deliveryQueue } from "../queue/delivery";
 
 export async function sendEmail(request: Request) {
   const input = await request.json();
   const message = await messages.create(input);
 
-  await deliverWithProvider(message, {
-    idempotencyKey: message.id,
-  });
-  await messages.markDelivered(message.id);
+  await deliveryQueue.add({ messageId: message.id });
 
   return Response.json(
-    { id: message.id, status: "delivered" },
-    { status: 200 },
+    { id: message.id, status: "accepted" },
+    { status: 202 },
   );
 }
diff --git a/src/workers/deliver-email.ts b/src/workers/deliver-email.ts
new file mode 100644
index 0000000..3229cb4
--- /dev/null
+++ b/src/workers/deliver-email.ts
@@ -0,0 +1,23 @@
+import { messages } from "../db/messages";
+import { deliverWithProvider, isTransient } from "../mail/provider";
+
+export async function deliverEmail(messageId: string) {
+  const message = await messages.find(messageId);
+  if (!message || message.status === "delivered") return;
+
+  try {
+    await deliverWithProvider(message, { idempotencyKey: message.id });
+    await messages.markDelivered(message.id);
+  } catch (error) {
+    if (isTransient(error)) throw error;
+    await messages.markFailed(message.id, String(error));
+  }
+}
diff --git a/src/queue/delivery.ts b/src/queue/delivery.ts
index 2ac1613..8c111f0 100644
--- a/src/queue/delivery.ts
+++ b/src/queue/delivery.ts
@@ -4,5 +4,6 @@ export const deliveryQueue = createQueue({
   name: "email-delivery",
   attempts: 3,
+  backoff: { type: "exponential", delay: 1000 },
   handler: ({ messageId }) => deliverEmail(messageId),
 });`;
