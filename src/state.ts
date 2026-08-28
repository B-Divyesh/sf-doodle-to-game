export type GameTemplate = 'dodge' | 'collect' | 'maze';
export type SpeedSetting = 'gentle' | 'zippy';
export type ScoreSetting = 'short' | 'long';
export type AssetSlot = 'hero' | 'object';

export interface Project {
  id: 'current';
  title: string;
  template: GameTemplate;
  speed: SpeedSetting;
  score: ScoreSetting;
  sound: boolean;
  assets: Partial<Record<AssetSlot, string>>;
  updatedAt: string;
}

export const defaultProject = (): Project => ({
  id: 'current',
  title: 'Our tiny game',
  template: 'collect',
  speed: 'gentle',
  score: 'short',
  sound: true,
  assets: {},
  updatedAt: new Date().toISOString(),
});

const DB_NAME = 'doodle-to-game';
const DB_VERSION = 1;
const STORE = 'projects';
let demoMode = false;

/** Keeps sample work physically separate from a visitor's own saved project. */
export const setDemoMode = (enabled: boolean): void => { demoMode = enabled; };

const activeDatabaseName = (): string => demoMode ? `${DB_NAME}-demo` : DB_NAME;

const sampleArt = (shape: 'hero' | 'object'): string => {
  const body = shape === 'hero'
    ? '<path d="M42 124c-19-46 14-91 61-77 11-31 59-24 67 8 37 7 48 48 25 72-24 25-53 35-88 27-32 8-54-5-65-30Z" fill="#237A4B" stroke="#172033" stroke-width="9"/><circle cx="86" cy="89" r="8" fill="#FFFDF7"/><circle cx="145" cy="82" r="8" fill="#FFFDF7"/><path d="M91 120q26 20 50-2" fill="none" stroke="#172033" stroke-width="8" stroke-linecap="round"/>'
    : '<path d="m120 28 17 43 47 3-36 30 12 48-40-26-41 25 13-48-36-30 47-2Z" fill="#1859C9" stroke="#172033" stroke-width="9" stroke-linejoin="round"/><circle cx="120" cy="95" r="12" fill="#F7F1E3"/>';
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180">${body}</svg>`)}`;
};

export const sampleProject = (): Project => ({
  id: 'current',
  title: 'Maya and Theo’s doodle dodge',
  template: 'dodge',
  speed: 'gentle',
  score: 'short',
  sound: true,
  assets: { hero: sampleArt('hero'), object: sampleArt('object') },
  updatedAt: new Date().toISOString(),
});

const openDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(activeDatabaseName(), DB_VERSION);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('Could not open local storage.'));
});

export const loadProject = async (): Promise<Project> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get('current');
    request.onsuccess = () => resolve(request.result ? validateProject(request.result) : (demoMode ? sampleProject() : defaultProject()));
    request.onerror = () => reject(request.error ?? new Error('Could not read the saved game.'));
  });
};

/** Clear only the disposable demo project, then return a fresh seeded game. */
export const resetDemoProject = async (): Promise<Project> => {
  if (!demoMode) return defaultProject();
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Could not reset the demo.'));
  });
  return sampleProject();
};

/** Delete the disposable sample when someone leaves demo mode. */
export const discardDemoProject = async (): Promise<void> => {
  if (!demoMode) return;
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Could not clear the demo.'));
  });
};

export const saveProject = async (project: Project): Promise<void> => {
  const db = await openDatabase();
  project.updatedAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(project);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Could not save the game.'));
  });
};

export const validateProject = (value: unknown): Project => {
  if (!value || typeof value !== 'object') throw new Error('That file is not a Doodle to Game project.');
  const raw = value as Partial<Project>;
  if (!['dodge', 'collect', 'maze'].includes(raw.template ?? '')) throw new Error('That project uses an unknown game.');
  if (raw.assets && (typeof raw.assets !== 'object' || Object.values(raw.assets).some((asset) => typeof asset !== 'string' || !asset.startsWith('data:image/')))) {
    throw new Error('That project contains an unreadable drawing.');
  }
  return {
    id: 'current',
    title: typeof raw.title === 'string' ? raw.title.slice(0, 60) : 'Our tiny game',
    template: raw.template as GameTemplate,
    speed: raw.speed === 'zippy' ? 'zippy' : 'gentle',
    score: raw.score === 'long' ? 'long' : 'short',
    sound: raw.sound !== false,
    assets: raw.assets ?? {},
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
};

export const projectToJson = (project: Project): string => JSON.stringify({
  format: 'doodle-to-game',
  version: 1,
  exportedAt: new Date().toISOString(),
  project,
}, null, 2);

export const projectFromJson = (json: string): Project => {
  let payload: { format?: string; project?: unknown };
  try {
    payload = JSON.parse(json) as { format?: string; project?: unknown };
  } catch {
    throw new Error('That project file is incomplete. Export it again or choose another Doodle to Game JSON file.');
  }
  if (payload.format !== 'doodle-to-game' || !payload.project) throw new Error('That file is not a Doodle to Game export.');
  return validateProject(payload.project);
};
