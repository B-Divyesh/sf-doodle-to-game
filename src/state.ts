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

const openDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
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
    request.onsuccess = () => resolve(request.result ? validateProject(request.result) : defaultProject());
    request.onerror = () => reject(request.error ?? new Error('Could not read the saved game.'));
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
  const payload = JSON.parse(json) as { format?: string; project?: unknown };
  if (payload.format !== 'doodle-to-game' || !payload.project) throw new Error('That file is not a Doodle to Game export.');
  return validateProject(payload.project);
};
