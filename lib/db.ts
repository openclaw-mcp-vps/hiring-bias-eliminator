import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { StoredAccessToken, StoredPaidSession } from "@/lib/types";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "subscriptions.json");

type SubscriptionStore = {
  paidSessions: Record<string, StoredPaidSession>;
  accessTokens: Record<string, StoredAccessToken>;
};

const EMPTY_STORE: SubscriptionStore = {
  paidSessions: {},
  accessTokens: {}
};

async function ensureStoreFile() {
  await mkdir(DB_DIR, { recursive: true });

  try {
    await readFile(DB_PATH, "utf8");
  } catch {
    await writeFile(DB_PATH, JSON.stringify(EMPTY_STORE, null, 2), "utf8");
  }
}

async function readStore(): Promise<SubscriptionStore> {
  await ensureStoreFile();

  const content = await readFile(DB_PATH, "utf8");
  const parsed = JSON.parse(content) as Partial<SubscriptionStore>;

  return {
    paidSessions: parsed.paidSessions ?? {},
    accessTokens: parsed.accessTokens ?? {}
  };
}

async function writeStore(store: SubscriptionStore) {
  await ensureStoreFile();
  const tempPath = `${DB_PATH}.tmp`;
  await writeFile(tempPath, JSON.stringify(store, null, 2), "utf8");
  await rename(tempPath, DB_PATH);
}

export async function markSessionPaid(
  sessionId: string,
  details: StoredPaidSession
): Promise<void> {
  const store = await readStore();
  store.paidSessions[sessionId] = details;
  await writeStore(store);
}

export async function isPaidSession(sessionId: string): Promise<boolean> {
  const store = await readStore();
  return Boolean(store.paidSessions[sessionId]);
}

export async function createAccessToken(
  sessionId: string,
  ttlDays = 30
): Promise<string> {
  const store = await readStore();

  if (!store.paidSessions[sessionId]) {
    throw new Error("Cannot grant access: session not marked as paid.");
  }

  const token = randomBytes(32).toString("hex");
  const issued = new Date();
  const expires = new Date(issued.getTime() + ttlDays * 24 * 60 * 60 * 1000);

  store.accessTokens[token] = {
    sessionId,
    issuedAt: issued.toISOString(),
    expiresAt: expires.toISOString()
  };

  await writeStore(store);
  return token;
}

export async function isAccessTokenValid(token: string): Promise<boolean> {
  const store = await readStore();
  const entry = store.accessTokens[token];

  if (!entry) {
    return false;
  }

  if (new Date(entry.expiresAt).getTime() < Date.now()) {
    delete store.accessTokens[token];
    await writeStore(store);
    return false;
  }

  return true;
}
