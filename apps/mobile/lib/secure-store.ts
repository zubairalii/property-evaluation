import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CHUNK = 1800;
const memory = new Map<string, string>();
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

async function getRaw(key: string): Promise<string | null> {
  if (!isNative) return memory.get(key) ?? null;
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

async function setRaw(key: string, value: string): Promise<void> {
  if (!isNative) {
    memory.set(key, value);
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    memory.set(key, value);
  }
}

async function deleteRaw(key: string): Promise<void> {
  if (!isNative) {
    memory.delete(key);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    memory.delete(key);
  }
}

async function readCount(key: string): Promise<number | null> {
  const raw = await getRaw(`${key}.count`);
  if (!raw) return null;
  const count = Number(raw);
  return Number.isFinite(count) && count > 0 ? count : null;
}

export const secureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const count = await readCount(key);
    if (!count) return getRaw(key);
    let value = '';
    for (let index = 0; index < count; index += 1) {
      value += (await getRaw(`${key}.${index}`)) ?? '';
    }
    return value;
  },
  async setItem(key: string, value: string): Promise<void> {
    await this.removeItem(key);
    if (!isNative) {
      memory.set(key, value);
      return;
    }
    const chunks = Math.max(1, Math.ceil(value.length / CHUNK));
    await setRaw(`${key}.count`, String(chunks));
    for (let index = 0; index < chunks; index += 1) {
      await setRaw(`${key}.${index}`, value.slice(index * CHUNK, (index + 1) * CHUNK));
    }
  },
  async removeItem(key: string): Promise<void> {
    if (!isNative) {
      memory.delete(key);
      for (const existing of [...memory.keys()]) {
        if (existing.startsWith(`${key}.`)) memory.delete(existing);
      }
      return;
    }
    const count = await readCount(key);
    if (count) {
      for (let index = 0; index < count; index += 1) {
        await deleteRaw(`${key}.${index}`);
      }
      await deleteRaw(`${key}.count`);
    }
    await deleteRaw(key);
  },
};

export const ONBOARDING_KEY = 'spe_onboarding_complete';
