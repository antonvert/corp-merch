import {readFile,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

// Publish a single minimal UTF-8 sitemap after all Event/HR extensions.
// Page URLs and content are not changed; optional hints cannot drift out of schema order.
export async function finalizeSitemap(root,site){
 const dist=path.join(root,'dist'),file=path.join(dist,'sitemap.xml');
 const before=await readFile(file,'utf8');
 const urls=[...before.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert(urls.length>0&&new Set(urls).size===urls.length,'Missing or duplicate sitemap URLs');
 for(const value of urls){const u=new URL(value);assert.equal(u.origin,site.url);assert(!u.search&&!u.hash,'Noncanonical sitemap address');let local=path.join(dist,u.pathname);if(u.pathname.endsWith('/'))local=path.join(local,'index.html');await access(local);}
 const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>'  <url><loc>'+escape(u)+'</loc></url>').join('\n')+'\n</urlset>\n';
 assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]),urls,'Sitemap addresses changed');
 await writeFile(file,xml,'utf8');
 console.log('Final sitemap: '+urls.length+' preserved canonical URLs; minimal UTF-8 XML. Existing response headers retained.');
}
