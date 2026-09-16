// HomeScore 21:9 Dashboard Client Application

let appState = null;
let soundEnabled = true;
let currentAdjustMemberId = null;
let currentCoopActivityId = null;
let selectedParticipants = [];

// Web Audio API Synthesizer (Zero external audio assets needed, 100% offline reliable)
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCoin() {
    if (!soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playSuccess() {
    if (!soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.25, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.25);
    });
  }

  playFanfare() {
    if (!soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Triumphant orchestral chime
    const chords = [
      { t: 0.00, f: [523.25, 659.25, 783.99] }, // C major
      { t: 0.15, f: [587.33, 739.99, 880.00] }, // D major
      { t: 0.30, f: [659.25, 830.61, 987.77] }, // E major
      { t: 0.50, f: [1046.5, 1318.5, 1567.98] } // High C major
    ];
    chords.forEach(chord => {
      chord.f.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + chord.t);
        gain.gain.setValueAtTime(0.2, now + chord.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + chord.t + (chord.t === 0.5 ? 0.8 : 0.2));
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + chord.t);
        osc.stop(now + chord.t + (chord.t === 0.5 ? 0.8 : 0.2));
      });
    });
  }
}

const soundEngine = new SoundEngine();

// Pre-defined Habit Tags for Quick Adjustment
const POSITIVE_HABITS = [
  { text: '主动做家务', delta: 10 },
  { text: '自主作业且认真', delta: 15 },
  { text: '早睡早起作息好', delta: 10 },
  { text: '关心体贴家人', delta: 10 },
  { text: '情绪稳定有耐心', delta: 10 },
  { text: '坚持阅读30分钟', delta: 10 },
  { text: '主动整理玩具书包', delta: 10 },
  { text: '户外运动锻炼好', delta: 15 }
];

const NEGATIVE_HABITS = [
  { text: '拖延磨蹭超时', delta: -5 },
  { text: '任性发脾气', delta: -5 },
  { text: '沉迷屏幕超时', delta: -10 },
  { text: '乱丢物品未整理', delta: -5 },
  { text: '挑食浪费食物', delta: -5 }
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initLayoutMode();
  setupEventListeners();
  loadState();
  // 数据存于浏览器 localStorage：无需轮询服务器。
  // 通过 homescore:change 事件实现同浏览器多标签页（看板/配置页）实时同步。
  window.addEventListener('homescore:change', loadState);
  window.addEventListener('storage', loadState);
  // 本地存储写入失败（隐私模式/配额超限）时弹出醒目提示
  window.addEventListener('homescore:storageerror', (e) => showToast(e.detail || '⚠️ 本地存储写入失败'));
});

function initLayoutMode() {
  const savedMode = localStorage.getItem('homescore_layout_mode');
  const isUltraWideScreen = (window.innerWidth / window.innerHeight) >= 1.85 || window.innerWidth >= 2000;
  
  if (savedMode === 'standard') {
    setLayoutMode(false, false);
  } else if (savedMode === 'ultrawide' || isUltraWideScreen) {
    setLayoutMode(true, false);
  }

  const toggleBtn = document.getElementById('btn-toggle-ultrawide');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isCurrentlyUltrawide = document.body.classList.contains('mode-ultrawide') || 
        (!document.body.classList.contains('mode-standard') && ((window.innerWidth / window.innerHeight) >= 1.85 || window.innerWidth >= 2000));
      const newMode = !isCurrentlyUltrawide;
      setLayoutMode(newMode, true);
    });
  }

  window.addEventListener('resize', () => {
    const userPref = localStorage.getItem('homescore_layout_mode');
    if (!userPref) {
      const wide = (window.innerWidth / window.innerHeight) >= 1.85 || window.innerWidth >= 2000;
      updateBadgeUI(wide);
    }
  });
}

function setLayoutMode(isUltrawide, saveToStorage = true) {
  if (isUltrawide) {
    document.body.classList.add('mode-ultrawide');
    document.body.classList.remove('mode-standard');
    if (saveToStorage) localStorage.setItem('homescore_layout_mode', 'ultrawide');
  } else {
    document.body.classList.add('mode-standard');
    document.body.classList.remove('mode-ultrawide');
    if (saveToStorage) localStorage.setItem('homescore_layout_mode', 'standard');
  }
  updateBadgeUI(isUltrawide);
  if (saveToStorage) {
    showToast(isUltrawide ? '🖥️ 已启用：21:9 免滚动宽屏指挥舱' : '📜 已切换为：标准流式看板');
  }
}

function updateBadgeUI(isUltrawide) {
  const badgeText = document.getElementById('badge-mode-text');
  const badgeBtn = document.getElementById('btn-toggle-ultrawide');
  if (badgeText) {
    badgeText.textContent = isUltrawide ? '21:9 宽屏指挥舱 (免滚动)' : '标准流式看板';
  }
  if (badgeBtn) {
    if (isUltrawide) {
      badgeBtn.classList.add('active');
    } else {
      badgeBtn.classList.remove('active');
    }
  }
}

function initClock() {
  const clockEl = document.getElementById('current-clock');
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const update = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日`;
    const dayStr = days[now.getDay()];
    clockEl.textContent = `${dateStr} ${dayStr} ${timeStr}`;
  };
  update();
  setInterval(update, 1000);
}

function setupEventListeners() {
  // Sound toggle
  const soundBtn = document.getElementById('btn-sound-toggle');
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
    soundBtn.querySelector('.btn-label').textContent = soundEnabled ? '音效开启' : '音效静音';
    showToast(soundEnabled ? '🔔 音效已开启' : '🔕 音效已静音');
  });

  // Fullscreen toggle
  const fsBtn = document.getElementById('btn-fullscreen');
  fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });

  // Co-op Info Modal / Toast
  document.getElementById('btn-quick-coop-info').addEventListener('click', () => {
    showToast('💡 协作理念：打破单向说教，家长示范与孩子共同达标，每完成一项，全家齐心各加积分！');
  });
}

// --- Fetch & Render State ---
async function loadState() {
  try {
    const res = await HS.localFetch('/api/state');
    const json = await res.json();
    if (json.success && json.data) {
      appState = json.data;
      renderHeaderStats();
      renderCoopActivities();
      renderMembers();
      renderActivityFeed();
      renderRewardsShowcase();
    }
  } catch (err) {
    console.error('Failed to load state:', err);
  }
}

// Render Header Stats
function renderHeaderStats() {
  const { system, members, logs } = appState;
  document.getElementById('family-name').textContent = system.familyName || '家庭模范战队';
  document.getElementById('family-motto').textContent = system.familyMotto || '齐心同行 · 快乐成长';
  document.getElementById('stat-streak').textContent = `${system.streakDays || 1} 天`;

  const totalFamilyScore = members.reduce((sum, m) => sum + (m.score || 0), 0);
  document.getElementById('stat-family-score').textContent = `${totalFamilyScore} 分`;

  // Calculate today's gain from logs
  const todayStr = new Date().toISOString().split('T')[0];
  const todayGain = logs
    .filter(l => l.timestamp.startsWith(todayStr) && l.change > 0)
    .reduce((sum, l) => sum + l.change, 0);
  document.getElementById('stat-today-gain').textContent = `+${todayGain} 分`;
}

// Render Family Co-op Quests
function renderCoopActivities() {
  const container = document.getElementById('coop-cards-container');
  container.innerHTML = '';

  appState.coopActivities.forEach(act => {
    const card = document.createElement('div');
    card.className = 'coop-card';
    card.innerHTML = `
      <div class="coop-card-top">
        <div class="coop-icon">${act.icon || '🤝'}</div>
        <div class="coop-info">
          <div class="coop-title">${escapeHtml(act.title)}</div>
          <span class="coop-tag">${escapeHtml(act.tag || '共同协作')}</span>
          <div class="coop-desc">${escapeHtml(act.description || '')}</div>
        </div>
      </div>
      <div class="coop-card-bottom">
        <div class="coop-points">全员各 +${act.pointsPerPerson} 分</div>
        <button class="btn-coop-claim" onclick="openCoopModal('${act.id}')">
          <span>🎉</span> 全家齐心打卡
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render Member Boards (Ultra-wide multi-column)
function renderMembers() {
  const container = document.getElementById('members-container');
  container.innerHTML = '';

  appState.members.forEach(member => {
    const memberTasks = appState.tasks.filter(t => t.memberId === member.id);
    const completedTasksCount = memberTasks.filter(t => t.completed).length;

    // Calculate level & XP
    const nextLevelThreshold = getNextLevelTarget(member.totalEarned || member.score);
    const currentLevelBase = getPrevLevelThreshold(member.totalEarned || member.score);
    const progressPercent = Math.min(100, Math.round(((member.totalEarned - currentLevelBase) / (nextLevelThreshold - currentLevelBase)) * 100));

    // Wish progress
    const wishCost = member.wishCost || 100;
    const wishProgressPercent = Math.min(100, Math.round((member.score / wishCost) * 100));
    const canRedeemWish = member.score >= wishCost;

    const col = document.createElement('div');
    col.className = 'member-column-card';
    col.style.setProperty('--theme-color', member.themeColor || '#6366f1');

    col.innerHTML = `
      <!-- Header -->
      <div class="member-header">
        <div class="member-header-top">
          <span class="member-role-badge">${escapeHtml(member.role)}</span>
          <span class="member-today-badge">今日已成 ${completedTasksCount}/${memberTasks.length} 项</span>
        </div>
        <div class="member-profile-row">
          <div class="member-avatar" style="border-color: ${member.themeColor};">${member.avatar || '🌟'}</div>
          <div class="member-title-box">
            <div class="member-name">
              ${escapeHtml(member.name)}
              <span class="member-level-badge">Lv.${member.level || 1} ${escapeHtml(member.levelTitle || '自律之星')}</span>
            </div>
            <div class="member-level-bar-box">
              <div class="level-progress-bg">
                <div class="level-progress-fill" style="width: ${progressPercent}%;"></div>
              </div>
              <div class="level-text-sub">
                <span>成长总能值: ${member.totalEarned || member.score}</span>
                <span>下一级还需 ${Math.max(0, nextLevelThreshold - member.totalEarned)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Score Display -->
      <div class="member-score-display">
        <div class="score-main">
          <span class="score-num" id="score-num-${member.id}">${member.score}</span>
          <span class="score-unit">当前可用积分</span>
        </div>
        <div class="score-lifetime">历史总产出: ${member.totalEarned || member.score} 分</div>
      </div>

      <!-- Quick Adjust Strip -->
      <div class="quick-action-strip">
        <button class="btn-point-quick point-add" onclick="quickAdjust('${member.id}', 1, '小进步鼓励')">+1</button>
        <button class="btn-point-quick point-add" onclick="quickAdjust('${member.id}', 5, '好习惯打卡')">+5</button>
        <button class="btn-point-quick point-add" onclick="quickAdjust('${member.id}', 10, '突出优秀表现')">+10</button>
        <button class="btn-point-quick point-sub" onclick="quickAdjust('${member.id}', -5, '提醒纠正扣除')">-5</button>
        <button class="btn-adjust-custom" onclick="openAdjustModal('${member.id}')">⚡ 快捷奖惩</button>
      </div>

      <!-- Task Checklist -->
      <div class="member-tasks-container">
        <div class="task-category-title">今日专属打卡任务</div>
        ${
          memberTasks.length === 0
            ? `<div style="font-size:12px;color:var(--text-muted);padding:10px 0;">暂无专属任务，可点击下方添加</div>`
            : memberTasks.map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''}" onclick="toggleTask('${task.id}')">
                  <div class="task-left">
                    <div class="task-checkbox">${task.completed ? '✓' : ''}</div>
                    <div class="task-info">
                      <div class="task-title">${escapeHtml(task.title)}</div>
                      <div class="task-badge-cat">${escapeHtml(task.category || '日常习惯')}</div>
                    </div>
                  </div>
                  <div class="task-points-tag">+${task.points}分</div>
                </div>
              `).join('')
        }
        <button class="btn-add-member-task" onclick="openQuickTaskModal('${member.id}', '${escapeHtml(member.name)}')">
          ＋ 为${escapeHtml(member.name)}增添新任务
        </button>
      </div>

      <!-- Wish Progress Mini Widget -->
      <div class="member-wish-widget">
        <div class="wish-header">
          <span class="wish-label">🎯 心愿目标：</span>
          <span class="wish-target-title">${escapeHtml(member.wishTitle || '心仪心愿')} (${member.wishCost || 100}分)</span>
        </div>
        <div class="wish-bar-bg">
          <div class="wish-bar-fill" style="width: ${wishProgressPercent}%;"></div>
        </div>
        <div class="wish-footer">
          <span>进度: ${wishProgressPercent}% (${member.score}/${wishCost})</span>
          <button class="btn-redeem-wish" ${canRedeemWish ? '' : 'disabled'} onclick="redeemMemberWish('${member.id}', '${escapeHtml(member.wishTitle)}', ${wishCost})">
            ${canRedeemWish ? '🎁 可兑换心愿' : '积攒中'}
          </button>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}

// Render Live Activity Feed
function renderActivityFeed() {
  const container = document.getElementById('activity-feed-list');
  container.innerHTML = '';

  const logs = appState.logs || [];
  if (logs.length === 0) {
    container.innerHTML = `<div style="color:var(--text-muted);font-size:12px;padding:8px;">暂无积分动态</div>`;
    return;
  }

  logs.slice(0, 25).forEach(log => {
    const isPos = log.change >= 0;
    const timeStr = new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const item = document.createElement('div');
    item.className = 'log-item';
    item.innerHTML = `
      <div class="log-left">
        <span class="log-member-tag">【${escapeHtml(log.memberName || '家庭成员')}】</span>
        <span class="log-reason" title="${escapeHtml(log.reason || '')}">${escapeHtml(log.reason || '')}</span>
      </div>
      <div class="log-right">
        <span class="log-change ${isPos ? 'positive' : 'negative'}">${isPos ? '+' : ''}${log.change}</span>
        <span class="log-time">${timeStr}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

// Render Reward Showcase
function renderRewardsShowcase() {
  const container = document.getElementById('rewards-showcase-list');
  container.innerHTML = '';

  const rewards = appState.rewards || [];
  rewards.forEach(rew => {
    const member = appState.members.find(m => m.id === rew.memberId);
    const memberName = member ? member.name : '全员可用';

    const card = document.createElement('div');
    card.className = 'reward-mini-card';
    card.innerHTML = `
      <div class="reward-icon">${rew.icon || '🎁'}</div>
      <div class="reward-info">
        <div class="reward-title">${escapeHtml(rew.title)}</div>
        <div class="reward-cost">${rew.cost} 积分 · <span style="color:var(--text-muted);font-size:10px;">${memberName}</span></div>
      </div>
      <button class="btn-redeem-quick" onclick="redeemRewardFromList('${rew.id}')">兑换</button>
    `;
    container.appendChild(card);
  });
}

// --- Interactive Operations ---

// 1. Task Toggle
async function toggleTask(taskId) {
  try {
    const res = await HS.localFetch(`/api/tasks/${taskId}/toggle`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      const isCompleted = json.data.task.completed;
      if (isCompleted) {
        soundEngine.playSuccess();
        triggerConfetti(0.3);
        showToast(`🎉 完成打卡：${json.data.task.title} (+${json.data.task.points}分)`);
      } else {
        showToast(`↩️ 撤销打卡：${json.data.task.title}`);
      }
      loadState();
    } else {
      showToast('❌ 操作失败：' + json.error);
    }
  } catch (err) {
    showToast('❌ 网络异常');
  }
}

// 2. Quick Score Adjust (+/-)
async function quickAdjust(memberId, delta, reason) {
  try {
    const res = await HS.localFetch(`/api/members/${memberId}/adjust-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta, reason })
    });
    const json = await res.json();
    if (json.success) {
      if (delta > 0) {
        soundEngine.playCoin();
        triggerConfetti(0.15);
      }
      showToast(`${delta > 0 ? '✨ 奖励' : '⚠️ 扣减'} ${json.data.member.name} ${delta > 0 ? '+' : ''}${delta}分`);
      loadState();
    } else {
      showToast('❌ 调整失败：' + json.error);
    }
  } catch (err) {
    showToast('❌ 网络异常');
  }
}

// 3. Open Adjust Modal
function openAdjustModal(memberId) {
  currentAdjustMemberId = memberId;
  const member = appState.members.find(m => m.id === memberId);
  if (!member) return;

  document.getElementById('adjust-modal-title').textContent = `为【${member.name}】快捷奖惩与记录闪光点`;
  document.getElementById('adjust-member-preview').innerHTML = `
    <div style="font-size:28px;">${member.avatar}</div>
    <div>
      <div style="font-weight:700;color:#fff;">${member.name} (${member.role})</div>
      <div style="font-size:11px;color:var(--text-secondary);">当前积分: <strong style="color:#facc15;">${member.score}</strong> 分</div>
    </div>
  `;

  // Render Positive Tags
  const posContainer = document.getElementById('positive-tags-container');
  posContainer.innerHTML = '';
  POSITIVE_HABITS.forEach(h => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn tag-pos';
    btn.textContent = `+${h.delta} ${h.text}`;
    btn.onclick = () => {
      document.getElementById('input-adjust-delta').value = h.delta;
      document.getElementById('input-adjust-reason').value = h.text;
    };
    posContainer.appendChild(btn);
  });

  // Render Negative Tags
  const negContainer = document.getElementById('negative-tags-container');
  negContainer.innerHTML = '';
  NEGATIVE_HABITS.forEach(h => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn tag-neg';
    btn.textContent = `${h.delta} ${h.text}`;
    btn.onclick = () => {
      document.getElementById('input-adjust-delta').value = h.delta;
      document.getElementById('input-adjust-reason').value = h.text;
    };
    negContainer.appendChild(btn);
  });

  document.getElementById('modal-adjust-score').style.display = 'flex';
}

function closeAdjustModal() {
  document.getElementById('modal-adjust-score').style.display = 'none';
  currentAdjustMemberId = null;
}

async function submitAdjustScore() {
  if (!currentAdjustMemberId) return;
  const delta = Number(document.getElementById('input-adjust-delta').value);
  const reason = document.getElementById('input-adjust-reason').value.trim() || (delta > 0 ? '优秀习惯加分' : '引导提醒扣分');

  if (isNaN(delta) || delta === 0) {
    showToast('⚠️ 请输入有效的分值');
    return;
  }

  await quickAdjust(currentAdjustMemberId, delta, reason);
  closeAdjustModal();
}

// 4. Family Co-op Quest Modal & Submission (Together Gain Points)
function openCoopModal(activityId) {
  currentCoopActivityId = activityId;
  const act = appState.coopActivities.find(a => a.id === activityId);
  if (!act) return;

  document.getElementById('coop-modal-detail').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
      <div style="font-size:36px;">${act.icon}</div>
      <div>
        <h3 style="color:#fff;font-size:16px;">${act.title}</h3>
        <p style="font-size:12px;color:#34d399;font-weight:700;">人均奖励：+${act.pointsPerPerson} 积分</p>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text-secondary);background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;">
      ${act.description}
    </div>
  `;

  // Populate participants list (default all selected)
  selectedParticipants = appState.members.map(m => m.id);
  const pList = document.getElementById('coop-participants-list');
  pList.innerHTML = '';

  appState.members.forEach(member => {
    const chip = document.createElement('div');
    chip.className = 'participant-chip selected';
    chip.id = `part-chip-${member.id}`;
    chip.innerHTML = `
      <span>${member.avatar}</span>
      <span style="font-size:12px;font-weight:600;">${member.name}</span>
      <span style="font-size:10px;color:#34d399;">✓ 参与</span>
    `;
    chip.onclick = () => {
      const idx = selectedParticipants.indexOf(member.id);
      if (idx > -1) {
        selectedParticipants.splice(idx, 1);
        chip.classList.remove('selected');
        chip.querySelector('span:last-child').textContent = '✕ 缺席';
        chip.querySelector('span:last-child').style.color = 'var(--text-muted)';
      } else {
        selectedParticipants.push(member.id);
        chip.classList.add('selected');
        chip.querySelector('span:last-child').textContent = '✓ 参与';
        chip.querySelector('span:last-child').style.color = '#34d399';
      }
    };
    pList.appendChild(chip);
  });

  document.getElementById('modal-coop-confirm').style.display = 'flex';
}

function closeCoopModal() {
  document.getElementById('modal-coop-confirm').style.display = 'none';
  currentCoopActivityId = null;
}

async function submitCoopComplete() {
  if (!currentCoopActivityId) return;
  if (selectedParticipants.length === 0) {
    showToast('⚠️ 至少需要选择一名参与成员');
    return;
  }

  try {
    const res = await HS.localFetch(`/api/coop/${currentCoopActivityId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantIds: selectedParticipants })
    });
    const json = await res.json();
    if (json.success) {
      soundEngine.playFanfare();
      triggerConfetti(0.8);
      showToast(`🎊 【全家齐心达成】${json.data.activity.title}！所有参与人同步各+${json.data.activity.pointsPerPerson}分！`);
      closeCoopModal();
      loadState();
    } else {
      showToast('❌ 协作打卡失败：' + json.error);
    }
  } catch (err) {
    showToast('❌ 网络异常');
  }
}

// 5. Member Wish / Reward Redemption
async function redeemMemberWish(memberId, wishTitle, cost) {
  if (!confirm(`确认兑换【${wishTitle}】吗？将消耗 ${cost} 积分`)) return;
  await quickAdjust(memberId, -cost, `兑换心愿达成：${wishTitle}`);
  soundEngine.playSuccess();
  triggerConfetti(0.5);
  showToast(`🎁 恭喜！成功兑换心愿：${wishTitle}`);
}

async function redeemRewardFromList(rewardId) {
  const rew = appState.rewards.find(r => r.id === rewardId);
  if (!rew) return;

  let memberId = rew.memberId;
  if (!memberId) {
    // If general reward, ask which member
    const names = appState.members.map((m, i) => `${i + 1}. ${m.name} (拥有${m.score}分)`).join('\n');
    const input = prompt(`请选择由哪位成员兑换【${rew.title}】(${rew.cost}分)：\n${names}`);
    const num = parseInt(input);
    if (!isNaN(num) && num >= 1 && num <= appState.members.length) {
      memberId = appState.members[num - 1].id;
    } else {
      return;
    }
  }

  try {
    const res = await HS.localFetch(`/api/rewards/${rewardId}/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId })
    });
    const json = await res.json();
    if (json.success) {
      soundEngine.playSuccess();
      triggerConfetti(0.4);
      showToast(`🎁 成功兑换【${rew.title}】，消耗 ${rew.cost} 分！`);
      loadState();
    } else {
      showToast('❌ 兑换失败：' + json.error);
    }
  } catch (err) {
    showToast('❌ 网络异常');
  }
}

// 6. Quick Add Task
function openQuickTaskModal(memberId, memberName) {
  document.getElementById('quick-task-member-id').value = memberId;
  document.getElementById('quick-task-title').textContent = `为【${memberName}】添加今日新任务`;
  document.getElementById('quick-task-name').value = '';
  document.getElementById('quick-task-points').value = '10';
  document.getElementById('modal-quick-task').style.display = 'flex';
}

function closeQuickTaskModal() {
  document.getElementById('modal-quick-task').style.display = 'none';
}

async function submitQuickTask() {
  const memberId = document.getElementById('quick-task-member-id').value;
  const title = document.getElementById('quick-task-name').value.trim();
  const category = document.getElementById('quick-task-category').value;
  const points = Number(document.getElementById('quick-task-points').value);

  if (!title) {
    showToast('⚠️ 请填写任务名称');
    return;
  }

  try {
    const res = await HS.localFetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, title, category, points })
    });
    const json = await res.json();
    if (json.success) {
      showToast(`✅ 已为成员添加任务：${title}`);
      closeQuickTaskModal();
      loadState();
    } else {
      showToast('❌ 添加失败：' + json.error);
    }
  } catch (err) {
    showToast('❌ 网络异常');
  }
}

// --- Level Calculations ---
function getNextLevelTarget(totalEarned) {
  if (totalEarned < 50) return 50;
  if (totalEarned < 120) return 120;
  if (totalEarned < 220) return 220;
  if (totalEarned < 380) return 380;
  if (totalEarned < 600) return 600;
  return 1000;
}

function getPrevLevelThreshold(totalEarned) {
  if (totalEarned < 50) return 0;
  if (totalEarned < 120) return 50;
  if (totalEarned < 220) return 120;
  if (totalEarned < 380) return 220;
  if (totalEarned < 600) return 380;
  return 600;
}

// --- Confetti Animation ---
function triggerConfetti(intensity = 0.5) {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: Math.round(70 * intensity),
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

// --- Toast Messages ---
function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = msg;
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3000);
}

// --- Utility: Escape HTML ---
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
