import type { MinigameSessionResponse, MinigameActionResponse } from "./types";
import { PLAYER_ECONOMY_GENERATOR_COLLECTED_ACTION } from "./playerEconomyTypes";
import { getMinigamesApiUrl } from "./url";

export async function getPlayerEconomySession({
  token,
}: {
  token: string;
}): Promise<MinigameSessionResponse> {
  const base = getMinigamesApiUrl();
  if (!base) {
    throw new Error(
      "No Minigames API URL (set VITE_MINIGAMES_API_URL or pass minigamesApiUrl=…)",
    );
  }

  const url = new URL("/data", `${base}/`);
  url.searchParams.set("type", "session");

  const response = await window.fetch(url.toString(), {
    method: "GET",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const bodyText = await response.text();
  let parsed: { data?: MinigameSessionResponse; error?: string } = {};
  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    throw new Error(bodyText || `Invalid JSON (${response.status})`);
  }

  if (response.status >= 400) {
    throw new Error(
      typeof parsed.error === "string"
        ? parsed.error
        : bodyText || `Minigame session ${response.status}`,
    );
  }

  if (!parsed.data) {
    throw new Error("Invalid session response (missing data)");
  }

  return parsed.data;
}

async function postMinigameEconomyActionRequest(
  token: string,
  body: Record<string, unknown>,
): Promise<MinigameActionResponse> {
  const base = getMinigamesApiUrl();
  if (!base) {
    throw new Error(
      "No Minigames API URL (set VITE_MINIGAMES_API_URL or pass minigamesApiUrl=…)",
    );
  }

  const response = await window.fetch(`${base}/action`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const bodyText = await response.text();
  let envelope: {
    data?: MinigameActionResponse;
    error?: string;
  } = {};
  try {
    envelope = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    throw new Error(bodyText || `Invalid JSON (${response.status})`);
  }

  if (response.status >= 400) {
    throw new Error(envelope.error || `Action failed (${response.status})`);
  }

  if (!envelope.data) {
    throw new Error("Invalid action response (missing data)");
  }

  return envelope.data;
}

/**
 * Collect a completed generator job. `jobId` is the key in `playerEconomy.generating`
 * (same value the economies API expects as `itemId` on `type: "generator.collected"`).
 */
export async function postPlayerEconomyGeneratorCollect(params: {
  token: string;
  jobId: string;
}): Promise<MinigameActionResponse> {
  const jobId = params.jobId.trim();
  if (!jobId) {
    throw new Error("jobId is required to collect a generator job");
  }
  return postMinigameEconomyActionRequest(params.token, {
    type: PLAYER_ECONOMY_GENERATOR_COLLECTED_ACTION,
    itemId: jobId,
  });
}

/**
 * Named economy action: `{ "type": "minigame.action", "action", "amounts"? }`.
 */
export async function postPlayerEconomyAction(params: {
  token: string;
  action: string;
  amounts?: Record<string, number>;
}): Promise<MinigameActionResponse> {
  return postMinigameEconomyActionRequest(params.token, {
    type: "minigame.action",
    action: params.action,
    ...(params.amounts !== undefined ? { amounts: params.amounts } : {}),
  });
}

/** Minigames `POST /action` with `type: "score.submitted"` and integer `score` ≥ 0. */
export async function submitScore(params: {
  token: string;
  score: number;
}): Promise<MinigameActionResponse> {
  const score = Math.max(0, Math.floor(params.score));
  return postMinigameEconomyActionRequest(params.token, {
    type: "score.submitted",
    score,
  });
}
