/**
 * 类型定义模块
 * 
 * 定义书签、分组和存储结构的数据类型
 */

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  groupId: string;
  createdAt: number;
  order?: number;
  tags?: string[];
  isRead?: boolean;
  notes?: string;
  updatedAt?: number;
}

export interface Group {
  id: string;
  name: string;
  order: number;
  parentId?: string;
  color?: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  defaultGroupId: string;
  autoMarkAsRead: boolean;
  dateFormat: string;
  itemsPerPage: number;
  enableBackup: boolean;
  backupInterval: number;
}

export interface Backup {
  id: string;
  timestamp: number;
  data: StorageSchema;
  size: number;
}

export interface SearchHistory {
  query: string;
  timestamp: number;
}

export interface StorageSchema {
  bookmarks: Bookmark[];
  groups: Group[];
  settings?: Settings;
  backups?: Backup[];
  searchHistory?: SearchHistory[];
}

export type SortType = 'createdAt' | 'title' | 'updatedAt' | 'order';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  type: SortType;
  order: SortOrder;
}

export type ReadStatusFilter = 'all' | 'read' | 'unread';
