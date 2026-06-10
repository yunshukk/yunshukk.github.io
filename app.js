(function () {
  const {
    DAYS,
    PERIODS,
    SLOT_STATES,
    ROLE_TREES,
    EXPERIENCE_TAGS,
    PRESETS,
    RESOURCES,
    ALGORITHM_NOTES
  } = window.GrowthData;

  const state = {
    activePreset: "java_sprint",
    schedule: clone(PRESETS.java_sprint.schedule),
    selectedTags: new Set(PRESETS.java_sprint.selectedTags),
    profile: null,
    gapReport: [],
    plan: null,
    resources: [],
    coach: null
  };

  const els = {
    presetRow: document.getElementById("presetRow"),
    profileForm: document.getElementById("profileForm"),
    targetRole: document.getElementById("targetRole"),
    deadlineMonths: document.getElementById("deadlineMonths"),
    deadlineValue: document.getElementById("deadlineValue"),
    energyLevel: document.getElementById("energyLevel"),
    energyValue: document.getElementById("energyValue"),
    examWeek: document.getElementById("examWeek"),
    timetableBoard: document.getElementById("timetableBoard"),
    budgetSummary: document.getElementById("budgetSummary"),
    experienceTags: document.getElementById("experienceTags"),
    algorithmList: document.getElementById("algorithmList"),
    dashboardStats: document.getElementById("dashboardStats"),
    radarChart: document.getElementById("radarChart"),
    profileSummary: document.getElementById("profileSummary"),
    strengthTags: document.getElementById("strengthTags"),
    gapOverview: document.getElementById("gapOverview"),
    gapList: document.getElementById("gapList"),
    annualRoadmap: document.getElementById("annualRoadmap"),
    monthlyPlan: document.getElementById("monthlyPlan"),
    weeklySchedule: document.getElementById("weeklySchedule"),
    resourceBoard: document.getElementById("resourceBoard"),
    completionRate: document.getElementById("completionRate"),
    completionValue: document.getElementById("completionValue"),
    difficultyRate: document.getElementById("difficultyRate"),
    difficultyValue: document.getElementById("difficultyValue"),
    confidenceRate: document.getElementById("confidenceRate"),
    confidenceValue: document.getElementById("confidenceValue"),
    coachSummary: document.getElementById("coachSummary"),
    coachTrend: document.getElementById("coachTrend"),
    heroGenerateBtn: document.getElementById("heroGenerateBtn"),
    heroHours: document.getElementById("heroHours"),
    heroFit: document.getElementById("heroFit"),
    heroGaps: document.getElementById("heroGaps")
  };

  init();

  function init() {
    populateTargetRoles();
    renderPresetButtons();
    renderAlgorithmNotes();
    bindEvents();
    applyPreset(state.activePreset);
  }

  function bindEvents() {
    els.profileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      refreshPlan();
    });

    els.deadlineMonths.addEventListener("input", () => {
      els.deadlineValue.textContent = `${els.deadlineMonths.value} 个月`;
    });

    els.energyLevel.addEventListener("input", () => {
      els.energyValue.textContent = `${els.energyLevel.value} / 5`;
    });

    els.targetRole.addEventListener("change", () => {
      renderExperienceTags();
      refreshPlan(false);
    });

    els.examWeek.addEventListener("change", () => {
      renderBudgetSummary();
      refreshPlan(false);
    });

    els.completionRate.addEventListener("input", updateCoachFromInputs);
    els.difficultyRate.addEventListener("input", updateCoachFromInputs);
    els.confidenceRate.addEventListener("input", updateCoachFromInputs);
    els.heroGenerateBtn.addEventListener("click", () => {
      document.getElementById("profileForm").scrollIntoView({ behavior: "smooth", block: "start" });
      refreshPlan();
    });
  }

  function populateTargetRoles() {
    const html = Object.entries(ROLE_TREES)
      .map(([id, role]) => `<option value="${id}">${role.label}</option>`)
      .join("");
    els.targetRole.innerHTML = html;
  }

  function renderPresetButtons() {
    els.presetRow.innerHTML = Object.entries(PRESETS)
      .map(([id, preset]) => `
        <button class="preset-btn ${id === state.activePreset ? "is-active" : ""}" type="button" data-preset="${id}">
          <strong>${preset.label}</strong>
          <span>${preset.subtitle}</span>
        </button>
      `)
      .join("");

    els.presetRow.querySelectorAll("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => applyPreset(button.dataset.preset));
    });
  }

  function renderAlgorithmNotes() {
    els.algorithmList.innerHTML = ALGORITHM_NOTES.map((item) => `
      <article>
        <h3>${item.title}</h3>
        <p>${item.summary}</p>
        <ul>${item.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
      </article>
    `).join("");
  }

  function applyPreset(presetId) {
    state.activePreset = presetId;
    const preset = PRESETS[presetId];

    setInputValue("studentName", preset.fields.studentName);
    setInputValue("studentGrade", preset.fields.studentGrade);
    setInputValue("studentMajor", preset.fields.studentMajor);
    setInputValue("targetRole", preset.fields.targetRole);
    setInputValue("goalText", preset.fields.goalText);
    setInputValue("deadlineMonths", preset.fields.deadlineMonths);
    setInputValue("energyLevel", preset.fields.energyLevel);
    setInputValue("resumeText", preset.fields.resumeText);
    els.examWeek.checked = preset.fields.examWeek;
    els.deadlineValue.textContent = `${preset.fields.deadlineMonths} 个月`;
    els.energyValue.textContent = `${preset.fields.energyLevel} / 5`;

    state.schedule = clone(preset.schedule);
    state.selectedTags = new Set(preset.selectedTags);

    renderPresetButtons();
    renderTimetable();
    renderExperienceTags();
    refreshPlan();
  }

  function renderTimetable() {
    const header = `
      <div class="timetable-header">
        <span>时段</span>
        ${DAYS.map((day) => `<span>${day}</span>`).join("")}
      </div>
    `;

    const rows = PERIODS.map((period, periodIndex) => `
      <div class="timetable-row">
        <div class="period-label">${period.label}<br><small>${period.time}</small></div>
        ${DAYS.map((_, dayIndex) => renderSlotButton(dayIndex, periodIndex)).join("")}
      </div>
    `).join("");

    els.timetableBoard.innerHTML = header + rows;
    els.timetableBoard.querySelectorAll("[data-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        const [dayIndex, periodIndex] = button.dataset.slot.split("-").map(Number);
        cycleScheduleState(dayIndex, periodIndex);
        renderTimetable();
        renderBudgetSummary();
        refreshPlan(false);
      });
    });

    renderBudgetSummary();
  }

  function renderSlotButton(dayIndex, periodIndex) {
    const slotState = SLOT_STATES[state.schedule[dayIndex][periodIndex]];
    return `
      <button class="slot-btn ${slotState.className}" type="button" data-slot="${dayIndex}-${periodIndex}">
        ${slotState.label}
        <small>${slotState.hours}h</small>
      </button>
    `;
  }

  function cycleScheduleState(dayIndex, periodIndex) {
    const current = state.schedule[dayIndex][periodIndex];
    const order = ["blocked", "study", "focus"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    state.schedule[dayIndex][periodIndex] = next;
  }

  function renderBudgetSummary() {
    const scheduleStats = computeScheduleStats(state.schedule, els.examWeek.checked);
    els.budgetSummary.innerHTML = `
      <span class="summary-pill">每周可用 ${scheduleStats.weeklyHours.toFixed(1)} h</span>
      <span class="summary-pill">高专注 ${scheduleStats.focusHours.toFixed(1)} h</span>
      <span class="summary-pill">空档槽位 ${scheduleStats.availableSlots.length} 个</span>
      <span class="summary-pill">考试周系数 ${scheduleStats.examLoadFactor.toFixed(2)}</span>
    `;
  }

  function renderExperienceTags() {
    const roleId = els.targetRole.value || PRESETS[state.activePreset].fields.targetRole;
    const role = ROLE_TREES[roleId];
    els.experienceTags.innerHTML = EXPERIENCE_TAGS.map((tag) => {
      const selected = state.selectedTags.has(tag.id);
      const affinity = Object.keys(tag.bonuses).some((skillId) => role.skills.some((skill) => skill.id === skillId));
      return `
        <button class="tag-chip ${selected ? "is-selected" : ""}" type="button" data-tag="${tag.id}">
          ${tag.label}${affinity ? " · 高相关" : ""}
        </button>
      `;
    }).join("");

    els.experienceTags.querySelectorAll("[data-tag]").forEach((button) => {
      button.addEventListener("click", () => {
        const tagId = button.dataset.tag;
        if (state.selectedTags.has(tagId)) {
          state.selectedTags.delete(tagId);
        } else {
          state.selectedTags.add(tagId);
        }
        renderExperienceTags();
        refreshPlan(false);
      });
    });
  }

  function refreshPlan(scrollToSection = false) {
    const formData = readFormData();
    const roleTree = ROLE_TREES[formData.targetRole];
    const profile = buildProfile(formData, roleTree);
    const gapReport = buildGapReport(profile.skillScores, roleTree);
    const plan = buildLearningPlan(formData, profile, roleTree, gapReport);
    const resources = buildResourcePlan(formData, roleTree, gapReport, plan);

    state.profile = profile;
    state.gapReport = gapReport;
    state.plan = plan;
    state.resources = resources;

    renderDashboard(formData, profile, gapReport);
    renderGapAnalysis(roleTree, gapReport);
    renderPlanner(plan);
    renderResources(resources);
    updateCoachFromInputs();

    if (scrollToSection) {
      document.getElementById("dashboardSection").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function readFormData() {
    return {
      studentName: getInputValue("studentName"),
      studentGrade: getInputValue("studentGrade"),
      studentMajor: getInputValue("studentMajor"),
      targetRole: getInputValue("targetRole"),
      goalText: getInputValue("goalText"),
      deadlineMonths: Number(getInputValue("deadlineMonths")),
      energyLevel: Number(getInputValue("energyLevel")),
      examWeek: els.examWeek.checked,
      resumeText: getInputValue("resumeText"),
      selectedTags: Array.from(state.selectedTags),
      schedule: clone(state.schedule)
    };
  }

  function buildProfile(formData, roleTree) {
    const scheduleStats = computeScheduleStats(formData.schedule, formData.examWeek);
    const skillScores = inferSkillScores(formData, roleTree, scheduleStats);
    const roleFit = computeRoleFit(skillScores, roleTree);
    const strengths = sortEntries(skillScores)
      .slice(0, 4)
      .map(([skillId, score]) => ({
        skillId,
        score,
        label: roleTree.skills.find((skill) => skill.id === skillId).name
      }));

    const latentStrengths = deriveLatentStrengths(formData, roleTree);
    const disciplineIndex = clamp(Math.round((scheduleStats.focusHours * 3.1 + formData.energyLevel * 8 + scheduleStats.availableSlots.length * 1.4)), 35, 96);

    return {
      scheduleStats,
      skillScores,
      roleFit,
      strengths,
      latentStrengths,
      disciplineIndex,
      readinessNarrative: buildReadinessNarrative(roleFit, scheduleStats.weeklyHours),
      availabilityNarrative: `你的课表中有 ${scheduleStats.availableSlots.length} 个可用学习时段，其中 ${scheduleStats.focusHours.toFixed(1)} 小时属于高专注时间，非常适合安排核心技能与项目任务。`
    };
  }

  function computeScheduleStats(schedule, examWeek) {
    const availableSlots = [];
    let weeklyHours = 0;
    let focusHours = 0;
    const examLoadFactor = examWeek ? 0.82 : 1;

    schedule.forEach((periods, dayIndex) => {
      periods.forEach((stateKey, periodIndex) => {
        const period = PERIODS[periodIndex];
        const slotState = SLOT_STATES[stateKey];
        const baseHours = slotState.hours * examLoadFactor;
        weeklyHours += baseHours;
        if (stateKey === "focus") {
          focusHours += baseHours;
        }
        if (stateKey !== "blocked") {
          availableSlots.push({
            id: `${dayIndex}-${periodIndex}`,
            dayIndex,
            day: DAYS[dayIndex],
            periodIndex,
            periodKey: period.key,
            label: `${DAYS[dayIndex]} ${period.label}`,
            time: period.time,
            stateKey,
            hours: baseHours,
            energy: SLOT_STATES[stateKey].energy
          });
        }
      });
    });

    return {
      weeklyHours,
      focusHours,
      availableSlots,
      examLoadFactor
    };
  }

  function inferSkillScores(formData, roleTree, scheduleStats) {
    const scores = {};
    roleTree.skills.forEach((skill) => {
      scores[skill.id] = 18;
    });

    const major = normalizeText(formData.studentMajor);
    const resume = normalizeText(formData.resumeText);
    const gradeBoost = {
      "大一": 0,
      "大二": 4,
      "大三": 8,
      "大四": 10,
      "研一": 10,
      "研二": 12,
      "研三": 14
    }[formData.studentGrade] || 6;

    applyMajorBoosts(scores, roleTree.track, major);
    applyGradeBoost(scores, roleTree.track, gradeBoost);

    EXPERIENCE_TAGS.forEach((tag) => {
      if (!state.selectedTags.has(tag.id)) {
        return;
      }
      Object.entries(tag.bonuses).forEach(([skillId, bonus]) => {
        if (skillId in scores) {
          scores[skillId] += bonus;
        }
      });
    });

    const keywordRules = buildKeywordRules(roleTree.track);
    keywordRules.forEach((rule) => {
      if (rule.pattern.test(resume)) {
        Object.entries(rule.bonuses).forEach(([skillId, bonus]) => {
          if (skillId in scores) {
            scores[skillId] += bonus;
          }
        });
      }
    });

    const scheduleBonus = scheduleStats.weeklyHours > 16 ? 6 : scheduleStats.weeklyHours > 10 ? 4 : 2;
    const focusBonus = scheduleStats.focusHours > 9 ? 4 : 2;

    roleTree.skills.forEach((skill) => {
      if (skill.bucket === "project") {
        scores[skill.id] += Math.round(scheduleBonus * 0.7);
      } else {
        scores[skill.id] += focusBonus;
      }
      scores[skill.id] = clamp(Math.round(scores[skill.id]), 16, 94);
    });

    return scores;
  }

  function applyMajorBoosts(scores, track, major) {
    const boostByTrack = {
      technical: [
        { match: /(计算机|软件|网络|数据|人工智能)/, bonuses: { java_core: 18, mysql_sql: 14, algorithms: 12, spring_boot: 8 } },
        { match: /(电子|自动化|机械|通信)/, bonuses: { java_core: 8, algorithms: 6, engineering: 4 } }
      ],
      product: [
        { match: /(社会学|新闻|中文|广告|市场|管理|法学)/, bonuses: { communication: 16, user_research: 14, competitor_analysis: 8 } },
        { match: /(计算机|软件|数据)/, bonuses: { data_analysis: 10, prototype_design: 8, requirement_analysis: 6 } }
      ],
      data: [
        { match: /(统计|数学|经济|金融|数据|计算机)/, bonuses: { statistics: 18, sql: 12, python: 10 } },
        { match: /(机械|工业|自动化|物理)/, bonuses: { python: 10, business_insight: 8, project_story: 6 } }
      ]
    };

    (boostByTrack[track] || []).forEach((item) => {
      if (item.match.test(major)) {
        Object.entries(item.bonuses).forEach(([skillId, bonus]) => {
          if (skillId in scores) {
            scores[skillId] += bonus;
          }
        });
      }
    });
  }

  function applyGradeBoost(scores, track, gradeBoost) {
    Object.keys(scores).forEach((skillId) => {
      const isProjectSkill = /(project|portfolio|story)/.test(skillId);
      const isFoundation = /(java_core|spring_boot|mysql_sql|user_research|requirement_analysis|python|sql|statistics)/.test(skillId);
      const multiplier = isProjectSkill ? 0.7 : isFoundation ? 0.9 : 0.8;
      scores[skillId] += Math.round(gradeBoost * multiplier);
    });

    if (track === "product") {
      scores.communication += 3;
    }
  }

  function buildKeywordRules(track) {
    const shared = [
      { pattern: /(比赛|竞赛|hackathon)/, bonuses: { project_practice: 6, portfolio: 6, project_story: 6 } },
      { pattern: /(博客|公众号|复盘|输出)/, bonuses: { communication: 5, portfolio: 5, project_story: 5 } },
      { pattern: /(实习|intern)/, bonuses: { engineering: 8, communication: 8, business_insight: 8, project_practice: 8 } }
    ];

    const map = {
      technical: [
        { pattern: /(java|jvm|集合|并发)/, bonuses: { java_core: 14 } },
        { pattern: /(spring|springboot|mybatis|接口|api)/, bonuses: { spring_boot: 14, api_design: 12 } },
        { pattern: /(mysql|sql|数据库|索引)/, bonuses: { mysql_sql: 14 } },
        { pattern: /(redis|缓存)/, bonuses: { redis: 12 } },
        { pattern: /(项目|论坛|商城|博客系统)/, bonuses: { project_practice: 12, engineering: 8 } },
        { pattern: /(算法|leetcode)/, bonuses: { algorithms: 12 } }
      ],
      product: [
        { pattern: /(prd|需求文档|原型)/, bonuses: { prd_writing: 14, prototype_design: 10 } },
        { pattern: /(访谈|问卷|画像|用户研究)/, bonuses: { user_research: 14, requirement_analysis: 8 } },
        { pattern: /(竞品|拆解|案例分析)/, bonuses: { competitor_analysis: 14, portfolio: 8 } },
        { pattern: /(增长|指标|留存|漏斗)/, bonuses: { data_analysis: 12, requirement_analysis: 8 } },
        { pattern: /(沟通|跨部门|推进|策划)/, bonuses: { communication: 14, portfolio: 6 } }
      ],
      data: [
        { pattern: /(python|pandas|numpy)/, bonuses: { python: 14 } },
        { pattern: /(sql|mysql|hive|窗口函数)/, bonuses: { sql: 14 } },
        { pattern: /(统计|回归|显著性|假设检验)/, bonuses: { statistics: 12, ab_test: 8 } },
        { pattern: /(可视化|图表|tableau|power bi)/, bonuses: { visualization: 12, bi_tools: 10 } },
        { pattern: /(分析报告|洞察|业务)/, bonuses: { business_insight: 12, project_story: 8 } },
        { pattern: /(kaggle|项目|作品集)/, bonuses: { project_story: 14, python: 6 } }
      ]
    };

    return [...(map[track] || []), ...shared];
  }

  function buildGapReport(skillScores, roleTree) {
    const gapItems = roleTree.skills.map((skill) => {
      const current = skillScores[skill.id] || 0;
      const gap = Math.max(skill.target - current, 0);
      const gapRatio = gap / 100;
      const missingDeps = skill.deps.filter((depId) => (skillScores[depId] || 0) < 60).length;
      const priorityScore = Math.round(
        skill.importance * gapRatio * (1 + skill.difficulty * 0.08 + missingDeps * 0.06) * 100
      );

      return {
        ...skill,
        current,
        gap,
        gapRatio,
        missingDeps,
        priorityScore,
        readinessScore: Math.round((current / skill.target) * 100)
      };
    });

    return gapItems.sort((left, right) => right.priorityScore - left.priorityScore);
  }

  function computeRoleFit(skillScores, roleTree) {
    const totalWeight = roleTree.skills.reduce((sum, skill) => sum + skill.importance, 0);
    const readiness = roleTree.skills.reduce((sum, skill) => {
      const current = skillScores[skill.id] || 0;
      return sum + Math.min(current / skill.target, 1) * skill.importance;
    }, 0);
    return Math.round((readiness / totalWeight) * 100);
  }

  function deriveLatentStrengths(formData, roleTree) {
    const talents = [];
    const resume = normalizeText(formData.resumeText);
    if (/(比赛|竞赛|hackathon)/.test(resume)) talents.push("高压场景下的目标推进能力");
    if (/(策划|社团|负责人|班委)/.test(resume)) talents.push("跨团队协同与表达能力");
    if (/(项目|作品|案例)/.test(resume)) talents.push("结果导向与成果沉淀意识");
    if (formData.energyLevel >= 4) talents.push("连续深度学习耐力较强");
    if (!talents.length) talents.push(`${roleTree.label} 方向的基础迁移潜力明显`);
    return talents.slice(0, 4);
  }

  function buildReadinessNarrative(roleFit, weeklyHours) {
    if (roleFit >= 78) {
      return `你已经具备不错的岗位底座，只要把每周 ${weeklyHours.toFixed(1)} 小时稳定投入到项目与表达，就有机会快速进入投递窗口。`;
    }
    if (roleFit >= 58) {
      return `你处在“有基础但缺闭环”的阶段，最关键的是把高优先级差距尽快做成可展示成果。`;
    }
    return `你当前更适合先做系统补齐，重点不是学更多，而是按优先级补最关键的几块能力。`;
  }

  function buildLearningPlan(formData, profile, roleTree, gapReport) {
    const phaseMonths = allocatePhaseMonths(formData.deadlineMonths);
    const focusSkills = gapReport.slice(0, 6);
    const annualPhases = buildAnnualPhases(roleTree, focusSkills, phaseMonths);
    const monthlyPlan = buildMonthlyPlan(formData, roleTree, focusSkills, annualPhases);
    const weeklyPlan = buildWeeklyPlan(formData, roleTree, gapReport, monthlyPlan[0], profile.scheduleStats);

    return {
      annualPhases,
      monthlyPlan,
      weeklyPlan,
      highlights: {
        reviewCount: weeklyPlan.assignedTasks.filter((task) => task.mode === "复习").length,
        activeSkillCount: new Set(weeklyPlan.assignedTasks.filter((task) => task.skillId).map((task) => task.skillId)).size,
        plannedHours: weeklyPlan.assignedTasks.reduce((sum, task) => sum + task.hours, 0)
      }
    };
  }

  function allocatePhaseMonths(totalMonths) {
    const first = Math.max(1, Math.round(totalMonths * 0.4));
    const second = Math.max(1, Math.round(totalMonths * 0.35));
    let third = totalMonths - first - second;
    if (third < 1) {
      third = 1;
      if (second > 1) {
        return [first, second - 1, third];
      }
      return [Math.max(1, first - 1), second, third];
    }
    return [first, second, third];
  }

  function buildAnnualPhases(roleTree, focusSkills, phaseMonths) {
    const foundation = focusSkills.filter((item) => item.bucket === "foundation").slice(0, 3);
    const growth = focusSkills.filter((item) => item.bucket !== "project").slice(0, 3);
    const project = roleTree.skills.filter((skill) => skill.bucket === "project").slice(0, 2);

    return [
      {
        title: "Phase 1 · 基础补齐",
        months: phaseMonths[0],
        milestone: "搭出可复用的技能骨架",
        outcome: "完成知识笔记、关键概念闭环和 1 个可运行 demo。",
        focuses: foundation.map((item) => item.name)
      },
      {
        title: "Phase 2 · 项目沉淀",
        months: phaseMonths[1],
        milestone: "形成可以投递的作品材料",
        outcome: "把技能点串成真实项目 / 作品集，补齐业务表达与复盘能力。",
        focuses: growth.map((item) => item.name)
      },
      {
        title: "Phase 3 · 面试冲刺",
        months: phaseMonths[2],
        milestone: "提升岗位匹配度与面试转化率",
        outcome: "打磨项目故事、模拟问答、完成针对性投递。",
        focuses: project.map((item) => item.name)
      }
    ];
  }

  function buildMonthlyPlan(formData, roleTree, focusSkills, annualPhases) {
    const months = [];
    let phaseCursor = 0;
    let phaseMonthCount = 0;
    const outputsByTrack = {
      technical: ["完成 1 份知识图谱", "完成 1 个后端模块", "完成 1 次面试复盘", "补 15 道高频题"],
      product: ["完成 1 份竞品拆解", "完成 1 份 PRD", "完成 1 份原型稿", "完成 1 次作品集讲述"],
      data: ["完成 1 份 SQL 查询集", "完成 1 个分析报告", "完成 1 份可视化 Dashboard", "完成 1 次项目复盘"]
    };

    for (let index = 0; index < formData.deadlineMonths; index += 1) {
      if (phaseMonthCount >= annualPhases[phaseCursor].months && phaseCursor < annualPhases.length - 1) {
        phaseCursor += 1;
        phaseMonthCount = 0;
      }
      const phase = annualPhases[phaseCursor];
      const start = (index * 2) % focusSkills.length;
      const monthFocus = focusSkills.slice(start, start + 2).map((item) => item.name);
      const output = outputsByTrack[roleTree.track][index % outputsByTrack[roleTree.track].length];
      const load = formData.examWeek && index === 0 ? "减负模式" : index === formData.deadlineMonths - 1 ? "冲刺模式" : "稳步推进";

      months.push({
        monthIndex: index + 1,
        title: `第 ${index + 1} 月`,
        phase: phase.title,
        load,
        focus: monthFocus,
        output,
        note: phaseMonthCount === 0 ? `承接 ${phase.milestone}` : `沿着 ${phase.title} 继续推进`
      });
      phaseMonthCount += 1;
    }
    return months;
  }

  function buildWeeklyPlan(formData, roleTree, gapReport, currentMonth, scheduleStats) {
    const taskQueue = buildTaskQueue(roleTree, gapReport, currentMonth);
    const assignments = assignTasksToSlots(scheduleStats.availableSlots, taskQueue, formData.examWeek);
    const grid = buildScheduleGrid(assignments, formData.schedule);
    return {
      currentMonth,
      assignedTasks: assignments,
      grid
    };
  }

  function buildTaskQueue(roleTree, gapReport, currentMonth) {
    const topGaps = gapReport.slice(0, 3);
    const queue = [];

    topGaps.forEach((gap, index) => {
      queue.push({
        id: `${gap.id}-learn`,
        skillId: gap.id,
        title: `${gap.name} 核心概念学习`,
        mode: "新知",
        hours: index === 0 ? 3 : 2,
        priority: gap.priorityScore + 8,
        deliverable: `输出 1 页 ${gap.short} 笔记`
      });
      queue.push({
        id: `${gap.id}-practice`,
        skillId: gap.id,
        title: `${gap.name} 动手练习`,
        mode: "实操",
        hours: 2.5,
        priority: gap.priorityScore,
        deliverable: `完成 1 个 ${gap.short} 练习任务`
      });
    });

    const projectSkill = roleTree.skills.find((skill) => skill.bucket === "project");
    queue.push({
      id: `${projectSkill.id}-project`,
      skillId: projectSkill.id,
      title: `${projectSkill.name} 作品沉淀`,
      mode: "项目",
      hours: 3,
      priority: 55,
      deliverable: currentMonth.output
    });
    queue.push({
      id: "weekly-review",
      skillId: "",
      title: "本周复盘与下周校准",
      mode: "复盘",
      hours: 2,
      priority: 44,
      deliverable: "记录难点、复盘效率、微调任务"
    });

    return queue.sort((left, right) => right.priority - left.priority);
  }

  function assignTasksToSlots(availableSlots, taskQueue, examWeek) {
    const assignments = [];
    const slotPool = availableSlots.map((slot) => ({ ...slot, assigned: false }));
    const reviewRequests = [];

    taskQueue.forEach((task) => {
      const preferredSlot = slotPool
        .filter((slot) => !slot.assigned && slot.hours >= Math.min(task.hours, 2))
        .sort((left, right) => right.energy - left.energy || left.dayIndex - right.dayIndex || left.periodIndex - right.periodIndex)[0];

      if (!preferredSlot) {
        return;
      }

      preferredSlot.assigned = true;
      const assignment = {
        ...preferredSlot,
        title: task.title,
        skillId: task.skillId,
        mode: task.mode,
        hours: preferredSlot.hours,
        deliverable: task.deliverable,
        stateClass: preferredSlot.stateKey === "focus" ? "is-focus" : ""
      };
      assignments.push(assignment);

      if (task.mode === "新知") {
        reviewRequests.push({ skillId: task.skillId, skillName: task.title.split(" 核心概念学习")[0], dayIndex: preferredSlot.dayIndex });
      }
    });

    reviewRequests.forEach((request, index) => {
      [1, 3].forEach((offset) => {
        const reviewSlot = slotPool.find((slot) => !slot.assigned && slot.dayIndex >= request.dayIndex + offset);
        if (reviewSlot) {
          reviewSlot.assigned = true;
          assignments.push({
            ...reviewSlot,
            title: `${request.skillName} 复习回看`,
            skillId: request.skillId,
            mode: "复习",
            hours: reviewSlot.hours,
            deliverable: `回顾重点并修正 1 处误区`,
            stateClass: "is-review"
          });
        }
      });
      if (examWeek && index === 0) {
        const bufferSlot = slotPool.find((slot) => !slot.assigned);
        if (bufferSlot) {
          bufferSlot.assigned = true;
          assignments.push({
            ...bufferSlot,
            title: "考试周减负缓冲",
            skillId: "",
            mode: "缓冲",
            hours: bufferSlot.hours,
            deliverable: "仅完成最低保底任务",
            stateClass: ""
          });
        }
      }
    });

    slotPool
      .filter((slot) => !slot.assigned)
      .forEach((slot) => {
        assignments.push({
          ...slot,
          title: slot.stateKey === "focus" ? "弹性强化 / 项目补位" : "轻量整理 / 休息",
          skillId: "",
          mode: slot.stateKey === "focus" ? "强化" : "缓冲",
          hours: slot.hours,
          deliverable: slot.stateKey === "focus" ? "补齐拖延任务或加深练习" : "整理笔记、回收精力",
          stateClass: slot.stateKey === "focus" ? "is-focus" : ""
        });
      });

    return assignments.sort((left, right) => left.dayIndex - right.dayIndex || left.periodIndex - right.periodIndex);
  }

  function buildScheduleGrid(assignments, schedule) {
    return DAYS.map((day, dayIndex) => {
      return {
        day,
        slots: PERIODS.map((period, periodIndex) => {
          const slotState = schedule[dayIndex][periodIndex];
          const assignment = assignments.find((item) => item.dayIndex === dayIndex && item.periodIndex === periodIndex);
          return {
            periodLabel: `${period.label} ${period.time}`,
            slotState,
            assignment: assignment || {
              title: "课堂 / 已占用",
              mode: "锁定",
              deliverable: "不安排学习任务",
              stateClass: "is-blocked"
            }
          };
        })
      };
    });
  }

  function buildResourcePlan(formData, roleTree, gapReport, plan) {
    const topSkills = gapReport.slice(0, 4);
    const targetDuration = formData.energyLevel >= 4 ? 100 : 70;

    return topSkills.map((gap) => {
      const resources = RESOURCES
        .filter((resource) => resource.role === formData.targetRole && resource.skills.includes(gap.id))
        .map((resource) => {
          const contentMatch = resource.skills.includes(gap.id) ? 1 : overlapRatio(resource.skills, [gap.id]);
          const skillRatio = gap.current / gap.target;
          const desiredDifficulty = skillRatio < 0.45 ? 2 : skillRatio < 0.7 ? 3 : 4;
          const difficultyFit = 1 - Math.min(Math.abs(resource.difficulty - desiredDifficulty) / 4, 1);
          const durationFit = 1 - Math.min(Math.abs(resource.duration - targetDuration) / 150, 1);
          const qualitySignal = resource.quality / 5;
          const setupFit = 1 - Math.min(resource.setupCost / 5, 1);
          const score = Math.round(
            (contentMatch * 0.38 + difficultyFit * 0.24 + durationFit * 0.2 + qualitySignal * 0.12 + setupFit * 0.06) * 100
          );

          return {
            ...resource,
            score,
            reason: `${resource.platform} 的 ${resource.type} 与「${gap.name}」高度匹配，预计能在 ${Math.round(resource.duration)} 分钟内完成一个清晰学习闭环，适合你当前每周 ${plan.highlights.plannedHours.toFixed(1)} 小时的节奏。`
          };
        })
        .sort((left, right) => right.score - left.score)
        .slice(0, 2);

      return {
        skillName: gap.name,
        brief: gap.brief,
        resources
      };
    });
  }

  function updateCoachFromInputs() {
    els.completionValue.textContent = `${els.completionRate.value}%`;
    els.difficultyValue.textContent = `${els.difficultyRate.value} / 100`;
    els.confidenceValue.textContent = `${els.confidenceRate.value} / 100`;

    if (!state.plan || !state.profile) {
      return;
    }

    const completion = Number(els.completionRate.value);
    const difficulty = Number(els.difficultyRate.value);
    const confidence = Number(els.confidenceRate.value);
    const coach = buildCoachOutput(state.profile, state.gapReport, state.plan, completion, difficulty, confidence);
    state.coach = coach;
    renderCoach(coach);
  }

  function buildCoachOutput(profile, gapReport, plan, completion, difficulty, confidence) {
    let strategy = "保持主线";
    let loadDelta = "下周维持当前负荷";
    let actionList = [];

    if (completion < 60 || difficulty > 70) {
      strategy = "减负稳住";
      loadDelta = "减少并行技能数，优先保住前 2 个核心差距";
      actionList = [
        "把本周并行学习技能数从 3 个降到 2 个。",
        "周中新增 1 个复习时段，避免学了就忘。",
        "将项目任务拆成更小里程碑，先拿到一次可见成果。"
      ];
    } else if (completion > 85 && confidence > 72) {
      strategy = "提前提速";
      loadDelta = "把 1 个高专注时段切给项目深挖或面试表达";
      actionList = [
        "提前进入项目沉淀阶段，拉高作品输出密度。",
        "加入 1 次模拟面试 / 案例讲述复盘。",
        "资源推荐里提高 GitHub 项目和中高难材料权重。"
      ];
    } else {
      actionList = [
        "继续按现有主线推进，优先完成首个核心 deliverable。",
        "保留周日复盘，检查是否需要重排某个难点技能。",
        "对高优先级技能保持“新知 + 练习 + 复习”三段式节奏。"
      ];
    }

    const nextFit = clamp(Math.round(profile.roleFit + completion * 0.08 - difficulty * 0.03 + confidence * 0.02), 35, 96);
    const trend = [0, 1, 2, 3].map((weekIndex) => {
      const uplift = weekIndex * (completion > 80 ? 4 : completion < 60 ? 2 : 3);
      const friction = weekIndex * (difficulty > 70 ? 1.2 : 0.6);
      return clamp(Math.round(profile.roleFit + uplift - friction), 28, 98);
    });

    return {
      strategy,
      loadDelta,
      actionList,
      nextFit,
      morale: completion >= 70 ? "你已经建立起稳定节奏，接下来重点是把成果做得更像“可投递材料”。" : "这周不需要追求全做完，先守住最高优先级任务，连续性比完美更重要。",
      topWatch: gapReport[0].name,
      trend
    };
  }

  function renderDashboard(formData, profile, gapReport) {
    const topGap = gapReport[0];
    const stats = [
      { value: `${profile.scheduleStats.weeklyHours.toFixed(1)}h`, label: "每周真实学习预算" },
      { value: `${profile.roleFit}%`, label: "岗位匹配度" },
      { value: `${profile.disciplineIndex}`, label: "执行稳定度指数" },
      { value: topGap ? topGap.name : "-", label: "当前第一优先级" }
    ];

    els.dashboardStats.innerHTML = stats
      .map((item) => `
        <article class="stat-card">
          <strong>${item.value}</strong>
          <span>${item.label}</span>
        </article>
      `)
      .join("");

    els.profileSummary.innerHTML = `
      <article>
        <strong>${formData.studentName || "该同学"} 的成长画像</strong>
        <p>${profile.readinessNarrative}</p>
      </article>
      <article>
        <strong>时间画像</strong>
        <p>${profile.availabilityNarrative}</p>
      </article>
      <article>
        <strong>目标岗位</strong>
        <p>${ROLE_TREES[formData.targetRole].label}，当前建议优先补齐「${gapReport[0].name}」「${gapReport[1].name}」两块能力。</p>
      </article>
    `;

    els.strengthTags.innerHTML = [...profile.strengths.map((item) => item.label), ...profile.latentStrengths]
      .slice(0, 6)
      .map((label) => `<span>${label}</span>`)
      .join("");

    els.heroHours.textContent = `${profile.scheduleStats.weeklyHours.toFixed(1)}h`;
    els.heroFit.textContent = `${profile.roleFit}%`;
    els.heroGaps.textContent = `${gapReport.filter((item) => item.priorityScore >= 20).length}`;

    renderRadar(profile.skillScores, ROLE_TREES[formData.targetRole]);
  }

  function renderRadar(skillScores, roleTree) {
    const skills = roleTree.skills.slice(0, 6);
    const size = 340;
    const center = size / 2;
    const radius = 114;
    const angleStep = (Math.PI * 2) / skills.length;

    const levels = [20, 40, 60, 80, 100];
    const gridPolygons = levels.map((level) => {
      const points = skills.map((_, index) => {
        const angle = -Math.PI / 2 + index * angleStep;
        const r = radius * (level / 100);
        return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
      }).join(" ");
      return `<polygon points="${points}" fill="none" stroke="rgba(23,50,47,0.12)" stroke-width="1"></polygon>`;
    }).join("");

    const axes = skills.map((skill, index) => {
      const angle = -Math.PI / 2 + index * angleStep;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      const labelX = center + Math.cos(angle) * (radius + 20);
      const labelY = center + Math.sin(angle) * (radius + 20);
      return `
        <line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(23,50,47,0.12)"></line>
        <text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="12">${skill.short}</text>
      `;
    }).join("");

    const currentPoints = skills.map((skill, index) => {
      const angle = -Math.PI / 2 + index * angleStep;
      const r = radius * ((skillScores[skill.id] || 0) / 100);
      return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
    }).join(" ");

    const targetPoints = skills.map((skill, index) => {
      const angle = -Math.PI / 2 + index * angleStep;
      const r = radius * (skill.target / 100);
      return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
    }).join(" ");

    els.radarChart.innerHTML = `
      <svg class="radar-svg" viewBox="0 0 ${size} ${size}" width="100%" height="320" aria-label="技能雷达图">
        ${gridPolygons}
        ${axes}
        <polygon points="${targetPoints}" fill="rgba(216,108,72,0.14)" stroke="rgba(216,108,72,0.8)" stroke-width="2"></polygon>
        <polygon points="${currentPoints}" fill="rgba(14,133,117,0.18)" stroke="rgba(14,133,117,0.95)" stroke-width="2.5"></polygon>
        <circle cx="${center}" cy="${center}" r="4" fill="var(--accent-strong)"></circle>
      </svg>
    `;
  }

  function renderGapAnalysis(roleTree, gapReport) {
    const highPriority = gapReport.filter((item) => item.priorityScore >= 20).length;
    const mediumPriority = gapReport.filter((item) => item.priorityScore >= 10 && item.priorityScore < 20).length;
    const lowRisk = gapReport.length - highPriority - mediumPriority;

    els.gapOverview.innerHTML = `
      <span class="summary-pill">高优先级差距 ${highPriority} 个</span>
      <span class="summary-pill">中优先级差距 ${mediumPriority} 个</span>
      <span class="summary-pill">已接近岗位要求 ${lowRisk} 个</span>
      <span class="summary-pill">技能树节点 ${roleTree.skills.length} 个</span>
    `;

    els.gapList.innerHTML = gapReport.map((item) => `
      <article class="gap-item">
        <div class="gap-head">
          <h3>${item.name}</h3>
          <span class="gap-score">P${item.priorityScore}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${Math.min(item.current, item.target)}%"></div>
        </div>
        <div class="gap-meta">
          <span>当前 ${item.current}</span>
          <span>目标 ${item.target}</span>
          <span>差距 ${item.gap}</span>
          <span>难度 ${item.difficulty}/5</span>
        </div>
        <p>${item.brief}</p>
        <div class="dependency-row">
          ${item.deps.length ? item.deps.map((depId) => {
            const dep = roleTree.skills.find((skill) => skill.id === depId);
            return `<span class="dependency-chip">依赖：${dep.short}</span>`;
          }).join("") : `<span class="dependency-chip">可直接启动</span>`}
        </div>
      </article>
    `).join("");
  }

  function renderPlanner(plan) {
    els.annualRoadmap.innerHTML = plan.annualPhases.map((phase) => `
      <article class="phase-card">
        <header>
          <h3>${phase.title}</h3>
          <span class="phase-badge">${phase.months} 个月</span>
        </header>
        <p><strong>阶段里程碑：</strong>${phase.milestone}</p>
        <p><strong>核心产出：</strong>${phase.outcome}</p>
        <div class="focus-list">
          ${phase.focuses.map((focus) => `<span class="focus-chip">${focus}</span>`).join("")}
        </div>
      </article>
    `).join("");

    els.monthlyPlan.innerHTML = plan.monthlyPlan.map((month) => `
      <article class="month-card">
        <header>
          <h3>${month.title}</h3>
          <span class="month-badge">${month.load}</span>
        </header>
        <p><strong>所属阶段：</strong>${month.phase}</p>
        <p><strong>本月输出：</strong>${month.output}</p>
        <p><strong>推进备注：</strong>${month.note}</p>
        <div class="focus-list">
          ${month.focus.map((focus) => `<span class="focus-chip">${focus}</span>`).join("")}
        </div>
      </article>
    `).join("");

    els.weeklySchedule.innerHTML = plan.weeklyPlan.grid.map((day) => `
      <div class="day-column">
        <div class="day-card">
          <h4>${day.day}</h4>
          ${day.slots.map((slot) => `
            <div class="slot-card ${SLOT_STATES[slot.slotState].className} ${slot.assignment.stateClass || ""}">
              <div class="slot-title">${slot.periodLabel}</div>
              <div class="slot-task">${slot.assignment.title}</div>
              <div class="slot-meta">${slot.assignment.mode} · ${slot.assignment.deliverable}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  function renderResources(resourceGroups) {
    els.resourceBoard.innerHTML = resourceGroups.map((group) => `
      <section class="resource-group">
        <header>
          <div>
            <h3>${group.skillName}</h3>
            <p>${group.brief}</p>
          </div>
        </header>
        <div class="resource-group-grid">
          ${group.resources.map((resource) => `
            <article class="resource-card">
              <h4>${resource.title}</h4>
              <div class="resource-meta">
                <span class="resource-badge">${resource.platform}</span>
                <span class="resource-badge">${resource.type}</span>
                <span class="resource-badge">难度 ${resource.difficulty}/5</span>
                <span class="resource-badge">${resource.duration} min</span>
                <span class="resource-badge">推荐分 ${resource.score}</span>
              </div>
              <p class="resource-reason">${resource.reason}</p>
              <div class="resource-actions">
                <span class="mini-note">${resource.highlight}</span>
                <a class="resource-link" href="${resource.url}" target="_blank" rel="noreferrer">查看资源</a>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `).join("");
  }

  function renderCoach(coach) {
    els.coachSummary.innerHTML = `
      <article>
        <strong>本周策略：${coach.strategy}</strong>
        <p>${coach.loadDelta}</p>
      </article>
      <article>
        <strong>重点盯防技能</strong>
        <p>${coach.topWatch} 仍是当前最可能拉开差距的关键节点。</p>
      </article>
      <article>
        <strong>回访结论</strong>
        <p>${coach.morale}</p>
      </article>
      <article>
        <strong>下周动作</strong>
        <p>${coach.actionList.join("；")}</p>
      </article>
    `;

    renderTrend(coach.trend, coach.nextFit);
  }

  function renderTrend(trend, nextFit) {
    const width = 480;
    const height = 240;
    const padding = 32;
    const maxValue = 100;
    const points = trend.map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / (trend.length - 1);
      const y = height - padding - ((value / maxValue) * (height - padding * 2));
      return { x, y, value };
    });

    const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
    const pointDots = points.map((point, index) => `
      <circle cx="${point.x}" cy="${point.y}" r="5" fill="var(--accent)"></circle>
      <text x="${point.x}" y="${point.y - 12}" text-anchor="middle" font-size="12">${point.value}%</text>
      <text x="${point.x}" y="${height - 10}" text-anchor="middle" font-size="12">W${index + 1}</text>
    `).join("");

    els.coachTrend.innerHTML = `
      <svg class="trend-svg" viewBox="0 0 ${width} ${height}" width="100%" height="260" aria-label="成长趋势预测">
        <rect x="0" y="0" width="${width}" height="${height}" rx="20" fill="rgba(255,255,255,0.35)"></rect>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(23,50,47,0.12)"></line>
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="rgba(23,50,47,0.12)"></line>
        <polyline points="${polyline}" fill="none" stroke="rgba(14,133,117,0.9)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${pointDots}
      </svg>
      <span class="trend-note">若保持当前调整策略，4 周后预计岗位匹配度可达 <strong>${nextFit}%</strong> 左右。</span>
    `;
  }

  function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (input.type === "checkbox") {
      input.checked = Boolean(value);
    } else {
      input.value = value;
    }
  }

  function getInputValue(id) {
    return document.getElementById(id).value;
  }

  function normalizeText(text) {
    return String(text || "").toLowerCase();
  }

  function sortEntries(record) {
    return Object.entries(record).sort((left, right) => right[1] - left[1]);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function overlapRatio(left, right) {
    const leftSet = new Set(left);
    const rightSet = new Set(right);
    const intersection = [...leftSet].filter((value) => rightSet.has(value)).length;
    return intersection / Math.max(leftSet.size, 1);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
})();
