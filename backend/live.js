/* live.js — a tiny in-memory pub/sub for live dashboard events.
   Each shop has its own channel; SSE clients subscribe by shopId.
   Nothing is persisted here — events are transient by design. */
const channels = new Map(); // shopId -> Set(res)

function subscribe(shopId, res) {
  if (!channels.has(shopId)) channels.set(shopId, new Set());
  channels.get(shopId).add(res);
  res.on("close", () => {
    channels.get(shopId)?.delete(res);
  });
}

function publish(shopId, event) {
  const set = channels.get(shopId);
  if (!set || !set.size) return;
  const payload = `data: ${JSON.stringify({ ...event, at: Date.now() })}\n\n`;
  for (const res of set) {
    try { res.write(payload); } catch (e) { /* client gone */ }
  }
}

// Ring buffer of recent events per shop, so a fresh dashboard can catch up
// (last ~50 events). Managers who just opened the page still see activity.
const recent = new Map(); // shopId -> array
function recordAndPublish(shopId, event) {
  const e = { ...event, at: Date.now() };
  const list = recent.get(shopId) || [];
  list.push(e);
  if (list.length > 50) list.shift();
  recent.set(shopId, list);
  publish(shopId, e);
}
function history(shopId) {
  return recent.get(shopId) || [];
}

module.exports = { subscribe, publish: recordAndPublish, history };
