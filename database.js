const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'homescore.sqlite');
const JSON_BACKUP_FILE = path.join(DATA_DIR, 'homescore_store.json');

// Initial seed data for a 2-child family
const DEFAULT_MEMBERS = [
  {
    id: 'mem_dad',
    name: '爸爸',
    role: '家长 · 榜样',
    roleType: 'parent',
    avatar: '👨‍💼',
    themeColor: '#3b82f6',
    score: 180,
    totalEarned: 350,
    level: 3,
    levelTitle: '超人老爸',
    wishTitle: '静音机械键盘',
    wishCost: 300,
    orderIndex: 1
  },
  {
    id: 'mem_mom',
    name: '妈妈',
    role: '家长 · 温柔力量',
    roleType: 'parent',
    avatar: '👩‍🏫',
    themeColor: '#ec4899',
    score: 210,
    totalEarned: 420,
    level: 4,
    levelTitle: '智慧女神',
    wishTitle: '周末水疗SPA',
    wishCost: 350,
    orderIndex: 2
  },
  {
    id: 'mem_kid1',
    name: '大宝 (轩轩)',
    role: '哥哥 · 小学生',
    roleType: 'kid',
    avatar: '👦',
    themeColor: '#10b981',
    score: 145,
    totalEarned: 290,
    level: 3,
    levelTitle: '自律小先锋',
    wishTitle: '乐高火星探测车',
    wishCost: 200,
    orderIndex: 3
  },
  {
    id: 'mem_kid2',
    name: '二宝 (彤彤)',
    role: '妹妹 · 幼儿园',
    roleType: 'kid',
    avatar: '👧',
    themeColor: '#f59e0b',
    score: 95,
    totalEarned: 180,
    level: 2,
    levelTitle: '快乐探索家',
    wishTitle: '迪士尼公主绘本全套',
    wishCost: 150,
    orderIndex: 4
  }
];

const DEFAULT_TASKS = [
  // 爸爸任务
  { id: 't_dad_1', memberId: 'mem_dad', title: '带孩子户外运动/锻炼30分钟', category: '运动健康', points: 15, frequency: 'daily', completed: 0, completedAt: null },
  { id: 't_dad_2', memberId: 'mem_dad', title: '辅导作业保持耐心温和不发火', category: '情绪自律', points: 10, frequency: 'daily', completed: 0, completedAt: null },
  { id: 't_dad_3', memberId: 'mem_dad', title: '准备一顿健康营养餐或主动洗碗', category: '家庭分担', points: 10, frequency: 'daily', completed: 0, completedAt: null },

  // 妈妈任务
  { id: 't_mom_1', memberId: 'mem_mom', title: '亲子高质量共读绘本20分钟', category: '习惯培养', points: 15, frequency: 'daily', completed: 0, completedAt: null },
  { id: 't_mom_2', memberId: 'mem_mom', title: '坚持晚间拉伸与个人阅读30分钟', category: '自律榜样', points: 10, frequency: 'daily', completed: 0, completedAt: null },
  { id: 't_mom_3', memberId: 'mem_mom', title: '记录今日家庭闪光时刻与赞美孩子', category: '正向鼓励', points: 10, frequency: 'daily', completed: 0, completedAt: null },

  // 大宝（轩轩）任务
  { id: 't_k1_1', memberId: 'mem_kid1', title: '放学主动完成作业并自主检查', category: '学习自律', points: 15, frequency: 'daily', completed: 0, completedAt: null },
  { id: 't_k1_2', memberId: 'mem_kid1', title: '自主整理书包与保持书桌整洁', category: '生活卫生', points: 10, frequency: 'daily', completed: 0, completedAt: null },
  { id: 't_k1_3', memberId: 'mem_kid1', title: '课外阅读经典书籍30分钟', category: '阅读拓展', points: 10, frequency: 'daily', completed: 0, completedAt: null },
  { id: 't_k1_4', memberId: 'mem_kid1', title: '主动关爱妹妹，耐心分享玩具', category: '品德情商', points: 10, frequency: 'daily', completed: 0, completedAt: null },
  { id: 't_k1_5', memberId: 'mem_kid1', title: '晚上9:30前准时刷牙上床熄灯', category: '作息自理', points: 10, frequency: 'daily', completed: 0, completedAt: null },

  // 二宝（彤彤）任务
  { id: 't_k2_1', memberId: 'mem_kid2', title: '玩完玩具后自己放回玩具箱', category: '生活自理', points: 10, frequency: 'daily', completed: 0, completedAt: null },
  { id: 't_k2_2', memberId: 'mem_kid2', title: '饭前主动洗手，吃饭不挑食吃光光', category: '健康生活', points: 10, frequency: 'daily', completed: 0, completedAt: null },
  { id: 't_k2_3', memberId: 'mem_kid2', title: '认真听妈妈读绘本并主动提问', category: '认知习惯', points: 10, frequency: 'daily', completed: 0, completedAt: null },
  { id: 't_k2_4', memberId: 'mem_kid2', title: '自己穿脱鞋袜与脱下的衣服折好', category: '独立动手', points: 10, frequency: 'daily', completed: 0, completedAt: null },
  { id: 't_k2_5', memberId: 'mem_kid2', title: '礼貌待人，常说“谢谢”和“请”', category: '品德礼貌', points: 5, frequency: 'daily', completed: 0, completedAt: null }
];

// 家庭共同协作大任务（做了一起加积分）
const DEFAULT_COOP_ACTIVITIES = [
  {
    id: 'coop_1',
    title: '餐后全家总动员',
    description: '全家分工：一人收碗筷、一人擦桌子、一人扫地、一人洗碗，厨房与客厅一尘不染！',
    icon: '🍽️',
    pointsPerPerson: 15,
    tag: '家务协作',
    completedToday: 0,
    lastCompletedAt: null
  },
  {
    id: 'coop_2',
    title: '亲子沉浸共读时光 (40分钟)',
    description: '全家放下手机与电子屏幕，围坐在沙发或书房，各自阅读或共同读一本好书。',
    icon: '📖',
    pointsPerPerson: 20,
    tag: '精神给养',
    completedToday: 0,
    lastCompletedAt: null
  },
  {
    id: 'coop_3',
    title: '全家户外徒步/骑行/运动',
    description: '周末全家一起去公园散步徒步5公里、骑单车或打羽毛球，拥抱大自然与阳光。',
    icon: '🏃‍♂️',
    pointsPerPerson: 25,
    tag: '体能活力',
    completedToday: 0,
    lastCompletedAt: null
  },
  {
    id: 'coop_4',
    title: '周末全家深层大扫除',
    description: '全家齐心协力打扫死角、整理衣橱与玩具区，让家焕然一新！',
    icon: '🧹',
    pointsPerPerson: 30,
    tag: '深度劳作',
    completedToday: 0,
    lastCompletedAt: null
  },
  {
    id: 'coop_5',
    title: '全家烘焙/亲子大厨之夜',
    description: '全员协作制作一道家庭特色菜或美味烘焙甜点，共享劳动果实与欢声笑语。',
    icon: '🍳',
    pointsPerPerson: 20,
    tag: '亲子美食',
    completedToday: 0,
    lastCompletedAt: null
  },
  {
    id: 'coop_6',
    title: '无屏幕客厅桌游之夜',
    description: '全家围坐玩大富翁、拼图、飞行棋或猜谜互动，享受纯粹的高质量亲情陪伴。',
    icon: '🎲',
    pointsPerPerson: 15,
    tag: '家庭联欢',
    completedToday: 0,
    lastCompletedAt: null
  }
];

const DEFAULT_REWARDS = [
  { id: 'rew_1', memberId: 'mem_kid1', title: '乐高火星探测车', cost: 200, icon: '🚀', category: '实物玩具', redeemedCount: 0 },
  { id: 'rew_2', memberId: 'mem_kid1', title: '周末自主选择一次游乐园', cost: 120, icon: '🎡', category: '体验活动', redeemedCount: 0 },
  { id: 'rew_3', memberId: 'mem_kid1', title: '额外自由看动画片/玩游戏30分钟', cost: 50, icon: '🎮', category: '特权奖励', redeemedCount: 1 },
  { id: 'rew_4', memberId: 'mem_kid2', title: '迪士尼公主绘本全套', cost: 150, icon: '📚', category: '实物书籍', redeemedCount: 0 },
  { id: 'rew_5', memberId: 'mem_kid2', title: '去动物园喂小动物一次', cost: 100, icon: '🦒', category: '体验活动', redeemedCount: 0 },
  { id: 'rew_6', memberId: 'mem_kid2', title: '挑选一个喜爱的冰淇淋/甜点', cost: 40, icon: '🍦', category: '美食愿望', redeemedCount: 2 },
  { id: 'rew_7', memberId: 'mem_dad', title: '静音机械键盘', cost: 300, icon: '⌨️', category: '数码心愿', redeemedCount: 0 },
  { id: 'rew_8', memberId: 'mem_mom', title: '周末专属放松SPA与独处下午茶', cost: 350, icon: '☕', category: '生活享受', redeemedCount: 0 }
];

const DEFAULT_LOGS = [
  {
    id: 'log_seed_1',
    memberId: 'mem_kid1',
    memberName: '大宝 (轩轩)',
    change: 15,
    reason: '完成任务：放学主动完成作业并自主检查',
    type: 'task',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'log_seed_2',
    memberId: 'mem_kid2',
    memberName: '二宝 (彤彤)',
    change: 10,
    reason: '完成任务：玩完玩具后自己放回玩具箱',
    type: 'task',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: 'log_seed_3',
    memberId: 'all',
    memberName: '全家战队',
    change: 15,
    reason: '【全家齐心协作】完成活动：餐后全家总动员，全员各+15分！',
    type: 'coop',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

class Database {
  constructor() {
    this.sqliteDb = null;
    this.useSqlite = false;
    this.state = {
      members: [],
      tasks: [],
      coopActivities: [],
      rewards: [],
      logs: [],
      system: {
        familyName: '幸福四口之家',
        familyMotto: '自律有爱，齐心同行，做更好的自己！',
        lastRolloverDate: new Date().toISOString().split('T')[0],
        streakDays: 12
      }
    };
    this.init();
  }

  init() {
    // Try node:sqlite first
    try {
      const { DatabaseSync } = require('node:sqlite');
      this.sqliteDb = new DatabaseSync(DB_FILE);
      this.useSqlite = true;
      this.createTables();
      this.loadFromSqlite();
      console.log('✅ SQLite Database initialized successfully using node:sqlite at', DB_FILE);
    } catch (err) {
      console.warn('⚠️ node:sqlite initialization notice, using robust JSON file storage:', err.message);
      this.useSqlite = false;
      this.loadFromJson();
    }
  }

  createTables() {
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        roleType TEXT NOT NULL,
        avatar TEXT,
        themeColor TEXT,
        score INTEGER DEFAULT 0,
        totalEarned INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        levelTitle TEXT,
        wishTitle TEXT,
        wishCost INTEGER DEFAULT 100,
        orderIndex INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        memberId TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT,
        points INTEGER DEFAULT 5,
        frequency TEXT DEFAULT 'daily',
        completed INTEGER DEFAULT 0,
        completedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS coop_activities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        pointsPerPerson INTEGER DEFAULT 10,
        tag TEXT,
        completedToday INTEGER DEFAULT 0,
        lastCompletedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS rewards (
        id TEXT PRIMARY KEY,
        memberId TEXT,
        title TEXT NOT NULL,
        cost INTEGER DEFAULT 50,
        icon TEXT,
        category TEXT,
        redeemedCount INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS score_logs (
        id TEXT PRIMARY KEY,
        memberId TEXT,
        memberName TEXT,
        change INTEGER NOT NULL,
        reason TEXT,
        type TEXT,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  }

  loadFromSqlite() {
    const memberRows = this.sqliteDb.prepare('SELECT * FROM members ORDER BY orderIndex ASC').all();
    if (!memberRows || memberRows.length === 0) {
      this.seedDefaults();
      return;
    }

    this.state.members = memberRows;
    this.state.tasks = this.sqliteDb.prepare('SELECT * FROM tasks').all();
    this.state.coopActivities = this.sqliteDb.prepare('SELECT * FROM coop_activities').all();
    this.state.rewards = this.sqliteDb.prepare('SELECT * FROM rewards').all();
    this.state.logs = this.sqliteDb.prepare('SELECT * FROM score_logs ORDER BY timestamp DESC LIMIT 100').all();

    const settingRows = this.sqliteDb.prepare('SELECT * FROM settings').all();
    for (const r of settingRows) {
      try {
        this.state.system[r.key] = JSON.parse(r.value);
      } catch {
        this.state.system[r.key] = r.value;
      }
    }

    this.checkDailyRollover();
  }

  loadFromJson() {
    if (fs.existsSync(JSON_BACKUP_FILE)) {
      try {
        const raw = fs.readFileSync(JSON_BACKUP_FILE, 'utf8');
        this.state = JSON.parse(raw);
        console.log('✅ Loaded data from JSON persistence at', JSON_BACKUP_FILE);
      } catch (e) {
        console.error('Failed to parse JSON file, seeding defaults:', e);
        this.seedDefaults();
      }
    } else {
      this.seedDefaults();
    }
    this.checkDailyRollover();
  }

  saveToJson() {
    try {
      fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing JSON backup:', e);
    }
  }

  seedDefaults() {
    console.log('🌱 Seeding default initial data...');
    this.state.members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
    this.state.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    this.state.coopActivities = JSON.parse(JSON.stringify(DEFAULT_COOP_ACTIVITIES));
    this.state.rewards = JSON.parse(JSON.stringify(DEFAULT_REWARDS));
    this.state.logs = JSON.parse(JSON.stringify(DEFAULT_LOGS));
    this.state.system = {
      familyName: '幸福二孩模范家',
      familyMotto: '全家同行 · 互助自律 · 快乐成长',
      lastRolloverDate: new Date().toISOString().split('T')[0],
      streakDays: 15
    };

    if (this.useSqlite) {
      this.sqliteDb.exec('DELETE FROM members; DELETE FROM tasks; DELETE FROM coop_activities; DELETE FROM rewards; DELETE FROM score_logs; DELETE FROM settings;');
      
      const insertMember = this.sqliteDb.prepare(`
        INSERT INTO members (id, name, role, roleType, avatar, themeColor, score, totalEarned, level, levelTitle, wishTitle, wishCost, orderIndex)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of this.state.members) {
        insertMember.run(m.id, m.name, m.role, m.roleType, m.avatar, m.themeColor, m.score, m.totalEarned, m.level, m.levelTitle, m.wishTitle, m.wishCost, m.orderIndex);
      }

      const insertTask = this.sqliteDb.prepare(`
        INSERT INTO tasks (id, memberId, title, category, points, frequency, completed, completedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of this.state.tasks) {
        insertTask.run(t.id, t.memberId, t.title, t.category, t.points, t.frequency, t.completed, t.completedAt);
      }

      const insertCoop = this.sqliteDb.prepare(`
        INSERT INTO coop_activities (id, title, description, icon, pointsPerPerson, tag, completedToday, lastCompletedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const c of this.state.coopActivities) {
        insertCoop.run(c.id, c.title, c.description, c.icon, c.pointsPerPerson, c.tag, c.completedToday, c.lastCompletedAt);
      }

      const insertReward = this.sqliteDb.prepare(`
        INSERT INTO rewards (id, memberId, title, cost, icon, category, redeemedCount)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of this.state.rewards) {
        insertReward.run(r.id, r.memberId, r.title, r.cost, r.icon, r.category, r.redeemedCount);
      }

      const insertLog = this.sqliteDb.prepare(`
        INSERT INTO score_logs (id, memberId, memberName, change, reason, type, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const l of this.state.logs) {
        insertLog.run(l.id, l.memberId, l.memberName, l.change, l.reason, l.type, l.timestamp);
      }

      const insertSetting = this.sqliteDb.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
      for (const [k, v] of Object.entries(this.state.system)) {
        insertSetting.run(k, JSON.stringify(v));
      }
    }

    this.saveToJson();
  }

  checkDailyRollover() {
    const today = new Date().toISOString().split('T')[0];
    if (this.state.system.lastRolloverDate !== today) {
      console.log(`🌅 New day detected (${today}). Resetting daily tasks...`);
      for (const task of this.state.tasks) {
        if (task.frequency === 'daily') {
          task.completed = 0;
          task.completedAt = null;
        }
      }
      for (const coop of this.state.coopActivities) {
        coop.completedToday = 0;
      }
      this.state.system.lastRolloverDate = today;
      this.state.system.streakDays = (this.state.system.streakDays || 0) + 1;

      if (this.useSqlite) {
        this.sqliteDb.prepare("UPDATE tasks SET completed = 0, completedAt = NULL WHERE frequency = 'daily'").run();
        this.sqliteDb.prepare('UPDATE coop_activities SET completedToday = 0').run();
        this.sqliteDb.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('lastRolloverDate', JSON.stringify(today));
        this.sqliteDb.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('streakDays', JSON.stringify(this.state.system.streakDays));
      }
      this.saveToJson();
    }
  }

  // --- API State Read ---
  getFullState() {
    this.checkDailyRollover();
    return {
      members: this.state.members,
      tasks: this.state.tasks,
      coopActivities: this.state.coopActivities,
      rewards: this.state.rewards,
      logs: this.state.logs.slice(0, 50),
      system: this.state.system
    };
  }

  // --- Member Operations ---
  calculateLevel(totalScore) {
    if (totalScore < 50) return { level: 1, title: '初出茅庐' };
    if (totalScore < 120) return { level: 2, title: '积极进步' };
    if (totalScore < 220) return { level: 3, title: '自律之星' };
    if (totalScore < 380) return { level: 4, title: '成长领航者' };
    if (totalScore < 600) return { level: 5, title: '卓越先锋' };
    return { level: 6, title: '全能榜样' };
  }

  adjustMemberScore(memberId, delta, reason, type = 'manual') {
    const member = this.state.members.find(m => m.id === memberId);
    if (!member) throw new Error('Member not found');

    member.score = Math.max(0, member.score + delta);
    if (delta > 0) {
      member.totalEarned = (member.totalEarned || 0) + delta;
    }
    const { level, title } = this.calculateLevel(member.totalEarned);
    member.level = level;
    if (!member.levelTitle || member.levelTitle === '自律之星' || member.levelTitle === '初出茅庐' || member.levelTitle === '积极进步' || member.levelTitle === '成长领航者' || member.levelTitle === '卓越先锋') {
      member.levelTitle = title;
    }

    const logEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      memberId: member.id,
      memberName: member.name,
      change: delta,
      reason: reason || (delta >= 0 ? `获得奖励 +${delta}分` : `扣减积分 ${delta}分`),
      type: type,
      timestamp: new Date().toISOString()
    };
    this.state.logs.unshift(logEntry);
    if (this.state.logs.length > 300) this.state.logs.pop();

    if (this.useSqlite) {
      this.sqliteDb.prepare(`
        UPDATE members SET score = ?, totalEarned = ?, level = ?, levelTitle = ? WHERE id = ?
      `).run(member.score, member.totalEarned, member.level, member.levelTitle, member.id);

      this.sqliteDb.prepare(`
        INSERT INTO score_logs (id, memberId, memberName, change, reason, type, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(logEntry.id, logEntry.memberId, logEntry.memberName, logEntry.change, logEntry.reason, logEntry.type, logEntry.timestamp);
    }
    this.saveToJson();

    return { member, log: logEntry };
  }

  toggleTask(taskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const member = this.state.members.find(m => m.id === task.memberId);
    if (!member) throw new Error('Member for task not found');

    const isNowCompleted = task.completed ? 0 : 1;
    task.completed = isNowCompleted;
    task.completedAt = isNowCompleted ? new Date().toISOString() : null;

    const delta = isNowCompleted ? task.points : -task.points;
    const reason = isNowCompleted ? `完成任务：${task.title}` : `撤销任务打卡：${task.title}`;

    if (this.useSqlite) {
      this.sqliteDb.prepare('UPDATE tasks SET completed = ?, completedAt = ? WHERE id = ?')
        .run(task.completed, task.completedAt, task.id);
    }

    const { member: updatedMember, log } = this.adjustMemberScore(member.id, delta, reason, 'task');
    return { task, member: updatedMember, log };
  }

  // --- Family Co-op Quest Completion (Together Gain Points) ---
  completeCoopActivity(activityId, participantIds = null) {
    const activity = this.state.coopActivities.find(a => a.id === activityId);
    if (!activity) throw new Error('Co-op activity not found');

    const now = new Date().toISOString();
    activity.completedToday = (activity.completedToday || 0) + 1;
    activity.lastCompletedAt = now;

    if (this.useSqlite) {
      this.sqliteDb.prepare('UPDATE coop_activities SET completedToday = ?, lastCompletedAt = ? WHERE id = ?')
        .run(activity.completedToday, activity.lastCompletedAt, activity.id);
    }

    // Determine participating members
    const targetMembers = participantIds && participantIds.length > 0
      ? this.state.members.filter(m => participantIds.includes(m.id))
      : this.state.members;

    const updatedMembers = [];
    const logs = [];

    for (const member of targetMembers) {
      const res = this.adjustMemberScore(
        member.id,
        activity.pointsPerPerson,
        `【全家齐心协作】${activity.title}（全员各+${activity.pointsPerPerson}分）`,
        'coop'
      );
      updatedMembers.push(res.member);
      logs.push(res.log);
    }

    return { activity, updatedMembers, logs };
  }

  // --- Reward Redemption ---
  redeemReward(rewardId, memberId = null) {
    const reward = this.state.rewards.find(r => r.id === rewardId);
    if (!reward) throw new Error('Reward not found');

    const targetMemberId = memberId || reward.memberId;
    const member = this.state.members.find(m => m.id === targetMemberId);
    if (!member) throw new Error('Target member not found');

    if (member.score < reward.cost) {
      throw new Error(`积分不足！当前拥有 ${member.score} 分，需要 ${reward.cost} 分`);
    }

    reward.redeemedCount = (reward.redeemedCount || 0) + 1;
    if (this.useSqlite) {
      this.sqliteDb.prepare('UPDATE rewards SET redeemedCount = ? WHERE id = ?')
        .run(reward.redeemedCount, reward.id);
    }

    const { member: updatedMember, log } = this.adjustMemberScore(
      member.id,
      -reward.cost,
      `兑换愿望奖励：${reward.title}`,
      'reward'
    );

    return { reward, member: updatedMember, log };
  }

  // --- CRUD for Members (Character Configuration Page) ---
  addMember(data) {
    const id = 'mem_' + Date.now().toString(36);
    const newMember = {
      id,
      name: data.name || '新成员',
      role: data.role || '家庭成员',
      roleType: data.roleType || 'kid',
      avatar: data.avatar || '🌟',
      themeColor: data.themeColor || '#6366f1',
      score: Number(data.score) || 0,
      totalEarned: Number(data.totalEarned) || Number(data.score) || 0,
      level: 1,
      levelTitle: data.levelTitle || '积极小能手',
      wishTitle: data.wishTitle || '心愿奖励',
      wishCost: Number(data.wishCost) || 100,
      orderIndex: this.state.members.length + 1
    };

    this.state.members.push(newMember);
    if (this.useSqlite) {
      this.sqliteDb.prepare(`
        INSERT INTO members (id, name, role, roleType, avatar, themeColor, score, totalEarned, level, levelTitle, wishTitle, wishCost, orderIndex)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newMember.id, newMember.name, newMember.role, newMember.roleType, newMember.avatar, newMember.themeColor, newMember.score, newMember.totalEarned, newMember.level, newMember.levelTitle, newMember.wishTitle, newMember.wishCost, newMember.orderIndex);
    }

    // Also add a couple default basic tasks for this member
    const sampleTask1 = {
      id: 't_' + id + '_1',
      memberId: id,
      title: '每日阅读打卡20分钟',
      category: '阅读学习',
      points: 10,
      frequency: 'daily',
      completed: 0,
      completedAt: null
    };
    const sampleTask2 = {
      id: 't_' + id + '_2',
      memberId: id,
      title: '主动做一件家务或整理房间',
      category: '生活自律',
      points: 10,
      frequency: 'daily',
      completed: 0,
      completedAt: null
    };
    this.addTask(sampleTask1);
    this.addTask(sampleTask2);

    this.saveToJson();
    return newMember;
  }

  updateMember(id, data) {
    const member = this.state.members.find(m => m.id === id);
    if (!member) throw new Error('Member not found');

    if (data.name !== undefined) member.name = data.name;
    if (data.role !== undefined) member.role = data.role;
    if (data.roleType !== undefined) member.roleType = data.roleType;
    if (data.avatar !== undefined) member.avatar = data.avatar;
    if (data.themeColor !== undefined) member.themeColor = data.themeColor;
    if (data.levelTitle !== undefined) member.levelTitle = data.levelTitle;
    if (data.wishTitle !== undefined) member.wishTitle = data.wishTitle;
    if (data.wishCost !== undefined) member.wishCost = Number(data.wishCost);
    if (data.score !== undefined) member.score = Number(data.score);
    if (data.totalEarned !== undefined) member.totalEarned = Number(data.totalEarned);

    if (this.useSqlite) {
      this.sqliteDb.prepare(`
        UPDATE members SET name = ?, role = ?, roleType = ?, avatar = ?, themeColor = ?, levelTitle = ?, wishTitle = ?, wishCost = ?, score = ?, totalEarned = ?
        WHERE id = ?
      `).run(member.name, member.role, member.roleType, member.avatar, member.themeColor, member.levelTitle, member.wishTitle, member.wishCost, member.score, member.totalEarned, member.id);
    }
    this.saveToJson();
    return member;
  }

  deleteMember(id) {
    const idx = this.state.members.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Member not found');

    this.state.members.splice(idx, 1);
    this.state.tasks = this.state.tasks.filter(t => t.memberId !== id);
    this.state.rewards = this.state.rewards.filter(r => r.memberId !== id);

    if (this.useSqlite) {
      this.sqliteDb.prepare('DELETE FROM members WHERE id = ?').run(id);
      this.sqliteDb.prepare('DELETE FROM tasks WHERE memberId = ?').run(id);
      this.sqliteDb.prepare('DELETE FROM rewards WHERE memberId = ?').run(id);
    }
    this.saveToJson();
    return true;
  }

  // --- CRUD for Tasks ---
  addTask(data) {
    const id = data.id || ('t_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5));
    const newTask = {
      id,
      memberId: data.memberId,
      title: data.title,
      category: data.category || '综合习惯',
      points: Number(data.points) || 5,
      frequency: data.frequency || 'daily',
      completed: 0,
      completedAt: null
    };
    this.state.tasks.push(newTask);
    if (this.useSqlite) {
      this.sqliteDb.prepare(`
        INSERT INTO tasks (id, memberId, title, category, points, frequency, completed, completedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newTask.id, newTask.memberId, newTask.title, newTask.category, newTask.points, newTask.frequency, newTask.completed, newTask.completedAt);
    }
    this.saveToJson();
    return newTask;
  }

  updateTask(id, data) {
    const task = this.state.tasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');

    if (data.title !== undefined) task.title = data.title;
    if (data.category !== undefined) task.category = data.category;
    if (data.points !== undefined) task.points = Number(data.points);
    if (data.frequency !== undefined) task.frequency = data.frequency;
    if (data.memberId !== undefined) task.memberId = data.memberId;

    if (this.useSqlite) {
      this.sqliteDb.prepare(`
        UPDATE tasks SET title = ?, category = ?, points = ?, frequency = ?, memberId = ? WHERE id = ?
      `).run(task.title, task.category, task.points, task.frequency, task.memberId, task.id);
    }
    this.saveToJson();
    return task;
  }

  deleteTask(id) {
    const idx = this.state.tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    this.state.tasks.splice(idx, 1);
    if (this.useSqlite) {
      this.sqliteDb.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    }
    this.saveToJson();
    return true;
  }

  // --- CRUD for Coop Activities ---
  addCoopActivity(data) {
    const id = 'coop_' + Date.now().toString(36);
    const newAct = {
      id,
      title: data.title,
      description: data.description || '',
      icon: data.icon || '🤝',
      pointsPerPerson: Number(data.pointsPerPerson) || 15,
      tag: data.tag || '共同协作',
      completedToday: 0,
      lastCompletedAt: null
    };
    this.state.coopActivities.push(newAct);
    if (this.useSqlite) {
      this.sqliteDb.prepare(`
        INSERT INTO coop_activities (id, title, description, icon, pointsPerPerson, tag, completedToday, lastCompletedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newAct.id, newAct.title, newAct.description, newAct.icon, newAct.pointsPerPerson, newAct.tag, newAct.completedToday, newAct.lastCompletedAt);
    }
    this.saveToJson();
    return newAct;
  }

  updateCoopActivity(id, data) {
    const act = this.state.coopActivities.find(c => c.id === id);
    if (!act) throw new Error('Co-op activity not found');

    if (data.title !== undefined) act.title = data.title;
    if (data.description !== undefined) act.description = data.description;
    if (data.icon !== undefined) act.icon = data.icon;
    if (data.pointsPerPerson !== undefined) act.pointsPerPerson = Number(data.pointsPerPerson);
    if (data.tag !== undefined) act.tag = data.tag;

    if (this.useSqlite) {
      this.sqliteDb.prepare(`
        UPDATE coop_activities SET title = ?, description = ?, icon = ?, pointsPerPerson = ?, tag = ? WHERE id = ?
      `).run(act.title, act.description, act.icon, act.pointsPerPerson, act.tag, act.id);
    }
    this.saveToJson();
    return act;
  }

  deleteCoopActivity(id) {
    const idx = this.state.coopActivities.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Co-op activity not found');
    this.state.coopActivities.splice(idx, 1);
    if (this.useSqlite) {
      this.sqliteDb.prepare('DELETE FROM coop_activities WHERE id = ?').run(id);
    }
    this.saveToJson();
    return true;
  }

  // --- CRUD for Rewards ---
  addReward(data) {
    const id = 'rew_' + Date.now().toString(36);
    const newRew = {
      id,
      memberId: data.memberId || null,
      title: data.title,
      cost: Number(data.cost) || 50,
      icon: data.icon || '🎁',
      category: data.category || '心愿大奖',
      redeemedCount: 0
    };
    this.state.rewards.push(newRew);
    if (this.useSqlite) {
      this.sqliteDb.prepare(`
        INSERT INTO rewards (id, memberId, title, cost, icon, category, redeemedCount)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(newRew.id, newRew.memberId, newRew.title, newRew.cost, newRew.icon, newRew.category, newRew.redeemedCount);
    }
    this.saveToJson();
    return newRew;
  }

  deleteReward(id) {
    const idx = this.state.rewards.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Reward not found');
    this.state.rewards.splice(idx, 1);
    if (this.useSqlite) {
      this.sqliteDb.prepare('DELETE FROM rewards WHERE id = ?').run(id);
    }
    this.saveToJson();
    return true;
  }

  // --- Backup & Restore ---
  exportBackup() {
    return this.state;
  }

  importBackup(backupData) {
    if (!backupData || !Array.isArray(backupData.members)) {
      throw new Error('Invalid backup data structure');
    }
    this.state = backupData;
    if (this.useSqlite) {
      this.seedDefaults(); // Will rewrite tables with state
    }
    this.saveToJson();
    return true;
  }

  resetToDefaults() {
    this.seedDefaults();
    return this.getFullState();
  }
}

module.exports = new Database();
