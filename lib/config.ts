/**
 * 站点配置
 * 可以通过环境变量覆盖默认值
 */

export interface SiteConfig {
  // 站点基本信息
  name: string;
  owner: {
    name: string;
    nickname: string;
    title: string; // 职位/身份
    bio: string[];
    avatar: string;
  };
  // 技术栈标签
  skills: string[];
  // 联系方式
  contact: {
    wechat?: string;
    email?: string;
    github?: string;
    twitter?: string;
  };
  // AI 聊天配置
  ai: {
    name: string;
    intro: string;
    systemPromptBase: string;
  };
}

export const siteConfig: SiteConfig = {
  // 站点名称
  name: process.env.SITE_NAME || 'AI Blog',

  // 站主信息
  owner: {
    name: process.env.SITE_OWNER_NAME || 'Your Name',
    nickname: process.env.SITE_OWNER_NICKNAME || 'Nickname',
    title: process.env.SITE_OWNER_TITLE || '全栈工程师 / AI 探索者',
    bio: [
      process.env.SITE_OWNER_BIO_1 || '你好！我是一名全栈（偏前端）工程师，目前正专注于学习 AI 应用工程相关技术，持续探索大模型在实际产品中的落地实践。',
      process.env.SITE_OWNER_BIO_2 || '我主要研究 Web 技术和 AI 应用开发，比如 RAG 知识库、AI Agent、大模型应用等。我相信 AI 技术正在改变我们工作和生活的方式，而我希望能够在这个浪潮中探索更多可能性。',
      process.env.SITE_OWNER_BIO_3 || '这里记录了我的技术文章、工具和各种 AI 实验。你可以通过 AI 聊天与我的 AI 分身互动，快速了解我、我的项目，或者探索任何你感兴趣的问题。',
    ],
    avatar: process.env.SITE_OWNER_AVATAR || '/header.jpg',
  },

  // 技术栈
  skills: process.env.SITE_SKILLS
    ? process.env.SITE_SKILLS.split(',').map((s) => s.trim())
    : [
        'TypeScript',
        'React',
        'Next.js',
        'Vue',
        'Node.js',
        'PostgreSQL',
        'AI/LLM',
        'RAG',
        'LangChain',
      ],

  // 联系方式
  contact: {
    wechat: process.env.SITE_CONTACT_WECHAT || undefined,
    email: process.env.SITE_CONTACT_EMAIL || undefined,
    github: process.env.SITE_CONTACT_GITHUB || undefined,
    twitter: process.env.SITE_CONTACT_TWITTER || undefined,
  },

  // AI 配置
  ai: {
    name: process.env.SITE_AI_NAME || 'AI Assistant',
    intro: process.env.SITE_AI_INTRO || '基于知识库和博客的智能问答',
    systemPromptBase: process.env.SITE_AI_SYSTEM_PROMPT || `我是{name}，一名{title}，也是这个网站的主人。

我主要研究 Web 技术和 AI 应用开发，比如 RAG 知识库、AI Agent、大模型应用等。

这个网站记录了我的技术文章、工具和各种 AI 实验。

在这里，你可以把我当作"{name}的 AI 分身"，有什么问题都可以直接问我。`,
  },
};

/**
 * 获取完整的 AI system prompt
 */
export function getAISystemPrompt(hasContext: boolean): string {
  const { owner, ai } = siteConfig;
  const identityIntro = ai.systemPromptBase
    .replace(/{name}/g, owner.name)
    .replace(/{title}/g, owner.title);

  if (hasContext) {
    return `你是${owner.name}的 AI 分身，代表${owner.name}回答问题。

关于${owner.name}：
${identityIntro}

请根据以下参考资料回答用户问题。如果资料中没有相关信息，请根据你自己的知识回答。

参考资料：
{context}`;
  }

  return `你是${owner.name}的 AI 分身，代表${owner.name}回答问题。

关于${owner.name}：
${identityIntro}

如果用户问"你是谁"、"你好"、或者问一些你无法理解的问题，请用上面的内容介绍${owner.name}。`;
}

/**
 * 获取有效的联系方式列表
 */
export function getContactLinks() {
  const { contact } = siteConfig;
  const links: Array<{ type: string; label: string; value: string }> = [];

  if (contact.wechat) {
    links.push({ type: 'wechat', label: '微信', value: contact.wechat });
  }
  if (contact.email) {
    links.push({ type: 'email', label: 'Email', value: contact.email });
  }
  if (contact.github) {
    links.push({ type: 'github', label: 'GitHub', value: contact.github });
  }
  if (contact.twitter) {
    links.push({ type: 'twitter', label: 'Twitter', value: contact.twitter });
  }

  return links;
}
