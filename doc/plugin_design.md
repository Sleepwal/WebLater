# 浏览器插件开发文档 - Web Later

## 1. 项目概述
本项目旨在开发一个轻量级的浏览器插件，帮助用户便捷地保存网页链接以便稍后阅读。项目采用现代化的前端技术栈，确保高性能与良好的用户体验。

## 2. 技术栈
- **包管理器**: [pnpm](https://pnpm.io/)
- **核心框架**: [Vue 3](https://vuejs.org/)
- **构建工具**: [Vite](https://vitejs.dev/) (配合 CRXJS Vite Plugin 或类似工具适配插件开发)
- **插件标准**: Manifest V3
- **状态管理**: Pinia (可选，视复杂度而定)
- **样式方案**: TailwindCSS

## 3. 功能需求

### 3.1 核心功能：链接保存
- **自动抓取**: 打开插件弹窗时，自动获取当前活动标签页的标题 (Title) 和 网址 (URL)。
- **手动编辑**: 允许用户在保存前修改标题或 URL。
- **一键保存**: 提供醒目的保存按钮，将数据持久化存储。

### 3.2 链接管理 (稍后阅读)
- **列表展示**: 以清晰的列表形式展示所有未读/已保存的链接。
- **快捷操作**: 
  - 点击链接：在新标签页打开。
  - 删除按钮：移除不再需要的链接。
- **状态标记**: (可选) 标记为“已读”或“未读”。

### 3.3 分组管理
- **分组创建**: 用户可以添加自定义分组（例如：技术文档、新闻、娱乐）。
- **归类**: 在保存链接时，可以选择所属分组；也可以在列表中对已保存链接进行移动。
- **筛选**: 支持按分组筛选显示链接列表。

## 4. 数据结构设计 (chrome.storage.local)

建议使用如下 JSON 结构存储数据：

```typescript
interface Bookmark {
  id: string;         // 唯一标识符
  title: string;      // 网页标题
  url: string;        // 网页链接
  groupId: string;    // 所属分组ID，默认分组可为空或 'default'
  createdAt: number;  // 创建时间戳
}

interface Group {
  id: string;
  name: string;       // 分组名称
  order: number;      // 排序权重
}

// 存储结构
interface StorageSchema {
  bookmarks: Bookmark[];
  groups: Group[];
}
```

## 5. 目录结构建议

```
web_later/
├── doc/                # 文档目录
│   └── plugin_design.md
├── src/
│   ├── assets/         # 静态资源
│   ├── components/     # Vue 组件
│   │   ├── LinkItem.vue
│   │   ├── GroupList.vue
│   │   └── Header.vue
│   ├── popup/          # 插件弹窗入口
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── App.vue
│   ├── background/     # 后台脚本 (Service Worker)
│   ├── utils/          # 工具函数 (如 storage 封装)
│   └── manifest.json   # 插件配置文件
├── package.json
├── pnpm-lock.yaml
└── vite.config.ts
```

## 6. 开发计划
1. **环境搭建**: 初始化 Vue3 + Vite 项目，配置 Manifest V3。
2. **UI 实现**: 开发 Popup 界面，包括链接列表、添加表单和分组侧栏。
3. **逻辑开发**: 
   - 实现 `chrome.tabs` 获取当前页面信息。
   - 封装 `chrome.storage` 实现增删改查。
   - 实现分组逻辑。
4. **测试与优化**: 调试插件功能，优化交互体验。
