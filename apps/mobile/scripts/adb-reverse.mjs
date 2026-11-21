/**
 * Best-effort `adb reverse tcp:<port> tcp:<port>`.
 *
 * The mobile app calls `http://localhost:4000`, so on a physical Android
 * device the request has to be tunnelled back to this machine. Expo forwards
 * Metro's 8081 on its own but knows nothing about the API port, and the tunnel
 * is dropped on every reconnect, `adb kill-server` or device reboot — which is
 * why Home silently renders nothing.
 *
 * This runs before `expo run:android`. It never fails the dev command: with no
 * adb, no connected device, or iOS/web there is simply nothing to do.
 *
 *   node scripts/adb-reverse.mjs
 */

import { spawnSync } from "node:child_process";

const PORT = process.env.API_PORT ?? "4000";

function adb(args) {
  return spawnSync("adb", args, { encoding: "utf8" });
}

const probe = adb(["devices"]);
if (probe.error || probe.status !== 0) {
  process.exit(0);
}

const connected = (probe.stdout ?? "")
  .split("\n")
  .slice(1)
  .filter((line) => line.trim().length > 0 && !line.includes("offline"));

if (connected.length === 0) {
  process.exit(0);
}

const target = `tcp:${PORT}`;
const reverse = adb(["reverse", target, target]);

if (reverse.status === 0) {
  process.stdout.write(`adb reverse ${target} → ${target}\n`);
} else {
  const detail = (reverse.stderr ?? "").trim();
  process.stdout.write(
    `warning: could not forward ${target} to the device${detail ? ` (${detail})` : ""}\n`
  );
}
