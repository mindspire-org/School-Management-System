export const getPrimaryStorage = (pref = 'session') => (pref === 'local' ? localStorage : sessionStorage);
export const getSecondaryStorage = (pref = 'session') => (pref === 'local' ? sessionStorage : localStorage);

export const setItem = (storage, key, value) => storage.setItem(key, value);
export const getItem = (storage, key) => storage.getItem(key);
export const removeItem = (storage, key) => storage.removeItem(key);
