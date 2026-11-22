import * as SecureStore from 'expo-secure-store';

const CHUNK = 1800;

async function readCount(key: string): Promise<number | null> {
  const raw = await SecureStore.getItemAsync(`${key}.count`);
  if (!raw) return null;
  const count = Number(raw);
  return Number.isFinite(count) && count > 0 ? count : null;
}

export const secureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const count = await readCount(key);
    if (!count) return SecureStore.getItemAsync(key);
    let value = '';
    for (let index = 0; index < count; index += 1) {
      value += (await SecureStore.getItemAsync(`${key}.${index}`)) ?? '';
    }
    return value;
  },
  async setItem(key: string, value: string): Promise<void> {
    await this.removeItem(key);
    const chunks = Math.max(1, Math.ceil(value.length / CHUNK));
    await SecureStore.setItemAsync(`${key}.count`, String(chunks));
    for (let index = 0; index < chunks; index += 1) {
      await SecureStore.setItemAsync(`${key}.${index}`, value.slice(index * CHUNK, (index + 1) * CHUNK));
    }
  },
  async removeItem(key: string): Promise<void> {
    const count = await readCount(key);
    if (count) {
      for (let index = 0; index < count; index += 1) {
        await SecureStore.deleteItemAsync(`${key}.${index}`);
      }
      await SecureStore.deleteItemAsync(`${key}.count`);
    }
    await SecureStore.deleteItemAsync(key).catch(() => undefined);
  },
};

export const ONBOARDING_KEY = 'spe_onboarding_complete';
