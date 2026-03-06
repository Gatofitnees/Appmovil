import { Preferences } from '@capacitor/preferences';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const capacitorAsyncStorage = {
    getItem: async (key: string): Promise<string | null> => {
        const { value } = await Preferences.get({ key });
        return value;
    },
    setItem: async (key: string, value: string): Promise<void> => {
        await Preferences.set({ key, value });
    },
    removeItem: async (key: string): Promise<void> => {
        await Preferences.remove({ key });
    },
};

export const asyncPersister = createAsyncStoragePersister({
    storage: capacitorAsyncStorage,
});
