/* 站点配置 —— 发布时只改这里 */
window.NZSK_CONFIG = {
  version: "2.3.46",

  /* 站点内的安装包路径（相对站点根目录） */
  packagePath: "downloads/nzsk-v2.3.46.zip",
  packageName: "奶猪水课助手_v2.3.46.zip",
  packageSize: "84 KB",
  packageSha256: "0af6fe2093837bd80d2b5e4177c5a8a349bcda419b8655b6d27443be1a4549f6",

  /* 发布到 GitHub 后，把 Releases 的直链填在这里（例如
     https://github.com/你的用户名/仓库名/releases/latest/download/奶猪水课助手_v2.3.46.zip
     ）；留空时使用上面的 packagePath。 */
  githubReleaseUrl: "https://github.com/hanhanha-114514/naizhu-course-helper/releases/download/v2.3.46/naizhu-course-helper-v2.3.46.zip",

  /* 扩展开源仓库地址：全站 data-repo 链接与 Star 徽章都读这里 */
  repoUrl: "https://github.com/hanhanha-114514/naizhu-course-helper",
  repoApi: "https://api.github.com/repos/hanhanha-114514/naizhu-course-helper",

  /* 入场加载动画时长（毫秒） */
  introMs: 950,
  /* true = 每个页面都播放入场动画；false = 每次浏览会话只在首个页面播放 */
  introEveryPage: false
};