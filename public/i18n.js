// HomeScore Internationalization (i18n) Engine
// Supports Chinese (zh) and English (en) with zero external dependencies

(function (global) {
  'use strict';

  var STORAGE_KEY = 'homescore_lang';

  var DICT = {
    zh: {
      site_default_title: '家庭积分奖励',
      site_default_motto: '全家同行 · 互助自律 · 快乐成长',
      ultra_badge_ultrawide: '21:9 宽屏指挥舱 (免滚动)',
      ultra_badge_standard: '标准流式看板',
      streak: '连续打卡',
      days: '天',
      family_score: '家庭总能值',
      points: '分',
      today_gain: '今日新增',
      sound_on: '音效开启',
      sound_off: '音效静音',
      fullscreen: '全屏看板',
      config_center: '人物与家庭配置中心',
      coop_hall_title: '家庭同心协作大厅',
      coop_hall_badge: '做了一起加积分',
      coop_hall_desc: '家长与孩子共同参与，协同达成家庭大事件，全员同步加分，共筑温馨自律好风气！',
      coop_rules_btn: '💡 协作理念与规则',
      coop_claim_btn: '全家齐心打卡',
      coop_per_person: '全员各 +{n} 分',
      today_tasks_title: '今日专属打卡任务',
      today_tasks_count: '今日已成 {done}/{total} 项',
      growth_score: '成长总能值',
      next_level_need: '下一级还需 {n}',
      current_available_score: '当前可用积分',
      lifetime_score: '历史总产出: {n} 分',
      quick_adjust: '⚡ 快捷奖惩',
      add_task_for_member: '＋ 为{name}增添新任务',
      wish_target: '🎯 心愿目标：',
      progress: '进度',
      can_redeem_wish: '🎁 可兑换心愿',
      saving_wish: '积攒中',
      activity_feed_title: '实时积分与荣耀动态',
      recent_logs: '最近记录',
      rewards_mall_title: '心愿兑换商城',
      manage_rewards: '管理奖品 →',
      redeem_btn: '兑换',
      footer_text: '🏡 HomeScore 21:9 超宽屏家庭协同系统',
      footer_philosophy: '理念源自现代亲子游戏化激励与正向心理学',
      backend_connected: '🟢 数据持久化已连接',
      footer_config_link: '配置人物/任务/心愿',
      back_dashboard: '返回指挥大屏',
      
      // Modals
      modal_title_edit: '🏷️ 修改网站标题与标语',
      site_title_label: '网站标题 / 系统名称：',
      site_title_placeholder: '例如：家庭积分奖励 / 张家成长营 / 幸福一家人',
      site_motto_label: '家庭座右铭 / 励志标语：',
      site_motto_placeholder: '例如：全家同行 · 互助自律 · 快乐成长',
      modal_cancel: '取消',
      modal_save: '保存并应用',
      modal_confirm: '确认',

      // Adjust modal
      modal_adjust_title: '为【{name}】快捷奖惩与记录闪光点',
      rec_positive_habits: '选择推荐好习惯 / 正向激励：',
      rec_negative_habits: '纠偏引导 / 扣减提示（慎用）：',
      custom_delta_label: '自定义分值 (+/-)：',
      custom_reason_label: '奖惩原因 / 闪光点记录：',
      btn_submit_adjust: '确认并记入积分',

      // Co-op modal
      coop_modal_title: '🎉 全家齐心协作打卡',
      coop_select_members: '选择参与本次协作的家庭成员（默认全员）：',
      coop_reward_tip: '🌟 点击确认后，所选成员将各自获得对应积分，并在荣誉墙广播！',
      coop_submit_btn: '齐心达成，全员加分！',
      participate: '✓ 参与',
      absent: '✕ 缺席',

      // Quick Task Modal
      modal_quick_task_title: '为【{name}】添加今日新任务',
      task_name_label: '任务名称：',
      task_category_label: '分类：',
      task_points_label: '奖励分值：',
      btn_add_task: '添加任务',

      // Config Page
      config_page_title: '⚙️ 人物与家庭配置中心',
      config_page_desc: '随时定制家庭成员、角色形象、专属习惯任务、协作大事件及心愿商城',
      export_backup_btn: '📥 导出数据备份',
      import_backup_btn: '📤 导入数据恢复',
      reset_defaults_btn: '🔄 重置默认家庭数据',
      tab_members: '👥 人物档案管理',
      tab_tasks: '📋 专属任务配置',
      tab_coop: '🤝 全家协作大任务',
      tab_rewards: '🎁 心愿商城配置',
      tab_system: '🏷️ 网站标题设置',

      // Config Tab 1
      members_panel_title: '家庭人物角色档案',
      members_panel_desc: '支持自由增删与修改家庭成员（爸爸、妈妈、大宝、二宝、长辈等），定义专属身份、形象与成长目标。',
      add_member_btn: '＋ 添加新家庭成员',
      edit_member_btn: '✏️ 编辑人物档案',
      delete_btn: '🗑️ 删除',
      col_available_score: '当前可用积分',
      col_lifetime_score: '历史总产出能值',

      // Config Tab 2
      tasks_panel_title: '各人物专属打卡任务配置',
      tasks_panel_desc: '根据孩子年龄阶段与家长榜样职责，灵活规划习惯、学习、劳作与品德任务。',
      filter_all_tasks: '所有成员任务',
      add_task_btn: '＋ 添加新任务',
      th_member: '归属人物',
      th_task_name: '任务名称',
      th_category: '分类',
      th_points: '奖励分值',
      th_frequency: '频次',
      th_actions: '操作',
      daily_reset: '每日重置',
      once: '单次',
      edit_btn: '编辑',

      // Config Tab 3
      coop_panel_title: '家庭共同协作大任务 (做了一起加积分)',
      coop_panel_desc: '规划全家共同参与的家务、阅读、运动与亲子时光，达成时全员同步加分，共筑温馨家风。',
      add_coop_btn: '＋ 添加全家协作活动',

      // Config Tab 4
      rewards_panel_title: '心愿商城与奖品库',
      rewards_panel_desc: '设立正向激励心愿目标，让孩子用日常自律积累的积分兑换心仪书籍、玩具或特权时光。',
      add_reward_btn: '＋ 添加心愿奖品',
      redeemed_count: '累计已兑换: {n} 次',
      need_points: '需要 {n} 积分',
      general_reward: '全家通用奖品',
      exclusive_for: '{name} 专属',

      // Config Tab 5
      system_panel_title: '网站标题与标语配置',
      system_panel_desc: '自定义您的专属家庭或团队名称，以及激励全家共同进步的座右铭/标语。',
      save_settings_btn: '💾 保存标题设置',
      site_title_hint: '该标题将直接展示在看板左上角及浏览器标签页标题中。',
      site_motto_hint: '展示在网站标题下方的副标题中，激励全员齐心协作。',
      lang_btn_text: 'English'
    },
    en: {
      site_default_title: 'Family Rewards',
      site_default_motto: 'United in Love · Self-Discipline · Growing Together',
      ultra_badge_ultrawide: '21:9 Ultra-Wide Cockpit (No Scroll)',
      ultra_badge_standard: 'Standard Flow Board',
      streak: 'Streak',
      days: 'Days',
      family_score: 'Family Energy',
      points: 'Pts',
      today_gain: 'Today Added',
      sound_on: 'Sound ON',
      sound_off: 'Sound Muted',
      fullscreen: 'Fullscreen',
      config_center: 'Family & Character Settings',
      coop_hall_title: 'Family Co-op Hub',
      coop_hall_badge: 'Earn Points Together',
      coop_hall_desc: 'Parents and children collaborate on meaningful household missions, gaining points simultaneously!',
      coop_rules_btn: '💡 Philosophy & Rules',
      coop_claim_btn: 'Family Complete',
      coop_per_person: '+{n} Pts Each',
      today_tasks_title: 'Today’s Quests',
      today_tasks_count: 'Completed {done}/{total} today',
      growth_score: 'Total Growth Energy',
      next_level_need: '{n} pts to next level',
      current_available_score: 'Available Balance',
      lifetime_score: 'Lifetime: {n} Pts',
      quick_adjust: '⚡ Quick Adjust',
      add_task_for_member: '＋ Add Quest for {name}',
      wish_target: '🎯 Wish Target: ',
      progress: 'Progress',
      can_redeem_wish: '🎁 Redeem Wish',
      saving_wish: 'Saving Up',
      activity_feed_title: 'Live Activity & Honor Wall',
      recent_logs: 'Recent Logs',
      rewards_mall_title: 'Wishlist Store',
      manage_rewards: 'Manage Store →',
      redeem_btn: 'Redeem',
      footer_text: '🏡 HomeScore · 21:9 Ultra-Wide Family Dashboard',
      footer_philosophy: 'Inspired by Gamified Parenting & Positive Psychology',
      backend_connected: '🟢 Storage Connected',
      footer_config_link: 'Manage Members / Quests / Rewards',
      back_dashboard: 'Back to Dashboard',

      // Modals
      modal_title_edit: '🏷️ Edit Website Title & Motto',
      site_title_label: 'Website Title / System Name:',
      site_title_placeholder: 'e.g. Family Rewards / Happy Family Camp',
      site_motto_label: 'Family Motto / Slogan:',
      site_motto_placeholder: 'e.g. United in Love · Self-Discipline · Growing Together',
      modal_cancel: 'Cancel',
      modal_save: 'Save & Apply',
      modal_confirm: 'Confirm',

      // Adjust modal
      modal_adjust_title: 'Quick Score Adjust & Highlight for {name}',
      rec_positive_habits: 'Recommended Positive Habits:',
      rec_negative_habits: 'Guidance & Deductions (Use with care):',
      custom_delta_label: 'Custom Points (+/-):',
      custom_reason_label: 'Reason / Highlight Record:',
      btn_submit_adjust: 'Confirm & Record Points',

      // Co-op modal
      coop_modal_title: '🎉 Family Co-op Quest Completion',
      coop_select_members: 'Select Participating Family Members (Default All):',
      coop_reward_tip: '🌟 Upon confirmation, selected members will each receive designated points!',
      coop_submit_btn: 'Mission Accomplished! Add Points to All!',
      participate: '✓ Joined',
      absent: '✕ Absent',

      // Quick Task Modal
      modal_quick_task_title: 'Add Today Quest for {name}',
      task_name_label: 'Quest Name:',
      task_category_label: 'Category:',
      task_points_label: 'Reward Points:',
      btn_add_task: 'Add Quest',

      // Config Page
      config_page_title: '⚙️ Family & Character Settings',
      config_page_desc: 'Customize members, avatars, habits, family co-op missions and rewards.',
      export_backup_btn: '📥 Export Backup',
      import_backup_btn: '📤 Import Backup',
      reset_defaults_btn: '🔄 Reset Demo Data',
      tab_members: '👥 Members',
      tab_tasks: '📋 Quests',
      tab_coop: '🤝 Co-op Quests',
      tab_rewards: '🎁 Rewards',
      tab_system: '🏷️ Site Title',

      // Config Tab 1
      members_panel_title: 'Family Members & Roles',
      members_panel_desc: 'Manage family members (parents, children, elders), customize avatars, roles and goals.',
      add_member_btn: '＋ Add New Member',
      edit_member_btn: '✏️ Edit Profile',
      delete_btn: '🗑️ Delete',
      col_available_score: 'Available Score',
      col_lifetime_score: 'Lifetime Energy',

      // Config Tab 2
      tasks_panel_title: 'Custom Member Daily Quests',
      tasks_panel_desc: 'Plan habits, learning, household chores, and manners suited for each age.',
      filter_all_tasks: 'All Member Quests',
      add_task_btn: '＋ Add New Quest',
      th_member: 'Member',
      th_task_name: 'Quest Name',
      th_category: 'Category',
      th_points: 'Reward Points',
      th_frequency: 'Frequency',
      th_actions: 'Actions',
      daily_reset: 'Daily Reset',
      once: 'Once',
      edit_btn: 'Edit',

      // Config Tab 3
      coop_panel_title: 'Family Co-op Quests (Together Gain Points)',
      coop_panel_desc: 'Engage in joint activities—reading, cleaning, sports—rewarding everyone together.',
      add_coop_btn: '＋ Add Co-op Quest',

      // Config Tab 4
      rewards_panel_title: 'Wishlist Store & Rewards',
      rewards_panel_desc: 'Set up positive incentives for toys, books, outings or special family privileges.',
      add_reward_btn: '＋ Add Reward',
      redeemed_count: 'Redeemed: {n} times',
      need_points: '{n} Points Required',
      general_reward: 'All Members',
      exclusive_for: 'For {name}',

      // Config Tab 5
      system_panel_title: 'Website Title & Motto Settings',
      system_panel_desc: 'Customize your team/family name and motivational slogan.',
      save_settings_btn: '💾 Save Settings',
      site_title_hint: 'This title appears in the top navigation and browser tab title.',
      site_motto_hint: 'Displayed as the subtitle under the main website title.',
      lang_btn_text: '中文'
    }
  };

  function getLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'zh';
    } catch (e) {
      return 'zh';
    }
  }

  function setLanguage(lang) {
    lang = lang === 'en' ? 'en' : 'zh';
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    apply();
    var event = new CustomEvent('homescore_lang_changed', { detail: { lang: lang } });
    window.dispatchEvent(event);
  }

  function toggleLanguage() {
    var cur = getLanguage();
    var next = cur === 'zh' ? 'en' : 'zh';
    setLanguage(next);
    return next;
  }

  function t(key, params) {
    var lang = getLanguage();
    var str = (DICT[lang] && DICT[lang][key]) || (DICT.zh && DICT.zh[key]) || key;
    if (params && typeof params === 'object') {
      for (var p in params) {
        if (Object.prototype.hasOwnProperty.call(params, p)) {
          str = str.replace(new RegExp('\\{' + p + '\\}', 'g'), params[p]);
        }
      }
    }
    return str;
  }

  function apply() {
    var lang = getLanguage();
    // Update elements with data-i18n
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var k = el.getAttribute('data-i18n');
      if (k && DICT[lang] && DICT[lang][k]) {
        el.textContent = DICT[lang][k];
      }
    }

    // Update placeholders
    var pEls = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < pEls.length; j++) {
      var pel = pEls[j];
      var pk = pel.getAttribute('data-i18n-placeholder');
      if (pk && DICT[lang] && DICT[lang][pk]) {
        pel.placeholder = DICT[lang][pk];
      }
    }

    // Update titles
    var tEls = document.querySelectorAll('[data-i18n-title]');
    for (var m = 0; m < tEls.length; m++) {
      var tel = tEls[m];
      var tk = tel.getAttribute('data-i18n-title');
      if (tk && DICT[lang] && DICT[lang][tk]) {
        tel.title = DICT[lang][tk];
      }
    }

    // Update switcher button label
    var btn = document.getElementById('btn-lang-toggle');
    if (btn) {
      var label = btn.querySelector('.btn-label') || btn;
      label.textContent = lang === 'zh' ? '🌐 English' : '🌐 中文';
    }
  }

  global.I18N = {
    getLanguage: getLanguage,
    setLanguage: setLanguage,
    toggleLanguage: toggleLanguage,
    t: t,
    apply: apply,
    DICT: DICT
  };

  // Auto apply on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', apply);
    } else {
      apply();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
