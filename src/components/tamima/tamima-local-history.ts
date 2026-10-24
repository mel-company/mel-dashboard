import type { TamimaProposedAction } from "@/api/endpoints/tamima.endpoints";

const STORAGE_KEY = "mel.tamima.voice.session.v1";

export type TamimaLocalTurn = {
  heard: string;
  reply: string;
  at: string;
  actions?: TamimaProposedAction[];
};

export type TamimaLocalSession = {
  conversationId: string;
  turns: TamimaLocalTurn[];
  updatedAt: string;
};

export function loadTamimaLocalSession(): TamimaLocalSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TamimaLocalSession;
    if (!parsed?.conversationId || !Array.isArray(parsed.turns)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTamimaLocalSession(session: TamimaLocalSession) {
  try {
    const trimmed: TamimaLocalSession = {
      ...session,
      turns: session.turns.slice(-40),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // quota / private mode — ignore
  }
}

export function clearTamimaLocalSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function appendTamimaLocalTurn(
  conversationId: string,
  turn: TamimaLocalTurn,
  prev?: TamimaLocalSession | null,
) {
  const base = prev?.conversationId === conversationId ? prev : null;
  const next: TamimaLocalSession = {
    conversationId,
    turns: [...(base?.turns || []), turn],
    updatedAt: new Date().toISOString(),
  };
  saveTamimaLocalSession(next);
  return next;
}

export function patchTamimaLocalActions(
  conversationId: string,
  actions: TamimaProposedAction[],
) {
  const prev = loadTamimaLocalSession();
  if (!prev || prev.conversationId !== conversationId || !prev.turns.length) {
    return prev;
  }
  const turns = [...prev.turns];
  const last = turns[turns.length - 1];
  if (!last) return prev;
  turns[turns.length - 1] = { ...last, actions };
  const next = { ...prev, turns, updatedAt: new Date().toISOString() };
  saveTamimaLocalSession(next);
  return next;
}
