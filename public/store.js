// HomeScore · 纯前端数据存储层 (Browser LocalStorage Adapter)
// 本文件是原服务端 database.js 的浏览器移植版：
//   - 业务逻辑（积分、任务、协作、兑换、等级、每日重置、备份/恢复）与原版完全一致
//   - 存储介质由 服务器文件(SQLite/JSON) 改为 浏览器 localStorage
//   - 对外暴露与旧 REST API 一致的调用契约（见文件底部 localFetch 与导出函数）
// 注意：所有数据仅保存在当前浏览器中，清除浏览器数据会丢失，请定期「导出数据备份」。

(function (global) {
  'use strict';

  var STORAGE_KEY = 'homescore_store_v1';
  var MAX_LOGS = 300;
  var LOG_WINDOW = 50;

  // ---- 默认示例数据（两孩家庭）----
  var DEFAULT_MEMBERS = [
    {
      id: 'mem_dad', name: '爸爸', role: '家长 · 榜样', roleType: 'parent',
      avatar: '👨‍💼', themeColor: '#3b82f6', score: 180, totalEarned: 350,
      level: 3, levelTitle: '超人老爸', wishTitle: '静音机械键盘', wishCost: 300, orderIndex: 1
    },
    {
      id: 'mem_mom', name: '妈妈', role: '家长 · 温柔力量', roleType: 'parent',
      avatar: '👩‍🏫', themeColor: '#ec4899', score: 210, totalEarned: 420,
      level: 4, levelTitle: '智慧女神', wishTitle: '周末水疗SPA', wishCost: 350, orderIndex: 2
    },
    {
      id: 'mem_kid1', name: '大宝 (轩轩)', role: '哥哥 · 小学生', roleType: 'kid',
      avatar: '👦', themeColor: '#10b981', score: 145, totalEarned: 290,
      level: 3, levelTitle: '自律小先锋', wishTitle: '乐高火星探测车', wishCost: 200, orderIndex: 3
    },
    {
      id: 'mem_kid2', name: '二宝 (彤彤)', role: '妹妹 · 幼儿园', roleType: 'kid',
      avatar: '👧', themeColor: '#f59e0b', score: 95, totalEarned: 180,
      level: 2, levelTitle: '快乐探索家', wishTitle: '迪士尼公主绘本全套', wishCost: 150, orderIndex: 4
    }
  ];

  var DEFAULT_TASKS = [
    { id: 't_dad_1', memberId: 'mem_dad', title: '带孩子户外运动/锻炼30分钟', category: '运动健康', points: 15, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_dad_2', memberId: 'mem_dad', title: '辅导作业保持耐心温和不发火', category: '情绪自律', points: 10, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_dad_3', memberId: 'mem_dad', title: '准备一顿健康营养餐或主动洗碗', category: '家庭分担', points: 10, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_mom_1', memberId: 'mem_mom', title: '亲子高质量共读绘本20分钟', category: '习惯培养', points: 15, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_mom_2', memberId: 'mem_mom', title: '坚持晚间拉伸与个人阅读30分钟', category: '自律榜样', points: 10, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_mom_3', memberId: 'mem_mom', title: '记录今日家庭闪光时刻与赞美孩子', category: '正向鼓励', points: 10, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_k1_1', memberId: 'mem_kid1', title: '放学主动完成作业并自主检查', category: '学习自律', points: 15, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_k1_2', memberId: 'mem_kid1', title: '自主整理书包与保持书桌整洁', category: '生活卫生', points: 10, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_k1_3', memberId: 'mem_kid1', title: '课外阅读经典书籍30分钟', category: '阅读拓展', points: 10, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_k1_4', memberId: 'mem_kid1', title: '主动关爱妹妹，耐心分享玩具', category: '品德情商', points: 10, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_k1_5', memberId: 'mem_kid1', title: '晚上9:30前准时刷牙上床熄灯', category: '作息自理', points: 10, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_k2_1', memberId: 'mem_kid2', title: '玩完玩具后自己放回玩具箱', category: '生活自理', points: 10, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_k2_2', memberId: 'mem_kid2', title: '饭前主动洗手，吃饭不挑食吃光光', category: '健康生活', points: 10, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_k2_3', memberId: 'mem_kid2', title: '认真听妈妈读绘本并主动提问', category: '认知习惯', points: 10, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_k2_4', memberId: 'mem_kid2', title: '自己穿脱鞋袜与脱下的衣服折好', category: '独立动手', points: 10, frequency: 'daily', completed: 0, completedAt: null },
    { id: 't_k2_5', memberId: 'mem_kid2', title: '礼貌待人，常说“谢谢”和“请”', category: '品德礼貌', points: 5, frequency: 'daily', completed: 0, completedAt: null }
  ];

  var DEFAULT_COOP_ACTIVITIES = [
    { id: 'coop_1', title: '餐后全家总动员', description: '全家分工：一人收碗筷、一人擦桌子、一人扫地、一人洗碗，厨房与客厅一尘不染！', icon: '🍽️', pointsPerPerson: 15, tag: '家务协作', completedToday: 0, lastCompletedAt: null },
    { id: 'coop_2', title: '亲子沉浸共读时光 (40分钟)', description: '全家放下手机与电子屏幕，围坐在沙发或书房，各自阅读或共同读一本好书。', icon: '📖', pointsPerPerson: 20, tag: '精神给养', completedToday: 0, lastCompletedAt: null },
    { id: 'coop_3', title: '全家户外徒步/骑行/运动', description: '周末全家一起去公园散步徒步5公里、骑单车或打羽毛球，拥抱大自然与阳光。', icon: '🏃‍♂️', pointsPerPerson: 25, tag: '体能活力', completedToday: 0, lastCompletedAt: null },
    { id: 'coop_4', title: '周末全家深层大扫除', description: '全家齐心协力打扫死角、整理衣橱与玩具区，让家焕然一新！', icon: '🧹', pointsPerPerson: 30, tag: '深度劳作', completedToday: 0, lastCompletedAt: null },
    { id: 'coop_5', title: '全家烘焙/亲子大厨之夜', description: '全员协作制作一道家庭特色菜或美味烘焙甜点，共享劳动果实与欢声笑语。', icon: '🍳', pointsPerPerson: 20, tag: '亲子美食', completedToday: 0, lastCompletedAt: null },
    { id: 'coop_6', title: '无屏幕客厅桌游之夜', description: '全家围坐玩大富翁、拼图、飞行棋或猜谜互动，享受纯粹的高质量亲情陪伴。', icon: '🎲', pointsPerPerson: 15, tag: '家庭联欢', completedToday: 0, lastCompletedAt: null }
  ];

  var DEFAULT_REWARDS = [
    { id: 'rew_1', memberId: 'mem_kid1', title: '乐高火星探测车', cost: 200, icon: '🚀', category: '实物玩具', redeemedCount: 0 },
    { id: 'rew_2', memberId: 'mem_kid1', title: '周末自主选择一次游乐园', cost: 120, icon: '🎡', category: '体验活动', redeemedCount: 0 },
    { id: 'rew_3', memberId: 'mem_kid1', title: '额外自由看动画片/玩游戏30分钟', cost: 50, icon: '🎮', category: '特权奖励', redeemedCount: 1 },
    { id: 'rew_4', memberId: 'mem_kid2', title: '迪士尼公主绘本全套', cost: 150, icon: '📚', category: '实物书籍', redeemedCount: 0 },
    { id: 'rew_5', memberId: 'mem_kid2', title: '去动物园喂小动物一次', cost: 100, icon: '🦒', category: '体验活动', redeemedCount: 0 },
    { id: 'rew_6', memberId: 'mem_kid2', title: '挑选一个喜爱的冰淇淋/甜点', cost: 40, icon: '🍦', category: '美食愿望', redeemedCount: 2 },
    { id: 'rew_7', memberId: 'mem_dad', title: '静音机械键盘', cost: 300, icon: '⌨️', category: '数码心愿', redeemedCount: 0 },
    { id: 'rew_8', memberId: 'mem_mom', title: '周末专属放松SPA与独处下午茶', cost: 350, icon: '☕', category: '生活享受', redeemedCount: 0 }
  ];

  var DEFAULT_LOGS = [
    { id: 'log_seed_1', memberId: 'mem_kid1', memberName: '大宝 (轩轩)', change: 15, reason: '完成任务：放学主动完成作业并自主检查', type: 'task', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'log_seed_2', memberId: 'mem_kid2', memberName: '二宝 (彤彤)', change: 10, reason: '完成任务：玩完玩具后自己放回玩具箱', type: 'task', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString() },
    { id: 'log_seed_3', memberId: 'all', memberName: '全家战队', change: 15, reason: '【全家齐心协作】完成活动：餐后全家总动员，全员各+15分！', type: 'coop', timestamp: new Date(Date.now() - 3600000).toISOString() }
  ];

  var DEFAULT_SYSTEM = {
    familyName: '家庭积分奖励',
    familyMotto: '全家同行 · 互助自律 · 快乐成长',
    lastRolloverDate: new Date().toISOString().split('T')[0],
    streakDays: 15
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function seedDefaults() {
    return {
      members: clone(DEFAULT_MEMBERS),
      tasks: clone(DEFAULT_TASKS),
      coopActivities: clone(DEFAULT_COOP_ACTIVITIES),
      rewards: clone(DEFAULT_REWARDS),
      logs: clone(DEFAULT_LOGS),
      system: clone(DEFAULT_SYSTEM)
    };
  }

  function load() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          var defaults = seedDefaults();
          if (!Array.isArray(parsed.members) || parsed.members.length === 0) {
            parsed.members = defaults.members;
          }
          if (!parsed.system || typeof parsed.system !== 'object') {
            parsed.system = defaults.system;
          } else {
            if (!parsed.system.familyName) parsed.system.familyName = defaults.system.familyName;
            if (!parsed.system.familyMotto) parsed.system.familyMotto = defaults.system.familyMotto;
          }
          if (Array.isArray(parsed.members)) {
            parsed.members.forEach(function (m) {
              if (m && m.totalEarned == null) m.totalEarned = m.score || 0;
              if (m && m.level == null) m.level = 1;
              if (m && !m.themeColor) m.themeColor = '#6366f1';
            });
          }
          if (!Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
            parsed.tasks = defaults.tasks;
          }
          if (!Array.isArray(parsed.coopActivities) || parsed.coopActivities.length === 0) {
            parsed.coopActivities = defaults.coopActivities;
          }
          if (!Array.isArray(parsed.rewards)) parsed.rewards = defaults.rewards;
          if (!Array.isArray(parsed.logs)) parsed.logs = defaults.logs;
          return parsed;
        }
      }
    } catch (e) {
      console.error('读取本地存储失败，将使用默认示例数据：', e);
    }
    var seeded = seedDefaults();
    persist(seeded);
    return seeded;
  }

  function persist(state) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // 常见于隐私模式或存储配额超限 —— 给出醒目提示而非静默失败
      console.error('写入本地存储失败：', e);
      try {
        var msg = '⚠️ 本地存储写入失败（可能是隐私模式或空间不足），本次更改可能未保存，请务必导出数据备份。';
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('homescore:storageerror', { detail: msg }));
        }
      } catch (_) { /* 忽略 */ }
    }
  }

  // 跨页广播：让看板页与配置页共享同一份数据时保持同步
  function notifyChange() {
    try {
      global.dispatchEvent(new CustomEvent('homescore:change'));
    } catch (e) { /* 忽略 */ }
  }

  // ---- 核心 Store ----
  function Store() {
    this.state = load();
    this.checkDailyRollover();
  }

  Store.prototype.save = function () {
    persist(this.state);
    notifyChange();
  };

  Store.prototype.checkDailyRollover = function () {
    if (!this.state) this.state = seedDefaults();
    if (!this.state.system) this.state.system = clone(DEFAULT_SYSTEM);
    var today = new Date().toISOString().split('T')[0];
    if (this.state.system.lastRolloverDate !== today) {
      if (Array.isArray(this.state.tasks)) {
        for (var i = 0; i < this.state.tasks.length; i++) {
          var task = this.state.tasks[i];
          if (task && task.frequency === 'daily') {
            task.completed = 0;
            task.completedAt = null;
          }
        }
      }
      if (Array.isArray(this.state.coopActivities)) {
        for (var j = 0; j < this.state.coopActivities.length; j++) {
          if (this.state.coopActivities[j]) this.state.coopActivities[j].completedToday = 0;
        }
      }
      this.state.system.lastRolloverDate = today;
      this.state.system.streakDays = (this.state.system.streakDays || 0) + 1;
      this.save();
    }
  };

  Store.prototype.getFullState = function () {
    this.checkDailyRollover();
    return {
      members: clone(this.state.members),
      tasks: clone(this.state.tasks),
      coopActivities: clone(this.state.coopActivities),
      rewards: clone(this.state.rewards),
      logs: clone(this.state.logs.slice(0, LOG_WINDOW)),
      system: clone(this.state.system)
    };
  };

  Store.prototype.calculateLevel = function (totalScore) {
    if (totalScore < 50) return { level: 1, title: '初出茅庐' };
    if (totalScore < 120) return { level: 2, title: '积极进步' };
    if (totalScore < 220) return { level: 3, title: '自律之星' };
    if (totalScore < 380) return { level: 4, title: '成长领航者' };
    if (totalScore < 600) return { level: 5, title: '卓越先锋' };
    return { level: 6, title: '全能榜样' };
  };

  Store.prototype.adjustMemberScore = function (memberId, delta, reason, type) {
    type = type || 'manual';
    var member = this.state.members.find(function (m) { return m.id === memberId; });
    if (!member) throw new Error('Member not found');

    member.score = Math.max(0, member.score + delta);
    if (delta > 0) {
      member.totalEarned = (member.totalEarned || 0) + delta;
    }
    var lvl = this.calculateLevel(member.totalEarned);
    member.level = lvl.level;
    if (!member.levelTitle || ['自律之星', '初出茅庐', '积极进步', '成长领航者', '卓越先锋'].indexOf(member.levelTitle) > -1) {
      member.levelTitle = lvl.title;
    }

    var logEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      memberId: member.id,
      memberName: member.name,
      change: delta,
      reason: reason || (delta >= 0 ? '获得奖励 +' + delta + '分' : '扣减积分 ' + delta + '分'),
      type: type,
      timestamp: new Date().toISOString()
    };
    this.state.logs.unshift(logEntry);
    if (this.state.logs.length > MAX_LOGS) this.state.logs.pop();

    this.save();
    return { member: clone(member), log: clone(logEntry) };
  };

  Store.prototype.toggleTask = function (taskId) {
    var task = this.state.tasks.find(function (t) { return t.id === taskId; });
    if (!task) throw new Error('Task not found');
    var member = this.state.members.find(function (m) { return m.id === task.memberId; });
    if (!member) throw new Error('Member for task not found');

    var isNowCompleted = task.completed ? 0 : 1;
    task.completed = isNowCompleted;
    task.completedAt = isNowCompleted ? new Date().toISOString() : null;

    var delta = isNowCompleted ? task.points : -task.points;
    var reason = isNowCompleted ? '完成任务：' + task.title : '撤销任务打卡：' + task.title;

    var res = this.adjustMemberScore(member.id, delta, reason, 'task');
    return { task: clone(task), member: res.member, log: res.log };
  };

  Store.prototype.completeCoopActivity = function (activityId, participantIds) {
    var activity = this.state.coopActivities.find(function (a) { return a.id === activityId; });
    if (!activity) throw new Error('Co-op activity not found');

    activity.completedToday = (activity.completedToday || 0) + 1;
    activity.lastCompletedAt = new Date().toISOString();
    this.save();

    var self = this;
    var targetMembers = participantIds && participantIds.length > 0
      ? this.state.members.filter(function (m) { return participantIds.indexOf(m.id) > -1; })
      : this.state.members;

    var updatedMembers = [];
    var logs = [];
    targetMembers.forEach(function (member) {
      var res = self.adjustMemberScore(member.id, activity.pointsPerPerson,
        '【全家齐心协作】' + activity.title + '（全员各+' + activity.pointsPerPerson + '分）', 'coop');
      updatedMembers.push(res.member);
      logs.push(res.log);
    });

    return { activity: clone(activity), updatedMembers: updatedMembers, logs: logs };
  };

  Store.prototype.redeemReward = function (rewardId, memberId) {
    var reward = this.state.rewards.find(function (r) { return r.id === rewardId; });
    if (!reward) throw new Error('Reward not found');

    var targetMemberId = memberId || reward.memberId;
    var member = this.state.members.find(function (m) { return m.id === targetMemberId; });
    if (!member) throw new Error('Target member not found');

    if (member.score < reward.cost) {
      throw new Error('积分不足！当前拥有 ' + member.score + ' 分，需要 ' + reward.cost + ' 分');
    }

    reward.redeemedCount = (reward.redeemedCount || 0) + 1;
    this.save();

    var res = this.adjustMemberScore(member.id, -reward.cost, '兑换愿望奖励：' + reward.title, 'reward');
    return { reward: clone(reward), member: res.member, log: res.log };
  };

  // ---- 人物 CRUD ----
  Store.prototype.addMember = function (data) {
    var id = 'mem_' + Date.now().toString(36);
    var newMember = {
      id: id,
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

    var self = this;
    var sampleTasks = [
      { id: 't_' + id + '_1', memberId: id, title: '每日阅读打卡20分钟', category: '阅读学习', points: 10, frequency: 'daily', completed: 0, completedAt: null },
      { id: 't_' + id + '_2', memberId: id, title: '主动做一件家务或整理房间', category: '生活自律', points: 10, frequency: 'daily', completed: 0, completedAt: null }
    ];
    sampleTasks.forEach(function (t) { self.addTask(t); });

    this.save();
    return clone(newMember);
  };

  Store.prototype.updateMember = function (id, data) {
    var member = this.state.members.find(function (m) { return m.id === id; });
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
    this.save();
    return clone(member);
  };

  Store.prototype.deleteMember = function (id) {
    var idx = this.state.members.findIndex(function (m) { return m.id === id; });
    if (idx === -1) throw new Error('Member not found');
    this.state.members.splice(idx, 1);
    this.state.tasks = this.state.tasks.filter(function (t) { return t.memberId !== id; });
    this.state.rewards = this.state.rewards.filter(function (r) { return r.memberId !== id; });
    this.save();
    return true;
  };

  // ---- 任务 CRUD ----
  Store.prototype.addTask = function (data) {
    var id = data.id || ('t_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5));
    var newTask = {
      id: id,
      memberId: data.memberId,
      title: data.title,
      category: data.category || '综合习惯',
      points: Number(data.points) || 5,
      frequency: data.frequency || 'daily',
      completed: 0,
      completedAt: null
    };
    this.state.tasks.push(newTask);
    this.save();
    return clone(newTask);
  };

  Store.prototype.updateTask = function (id, data) {
    var task = this.state.tasks.find(function (t) { return t.id === id; });
    if (!task) throw new Error('Task not found');
    if (data.title !== undefined) task.title = data.title;
    if (data.category !== undefined) task.category = data.category;
    if (data.points !== undefined) task.points = Number(data.points);
    if (data.frequency !== undefined) task.frequency = data.frequency;
    if (data.memberId !== undefined) task.memberId = data.memberId;
    this.save();
    return clone(task);
  };

  Store.prototype.deleteTask = function (id) {
    var idx = this.state.tasks.findIndex(function (t) { return t.id === id; });
    if (idx === -1) throw new Error('Task not found');
    this.state.tasks.splice(idx, 1);
    this.save();
    return true;
  };

  // ---- 协作 CRUD ----
  Store.prototype.addCoopActivity = function (data) {
    var id = 'coop_' + Date.now().toString(36);
    var newAct = {
      id: id,
      title: data.title,
      description: data.description || '',
      icon: data.icon || '🤝',
      pointsPerPerson: Number(data.pointsPerPerson) || 15,
      tag: data.tag || '共同协作',
      completedToday: 0,
      lastCompletedAt: null
    };
    this.state.coopActivities.push(newAct);
    this.save();
    return clone(newAct);
  };

  Store.prototype.updateCoopActivity = function (id, data) {
    var act = this.state.coopActivities.find(function (c) { return c.id === id; });
    if (!act) throw new Error('Co-op activity not found');
    if (data.title !== undefined) act.title = data.title;
    if (data.description !== undefined) act.description = data.description;
    if (data.icon !== undefined) act.icon = data.icon;
    if (data.pointsPerPerson !== undefined) act.pointsPerPerson = Number(data.pointsPerPerson);
    if (data.tag !== undefined) act.tag = data.tag;
    this.save();
    return clone(act);
  };

  Store.prototype.deleteCoopActivity = function (id) {
    var idx = this.state.coopActivities.findIndex(function (c) { return c.id === id; });
    if (idx === -1) throw new Error('Co-op activity not found');
    this.state.coopActivities.splice(idx, 1);
    this.save();
    return true;
  };

  // ---- 奖品 CRUD ----
  Store.prototype.addReward = function (data) {
    var id = 'rew_' + Date.now().toString(36);
    var newRew = {
      id: id,
      memberId: data.memberId || null,
      title: data.title,
      cost: Number(data.cost) || 50,
      icon: data.icon || '🎁',
      category: data.category || '心愿大奖',
      redeemedCount: 0
    };
    this.state.rewards.push(newRew);
    this.save();
    return clone(newRew);
  };

  Store.prototype.deleteReward = function (id) {
    var idx = this.state.rewards.findIndex(function (r) { return r.id === id; });
    if (idx === -1) throw new Error('Reward not found');
    this.state.rewards.splice(idx, 1);
    this.save();
    return true;
  };

  // ---- 备份与恢复 ----
  Store.prototype.exportBackup = function () {
    return clone(this.state);
  };

  Store.prototype.importBackup = function (backupData) {
    if (!backupData || !Array.isArray(backupData.members)) {
      throw new Error('Invalid backup data structure');
    }
    this.state = backupData;
    this.checkDailyRollover();
    this.save();
    return true;
  };

  Store.prototype.updateSystemSettings = function (data) {
    if (!data) return clone(this.state.system);
    if (typeof data.familyName === 'string' && data.familyName.trim()) {
      this.state.system.familyName = data.familyName.trim();
    }
    if (typeof data.familyMotto === 'string') {
      this.state.system.familyMotto = data.familyMotto.trim();
    }
    this.save();
    return clone(this.state.system);
  };

  Store.prototype.resetToDefaults = function () {
    this.state = seedDefaults();
    this.checkDailyRollover();
    this.save();
    return this.getFullState();
  };

  var store = new Store();

  // ---- 浏览器端 API 适配层 ----
  // 与旧版 REST 契约保持一致：resolve({ success, data?, error? })，
  // 从而前端 app.js / config.js 只需把 fetch 换成 localFetch 即可无缝运行。
  function ok(data) {
    return Promise.resolve({ status: 200, json: function () { return Promise.resolve({ success: true, data: data }); } });
  }
  function fail(message, status) {
    return Promise.resolve({ status: status || 400, json: function () { return Promise.resolve({ success: false, error: message }); } });
  }

  // 以 thunk 形式安全执行会抛错的 store 方法
  function run(fn) {
    return Promise.resolve()
      .then(fn)
      .then(ok, function (e) { return fail(e && e.message ? e.message : String(e)); });
  }

  function localFetch(input, options) {
    var url = String(input);
    if (url.indexOf('/api/') !== 0) {
      return fetch(input, options); // 非 API 请求交给原生 fetch
    }
    var path = url.replace(/^\/api\//, '').replace(/\?.*$/, '');
    var method = (options && options.method || 'GET').toUpperCase();
    var body = {};
    if (options && options.body) {
      try { body = JSON.parse(options.body); } catch (e) { body = {}; }
    }
    var seg = path.split('/');
    var a = seg[0], b = seg[1], c = seg[2];

    // 读取全量状态
    if (method === 'GET' && path === 'state') return ok(store.getFullState());
    // 导出备份（客户端由 HTML 下载，这里返回数据即可）
    if (method === 'GET' && path === 'backup/export') return ok(store.exportBackup());
    // 导入备份
    if (method === 'POST' && path === 'backup/import') return run(function () { return store.importBackup(body); });
    // 重置默认
    if (method === 'POST' && path === 'reset-defaults') return ok(store.resetToDefaults());

    // 系统设置（修改网站标题与标语）
    if (a === 'settings' && (method === 'POST' || method === 'PUT')) {
      return run(function () { return store.updateSystemSettings(body); });
    }

    // 成员
    if (a === 'members') {
      if (method === 'POST' && !b) return ok(store.addMember(body));
      if ((method === 'PUT' || method === 'POST') && b && !c) return ok(store.updateMember(b, body));
      if (method === 'DELETE' && b && !c) return run(function () { store.deleteMember(b); return { message: 'Member deleted' }; });
      if (b && c === 'adjust-score' && method === 'POST') {
        if (typeof body.delta !== 'number' || isNaN(body.delta)) return fail('delta must be a valid number');
        return run(function () { return store.adjustMemberScore(b, body.delta, body.reason, body.type || 'manual'); });
      }
    }
    // 任务
    if (a === 'tasks') {
      if (method === 'POST' && !b) return ok(store.addTask(body));
      if ((method === 'PUT' || method === 'POST') && b && !c) return ok(store.updateTask(b, body));
      if (method === 'DELETE' && b && !c) return run(function () { store.deleteTask(b); return { message: 'Task deleted' }; });
      if (b && c === 'toggle' && method === 'POST') return run(function () { return store.toggleTask(b); });
    }
    // 协作
    if (a === 'coop') {
      if (method === 'POST' && !b) return ok(store.addCoopActivity(body));
      if (method === 'PUT' && b && !c) return ok(store.updateCoopActivity(b, body));
      if (method === 'DELETE' && b && !c) return run(function () { store.deleteCoopActivity(b); return { message: 'Coop activity deleted' }; });
      if (b && c === 'complete' && method === 'POST') return run(function () { return store.completeCoopActivity(b, body.participantIds); });
    }
    // 奖品
    if (a === 'rewards') {
      if (method === 'POST' && !b) return ok(store.addReward(body));
      if (method === 'DELETE' && b && !c) return run(function () { store.deleteReward(b); return { message: 'Reward deleted' }; });
      if (b && c === 'redeem' && method === 'POST') return run(function () { return store.redeemReward(b, body.memberId); });
    }

    return fail('未知接口: ' + url, 404);
  }

  // 客户端导出：直接触发 JSON 文件下载（无需服务器）
  function downloadBackup() {
    var data = store.exportBackup();
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'homescore_backup_' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    return a.download;
  }

  global.HS = {
    store: store,
    localFetch: localFetch,
    downloadBackup: downloadBackup,
    STORAGE_KEY: STORAGE_KEY
  };
})(typeof window !== 'undefined' ? window : globalThis);
