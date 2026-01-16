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

// 简单的环境检测
const isDev = import.meta.env.MODE === 'development' && (typeof chrome === 'undefined' || !chrome.storage);

let mockData: StorageSchema = {
  bookmarks: [],
  groups: [{ id: DEFAULT_GROUP_ID, name: '默认', order: 0 }]
};

async function getData(): Promise<StorageSchema> {
  if (isDev) {
    console.log('Reading from mock storage');
    // 从 localStorage 读取以持久化开发数据
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

export const storage = {
  async get(): Promise<StorageSchema> {
    return getData();
  },

  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<Bookmark> {
    const data = await getData();
    const newBookmark: Bookmark = {
      ...bookmark,
      id: generateUUID(),
      createdAt: Date.now(),
    };
    
    const bookmarks = [newBookmark, ...data.bookmarks];
    await setData({ bookmarks });
    return newBookmark;
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
  
  async deleteGroup(id: string): Promise<void> {
     if (id === DEFAULT_GROUP_ID) return;
     const data = await getData();
     // 将该分组下的书签移动到默认分组
     const bookmarks = data.bookmarks.map(b => b.groupId === id ? { ...b, groupId: DEFAULT_GROUP_ID } : b);
     const groups = data.groups.filter(g => g.id !== id);
     await setData({ groups, bookmarks });
  },

  async getGroups(): Promise<Group[]> {
    const data = await getData();
    return data.groups;
  }
};
