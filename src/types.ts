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
}

export interface Group {
  id: string;
  name: string;
  order: number;
}

export interface StorageSchema {
  bookmarks: Bookmark[];
  groups: Group[];
}
