from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, re, subprocess, math, random
ROOT = Path(__file__).resolve().parent
DATA=(ROOT/'data.js').read_text()
rows=re.findall(r"\{id:'([^']+)',name:'([^']+)',category:'([^']+)',tag:'([^']+)',prices:\[([^]]+)\],color:'([^']+)',symbol:'([^']+)'\}",DATA)
assert len(rows)==36, len(rows)
# Deliberately stylized local iconography, not exact or endorsed app logos.
custom={
'alight-motion':'<g fill="none" stroke="white" stroke-width="7" opacity=".92"><circle cx="64" cy="64" r="31" stroke-dasharray="151 44" stroke-linecap="round" transform="rotate(-57 64 64)"/><circle cx="64" cy="64" r="20" stroke-dasharray="94 34" stroke-linecap="round" transform="rotate(50 64 64)"/><circle cx="64" cy="64" r="9"/></g>',
'amazon-prime':'<text x="64" y="71" font-size="71" fill="white" text-anchor="middle" font-family="Georgia" font-weight="700">a</text><path d="M36 82 Q67 101 96 80" fill="none" stroke="#DCEFFF" stroke-width="5" stroke-linecap="round"/><path d="M88 79l9 1-3 9" fill="none" stroke="#DCEFFF" stroke-width="3"/>',
'beautycam':'<path d="M35 45h11l7-9h23l7 9h11v49H35Z" stroke="white" stroke-width="5" fill="none" stroke-linejoin="round"/><circle cx="65" cy="69" r="17" stroke="white" stroke-width="5" fill="none"/><path d="M91 20v20M81 30h20" stroke="white" stroke-width="4" stroke-linecap="round"/>',
'bstation':'<rect x="27" y="41" width="74" height="52" rx="11" fill="none" stroke="white" stroke-width="6"/><path d="m48 29 14 10 16-10" stroke="white" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="50" cy="65" r="5" fill="white"/><circle cx="79" cy="65" r="5" fill="white"/><path d="M55 80h20" stroke="white" stroke-width="4" stroke-linecap="round"/>',
'canva':'<text x="65" y="93" font-size="88" fill="white" text-anchor="middle" font-family="Georgia" font-style="italic">C</text>',
'capcut':'<path d="M29 41 98 82 29 89V42L99 89V42L29 83" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
'chai-ai':'<path d="M36 34h56v45H62l-17 15v-15h-9z" fill="none" stroke="white" stroke-width="6" stroke-linejoin="round"/><path d="M50 57h28M50 68h20" stroke="white" stroke-width="5" stroke-linecap="round"/>',
'chatgpt':'<g stroke="white" stroke-width="6.5" fill="none" stroke-linejoin="round"><path d="M64 28C46 20 33 33 36 49 21 58 26 77 39 82c-1 18 13 26 29 19 14 9 31-3 28-20 13-10 10-29-3-36-1-17-17-25-29-17Z"/><path d="m46 51 18-10 20 12v22L65 86 45 74V53M45 74l20-10 19 11M64 41v23"/></g>',
'dazzcam':'<rect x="27" y="42" width="74" height="55" rx="13" fill="none" stroke="white" stroke-width="6"/><circle cx="64" cy="69" r="20" fill="none" stroke="white" stroke-width="6"/><circle cx="87" cy="51" r="4" fill="white"/><path d="M40 42V31h24v11" stroke="white" stroke-width="5"/>',
'disney':'<path d="M25 81Q64 14 105 77" stroke="white" stroke-width="3" fill="none"/><text x="62" y="81" font-size="36" fill="white" text-anchor="middle" font-family="Georgia" font-style="italic">D</text><path d="M84 87h21m-11-11v21" stroke="white" stroke-width="5" stroke-linecap="round"/>',
'duolingo':'<path d="M38 42Q64 27 90 42v38Q64 102 38 80Z" fill="white"/><ellipse cx="52" cy="57" rx="12" ry="15" fill="#d6f18c"/><ellipse cx="76" cy="57" rx="12" ry="15" fill="#d6f18c"/><circle cx="54" cy="58" r="5" fill="#426d25"/><circle cx="75" cy="58" r="5" fill="#426d25"/><path d="m60 73 8 0-4 9Z" fill="#FFBC49"/>',
'gemini':'<path d="M65 17C73 50 84 59 110 64 84 71 74 80 65 112 58 79 47 70 19 64 46 57 58 48 65 17Z" fill="#fff"/><circle cx="99" cy="30" r="4" fill="#ecdcff"/>',
'grok-ai':'<path d="M33 94 90 36M35 36l58 58" stroke="white" stroke-width="11" stroke-linecap="round"/><path d="M52 64h24" stroke="#aaa" stroke-width="4"/>',
'hbo-max':'<text x="64" y="58" font-size="28" fill="white" text-anchor="middle" font-weight="900">HBO</text><text x="64" y="82" font-size="32" fill="white" text-anchor="middle" font-weight="900">max</text>',
'ibispaint':'<circle cx="64" cy="64" r="31" fill="none" stroke="white" stroke-width="7"/><circle cx="64" cy="64" r="17" fill="none" stroke="#fbe3ed" stroke-width="6"/><path d="M64 22V42M106 64H86M64 106V86M22 64h20" stroke="white" stroke-width="5"/>',
'iqiyi':'<rect x="25" y="36" width="78" height="57" rx="11" stroke="white" stroke-width="5" fill="none"/><text x="64" y="78" font-size="29" fill="white" text-anchor="middle" font-weight="900">iQI</text>',
'lightroom':'<rect x="24" y="24" width="80" height="80" rx="13" fill="none" stroke="#78cfff" stroke-width="4"/><text x="64" y="83" font-size="52" fill="#95dfff" text-anchor="middle" font-weight="700">Lr</text>',
'netflix':'<path d="M37 25v77h15V53L77 102h14V25H76v48L53 25z" fill="#fff"/><path d="M76 25v77h15V25" fill="#fec5c6" opacity=".6"/>',
'perplexity':'<path d="M44 92V42l20-17 20 17v50H44M44 44l20 25 20-25M64 69v30" fill="none" stroke="white" stroke-width="5" stroke-linejoin="round"/><circle cx="64" cy="25" r="5" fill="white"/>',
'prime-video':'<path d="m48 35 42 29-42 29z" fill="white"/><path d="M32 100q34 13 68-1" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/>',
'spotify':'<circle cx="64" cy="64" r="41" fill="#14251A"/><path d="M34 51q34-11 63 7M37 66q30-10 53 6M41 80q25-7 44 5" stroke="#1DB954" stroke-width="7" stroke-linecap="round" fill="none"/>',
'viu':'<text x="64" y="85" font-size="58" fill="white" text-anchor="middle" font-weight="850">viu</text>',
'wattpad':'<path d="m24 43 17 43 18-32 17 32 28-43" fill="none" stroke="white" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>',
'wetv':'<path d="M37 28 Q30 25 30 39v50q0 12 12 6l57-26q11-5 0-10z" fill="white"/><path d="m59 49 28 16-28 16z" fill="#21b886"/>',
'vidio':'<path d="m28 42 23 46 15-26 15 26 19-45" fill="none" stroke="white" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>',
'vision-plus':'<text x="64" y="77" font-size="49" fill="white" text-anchor="middle" font-weight="900">V+</text>',
'wink':'<path d="M25 44 41 92 63 58 85 92 104 44" fill="none" stroke="white" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="103" cy="29" r="8" fill="#fff"/>',
'winkit':'<path d="M28 43 44 88 62 56 82 88 99 43" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"/><path d="M93 24v18M84 33h18" stroke="white" stroke-width="4"/>',
}
for i,(slug,name,category,tag,prices,color,symbol) in enumerate(rows):
    markup=custom.get(slug)
    if not markup:
        # Custom text emblems for the remaining services.
        base={ 'fizzo':'f', 'getcontact':'G','loklok':'L','meitu':'M','melolo':'m','moviebox':'▶','picsart':'P','remini':'R'}
        sym=base.get(slug,symbol)
        size=76 if len(sym)==1 else 54
        markup=f'<circle cx="64" cy="64" r="42" fill="#fff" fill-opacity=".11"/><text x="64" y="87" font-size="{size}" fill="white" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900">{sym}</text>'
    s=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Ikon {name}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{color}"/><stop offset="1" stop-color="{color}"/></linearGradient></defs>
<rect width="128" height="128" rx="31" fill="url(#g)"/><circle cx="26" cy="22" r="49" fill="white" opacity=".07"/>
{markup}
</svg>'''
    (ROOT/'assets/icons'/f'{slug}.svg').write_text(s)

def logo_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="30" fill="#b6dc79"/><circle cx="64" cy="64" r="43" fill="#42592d"/><path d="M63 28 72 54 100 64 72 74 63 100 53 74 26 64 53 54Z" fill="#dbf7a7"/><circle cx="95" cy="32" r="6" fill="#fff5c7"/></svg>'''
(ROOT/'assets/branding/favicon.svg').write_text(logo_svg())
fontpath='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
for size,name in [(192,'icon-192.png'),(512,'icon-512.png'),(180,'apple-touch-icon.png')]:
    im=Image.new('RGB',(size,size),(183,221,123));d=ImageDraw.Draw(im)
    k=size/128
    d.rounded_rectangle((16*k,16*k,112*k,112*k),radius=30*k,fill=(66,89,45))
    cx=cy=64*k
    # vector-ish star
    pts=[(64,26),(74,55),(101,64),(74,74),(64,103),(54,74),(27,64),(54,54)]
    d.polygon([(x*k,y*k) for x,y in pts],fill=(218,245,164))
    d.ellipse((91*k,26*k,102*k,37*k),fill=(255,249,207))
    im.save(ROOT/'assets/branding'/name,optimize=True)
manifest={'id':'./','name':'Lime Premium — Toko Aplikasi','short_name':'Lime Premium','description':'Katalog aplikasi premium dengan paket harian, bulanan, dan tahunan.','lang':'id','dir':'ltr','start_url':'./#home','scope':'./','display':'standalone','background_color':'#fafbf7','theme_color':'#e4f3c6','orientation':'portrait-primary','categories':['shopping','lifestyle'],'icons':[{'src':'assets/branding/icon-192.png','sizes':'192x192','type':'image/png','purpose':'any maskable'},{'src':'assets/branding/icon-512.png','sizes':'512x512','type':'image/png','purpose':'any maskable'}]}
(ROOT/'manifest.webmanifest').write_text(json.dumps(manifest,indent=2,ensure_ascii=False))
assets=['./','./index.html','./style.css','./app.js','./data.js','./manifest.webmanifest','./assets/branding/favicon.svg','./assets/branding/apple-touch-icon.png','./assets/branding/icon-192.png','./assets/branding/icon-512.png']
assets+=['./assets/icons/'+slug+'.svg' for slug,*_ in rows]
sw='''/* Service worker for offline catalog. Update CACHE_NAME when publishing changes. */
const CACHE_NAME='lime-premium-v1';
const ASSETS='''+json.dumps(assets,ensure_ascii=False,indent=2)+''';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return; e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(cached=> cached || fetch(e.request).then(res=>{if(res.ok){const clone=res.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));}return res;})));});
'''
(ROOT/'sw.js').write_text(sw)
print('Generated',len(rows),'icons; assets',len(assets))
