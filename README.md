# 家庭积分奖励 · 纯前端本地版 (onlyweb)

一个**纯浏览器运行**的家庭积分与游戏化任务管理系统。所有数据（成员、任务、协作大事件、心愿奖品、积分流水）都**只保存在你当前这台设备的浏览器 `localStorage` 中**，不依赖任何后端服务器，可直接部署到 **GitHub Pages** 上公开使用。

> ⚠️ **重要：数据仅存在本地，需要自行导出备份**
>
> 由于数据仅保存在**当前浏览器的 localStorage** 里，以下任一情况都会导致数据丢失：
> - 换一台电脑 / 换一台手机
> - 换一个浏览器（Chrome ↔ Safari ↔ …）
> - 清除浏览器缓存 / 网站数据 / 隐私模式
> - 不同设备之间**不会**自动同步
>
> 因此请务必养成习惯：**定期在「人物与家庭配置中心」页面点击右上角「📥 导出数据备份」**，把 JSON 备份文件保存下来。恢复时再用「📤 导入数据恢复」即可。

---

## 功能

- 🖥️ **21:9 超宽屏指挥舱看板**（`index.html`）：全家成员积分、今日打卡、协作大事件、实时积分动态、心愿商城。
- ⚙️ **人物与家庭配置中心**（`config.html`）：增删改家庭成员、专属任务、全家协作大任务、心愿奖品；支持**导出数据备份 / 导入数据恢复 / 重置默认数据**。
- 🎯 任务打卡自动加/减分、等级成长、心愿兑换、全家协作"做了一起加积分"、每日自动重置每日任务。
- 🔊 音效（Web Audio 合成，无需外部音频文件）+ 撒花庆祝动画（canvas-confetti CDN）。

## 本地运行（无需安装任何东西）

这是一个纯静态站点，两种方式任选：

**方式 A：直接双击打开**
直接双击 `index.html` 用浏览器打开即可（部分浏览器在 `file://` 下对 localStorage 限制较少，建议仍用下面的本地服务器方式）。

**方式 B：本地静态服务器（推荐）**
```bash
# 任选其一
npx serve .
# 或
python3 -m http.server 8080
# 然后浏览器访问 http://localhost:8080
```

## 部署到 GitHub Pages

因为整个站点就是仓库根目录下的静态文件，部署非常简单：

1. 把本分支（`onlyweb`）推送到你的 GitHub 仓库。
2. 进入仓库 **Settings → Pages**：
   - **Source** 选择 **Deploy from a branch**
   - **Branch** 选择 `onlyweb`（或你想发布的分支），目录选 `/ (root)`
   - 保存。
3. 稍等片刻，访问 `https://<你的用户名>.github.io/<仓库名>/` 即可。

> 仓库已包含 `.nojekyll` 文件，GitHub Pages 不会对内容做 Jekyll 处理，无需额外配置。
> 若仓库名与你的用户名不同，访问地址为 `https://<用户名>.github.io/<仓库名>/`。

## 目录结构

```
.
├── index.html          # 21:9 超宽屏家庭看板（首页）
├── config.html         # 人物与家庭配置中心
├── app.js              # 看板页前端逻辑
├── config.js           # 配置页前端逻辑
├── store.js            # 纯前端数据存储层（localStorage）+ 浏览器端 API 适配
├── style.css           # 看板 / 通用样式
├── config.css          # 配置页样式
├── .nojekyll           # 告知 GitHub Pages 不做 Jekyll 处理
└── README.md
```

### 数据存在哪里？

浏览器 `localStorage` 中的键 `homescore_store_v1`（见 `store.js` 顶部 `STORAGE_KEY`）。
`store.js` 完整复刻了原服务端的全部业务逻辑（积分、等级、任务、协作、兑换、每日重置、备份/恢复），
并以 `HS.localFetch(url, options)` 的形式对外提供与旧版 REST API **一致的调用契约**，因此前端 `app.js` / `config.js` 无需关心底层存储，只需调用 `HS.localFetch('/api/...')`。

## 从"带后端版"迁移说明

- 原 `server.js` / `database.js`（Express + SQLite/JSON 文件存储）在纯前端版中**已移除**，无需 `npm install`、无需启动 Node 服务。
- 若你之前用的是带后端版本、且希望保留历史数据：请先在后端版导出 JSON 备份，再在本页「导入数据恢复」中恢复即可（数据结构一致）。
