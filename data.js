window.GrowthData = (() => {
  const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const PERIODS = [
    { key: "morning", label: "上午", time: "08:30-11:00", hours: 2.5 },
    { key: "afternoon", label: "下午", time: "14:00-17:00", hours: 3 },
    { key: "evening", label: "晚上", time: "19:00-22:00", hours: 3 }
  ];

  const SLOT_STATES = {
    blocked: { label: "忙碌", hours: 0, energy: 0, className: "is-blocked" },
    study: { label: "可学习", hours: 2, energy: 1, className: "is-study" },
    focus: { label: "高专注", hours: 3, energy: 1.35, className: "is-focus" }
  };

  const ROLE_TREES = {
    java_backend: {
      label: "Java 后端开发工程师（校招）",
      track: "technical",
      idealWeeks: 20,
      defaultGoal: "希望在明年春招前拿到 2 个 Java 后端面试机会，并能讲出完整项目经历。",
      skills: [
        { id: "java_core", name: "Java 基础", short: "Java", target: 88, importance: 0.98, difficulty: 2, deps: [], bucket: "foundation", brief: "集合、并发、JVM 与面向对象能力。" },
        { id: "spring_boot", name: "Spring Boot / 框架", short: "Spring", target: 85, importance: 0.96, difficulty: 3, deps: ["java_core"], bucket: "foundation", brief: "能独立搭建 API 服务并理解常见注解链路。" },
        { id: "mysql_sql", name: "MySQL / SQL", short: "SQL", target: 82, importance: 0.9, difficulty: 2, deps: [], bucket: "foundation", brief: "表设计、索引、常见查询与事务。" },
        { id: "redis", name: "Redis", short: "Redis", target: 76, importance: 0.8, difficulty: 2, deps: ["mysql_sql"], bucket: "growth", brief: "缓存、过期策略与常见业务场景。" },
        { id: "api_design", name: "接口设计与调试", short: "API", target: 80, importance: 0.82, difficulty: 3, deps: ["spring_boot", "mysql_sql"], bucket: "growth", brief: "REST 设计、鉴权、接口联调与异常处理。" },
        { id: "algorithms", name: "算法与数据结构", short: "算法", target: 78, importance: 0.86, difficulty: 4, deps: [], bucket: "growth", brief: "校招高频题、链表树图与复杂度分析。" },
        { id: "engineering", name: "工程化与部署", short: "工程化", target: 72, importance: 0.74, difficulty: 4, deps: ["spring_boot"], bucket: "project", brief: "Git、日志、测试、基础部署与排错。" },
        { id: "project_practice", name: "项目实战表达", short: "项目", target: 84, importance: 1, difficulty: 4, deps: ["spring_boot", "mysql_sql", "redis", "api_design"], bucket: "project", brief: "把项目做成可以写进简历和面试讲述的成果。" }
      ]
    },
    product_manager: {
      label: "产品经理（校招）",
      track: "product",
      idealWeeks: 16,
      defaultGoal: "希望在秋招前产出 2 份高质量作品集，并能独立完成需求拆解与 PRD 撰写。",
      skills: [
        { id: "user_research", name: "用户研究", short: "用户研究", target: 78, importance: 0.82, difficulty: 2, deps: [], bucket: "foundation", brief: "访谈、问卷、用户画像与洞察提炼。" },
        { id: "requirement_analysis", name: "需求分析", short: "需求分析", target: 88, importance: 1, difficulty: 3, deps: ["user_research"], bucket: "foundation", brief: "场景拆解、需求优先级与问题定义。" },
        { id: "competitor_analysis", name: "竞品分析", short: "竞品", target: 76, importance: 0.74, difficulty: 2, deps: [], bucket: "foundation", brief: "拆框架、看策略、提亮点与空白机会。" },
        { id: "prd_writing", name: "PRD 撰写", short: "PRD", target: 86, importance: 0.96, difficulty: 3, deps: ["requirement_analysis"], bucket: "growth", brief: "将需求转为结构化、可协作的交付文档。" },
        { id: "prototype_design", name: "原型设计", short: "原型", target: 78, importance: 0.8, difficulty: 2, deps: ["requirement_analysis"], bucket: "growth", brief: "低保真到高保真原型表达与交互说明。" },
        { id: "data_analysis", name: "数据分析", short: "数据", target: 74, importance: 0.72, difficulty: 3, deps: [], bucket: "growth", brief: "基础数据指标、漏斗、留存和实验意识。" },
        { id: "communication", name: "跨团队沟通", short: "沟通", target: 82, importance: 0.84, difficulty: 2, deps: [], bucket: "project", brief: "拉齐目标、推动方案、写汇报和口头表达。" },
        { id: "portfolio", name: "作品集与案例表达", short: "作品集", target: 90, importance: 0.94, difficulty: 4, deps: ["prd_writing", "prototype_design", "data_analysis"], bucket: "project", brief: "形成能投递、能讲述、能自证思考链路的作品。" }
      ]
    },
    data_analyst: {
      label: "数据分析师（校招）",
      track: "data",
      idealWeeks: 16,
      defaultGoal: "希望在 4 个月内补齐 SQL、可视化和项目实战能力，拿到数据分析方向实习面试。",
      skills: [
        { id: "python", name: "Python 数据处理", short: "Python", target: 84, importance: 0.94, difficulty: 2, deps: [], bucket: "foundation", brief: "Pandas、清洗、分析与脚本自动化。" },
        { id: "sql", name: "SQL 查询与建模", short: "SQL", target: 88, importance: 1, difficulty: 2, deps: [], bucket: "foundation", brief: "Join、窗口函数、业务查询与表结构理解。" },
        { id: "statistics", name: "统计学基础", short: "统计", target: 80, importance: 0.82, difficulty: 3, deps: [], bucket: "foundation", brief: "抽样、显著性、回归直觉与指标解释。" },
        { id: "visualization", name: "数据可视化", short: "可视化", target: 78, importance: 0.78, difficulty: 2, deps: ["python"], bucket: "growth", brief: "图表选型、叙事表达、仪表板思维。" },
        { id: "bi_tools", name: "BI 工具", short: "BI", target: 72, importance: 0.68, difficulty: 2, deps: ["visualization"], bucket: "growth", brief: "Tableau / Power BI 的基础搭建与交互。" },
        { id: "ab_test", name: "A/B 测试", short: "A/B", target: 74, importance: 0.7, difficulty: 3, deps: ["statistics"], bucket: "growth", brief: "实验设计、指标选择、结果解释。" },
        { id: "business_insight", name: "业务理解", short: "业务", target: 80, importance: 0.86, difficulty: 3, deps: ["sql", "statistics"], bucket: "project", brief: "将分析结论转成业务建议和行动项。" },
        { id: "project_story", name: "项目实战与汇报", short: "项目", target: 88, importance: 0.96, difficulty: 4, deps: ["python", "sql", "visualization", "business_insight"], bucket: "project", brief: "做出端到端项目并清晰讲述分析价值。" }
      ]
    }
  };

  const EXPERIENCE_TAGS = [
    { id: "backend_course", label: "学过 Java / 数据结构", bonuses: { java_core: 14, algorithms: 10, mysql_sql: 8 } },
    { id: "spring_project", label: "做过 Spring Boot 小项目", bonuses: { spring_boot: 20, api_design: 14, engineering: 8, project_practice: 8 } },
    { id: "backend_intern", label: "有过研发实习 / 协作开发", bonuses: { api_design: 12, engineering: 14, project_practice: 16, mysql_sql: 10 } },
    { id: "pm_club", label: "做过社团活动策划 / 项目推进", bonuses: { communication: 16, requirement_analysis: 8, portfolio: 6 } },
    { id: "prd_written", label: "写过 PRD / 竞品分析", bonuses: { prd_writing: 16, competitor_analysis: 14, requirement_analysis: 10 } },
    { id: "design_tool", label: "会用 Figma / 墨刀 / Axure", bonuses: { prototype_design: 16, portfolio: 8 } },
    { id: "data_course", label: "学过统计 / 数据分析课程", bonuses: { python: 10, statistics: 14, sql: 8 } },
    { id: "kaggle_case", label: "做过 Kaggle / 数据项目", bonuses: { project_story: 16, business_insight: 10, visualization: 12, python: 10 } },
    { id: "leadership", label: "担任班委 / 学生干部", bonuses: { communication: 12, portfolio: 6, project_story: 4 } },
    { id: "competition", label: "参加过比赛 / Hackathon", bonuses: { project_practice: 10, portfolio: 8, project_story: 8, engineering: 6 } },
    { id: "content_output", label: "持续输出笔记 / 公众号 / 博客", bonuses: { portfolio: 10, communication: 6, project_story: 8, api_design: 4 } },
    { id: "english_reading", label: "能阅读英文文档", bonuses: { engineering: 4, business_insight: 4, project_practice: 4, bi_tools: 4 } }
  ];

  const PRESETS = {
    java_sprint: {
      label: "秋招 Java 冲刺",
      subtitle: "普通一本计科大三",
      fields: {
        studentName: "张同学",
        studentGrade: "大三",
        studentMajor: "计算机科学与技术",
        targetRole: "java_backend",
        goalText: "希望在明年 3 月春招前完成后端能力补齐，拿到 2 次以上面试机会。",
        deadlineMonths: 5,
        energyLevel: 4,
        examWeek: false,
        resumeText: "学过 Java、数据结构、数据库原理，做过一个简易校园论坛项目，能够完成基础增删改查。参加过校级程序设计比赛，正在准备春招。"
      },
      selectedTags: ["backend_course", "spring_project", "competition"],
      schedule: [
        ["blocked", "blocked", "focus"],
        ["blocked", "study", "focus"],
        ["blocked", "blocked", "focus"],
        ["blocked", "study", "focus"],
        ["blocked", "study", "study"],
        ["focus", "focus", "study"],
        ["study", "study", "focus"]
      ]
    },
    pm_transition: {
      label: "文科转产品经理",
      subtitle: "社会学大三转岗",
      fields: {
        studentName: "李同学",
        studentGrade: "大三",
        studentMajor: "社会学",
        targetRole: "product_manager",
        goalText: "希望在秋招前形成 2 份可投递作品集，理解需求分析和 PRD 写作完整链路。",
        deadlineMonths: 4,
        energyLevel: 3,
        examWeek: false,
        resumeText: "负责社团活动策划和内容运营，平时喜欢分析互联网产品，有一些问卷调研经验，但没有系统写过 PRD。"
      },
      selectedTags: ["pm_club", "leadership", "content_output"],
      schedule: [
        ["blocked", "study", "study"],
        ["blocked", "blocked", "focus"],
        ["blocked", "study", "study"],
        ["blocked", "blocked", "focus"],
        ["blocked", "study", "study"],
        ["focus", "focus", "study"],
        ["focus", "study", "study"]
      ]
    },
    data_switch: {
      label: "跨专业冲数据分析",
      subtitle: "机械研二转数据",
      fields: {
        studentName: "王同学",
        studentGrade: "研二",
        studentMajor: "机械工程",
        targetRole: "data_analyst",
        goalText: "希望在 4 个月内补齐 SQL、可视化和项目案例，争取拿到数据分析方向实习。",
        deadlineMonths: 4,
        energyLevel: 4,
        examWeek: true,
        resumeText: "有 Python 和统计基础，做过实验数据处理，但缺少数据分析项目和可视化作品，希望尽快完成转型。"
      },
      selectedTags: ["data_course", "kaggle_case", "english_reading"],
      schedule: [
        ["blocked", "study", "focus"],
        ["blocked", "blocked", "focus"],
        ["blocked", "study", "study"],
        ["blocked", "blocked", "focus"],
        ["blocked", "study", "study"],
        ["focus", "focus", "study"],
        ["study", "study", "focus"]
      ]
    }
  };

  const RESOURCES = [
    {
      role: "java_backend",
      title: "Spring Boot 从 0 到 1 项目实战",
      platform: "B站",
      type: "视频课",
      skills: ["spring_boot", "api_design", "project_practice"],
      difficulty: 2,
      duration: 110,
      quality: 4.7,
      setupCost: 2,
      url: "https://search.bilibili.com/all?keyword=Spring%20Boot%20%E9%A1%B9%E7%9B%AE%E5%AE%9E%E6%88%98",
      highlight: "适合框架刚起步阶段，能快速完成后端项目闭环。"
    },
    {
      role: "java_backend",
      title: "Java 并发与集合高频面试路线",
      platform: "小红书",
      type: "经验笔记",
      skills: ["java_core", "algorithms"],
      difficulty: 3,
      duration: 35,
      quality: 4.2,
      setupCost: 1,
      url: "https://www.xiaohongshu.com/explore",
      highlight: "碎片化复习友好，适合穿插进晚间 35 分钟时间块。"
    },
    {
      role: "java_backend",
      title: "Spring PetClinic / Java Web 经典练手项目",
      platform: "GitHub",
      type: "开源项目",
      skills: ["project_practice", "spring_boot", "engineering"],
      difficulty: 4,
      duration: 180,
      quality: 4.9,
      setupCost: 3,
      url: "https://github.com/search?q=spring+boot+demo&type=repositories",
      highlight: "可直接作为项目拆解与简历表达参考。"
    },
    {
      role: "java_backend",
      title: "MySQL 索引与 SQL 优化入门",
      platform: "B站",
      type: "专题课",
      skills: ["mysql_sql", "redis"],
      difficulty: 2,
      duration: 75,
      quality: 4.5,
      setupCost: 1,
      url: "https://search.bilibili.com/all?keyword=MySQL%20%E7%B4%A2%E5%BC%95%20SQL%20%E4%BC%98%E5%8C%96",
      highlight: "对校招常见数据库题和项目调优表达很有帮助。"
    },
    {
      role: "java_backend",
      title: "后端工程化 Roadmap",
      platform: "Roadmap",
      type: "知识地图",
      skills: ["engineering", "api_design", "redis"],
      difficulty: 3,
      duration: 45,
      quality: 4.6,
      setupCost: 1,
      url: "https://roadmap.sh/backend",
      highlight: "适合校准技能树顺序，避免盲目补点。"
    },
    {
      role: "product_manager",
      title: "从需求拆解到 PRD 的产品新人训练营",
      platform: "B站",
      type: "视频课",
      skills: ["requirement_analysis", "prd_writing"],
      difficulty: 2,
      duration: 95,
      quality: 4.6,
      setupCost: 1,
      url: "https://search.bilibili.com/all?keyword=PRD%20%E9%9C%80%E6%B1%82%E5%88%86%E6%9E%90",
      highlight: "结构完整，能帮助新手搭出产品交付语言。"
    },
    {
      role: "product_manager",
      title: "产品经理竞品分析模板库",
      platform: "小红书",
      type: "模板合集",
      skills: ["competitor_analysis", "portfolio"],
      difficulty: 1,
      duration: 25,
      quality: 4.1,
      setupCost: 1,
      url: "https://www.xiaohongshu.com/explore",
      highlight: "适合快速建立作品集表达模板。"
    },
    {
      role: "product_manager",
      title: "Figma / 墨刀原型实战案例",
      platform: "B站",
      type: "实操视频",
      skills: ["prototype_design", "portfolio"],
      difficulty: 2,
      duration: 65,
      quality: 4.5,
      setupCost: 2,
      url: "https://search.bilibili.com/all?keyword=Figma%20%E4%BA%A7%E5%93%81%E5%8E%9F%E5%9E%8B",
      highlight: "适合在周末长时间块快速输出第一版作品。"
    },
    {
      role: "product_manager",
      title: "产品人知识库 / PRD 案例仓库",
      platform: "GitHub",
      type: "知识仓库",
      skills: ["prd_writing", "portfolio", "communication"],
      difficulty: 2,
      duration: 50,
      quality: 4.7,
      setupCost: 1,
      url: "https://github.com/search?q=product+manager+prd&type=repositories",
      highlight: "能帮助用户学习结构化表达和复盘框架。"
    },
    {
      role: "product_manager",
      title: "增长产品 / 数据指标入门",
      platform: "知乎",
      type: "长文专题",
      skills: ["data_analysis", "requirement_analysis"],
      difficulty: 3,
      duration: 40,
      quality: 4.3,
      setupCost: 1,
      url: "https://www.zhihu.com/search?type=content&q=%E4%BA%A7%E5%93%81%20%E6%95%B0%E6%8D%AE%20%E5%88%86%E6%9E%90",
      highlight: "有助于把主观想法转成可验证指标。"
    },
    {
      role: "data_analyst",
      title: "SQL 校招高频题与窗口函数实战",
      platform: "B站",
      type: "专题课",
      skills: ["sql", "business_insight"],
      difficulty: 2,
      duration: 80,
      quality: 4.8,
      setupCost: 1,
      url: "https://search.bilibili.com/all?keyword=SQL%20%E7%AA%97%E5%8F%A3%E5%87%BD%E6%95%B0%20%E6%A0%A1%E6%8B%9B",
      highlight: "对实习笔试和面试都很友好。"
    },
    {
      role: "data_analyst",
      title: "Pandas 数据清洗全流程",
      platform: "B站",
      type: "视频课",
      skills: ["python", "visualization"],
      difficulty: 2,
      duration: 105,
      quality: 4.7,
      setupCost: 1,
      url: "https://search.bilibili.com/all?keyword=Pandas%20%E6%95%B0%E6%8D%AE%E6%B8%85%E6%B4%97",
      highlight: "覆盖最常用的数据分析基础动作。"
    },
    {
      role: "data_analyst",
      title: "Kaggle / 分析项目案例集",
      platform: "GitHub",
      type: "项目仓库",
      skills: ["project_story", "python", "business_insight"],
      difficulty: 4,
      duration: 180,
      quality: 4.9,
      setupCost: 2,
      url: "https://github.com/search?q=data+analysis+portfolio&type=repositories",
      highlight: "适合作为作品集结构参考和项目复刻素材。"
    },
    {
      role: "data_analyst",
      title: "Tableau / Power BI 快速上手",
      platform: "B站",
      type: "工具课",
      skills: ["bi_tools", "visualization"],
      difficulty: 2,
      duration: 60,
      quality: 4.4,
      setupCost: 2,
      url: "https://search.bilibili.com/all?keyword=Tableau%20PowerBI%20%E5%85%A5%E9%97%A8",
      highlight: "可以快速补齐可视化工具短板。"
    },
    {
      role: "data_analyst",
      title: "A/B 测试与统计推断笔记",
      platform: "知乎",
      type: "长文专题",
      skills: ["ab_test", "statistics"],
      difficulty: 3,
      duration: 35,
      quality: 4.3,
      setupCost: 1,
      url: "https://www.zhihu.com/search?type=content&q=A%2FB%20%E6%B5%8B%E8%AF%95%20%E7%BB%9F%E8%AE%A1",
      highlight: "适合建立实验设计思维和面试表达。"
    }
  ];

  const ALGORITHM_NOTES = [
    {
      title: "1. 课表驱动时间槽计算",
      summary: "将每个时间块映射为忙碌 / 可学习 / 高专注三态，并结合考试周减负因子估算真实学习预算。",
      bullets: [
        "忙碌 = 0 小时，可学习 = 2 小时，高专注 = 3 小时。",
        "考试周时，总时长乘以 0.82，并优先保留高优先级技能。",
        "高专注块优先分配给新知识与项目任务。"
      ]
    },
    {
      title: "2. 当前能力估算",
      summary: "根据专业背景、经历标签和自述文本中的关键词，为岗位技能树每个节点打出初始分。",
      bullets: [
        "专业背景决定基础分布，例如计科更偏向 Java / SQL，社会学更偏向用户研究与沟通。",
        "经历标签直接加分，例如实习、比赛、社团、项目经历。",
        "文本解析捕捉关键词，例如 Spring、PRD、Pandas、A/B 测试等。"
      ]
    },
    {
      title: "3. 加权差距排序",
      summary: "优先级 = 重要性 × 差距程度 × (1 + 难度修正 + 依赖缺口修正)。",
      bullets: [
        "差距程度 = max(目标分 - 当前分, 0) / 100。",
        "难度越高，需要越早开始预热，所以会做轻微前置加权。",
        "依赖项没补齐时，对上层技能追加优先级提醒。"
      ]
    },
    {
      title: "4. 三层规划生成",
      summary: "先按月数切成基础补齐、项目沉淀、面试冲刺三个阶段，再把重点技能塞进月主题和周时间块。",
      bullets: [
        "年层负责方向和里程碑。",
        "月层负责主题与产出物，例如小项目、PRD、案例报告。",
        "周层负责具体到哪一天学什么，并自动插入复习节点。"
      ]
    },
    {
      title: "5. 资源策展排序",
      summary: "综合内容匹配度、难度适配度、时长适配度、平台质量信号和上手成本给资源打分。",
      bullets: [
        "内容匹配度权重最高，保证资源真正对准当前技能缺口。",
        "时长会根据用户空档长度自动偏向短视频、专题课或开源项目。",
        "每条资源都生成推荐理由，便于比赛讲可解释性。"
      ]
    },
    {
      title: "6. 周日回访动态调整",
      summary: "根据本周完成度、学习阻力和自信度，动态决定减负、保持主线还是提前提速。",
      bullets: [
        "完成度低时减少并行技能数，强化复习与保底产出。",
        "完成度高且自信度高时，提前加入项目深挖或面试输出。",
        "回访结果直接反馈到下周排程与资源推荐顺序。"
      ]
    }
  ];

  return {
    DAYS,
    PERIODS,
    SLOT_STATES,
    ROLE_TREES,
    EXPERIENCE_TAGS,
    PRESETS,
    RESOURCES,
    ALGORITHM_NOTES
  };
})();
