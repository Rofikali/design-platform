export const DEFAULT_HISTORY_LIMIT = 50;

export type HistoryState = {
  readonly limit: number;
  readonly undoStack: readonly string[];
  readonly redoStack: readonly string[];
  readonly stableSnapshot: string;
};

export type HistoryStatus = "applied" | "empty" | "recorded-new-changes";

export type HistoryTransition = {
  readonly history: HistoryState;
  readonly snapshot: string | null;
  readonly status: HistoryStatus;
};

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit)) return DEFAULT_HISTORY_LIMIT;
  return Math.max(0, Math.floor(limit));
}

function appendBounded(stack: readonly string[], value: string, limit: number): readonly string[] {
  if (limit === 0) return [];
  return [...stack, value].slice(-limit);
}

export function createHistory(
  initialSnapshot = "",
  limit = DEFAULT_HISTORY_LIMIT,
): HistoryState {
  return {
    limit: normalizeLimit(limit),
    undoStack: [],
    redoStack: [],
    stableSnapshot: initialSnapshot,
  };
}

/** Record a completed/coalesced edit and invalidate any redo branch. */
export function recordHistory(history: HistoryState, snapshot: string): HistoryState {
  if (snapshot === history.stableSnapshot) return history;
  return {
    ...history,
    undoStack: appendBounded(history.undoStack, history.stableSnapshot, history.limit),
    redoStack: [],
    stableSnapshot: snapshot,
  };
}

export function undoHistory(history: HistoryState, currentSnapshot: string): HistoryTransition {
  const undoStack = currentSnapshot === history.stableSnapshot
    ? history.undoStack
    : appendBounded(history.undoStack, history.stableSnapshot, history.limit);
  const previous = undoStack.at(-1);
  if (previous === undefined) {
    return {
      history: currentSnapshot === history.stableSnapshot ? history : {
        ...history,
        undoStack,
        redoStack: [],
        stableSnapshot: currentSnapshot,
      },
      snapshot: null,
      status: "empty",
    };
  }

  return {
    history: {
      ...history,
      undoStack: undoStack.slice(0, -1),
      redoStack: appendBounded(history.redoStack, currentSnapshot, history.limit),
      stableSnapshot: previous,
    },
    snapshot: previous,
    status: "applied",
  };
}

export function redoHistory(history: HistoryState, currentSnapshot: string): HistoryTransition {
  if (currentSnapshot !== history.stableSnapshot) {
    return {
      history: recordHistory(history, currentSnapshot),
      snapshot: null,
      status: "recorded-new-changes",
    };
  }

  const next = history.redoStack.at(-1);
  if (next === undefined) {
    return { history, snapshot: null, status: "empty" };
  }

  return {
    history: {
      ...history,
      undoStack: appendBounded(history.undoStack, currentSnapshot, history.limit),
      redoStack: history.redoStack.slice(0, -1),
      stableSnapshot: next,
    },
    snapshot: next,
    status: "applied",
  };
}
