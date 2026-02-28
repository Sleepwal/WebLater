/**
 * 存储工具模块
 * 
 * 封装 Chrome Extension Storage API，提供书签和分组数据的持久化存储
 * 开发环境下使用 localStorage 作为 mock 存储进行调试
 */
import type { Bookmark, Group, StorageSchema } from '../types';

const DEFAULT_GROUP_ID = 'default';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const isDev = import.meta.env.MODE === 'development' && (typeof chrome === 'undefined' || !chrome.storage);

let mockData: StorageSchema = {
  bookmarks: [],
  groups: [{ id: DEFAULT_GROUP_ID, name: '默认', order: 0 }]
};

async function getData(): Promise<StorageSchema> {
  if (isDev) {
    console.log('Reading from mock storage');
    const local = localStorage.getItem('web-later-mock');
    if (local) {
      mockData = JSON.parse(local);
    }
    return mockData;
  }
  
  const result = await chrome.storage.local.get(['bookmarks', 'groups']);
  return {
    bookmarks: result.bookmarks || [],
    groups: result.groups || [
      { id: DEFAULT_GROUP_ID, name: '默认', order: 0 }
    ],
  };
}

async function setData(data: Partial<StorageSchema>): Promise<void> {
  if (isDev) {
    console.log('Writing to mock storage', data);
    mockData = { ...mockData, ...data };
    localStorage.setItem('web-later-mock', JSON.stringify(mockData));
    return;
  }
  await chrome.storage.local.set(data);
}

const VALID_KEYS = ['bookmarks', 'groups', 'settings', 'backups', 'searchHistory'] as const
type ValidKey = typeof VALID_KEYS[number]

function validateStorageData(data: Partial<StorageSchema>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const key of Object.keys(data)) {
    if (!VALID_KEYS.includes(key as ValidKey)) {
      errors.push(`Invalid key: ${key}`)
    }
  }

  if (data.bookmarks !== undefined && !Array.isArray(data.bookmarks)) {
    errors.push('bookmarks must be an array')
  }

  if (data.groups !== undefined && !Array.isArray(data.groups)) {
    errors.push('groups must be an array')
  }

  if (data.settings !== undefined && typeof data.settings !== 'object') {
    errors.push('settings must be an object')
  }

  if (data.backups !== undefined && !Array.isArray(data.backups)) {
    errors.push('backups must be an array')
  }

  if (data.searchHistory !== undefined && !Array.isArray(data.searchHistory)) {
    errors.push('searchHistory must be an array')
  }

  return { valid: errors.length === 0, errors }
}

export const storage = {
  async get(): Promise<StorageSchema> {
    return getData();
  },

  async set(data: Partial<StorageSchema>): Promise<{ success: boolean; errors?: string[] }> {
    const validation = validateStorageData(data)
    if (!validation.valid) {
      console.error('Storage validation failed:', validation.errors)
      return { success: false, errors: validation.errors }
    }
    await setData(data);
    return { success: true }
  },

  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<Bookmark> {
    const data = await getData();
    const newBookmark: Bookmark = {
      ...bookmark,
      id: generateUUID(),
      createdAt: Date.now(),
      tags: bookmark.tags || [],
      isRead: bookmark.isRead ?? false,
      notes: bookmark.notes || '',
      order: bookmark.order || 0,
      updatedAt: Date.now()
    };
    
    const bookmarks = [newBookmark, ...data.bookmarks];
    await setData({ bookmarks });
    return newBookmark;
  },

  async updateBookmark(id: string, updates: Partial<Omit<Bookmark, 'id' | 'createdAt'>>): Promise<void> {
    const data = await getData();
    const bookmarks = data.bookmarks.map(b => 
      b.id === id ? { ...b, ...updates } : b
    );
    await setData({ bookmarks });
  },

  async removeBookmark(id: string): Promise<void> {
    const data = await getData();
    const bookmarks = data.bookmarks.filter(b => b.id !== id);
    await setData({ bookmarks });
  },
  
  async addGroup(name: string): Promise<Group> {
    const data = await getData();
    const newGroup: Group = {
      id: generateUUID(),
      name,
      order: data.groups.length,
    };
    const groups = [...data.groups, newGroup];
    await setData({ groups });
    return newGroup;
  },

  async updateGroup(id: string, updates: Partial<Omit<Group, 'id'>>): Promise<void> {
    if (id === DEFAULT_GROUP_ID) return;
    const data = await getData();
    const groups = data.groups.map(g => 
      g.id === id ? { ...g, ...updates } : g
    );
    await setData({ groups });
  },

  async deleteGroup(id: string): Promise<void> {
     if (id === DEFAULT_GROUP_ID) return;
     const data = await getData();
     const bookmarks = data.bookmarks.map(b => b.groupId === id ? { ...b, groupId: DEFAULT_GROUP_ID } : b);
     const groups = data.groups.filter(g => g.id !== id);
     await setData({ groups, bookmarks });
   },

  async getGroups(): Promise<Group[]> {
    const data = await getData();
    return data.groups;
  }
};
