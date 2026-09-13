import fs from 'node:fs';
import path from 'node:path';
const content=JSON.parse(fs.readFileSync('src/content.json','utf8'));
const template=fs.readFileSync('dist/index.html','utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
for(const route of new Set([...content.legacyPaths,'/projects/','/blog/','/cv/'])){
 if(route==='/')continue;
 const page=content.pages.find(p=>p.path===route);
 const title=page?.title || (route.startsWith('/blog')?'Journal':'Projects');
 const html=template.replace(/<title>.*?<\/title>/,`<title>${escape(title)} | Ansori</title>`);
 const out=path.join('dist',route,'index.html');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html);
}
fs.writeFileSync('dist/404.html',template);
fs.writeFileSync('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: https://achadansori.com/sitemap.xml\n');
fs.writeFileSync('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['/','/projects/','/blog/',...content.pages.map(p=>p.path)].map(p=>'<url><loc>https://achadansori.com'+p+'</loc></url>').join('')+'</urlset>');
fs.writeFileSync('dist/.htaccess','RewriteEngine On\nRewriteCond %{HTTP_HOST} ^www\\.achadansori\\.com$ [NC]\nRewriteRule ^(.*)$ https://achadansori.com/$1 [R=301,L]\nErrorDocument 404 /404.html\n');
console.log('Static route entrypoints generated.');
