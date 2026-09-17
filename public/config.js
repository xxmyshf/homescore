// HomeScore Character & Family Configuration Center

let configState = null;
let currentTab = 'members';

const AVATAR_OPTIONS = [
  '👦', '👧', '👶', '🧑', '👨‍💼', '👩‍🏫', '👴', '👵',
  '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧚‍♀️', '🦁', '🐼', '🦄', '🚀',
  '⭐', '🌟', '🎨', '⚽', '🎯', '📚', '🧩', '🏆'
];

const THEME_COLORS = [
  '#3b82f6', '#ec4899', '#10b981', '#f59e0b',
  '#8b5cf6', '#06b6d4', '#ef4444', '#64748b'
];

document.addEventListener('DOMContentLoaded', () => {
  initPickers();
  loadConfigState();
});

function initPickers() {
  // Avatar picker in member modal
  const avContainer = document.getElementById('avatar-picker-container');
  avContainer.innerHTML = '';
  AVATAR_OPTIONS.forEach(av => {
    const item = document.createElement('div');
    item.className = 'avatar-option';
    item.textContent = av;
    item.onclick = () => selectAvatar(av, item);
    avContainer.appendChild(item);
  });

  // Color picker in member modal
  const colorContainer = document.getElementById('color-picker-container');
  colorContainer.innerHTML = '';
  THEME_COLORS.forEach(color => {
    const item = document.createElement('div');
    item.className = 'color-option';
    item.style.backgroundColor = color;
    item.onclick = () => selectColor(color, item);
    colorContainer.appendChild(item);
  });
}

function selectAvatar(av, el) {
  document.querySelectorAll('.avatar-option').forEach(x => x.classList.remove('selected'));
  if (el) el.classList.add('selected');
  document.getElementById('member-input-avatar').value = av;
}

function selectColor(color, el) {
  document.querySelectorAll('.color-option').forEach(x => x.classList.remove('selected'));
  if (el) el.classList.add('selected');
  document.getElementById('member-input-color').value = color;
}

function switchTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

  const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick')?.includes(tabName));
  if (activeBtn) activeBtn.classList.add('active');

  const panel = document.getElementById(`tab-${tabName}`);
  if (panel) panel.classList.add('active');
}

async function loadConfigState() {
  try {
    const res = await fetch('/api/state');
    const json = await res.json();
    if (json.success && json.data) {
      configState = json.data;
      renderMembersList();
      populateMemberDropdowns();
      renderTasksList();
      renderCoopList();
      renderRewardsList();
      renderSystemSettings();
    }
  } catch (err) {
    console.error('Failed to load config state:', err);
  }
}

// 1. Render Members List
function renderMembersList() {
  const container = document.getElementById('members-list-grid');
  container.innerHTML = '';

  configState.members.forEach(m => {
    const card = document.createElement('div');
    card.className = 'member-edit-card';
    card.style.setProperty('--card-color', m.themeColor || '#6366f1');

    card.innerHTML = `
      <div class="member-card-top-row">
        <div class="member-edit-avatar">${m.avatar}</div>
        <div class="member-edit-meta">
          <h3>${escapeHtml(m.name)} <span class="member-tag-pill">${escapeHtml(m.role)}</span></h3>
          <div style="font-size:11px;color:#facc15;margin-top:2px;">Lv.${m.level || 1} · ${escapeHtml(m.levelTitle || '自律小能手')}</div>
        </div>
      </div>

      <div class="member-card-stats">
        <div>
          <div class="stat-item-label">当前可用积分</div>
          <div class="stat-item-val">${m.score} 分</div>
        </div>
        <div>
          <div class="stat-item-label">历史总产出能值</div>
          <div class="stat-item-val">${m.totalEarned || m.score} 分</div>
        </div>
      </div>

      <div class="member-card-wish">
        🎯 <strong>心愿目标：</strong>${escapeHtml(m.wishTitle || '心仪玩具')} (${m.wishCost || 100}分)
      </div>

      <div class="member-card-actions">
        <button class="btn-card-edit" onclick="editMember('${m.id}')">✏️ 编辑人物档案</button>
        <button class="btn-card-delete" onclick="deleteMember('${m.id}', '${escapeHtml(m.name)}')">🗑️ 删除</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function populateMemberDropdowns() {
  // Task filter
  const filterSelect = document.getElementById('filter-task-member');
  filterSelect.innerHTML = `<option value="all">所有成员任务 (${configState.tasks.length}项)</option>`;
  configState.members.forEach(m => {
    const count = configState.tasks.filter(t => t.memberId === m.id).length;
    filterSelect.innerHTML += `<option value="${m.id}">${m.avatar} ${escapeHtml(m.name)} (${count}项)</option>`;
  });

  // Task member selector
  const taskMemberSelect = document.getElementById('task-input-member');
  taskMemberSelect.innerHTML = '';
  configState.members.forEach(m => {
    taskMemberSelect.innerHTML += `<option value="${m.id}">${m.avatar} ${escapeHtml(m.name)}</option>`;
  });

  // Reward member selector
  const rewMemberSelect = document.getElementById('reward-input-member');
  rewMemberSelect.innerHTML = `<option value="">全家通用奖品</option>`;
  configState.members.forEach(m => {
    rewMemberSelect.innerHTML += `<option value="${m.id}">${m.avatar} ${escapeHtml(m.name)} 专属</option>`;
  });
}

// 2. Member Modal Ops
function openMemberModal() {
  document.getElementById('edit-member-id').value = '';
  document.getElementById('member-modal-title').textContent = '添加新家庭成员';
  document.getElementById('member-input-name').value = '';
  document.getElementById('member-input-role').value = '家庭宝贝';
  document.getElementById('member-input-roleType').value = 'kid';
  document.getElementById('member-input-score').value = '100';
  document.getElementById('member-input-totalEarned').value = '100';
  document.getElementById('member-input-levelTitle').value = '积极小能手';
  document.getElementById('member-input-wishTitle').value = '心仪玩具';
  document.getElementById('member-input-wishCost').value = '120';
  selectAvatar('👦', document.querySelector('.avatar-option'));
  selectColor('#3b82f6', document.querySelector('.color-option'));

  document.getElementById('modal-member').style.display = 'flex';
}

function editMember(id) {
  const m = configState.members.find(x => x.id === id);
  if (!m) return;

  document.getElementById('edit-member-id').value = m.id;
  document.getElementById('member-modal-title').textContent = `编辑【${m.name}】档案`;
  document.getElementById('member-input-name').value = m.name;
  document.getElementById('member-input-role').value = m.role;
  document.getElementById('member-input-roleType').value = m.roleType || 'kid';
  document.getElementById('member-input-score').value = m.score;
  document.getElementById('member-input-totalEarned').value = m.totalEarned || m.score;
  document.getElementById('member-input-levelTitle').value = m.levelTitle || '自律小能手';
  document.getElementById('member-input-wishTitle').value = m.wishTitle || '';
  document.getElementById('member-input-wishCost').value = m.wishCost || 100;

  // Pick avatar
  const avEl = Array.from(document.querySelectorAll('.avatar-option')).find(x => x.textContent.trim() === m.avatar);
  selectAvatar(m.avatar || '👦', avEl);

  // Pick color
  const colEl = Array.from(document.querySelectorAll('.color-option')).find(x => x.style.backgroundColor.includes(m.themeColor));
  selectColor(m.themeColor || '#3b82f6', colEl);

  document.getElementById('modal-member').style.display = 'flex';
}

function closeMemberModal() {
  document.getElementById('modal-member').style.display = 'none';
}

async function submitMemberForm() {
  const id = document.getElementById('edit-member-id').value;
  const name = document.getElementById('member-input-name').value.trim();
  const role = document.getElementById('member-input-role').value.trim();
  const roleType = document.getElementById('member-input-roleType').value;
  const avatar = document.getElementById('member-input-avatar').value;
  const themeColor = document.getElementById('member-input-color').value;
  const score = Number(document.getElementById('member-input-score').value);
  const totalEarned = Number(document.getElementById('member-input-totalEarned').value);
  const levelTitle = document.getElementById('member-input-levelTitle').value.trim();
  const wishTitle = document.getElementById('member-input-wishTitle').value.trim();
  const wishCost = Number(document.getElementById('member-input-wishCost').value);

  if (!name) {
    showToast('⚠️ 请填写人物姓名或称谓');
    return;
  }

  const payload = { name, role, roleType, avatar, themeColor, score, totalEarned, levelTitle, wishTitle, wishCost };

  try {
    const url = id ? `/api/members/${id}` : '/api/members';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      showToast(`✅ 人物档案已保存：${name}`);
      closeMemberModal();
      loadConfigState();
    } else {
      showToast('❌ 保存失败：' + json.error);
    }
  } catch (err) {
    showToast('❌ 网络错误');
  }
}

async function deleteMember(id, name) {
  if (!confirm(`确定删除人物【${name}】吗？该人物的所有专属任务和心愿也将同步移除。`)) return;

  try {
    const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      showToast(`🗑️ 已删除人物：${name}`);
      loadConfigState();
    } else {
      showToast('❌ 删除失败：' + json.error);
    }
  } catch (err) {
    showToast('❌ 网络错误');
  }
}

// 3. Render Tasks List
function renderTasksList() {
  const filterMemberId = document.getElementById('filter-task-member').value;
  const tbody = document.getElementById('tasks-table-body');
  tbody.innerHTML = '';

  let tasks = configState.tasks;
  if (filterMemberId && filterMemberId !== 'all') {
    tasks = tasks.filter(t => t.memberId === filterMemberId);
  }

  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px;">暂无对应任务</td></tr>`;
    return;
  }

  tasks.forEach(t => {
    const m = configState.members.find(x => x.id === t.memberId);
    const mName = m ? `${m.avatar} ${m.name}` : '未知人物';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="badge-member-tag">${mName}</span></td>
      <td><strong>${escapeHtml(t.title)}</strong></td>
      <td><span style="color:var(--text-secondary);">${escapeHtml(t.category)}</span></td>
      <td><strong style="color:#38bdf8;">+${t.points} 分</strong></td>
      <td><span style="color:var(--text-muted);">${t.frequency === 'daily' ? '每日重置' : '单次'}</span></td>
      <td>
        <button class="btn btn-secondary" style="padding:4px 8px;font-size:11px;" onclick="editTask('${t.id}')">编辑</button>
        <button class="btn btn-danger-soft" style="padding:4px 8px;font-size:11px;" onclick="deleteTask('${t.id}')">删除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openTaskModal() {
  document.getElementById('edit-task-id').value = '';
  document.getElementById('task-modal-title').textContent = '添加专属打卡任务';
  document.getElementById('task-input-title').value = '';
  document.getElementById('task-input-points').value = '10';
  document.getElementById('modal-task').style.display = 'flex';
}

function editTask(id) {
  const t = configState.tasks.find(x => x.id === id);
  if (!t) return;
  document.getElementById('edit-task-id').value = t.id;
  document.getElementById('task-modal-title').textContent = '编辑任务';
  document.getElementById('task-input-member').value = t.memberId;
  document.getElementById('task-input-title').value = t.title;
  document.getElementById('task-input-category').value = t.category;
  document.getElementById('task-input-points').value = t.points;
  document.getElementById('modal-task').style.display = 'flex';
}

function closeTaskModal() {
  document.getElementById('modal-task').style.display = 'none';
}

async function submitTaskForm() {
  const id = document.getElementById('edit-task-id').value;
  const memberId = document.getElementById('task-input-member').value;
  const title = document.getElementById('task-input-title').value.trim();
  const category = document.getElementById('task-input-category').value;
  const points = Number(document.getElementById('task-input-points').value);

  if (!title) {
    showToast('⚠️ 请输入任务名称');
    return;
  }

  const payload = { memberId, title, category, points };
  try {
    const url = id ? `/api/tasks/${id}` : '/api/tasks';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      showToast('✅ 任务已保存');
      closeTaskModal();
      loadConfigState();
    } else {
      showToast('❌ 保存失败：' + json.error);
    }
  } catch (err) {
    showToast('❌ 网络错误');
  }
}

async function deleteTask(id) {
  if (!confirm('确认删除该任务吗？')) return;
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      showToast('🗑️ 任务已删除');
      loadConfigState();
    }
  } catch (err) {
    showToast('❌ 网络错误');
  }
}

// 4. Render Co-op List
function renderCoopList() {
  const container = document.getElementById('coop-manage-container');
  container.innerHTML = '';

  configState.coopActivities.forEach(act => {
    const card = document.createElement('div');
    card.className = 'coop-manage-card';
    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <div style="font-size:32px;">${act.icon || '🤝'}</div>
        <div style="flex:1;">
          <h3 style="color:#fff;font-size:15px;font-weight:700;">${escapeHtml(act.title)}</h3>
          <div style="font-size:12px;color:#34d399;font-weight:700;margin:2px 0;">全员各奖 +${act.pointsPerPerson} 积分 · <span style="color:var(--text-muted);font-weight:400;">${escapeHtml(act.tag || '共同协作')}</span></div>
          <p style="font-size:12px;color:var(--text-secondary);line-height:1.4;">${escapeHtml(act.description)}</p>
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--border-color);padding-top:10px;">
        <button class="btn btn-secondary" style="padding:4px 10px;font-size:11px;" onclick="editCoop('${act.id}')">编辑</button>
        <button class="btn btn-danger-soft" style="padding:4px 10px;font-size:11px;" onclick="deleteCoop('${act.id}')">删除</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function openCoopModal() {
  document.getElementById('edit-coop-id').value = '';
  document.getElementById('coop-modal-config-title').textContent = '添加全家协作大任务';
  document.getElementById('coop-input-title').value = '';
  document.getElementById('coop-input-icon').value = '🤝';
  document.getElementById('coop-input-tag').value = '家庭协作';
  document.getElementById('coop-input-points').value = '15';
  document.getElementById('coop-input-desc').value = '';
  document.getElementById('modal-coop-config').style.display = 'flex';
}

function editCoop(id) {
  const act = configState.coopActivities.find(x => x.id === id);
  if (!act) return;
  document.getElementById('edit-coop-id').value = act.id;
  document.getElementById('coop-modal-config-title').textContent = '编辑全家协作大任务';
  document.getElementById('coop-input-title').value = act.title;
  document.getElementById('coop-input-icon').value = act.icon;
  document.getElementById('coop-input-tag').value = act.tag;
  document.getElementById('coop-input-points').value = act.pointsPerPerson;
  document.getElementById('coop-input-desc').value = act.description;
  document.getElementById('modal-coop-config').style.display = 'flex';
}

function closeCoopConfigModal() {
  document.getElementById('modal-coop-config').style.display = 'none';
}

async function submitCoopConfigForm() {
  const id = document.getElementById('edit-coop-id').value;
  const title = document.getElementById('coop-input-title').value.trim();
  const icon = document.getElementById('coop-input-icon').value.trim() || '🤝';
  const tag = document.getElementById('coop-input-tag').value.trim() || '共同协作';
  const pointsPerPerson = Number(document.getElementById('coop-input-points').value);
  const description = document.getElementById('coop-input-desc').value.trim();

  if (!title) {
    showToast('⚠️ 请填写活动标题');
    return;
  }

  const payload = { title, icon, tag, pointsPerPerson, description };
  try {
    const url = id ? `/api/coop/${id}` : '/api/coop';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      showToast('✅ 全家协作任务已保存');
      closeCoopConfigModal();
      loadConfigState();
    }
  } catch (err) {
    showToast('❌ 网络错误');
  }
}

async function deleteCoop(id) {
  if (!confirm('确认删除该全家协作活动吗？')) return;
  try {
    await fetch(`/api/coop/${id}`, { method: 'DELETE' });
    showToast('🗑️ 已删除协作活动');
    loadConfigState();
  } catch (err) {
    showToast('❌ 网络错误');
  }
}

// 5. Render Rewards List
function renderRewardsList() {
  const container = document.getElementById('rewards-manage-container');
  container.innerHTML = '';

  configState.rewards.forEach(r => {
    const m = configState.members.find(x => x.id === r.memberId);
    const mName = m ? `${m.avatar} ${m.name} 专属` : '全员通用';

    const card = document.createElement('div');
    card.className = 'reward-manage-card';
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-size:28px;">${r.icon || '🎁'}</div>
        <div style="flex:1;">
          <h3 style="font-size:14px;color:#fff;font-weight:700;">${escapeHtml(r.title)}</h3>
          <div style="font-size:11px;color:#facc15;font-weight:700;">需要 ${r.cost} 积分 · <span style="color:var(--text-muted);font-weight:400;">${mName}</span></div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">累计已兑换: ${r.redeemedCount || 0} 次</div>
        </div>
        <button class="btn btn-danger-soft" style="padding:4px 8px;font-size:11px;" onclick="deleteReward('${r.id}')">删除</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function openRewardModal() {
  document.getElementById('reward-input-title').value = '';
  document.getElementById('reward-input-cost').value = '100';
  document.getElementById('modal-reward-config').style.display = 'flex';
}

function closeRewardModal() {
  document.getElementById('modal-reward-config').style.display = 'none';
}

async function submitRewardForm() {
  const memberId = document.getElementById('reward-input-member').value || null;
  const title = document.getElementById('reward-input-title').value.trim();
  const icon = document.getElementById('reward-input-icon').value.trim() || '🎁';
  const category = document.getElementById('reward-input-category').value;
  const cost = Number(document.getElementById('reward-input-cost').value);

  if (!title) {
    showToast('⚠️ 请填写奖品名称');
    return;
  }

  try {
    const res = await fetch('/api/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, title, icon, category, cost })
    });
    const json = await res.json();
    if (json.success) {
      showToast('✅ 心愿奖品已添加');
      closeRewardModal();
      loadConfigState();
    }
  } catch (err) {
    showToast('❌ 网络错误');
  }
}

async function deleteReward(id) {
  if (!confirm('确认删除该心愿奖品吗？')) return;
  try {
    await fetch(`/api/rewards/${id}`, { method: 'DELETE' });
    showToast('🗑️ 已删除奖品');
    loadConfigState();
  } catch (err) {
    showToast('❌ 网络错误');
  }
}

// 6. Data Backup & Reset
function exportDataBackup() {
  window.location.href = '/api/backup/export';
}

function triggerImportBackup() {
  document.getElementById('file-import').click();
}

async function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const parsed = JSON.parse(evt.target.result);
      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const json = await res.json();
      if (json.success) {
        showToast('✅ 数据备份导入成功！');
        loadConfigState();
      } else {
        showToast('❌ 导入失败：' + json.error);
      }
    } catch (err) {
      showToast('❌ 文件格式解析错误');
    }
  };
  reader.readAsText(file);
}

async function resetDefaultsConfirm() {
  if (!confirm('⚠️ 警告：确认要重置为默认的示例数据吗？当前所有自定义修改将被重置。')) return;

  try {
    const res = await fetch('/api/reset-defaults', { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast('🔄 已重置为默认家庭数据');
      loadConfigState();
    }
  } catch (err) {
    showToast('❌ 重置失败');
  }
}

// 7. System Settings (Website Title & Motto)
function renderSystemSettings() {
  if (!configState || !configState.system) return;
  const nameInput = document.getElementById('setting-family-name');
  const mottoInput = document.getElementById('setting-family-motto');
  const familyName = configState.system.familyName || '家庭积分奖励';
  if (nameInput) nameInput.value = familyName;
  if (mottoInput) mottoInput.value = configState.system.familyMotto || '全家同行 · 互助自律 · 快乐成长';
  document.title = `${familyName} · 人物与家庭配置中心`;
}

async function submitSystemSettingsForm() {
  const nameInput = document.getElementById('setting-family-name');
  const mottoInput = document.getElementById('setting-family-motto');
  const familyName = (nameInput ? nameInput.value : '').trim();
  const familyMotto = (mottoInput ? mottoInput.value : '').trim();

  if (!familyName) {
    showToast('⚠️ 网站标题不能为空');
    return;
  }

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyName, familyMotto })
    });
    const json = await res.json();
    if (json.success) {
      if (configState && configState.system) {
        configState.system.familyName = familyName;
        configState.system.familyMotto = familyMotto;
      }
      renderSystemSettings();
      showToast(`✅ 网站标题已更新为「${familyName}」`);
    } else {
      showToast('❌ 保存失败：' + json.error);
    }
  } catch (err) {
    showToast('❌ 网络错误');
  }
}

// Utilities
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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
