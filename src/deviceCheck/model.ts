// Device check: things only a real phone can verify after an update. Pure logic: the item list
// and a version-keyed tick state. Ticks belong to one app version; another version starts empty.

export const DEVICE_CHECK_ITEMS = [
  'widgets',
  'calendarExport',
  'persistentNotification',
  'femaleSaint',
  'updatesNotes',
  'otaReopen',
] as const;

export type DeviceCheckId = (typeof DEVICE_CHECK_ITEMS)[number];

export interface DeviceCheckState {
  version: string;
  done: readonly DeviceCheckId[];
}

export type DeviceCheckAction =
  | { type: 'toggle'; id: DeviceCheckId }
  | { type: 'reset' }
  | { type: 'version'; version: string }
  /** Stored ticks arrived; they are merged with ticks already made while loading. */
  | { type: 'load'; stored: DeviceCheckState };

export const isDeviceCheckId = (value: unknown): value is DeviceCheckId =>
  typeof value === 'string' && (DEVICE_CHECK_ITEMS as readonly string[]).includes(value);

export const emptyState = (version: string): DeviceCheckState => ({ version, done: [] });

/** Ticks in list order, so equal sets always look equal. */
function ordered(ids: Iterable<DeviceCheckId>): DeviceCheckId[] {
  const set = new Set(ids);
  return DEVICE_CHECK_ITEMS.filter((id) => set.has(id));
}

export function reduceDeviceCheck(
  state: DeviceCheckState,
  action: DeviceCheckAction,
): DeviceCheckState {
  switch (action.type) {
    case 'toggle': {
      if (!isDeviceCheckId(action.id)) return state;
      const has = state.done.includes(action.id);
      const next = has ? state.done.filter((id) => id !== action.id) : [...state.done, action.id];
      return { version: state.version, done: ordered(next) };
    }
    case 'reset':
      return emptyState(state.version);
    case 'load':
      if (action.stored.version !== state.version) return state;
      return { version: state.version, done: ordered([...action.stored.done, ...state.done]) };
    case 'version':
      return action.version === state.version ? state : emptyState(action.version);
  }
}

export const doneCount = (state: DeviceCheckState): number => state.done.length;

/** Stored text -> state for `version`. Anything unreadable or from another version is empty. */
export function parseDeviceCheck(raw: unknown, version: string): DeviceCheckState {
  try {
    const data: unknown = typeof raw === 'string' ? JSON.parse(raw) : null;
    if (!data || typeof data !== 'object') return emptyState(version);
    const { version: stored, done } = data as { version?: unknown; done?: unknown };
    if (stored !== version || !Array.isArray(done)) return emptyState(version);
    return { version, done: ordered(done.filter(isDeviceCheckId)) };
  } catch {
    return emptyState(version);
  }
}

export const serializeDeviceCheck = (state: DeviceCheckState): string =>
  JSON.stringify({ version: state.version, done: state.done });
