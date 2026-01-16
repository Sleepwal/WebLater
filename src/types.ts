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
