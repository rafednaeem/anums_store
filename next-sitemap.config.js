/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://avosira.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/checkout', '/checkout/*'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://avosira.com/server-sitemap.xml',
    ],
  },
}
