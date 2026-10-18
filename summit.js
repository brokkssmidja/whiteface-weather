// "Summit right now" card: UAlbany ASRC Whiteface Mountain Summit station (WFMS). Never blocks the page.
(function(){
const URL_='https://api.asrc.albany.edu:3000/wfmsapi',TIMEOUT=8000,STALE=2*36e5,$=id=>document.getElementById(id);
const DIRS={N:0,NNE:22.5,NE:45,ENE:67.5,E:90,ESE:112.5,SE:135,SSE:157.5,S:180,SSW:202.5,SW:225,WSW:247.5,W:270,WNW:292.5,NW:315,NNW:337.5};
const num=v=>{if(v==null||v==='')return null;const n=typeof v==='number'?v:parseFloat(String(v).replace(/[^\d.+-]/g,''));return isFinite(n)?n:null;};
const val=(j,k)=>num(j?.[k]?.value);
const bandC=m=>m>=58?'#ff6b6b':m>=45?'#ff9f43':m>=30?'#ffd166':'#6ee7b7';
// "Conditions as of: October 18, 2026 7:27 AM" — wall-clock time at the summit (America/New_York), whatever the units label says.
function parseAsOf(s){const m=/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})\s*([AP]M)?/i.exec(String(s||''));if(!m)return null;
 const mo=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(m[1].slice(0,3).toLowerCase());if(mo<0)return null;
 let h=+m[4]%12;if(m[6]&&/p/i.test(m[6]))h+=12;if(!m[6])h=+m[4];
 const guess=Date.UTC(+m[3],mo,+m[2],h,+m[5]);
 // find NY offset for that wall time
 const off=t=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).formatToParts(new Date(t)).reduce((o,x)=>(o[x.type]=x.value,o),{});
  return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour%24,+p.minute)-t;};
 let t=guess-off(guess);t=guess-off(t);return t;}
const fmtT=t=>new Date(t).toLocaleString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'})+' ET';
const fmtD=t=>new Date(t).toLocaleString('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'2-digit'})+' ET';
function arrow(deg,c){return`<svg class="sarr" viewBox="-8 -8 16 16" width="22" height="22" aria-hidden="true"><g transform="rotate(${(deg+180)%360})"><path d="M0,-6 L3.6,2.6 L0,0.8 L-3.6,2.6 Z" fill="${c}"/></g></svg>`;}
function msg(t){const el=$('summit');if(el)el.innerHTML=`<div class="nod">${t}</div>`;}
window.renderSummit=function(j,now){now=now??Date.now();const el=$('summit');if(!el)return;
 const tf=val(j,'Temp_degF'),tc=val(j,'Temp_degC'),wc=val(j,'WindChill_F'),wcc=val(j,'WindChill_C'),rh=val(j,'RelHum'),p=val(j,'BarPress'),
  mph=val(j,'WS_mph')??(val(j,'WS_mps')!=null?val(j,'WS_mps')*2.23694:null),dtxt=j?.WindDir?.value,deg=num(j?.WindDir?.units)??DIRS[String(dtxt||'').toUpperCase()]??null;
 const at=parseAsOf(j?.DateTime?.value);
 if(tf==null&&mph==null){msg('Summit station not reporting right now');return;}
 if(at!=null&&now-at>STALE){msg(`Summit station not reporting right now (last report ${fmtD(at)})`);return;}
 const c=mph!=null?bandC(mph):'#e6ecf2',r=v=>v==null?'--':Math.round(v);
 el.innerHTML=`<div class="sm">
  <div class="smt"><span class="smv">${r(tf)}°F</span><span class="smc">${tc!=null?r(tc)+'°C':''}</span></div>
  <div class="sml">Wind chill <b>${wc!=null?r(wc)+'°F':'--'}</b>${wcc!=null?` <small>(${r(wcc)}°C)</small>`:''}</div>
  <div class="smw">${deg!=null?arrow(deg,c):''}<span style="color:${c}">${mph!=null?r(mph)+' mph':'--'}</span> <small>${dtxt?String(dtxt).replace(/[<>&"]/g,''):''}${deg!=null?' ('+r(deg)+'°)':''}</small></div>
  <div class="smg"><span>Humidity <b>${rh!=null?r(rh)+'%':'--'}</b></span><span>Pressure <b>${p!=null?r(p)+' mb':'--'}</b></span></div>
  <div class="smn">As of ${at!=null?fmtT(at):String(j?.DateTime?.value||'--').replace(/^Conditions as of:\s*/i,'').replace(/[<>&"]/g,'')}</div></div>`;};
let busy=false;
async function load(){if(busy)return;busy=true;const ac=new AbortController(),to=setTimeout(()=>ac.abort(),TIMEOUT);
 try{const r=await fetch(URL_,{cache:'no-store',signal:ac.signal});if(!r.ok)throw new Error('HTTP '+r.status);renderSummit(await r.json());}
 catch(e){if(!$('summit')?.querySelector('.sm'))msg('Summit station not reporting right now');}
 finally{clearTimeout(to);busy=false;}}
window.loadSummit=load;
setTimeout(load,400);setInterval(load,5*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)load();});
})();
