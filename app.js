/* ===== shared chrome: gov utility bar clock ===== */
(function(){
  const fmt=new Intl.DateTimeFormat('en-IN',{
    weekday:'short',day:'2-digit',month:'short',year:'numeric',
    hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true,
    timeZone:'Asia/Kolkata'
  });
  function tick(){
    const el=document.getElementById('govClock');
    if(el) el.textContent=fmt.format(new Date())+' IST';
  }
  document.addEventListener('DOMContentLoaded',()=>{tick();setInterval(tick,1000)});
})();

/* ===== shared chrome: theme toggle ===== */
(function(){
  const root=document.documentElement;
  const saved=localStorage.getItem('gb-theme');
  if(saved) root.setAttribute('data-theme',saved);
  else if(window.matchMedia('(prefers-color-scheme: dark)').matches) root.setAttribute('data-theme','dark');

  document.addEventListener('DOMContentLoaded',()=>{
    const themeBtn=document.getElementById('themeToggle');
    if(themeBtn){
      themeBtn.textContent=root.getAttribute('data-theme')==='dark'?'☀️':'🌙';
      themeBtn.addEventListener('click',()=>{
        const now=root.getAttribute('data-theme')==='dark'?'light':'dark';
        root.setAttribute('data-theme',now);
        localStorage.setItem('gb-theme',now);
        themeBtn.textContent=now==='dark'?'☀️':'🌙';
      });
    }
  });
})();

function $(id){return document.getElementById(id)}

/* ===== language: English + Hindi =====
   Scoped deliberately to these two for now — the Constitution's 8th
   Schedule actually lists 22 languages, not 8, and machine-translating all
   of GovtBabu's researched exam data (pay scales, eligibility, application
   steps) into many languages at once risks introducing translation errors,
   which undermines the accuracy this whole site is built on. English and
   Hindi get done properly; more languages are a later, separately-verified
   batch, not a bigger flag added here. Every render function falls back to
   English wherever a Hindi translation doesn't exist yet, so nothing ever
   shows blank or broken. */
const LANG_STRINGS={
  en:{
    'nav.home':'Home','nav.browseExams':'Browse Exams','nav.calendar':'Calendar','nav.about':'About',
    'home.title':'Get your exam documents ready',
    'home.lead':'Search your exam, upload your photo &amp; signature, download files sized exactly right. Pay ₹29 only once you\'re ready to download.',
    'home.privacy':'🔒 Processed entirely in your browser — nothing is uploaded until you choose to pay.',
    'home.whichExam':'Which exam are you applying for?',
    'home.browseAll':'Browse all exams →','home.calendar':'Calendar →',
    'home.skip':'Skip — I just need to resize a file →',
    'home.changeExam':'← Change exam',
    'home.disclaimer':'GovtBabu is independent and not affiliated with UPSC, SSC, IBPS, Railway, BPSC or any government body. Requirement details are compiled from official notifications where available — always confirm against the current official notification before submitting.',
    'step.exam':'Exam','step.upload':'Upload','step.download':'Download',
    'sidebar.noticeBoard':'📌 Notice Board','sidebar.results':'🏆 Results',
    'detail.postsPay':'💰 Posts &amp; Pay','detail.eligibility':'🎓 Eligibility','detail.promotion':'📈 Promotion',
    'detail.howToApply':'📝 How to Apply','detail.otherDocs':'📄 Other Documents Required',
    'detail.age':'Age','detail.relaxation':'Relaxation','detail.qualification':'Qualification',
    'detail.applyOnOfficial':'Apply on the official site ↗','detail.officialNotice':'Official notice ↗',
    'detail.applicationsOpen':'Applications open','detail.applicationsClosed':'Applications closed',
    'detail.beforeYouStart':'Before you start','detail.commonMistakes':'⚠ Common mistakes to avoid','detail.correctionWindow':'Correction window',
    'detail.missing':'Posts, salary &amp; promotion details aren\'t compiled yet for this exam — check the official notification above.',
    'detail.noSpecificExam':'No specific exam selected — set your own target size below.'
  },
  hi:{
    'nav.home':'होम','nav.browseExams':'सभी परीक्षाएं','nav.calendar':'कैलेंडर','nav.about':'हमारे बारे में',
    'home.title':'अपने परीक्षा दस्तावेज़ तैयार करें',
    'home.lead':'अपनी परीक्षा खोजें, फोटो और हस्ताक्षर अपलोड करें, सही साइज़ में फ़ाइलें डाउनलोड करें। डाउनलोड के लिए तैयार होने पर ही ₹29 का भुगतान करें।',
    'home.privacy':'🔒 पूरी तरह आपके ब्राउज़र में प्रोसेस होता है — जब तक आप भुगतान नहीं करते, कुछ भी अपलोड नहीं होता।',
    'home.whichExam':'आप किस परीक्षा के लिए आवेदन कर रहे हैं?',
    'home.browseAll':'सभी परीक्षाएं देखें →','home.calendar':'कैलेंडर →',
    'home.skip':'छोड़ें — मुझे बस फ़ाइल का साइज़ बदलना है →',
    'home.changeExam':'← परीक्षा बदलें',
    'home.disclaimer':'GovtBabu एक स्वतंत्र सेवा है और UPSC, SSC, IBPS, रेलवे, BPSC या किसी भी सरकारी संस्था से संबद्ध नहीं है। विवरण जहां उपलब्ध हों वहां आधिकारिक अधिसूचनाओं से संकलित किए गए हैं — सबमिट करने से पहले हमेशा नवीनतम आधिकारिक अधिसूचना से पुष्टि करें।',
    'step.exam':'परीक्षा','step.upload':'अपलोड','step.download':'डाउनलोड',
    'sidebar.noticeBoard':'📌 सूचना पट्ट','sidebar.results':'🏆 परिणाम',
    'detail.postsPay':'💰 पद और वेतन','detail.eligibility':'🎓 पात्रता','detail.promotion':'📈 पदोन्नति',
    'detail.howToApply':'📝 आवेदन कैसे करें','detail.otherDocs':'📄 अन्य आवश्यक दस्तावेज़',
    'detail.age':'आयु','detail.relaxation':'छूट','detail.qualification':'योग्यता',
    'detail.applyOnOfficial':'आधिकारिक साइट पर आवेदन करें ↗','detail.officialNotice':'आधिकारिक सूचना ↗',
    'detail.applicationsOpen':'आवेदन खुले हैं','detail.applicationsClosed':'आवेदन बंद हैं',
    'detail.beforeYouStart':'शुरू करने से पहले','detail.commonMistakes':'⚠ बचने योग्य सामान्य गलतियां','detail.correctionWindow':'सुधार विंडो',
    'detail.missing':'इस परीक्षा के लिए पद, वेतन और पदोन्नति का विवरण अभी संकलित नहीं हुआ है — ऊपर दी गई आधिकारिक अधिसूचना देखें।',
    'detail.noSpecificExam':'कोई विशेष परीक्षा चयनित नहीं है — नीचे अपना लक्ष्य आकार निर्धारित करें।'
  }
};

let currentLang=localStorage.getItem('gb-lang')||'en';

// For fixed UI labels generated inside JS template strings (card headers,
// button text) rather than static HTML — same LANG_STRINGS dictionary,
// looked up directly instead of via a data-i18n element.
function T(key){
  const dict=LANG_STRINGS[currentLang]||LANG_STRINGS.en;
  return dict[key]!=null?dict[key]:(LANG_STRINGS.en[key]||key);
}

// Looks up a translated field on an exam object: tr(exam,'name'),
// tr(exam,'cat'), or a nested path like tr(exam,'details.promotion').
// Falls back to the English value whenever no Hindi override exists yet.
function tr(obj,path){
  const en=path.split('.').reduce((o,k)=>o&&o[k],obj);
  if(currentLang!=='hi'||!obj.hi) return en;
  const hiVal=path.split('.').reduce((o,k)=>o&&o[k],obj.hi);
  return hiVal!=null?hiVal:en;
}

// Category names repeat across many exams, so they get one shared
// dictionary instead of a per-exam translation field.
const CAT_HI={
  'Central Govt':'केंद्र सरकार','Banking':'बैंकिंग','Railway':'रेलवे',
  'Defence':'रक्षा','State PSC':'राज्य लोक सेवा आयोग','Teaching':'शिक्षण'
};
function trCat(cat){ return currentLang==='hi'&&CAT_HI[cat]?CAT_HI[cat]:cat; }

function applyLang(lang){
  currentLang=lang;
  localStorage.setItem('gb-lang',lang);
  const dict=LANG_STRINGS[lang]||LANG_STRINGS.en;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.dataset.i18n;
    if(dict[key]!=null) el.innerHTML=dict[key];
  });
  document.documentElement.lang=lang;
  const btn=$('langToggle');
  if(btn) btn.textContent=lang==='hi'?'हिं':'EN';
  // Re-render every exam-data-driven view so it picks up Hindi fields too.
  ['renderPopularExams','renderExamsByCategory','renderExamDirectory','renderExamCalendar','renderNoticeTicker','renderNoticeBoard','renderResultsPanel']
    .forEach(fn=>{ if(typeof window[fn]==='function') window[fn](); });
  if(typeof state!=='undefined'&&state.exam){
    renderSelectedExamBar();
    renderExamDetailPanel();
    renderUploadSlots();
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const langBtn=$('langToggle');
  if(langBtn) langBtn.addEventListener('click',()=>applyLang(currentLang==='hi'?'en':'hi'));
  applyLang(currentLang);
});

/* ===== payment / unlock =====
   Processing always happens locally and for free (that's the privacy
   pitch); paying only reveals the Download links for the current exam's
   bundle (photo + signature together, one payment). This is a UI-level
   gate, not content protection — fine for a small per-use price, not
   meant to survive someone opening dev tools. */
function unlockKey(tool,examCode){return 'gb-unlock:'+tool+':'+examCode}
function storeUnlock(tool,examCode,token){sessionStorage.setItem(unlockKey(tool,examCode),token)}
function hasUnlock(tool,examCode){return Boolean(sessionStorage.getItem(unlockKey(tool,examCode)))}

function loadScript(src){
  return new Promise((resolve,reject)=>{
    if(document.querySelector('script[src="'+src+'"]')){resolve();return}
    const s=document.createElement('script');
    s.src=src;s.onload=()=>resolve();s.onerror=()=>reject(new Error('Could not load '+src));
    document.head.appendChild(s);
  });
}

async function initiatePayment(tool,examCode,onUnlocked,btn){
  if(btn){btn.disabled=true;btn.textContent='Processing…'}
  try{
    const orderRes=await fetch('/api/create-order',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({tool,examCode})
    });
    const order=await orderRes.json();
    if(!orderRes.ok) throw new Error(order.error||'Could not start payment.');

    if(order.mock){
      // No Razorpay account configured yet on the server — exercises the
      // same order -> verify -> unlock pipeline without moving real money.
      const verifyRes=await fetch('/api/verify-payment',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({tool,examCode,order_id:order.order_id,mock:true})
      });
      const data=await verifyRes.json();
      if(!verifyRes.ok) throw new Error(data.error||'Verification failed.');
      storeUnlock(tool,examCode,data.unlock_token);
      onUnlocked();
      return;
    }

    await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    const rzp=new Razorpay({
      key:order.key_id,amount:order.amount,currency:'INR',name:'GovtBabu',
      description:tool+' unlock',order_id:order.order_id,
      theme:{color:'#7c3aed'},
      handler:async function(response){
        try{
          const verifyRes=await fetch('/api/verify-payment',{
            method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
              tool,examCode,order_id:response.razorpay_order_id,
              payment_id:response.razorpay_payment_id,signature:response.razorpay_signature
            })
          });
          const data=await verifyRes.json();
          if(!verifyRes.ok) throw new Error(data.error||'Payment could not be verified.');
          storeUnlock(tool,examCode,data.unlock_token);
          onUnlocked();
        }catch(err){alert(err.message)}
      }
    });
    rzp.open();
  }catch(err){
    alert(err.message||'Payment could not be started.');
  }finally{
    if(btn){btn.disabled=false;btn.textContent='Pay ₹29 & Unlock Downloads'}
  }
}

/* ===== image compression engine (shared by every upload slot) ===== */
async function compressToTarget(img,{exactDims,wantW,wantH,targetBytes}){
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');

  if(exactDims){
    // Center-crop to the exact required pixel shape so the exam's
    // dimension spec is preserved, then compress within that canvas.
    const targetRatio=wantW/wantH, imgRatio=img.naturalWidth/img.naturalHeight;
    let sx,sy,sw,sh;
    if(imgRatio>targetRatio){sh=img.naturalHeight;sw=sh*targetRatio;sx=(img.naturalWidth-sw)/2;sy=0}
    else{sw=img.naturalWidth;sh=sw/targetRatio;sx=0;sy=(img.naturalHeight-sh)/2}
    canvas.width=wantW;canvas.height=wantH;
    ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,wantW,wantH);
    ctx.drawImage(img,sx,sy,sw,sh,0,0,wantW,wantH);
  } else {
    let maxW=Math.min(img.naturalWidth,2500);
    canvas.width=maxW;canvas.height=Math.round(img.naturalHeight*(maxW/img.naturalWidth));
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
  }

  let lo=0.02,hi=0.98,best=null;
  for(let i=0;i<16;i++){
    const q=(lo+hi)/2;
    const blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',q));
    if(blob.size<=targetBytes){best=blob;lo=q}else hi=q;
  }
  if(!best&&!exactDims){
    // No exact dimensions were requested, so it's safe to shrink further
    // to chase the KB target.
    while(canvas.width>300&&!best){
      canvas.width=Math.round(canvas.width*.85);canvas.height=Math.round(canvas.height*.85);
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',0.55));
      if(blob.size<=targetBytes) best=blob;
    }
  }
  if(!best){
    // Exact dimensions were requested — never shrink below spec. Fall back
    // to the lowest-quality encode and say plainly if it's still over target.
    best=await new Promise(r=>canvas.toBlob(r,'image/jpeg',0.02));
  }
  return {blob:best,overTarget:best.size>targetBytes};
}

function concat(...arrs){let n=arrs.reduce((a,b)=>a+b.length,0),out=new Uint8Array(n),p=0;for(const a of arrs){out.set(a,p);p+=a.length}return out}

// Builds a PDF wrapping one JPEG image per page. Each object's complete byte
// content is assembled directly (rather than sharing a loosely indexed
// array) so the object numbering can't drift out of sync. pages is
// [{bytes,w,h}, ...] — one entry per page, in order.
function imagesToPdfBytes(pages){
  const enc=new TextEncoder();
  const n=pages.length;
  const objs=[[1,enc.encode('<< /Type /Catalog /Pages 2 0 R >>')]];
  const kids=pages.map((_,i)=>(3+i*3)+' 0 R').join(' ');
  objs.push([2,enc.encode(`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`)]);
  pages.forEach((p,i)=>{
    const pageNum=3+i*3, imgNum=4+i*3, contentNum=5+i*3;
    const content=`q\n${p.w} 0 0 ${p.h} 0 0 cm\n/Im0 Do\nQ`;
    const contentBytes=enc.encode(content);
    objs.push([pageNum,enc.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${p.w} ${p.h}] /Resources << /XObject << /Im0 ${imgNum} 0 R >> >> /Contents ${contentNum} 0 R >>`)]);
    objs.push([imgNum,concat(
      enc.encode(`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.bytes.length} >>\nstream\n`),
      p.bytes,
      enc.encode('\nendstream')
    )]);
    objs.push([contentNum,concat(
      enc.encode(`<< /Length ${contentBytes.length} >>\nstream\n`),
      contentBytes,
      enc.encode('\nendstream')
    )]);
  });
  objs.sort((a,b)=>a[0]-b[0]);
  let pdf=enc.encode('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');
  const offsets=[0];
  for(const [num,data] of objs){offsets[num]=pdf.length;pdf=concat(pdf,enc.encode(`${num} 0 obj\n`),data,enc.encode('\nendobj\n'))}
  const xref=pdf.length;
  const total=objs.length;
  pdf=concat(pdf,enc.encode(`xref\n0 ${total+1}\n0000000000 65535 f \n${offsets.slice(1).map(x=>String(x).padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size ${total+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`));
  return pdf;
}

function jpgToPdfBytes(jpegBytes,w,h){
  return imagesToPdfBytes([{bytes:jpegBytes,w,h}]);
}

/* ===== PDF.js, lazy-loaded from a CDN only when a PDF-reading tool is
   actually used — browsers have no native PDF decoder, so rasterizing an
   existing PDF's pages needs a real PDF-parsing library. Everything else on
   this site stays dependency-free; this is the one exception, loaded only
   on demand. ===== */
const PDFJS_VERSION='3.11.174';
let pdfjsLibPromise=null;
function loadPdfJs(){
  if(pdfjsLibPromise) return pdfjsLibPromise;
  pdfjsLibPromise=loadScript(`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`).then(()=>{
    window.pdfjsLib.GlobalWorkerOptions.workerSrc=`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
    return window.pdfjsLib;
  });
  return pdfjsLibPromise;
}

async function pdfFileToCanvases(file,scale){
  const pdfjsLib=await loadPdfJs();
  const buf=await file.arrayBuffer();
  const doc=await pdfjsLib.getDocument({data:buf}).promise;
  const canvases=[];
  for(let i=1;i<=doc.numPages;i++){
    const page=await doc.getPage(i);
    const viewport=page.getViewport({scale:scale||1.5});
    const canvas=document.createElement('canvas');
    canvas.width=Math.round(viewport.width);
    canvas.height=Math.round(viewport.height);
    await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
    canvases.push(canvas);
  }
  return canvases;
}

async function pdfToJpgBlob(file){
  const canvases=await pdfFileToCanvases(file,2);
  const blob=await new Promise(r=>canvases[0].toBlob(r,'image/jpeg',0.9));
  return {blob,extraPages:canvases.length-1};
}

async function compressPdfBlob(file,targetBytes){
  const canvases=await pdfFileToCanvases(file,1.5);
  const perPageTarget=Math.max(Math.floor(targetBytes/canvases.length),8*1024);
  const pages=[];
  let overTarget=false;
  for(const canvas of canvases){
    let lo=0.05,hi=0.95,best=null;
    for(let i=0;i<14;i++){
      const q=(lo+hi)/2;
      const blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',q));
      if(blob.size<=perPageTarget){best=blob;lo=q}else hi=q;
    }
    if(!best){best=await new Promise(r=>canvas.toBlob(r,'image/jpeg',0.05));overTarget=true}
    pages.push({bytes:new Uint8Array(await best.arrayBuffer()),w:canvas.width,h:canvas.height});
  }
  const pdfBytes=imagesToPdfBytes(pages);
  const blob=new Blob([pdfBytes],{type:'application/pdf'});
  return {blob,overTarget:overTarget||blob.size>targetBytes};
}

async function jpgFileToPdfBlob(file){
  const img=new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=URL.createObjectURL(file)});
  const c=document.createElement('canvas'),scale=Math.min(1600/img.naturalWidth,1600/img.naturalHeight,1);
  c.width=Math.round(img.naturalWidth*scale);c.height=Math.round(img.naturalHeight*scale);
  c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.88));
  const bytes=new Uint8Array(await blob.arrayBuffer());
  const pdf=jpgToPdfBytes(bytes,c.width,c.height);
  return new Blob([pdf],{type:'application/pdf'});
}

/* ===== applications data =====
   Compiled 24 Aug 2026 from official notifications/portals where possible.
   "verified" = date this record was compiled. Always re-check the linked
   official notification before submitting — cycles, dates and specs change. */
const APPLICATIONS=[
  {code:'UPSC',name:'UPSC Civil Services',cat:'Central Govt',status:'closed',popularity:10,hi:{name:'यूपीएससी सिविल सेवा'},
    notifTitle:'Civil Services Examination, 2026 — Notice No. 05/2026-CSE (Mains in progress; window for this cycle is closed)',
    applyStart:'04 Feb 2026',applyEnd:'27 Feb 2026 (extended)',
    officialUrl:'https://www.upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-060226Rev.pdf',
    photo:{dims:'350 × 350 px',px:{w:350,h:350},minKB:20,maxKB:300,format:'JPG/JPEG',notes:'white/off-white background, face ~75% of frame, filename must be photo.jpg'},
    signature:{dims:'~350–500 px wide (exact box unconfirmed)',minKB:20,maxKB:100,format:'JPG/JPEG',notes:'black ink, white background, filename must be signature.jpg — re-verify exact px on upsconline.nic.in at apply time'},
    details:{
      dataNote:'UPSC has reportedly moved from the old One-Time Registration (OTR) system to a new Aadhaar-based "Universal Registration Number" (URN) portal at upsconline.nic.in (since ~May 2025) — but the legacy OTR instructions page was still live and undated when checked, so it\'s unclear whether OTR terminology is fully retired in the candidate-facing UI. Confirm on upsconline.nic.in before relying on either name. Signature pixel dimensions also remain genuinely unresolved between sources — the 20–100 KB file-size figure is solid, the exact width/height is not.',
      payGroups:[{level:'Level 10 (Junior Time Scale)',band:'₹56,100 – ₹1,77,500 (basic)',posts:'~24 Group A/B services — IAS, IPS, IFS and other Central Civil Services — allocated by rank, category and preference after the interview stage'}],
      payNote:'All Group A services (including IAS/IPS) enter at the same Level 10 basic pay — DA/HRA and other allowances add to this and vary by posting.',
      promotion:'Not an official DoPT document — commonly cited (coaching-site estimate) IAS timeline: Sub-Divisional Magistrate (0–4 yrs) → Additional Collector (4–9 yrs) → District Magistrate/Collector (9–13 yrs) → Joint Secretary, GoI (17–22 yrs) → Secretary, GoI (30–35 yrs). Varies significantly by state cadre and batch-year vacancies.',
      eligibility:{age:'21–32 years (general/EWS) as on 1 August of the exam year',ageRelax:'OBC (non-creamy layer) up to 35 · SC/ST up to 37 · PwBD up to 42',qualification:'Bachelor\'s degree in any discipline from a recognized university (final-year candidates may apply provisionally in some cycles).'},
      howToApply:['Register on the current UPSC application portal (upsconline.nic.in) — check whether it currently calls this "OTR" or "URN"','Fill the common application form, then the exam-specific Civil Services application','Upload photo and signature to spec','Pay the fee online (exemptions apply for SC/ST/PwBD/women per UPSC norms)','Submit before the deadline — corrections are typically allowed only in a short post-close window']
    },
    verified:'26 Aug 2026'},
  {code:'SSC-CGL',name:'SSC CGL',cat:'Central Govt',status:'closed',popularity:1,hi:{name:'एसएससी सीजीएल',details:{
      payGroups:[
        {level:'लेवल 8',band:'₹47,600–₹1,51,100',posts:'सहायक लेखा परीक्षा अधिकारी, सहायक लेखा अधिकारी'},
        {level:'लेवल 7',band:'₹44,900–₹1,42,400',posts:'सहायक अनुभाग अधिकारी, निरीक्षक (आयकर), निरीक्षक (केंद्रीय उत्पाद शुल्क/जीएसटी), निरीक्षक (निवारक अधिकारी/परीक्षक), सहायक प्रवर्तन अधिकारी, उप निरीक्षक (सीबीआई), निरीक्षक (डाक), निरीक्षक (केंद्रीय नारकोटिक्स ब्यूरो)'},
        {level:'लेवल 6',band:'बैंड की स्वतंत्र रूप से पुष्टि नहीं हो सकी — अधिसूचना देखें',posts:'कार्यकारी सहायक, अनुसंधान सहायक, प्रभागीय लेखाकार, उप निरीक्षक (एनआईए), उप निरीक्षक/जेआईओ (नारकोटिक्स नियंत्रण ब्यूरो), कनिष्ठ सांख्यिकी अधिकारी, सांख्यिकी अन्वेषक ग्रेड II, कार्यालय अधीक्षक, अनुभाग प्रमुख (डीजीएफटी)'},
        {level:'लेवल 5',band:'बैंड की स्वतंत्र रूप से पुष्टि नहीं हो सकी — अधिसूचना देखें',posts:'लेखा परीक्षक, लेखाकार / कनिष्ठ लेखाकार'},
        {level:'लेवल 4',band:'₹25,500–₹81,100',posts:'डाक/छँटाई सहायक, वरिष्ठ सचिवालय सहायक (यूडीसी), वरिष्ठ प्रशासनिक सहायक, कर सहायक, उप-निरीक्षक (केंद्रीय नारकोटिक्स ब्यूरो)'}
      ],
      payNote:'आंकड़े 7वें वेतन आयोग की वेतन-मैट्रिक्स सीमाएं हैं (केवल मूल वेतन) — वास्तविक हाथ में आने वाला वेतन महंगाई भत्ता (वर्तमान में मूल वेतन का ~58%) और मकान किराया भत्ता (शहर श्रेणी अनुसार 8–24%) जोड़ने के बाद बनता है। लेवल 5 और 6 की सटीक सीमाओं की स्वतंत्र रूप से पुष्टि नहीं हो सकी — अपने विशिष्ट पद के लिए अधिसूचना देखें।',
      promotion:'आमतौर पर बताया जाता है, कोई आधिकारिक प्रकाशित समयसीमा नहीं है: निरीक्षक/एएसओ स्तर के पद आमतौर पर ~5–7 वर्षों में अधीक्षक/अधिकारी ग्रेड में और ~12–17 वर्षों में सहायक आयुक्त-समकक्ष पद पर पदोन्नत होते हैं, इसके बाद वरिष्ठता, विभागीय परीक्षाओं और सीमित विभागीय प्रतियोगी परीक्षाओं (एलडीसीई) के माध्यम से आगे बढ़ते हैं।',
      eligibility:{age:'पद के अनुसार 18–32 वर्ष — अधिकांश ग्रुप सी पद 18–27, इंस्पेक्टर/एएसओ जैसे ग्रुप बी पद 30 तक, सांख्यिकी पद 32 तक। सटीक आयु सीमा पद अनुसार भिन्न होती है — वर्तमान अधिसूचना से पुष्टि करें।',ageRelax:'ओबीसी +3 वर्ष · एससी/एसटी +5 वर्ष · दिव्यांग +10 वर्ष · भूतपूर्व सैनिक नियमानुसार',qualification:'किसी भी मान्यता प्राप्त विश्वविद्यालय से किसी भी विषय में स्नातक (सांख्यिकी/जेएसओ पदों के लिए गणित या सांख्यिकी विषय आवश्यक)।'},
      howToApply:['ssc.gov.in पर मोबाइल, ईमेल, आधार/पहचान पत्र और कक्षा 10 के विवरण के साथ एक बार पंजीकरण (OTR) पूरा करें','अपने OTR क्रेडेंशियल से लॉगिन करें और सीजीएल आवेदन फॉर्म भरें','3 परीक्षा केंद्रों तक और अपनी श्रेणी/पद वरीयताएं चुनें','अपनी फोटो और हस्ताक्षर निर्दिष्ट माप के अनुसार अपलोड करें','शुल्क ऑनलाइन भुगतान करें — सामान्य/ओबीसी/ईडब्ल्यूएस के लिए ₹100; महिलाओं, एससी, एसटी, दिव्यांग, भूतपूर्व सैनिकों के लिए निःशुल्क','समीक्षा करें और सबमिट करें — पुष्टिकरण पृष्ठ डाउनलोड करें']
    }},
    notifTitle:'SSC CGL 2025 (most recent cycle — SSC CGL 2026 notification not yet released as of today)',
    applyStart:'09 Jun 2025',applyEnd:'04 Jul 2025',
    officialUrl:'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2025.pdf',
    photo:{dims:'3.5 cm × 4.5 cm',px:{w:276,h:354},minKB:20,maxKB:50,format:'JPEG/JPG'},
    signature:{dims:'4 cm × 2 cm',px:{w:315,h:157},minKB:10,maxKB:20,format:'JPEG/JPG',notes:'signed on white paper, black ink pen'},
    details:{
      payGroups:[
        {level:'Level 8',band:'₹47,600–₹1,51,100',posts:'Assistant Audit Officer, Assistant Accounts Officer'},
        {level:'Level 7',band:'₹44,900–₹1,42,400',posts:'Assistant Section Officer, Inspector (Income Tax), Inspector (Central Excise/GST), Inspector (Preventive Officer/Examiner), Assistant Enforcement Officer, Sub Inspector (CBI), Inspector (Posts), Inspector (Central Bureau of Narcotics)'},
        {level:'Level 6',band:'band not independently confirmed — check notification',posts:'Executive Assistant, Research Assistant, Divisional Accountant, Sub Inspector (NIA), Sub-Inspector/JIO (Narcotics Control Bureau), Junior Statistical Officer, Statistical Investigator Grade II, Office Superintendent, Section Head (DGFT)'},
        {level:'Level 5',band:'band not independently confirmed — check notification',posts:'Auditor, Accountant / Junior Accountant'},
        {level:'Level 4',band:'₹25,500–₹81,100',posts:'Postal/Sorting Assistant, Senior Secretariat Assistant (UDC), Senior Administrative Assistant, Tax Assistant, Sub-Inspector (Central Bureau of Narcotics)'}
      ],
      payNote:'Figures are 7th CPC pay-matrix bands (basic pay only) — actual in-hand adds Dearness Allowance (currently ~58% of basic) and House Rent Allowance (8–24% by city class). Level 5 and 6 exact bands couldn\'t be independently confirmed in our research — check the notification for your specific post.',
      promotion:'Commonly cited, not an official published timeline: Inspector/ASO-level posts typically move to Superintendent/Officer grade in ~5–7 years, then Assistant-Commissioner-equivalent in ~12–17 years, and higher via seniority, departmental exams and Limited Departmental Competitive Exams (LDCE).',
      eligibility:{age:'18–32 years depending on post — most Group C posts 18–27, Group B posts like Inspector/ASO up to 30, statistical posts up to 32. Exact per-post brackets vary — confirm against the current notification.',ageRelax:'OBC +3 yrs · SC/ST +5 yrs · PwBD +10 yrs · Ex-servicemen per rules',qualification:'Bachelor\'s degree in any discipline from a recognized university (Statistical/JSO posts require Maths or Statistics as a subject).'},
      howToApply:['Complete One-Time Registration (OTR) on ssc.gov.in with mobile, email, Aadhaar/ID and Class 10 details','Log in with your OTR credentials and fill the CGL application form','Select up to 3 exam centres and your category/post preferences','Upload your photo and signature to spec','Pay the fee online — ₹100 for General/OBC/EWS; free for women, SC, ST, PwBD, Ex-servicemen','Review and submit — download the confirmation page']
    },
    verified:'26 Aug 2026'},
  {code:'SSC-CHSL',name:'SSC CHSL',cat:'Central Govt',status:'closed',popularity:2,hi:{name:'एसएससी सीएचएसएल',details:{
      dataNote:'वर्तमान चक्र के लिए एसएससी सीएचएसएल अधिसूचना हमारी अंतिम जांच तक जारी नहीं हुई थी — नीचे दिए गए पद/वेतन आंकड़े सबसे हाल के पूर्ण हुए चक्र को दर्शाते हैं। जारी होने पर ssc.gov.in पर वर्तमान अधिसूचना से पुष्टि करें।',
      payGroups:[
        {level:'लेवल 4',band:'₹25,500–₹81,100',posts:'डाक सहायक / छँटाई सहायक, डाटा एंट्री ऑपरेटर, डाटा एंट्री ऑपरेटर ग्रेड ए'},
        {level:'लेवल 2',band:'₹19,900–₹63,200',posts:'निम्न श्रेणी लिपिक / कनिष्ठ सचिवालय सहायक'}
      ],
      payNote:'आंकड़े 7वें वेतन आयोग की वेतन-मैट्रिक्स सीमाएं हैं (केवल मूल वेतन) — वास्तविक हाथ में आने वाला वेतन महंगाई भत्ता (वर्तमान में मूल वेतन का ~58%) और मकान किराया भत्ता (शहर श्रेणी अनुसार 8–24%) जोड़ने के बाद बनता है।',
      promotion:'आमतौर पर बताया जाता है, कोई आधिकारिक प्रकाशित समयसीमा नहीं है: एलडीसी/जेएसए आमतौर पर ~5–7 वर्षों के बाद (वरिष्ठता, कभी-कभी विभागीय परीक्षा) अपर डिवीजन क्लर्क (यूडीसी) / वरिष्ठ सचिवालय सहायक बनते हैं। इसके अलावा, सभी केंद्र सरकार कर्मचारियों को वास्तविक पदोन्नति की परवाह किए बिना 10, 20 और 30 वर्ष की सेवा पूरी करने पर संशोधित आश्वासित कैरियर प्रगति (एमएसीपी) वेतन-स्तर उन्नयन मिलता है।',
      eligibility:{age:'प्रत्येक चक्र की अधिसूचना द्वारा निर्धारित कट-ऑफ तिथि के अनुसार 18–27 वर्ष (सटीक जन्म-तिथि सीमा हर चक्र में बदलती है) — वर्तमान सीमा ssc.gov.in पर पुष्टि करें।',ageRelax:'मानक एसएससी छूट लागू होने की संभावना है (ओबीसी +3 वर्ष · एससी/एसटी +5 वर्ष · दिव्यांग +10 वर्ष) — सीएचएसएल के लिए विशेष रूप से स्वतंत्र पुष्टि नहीं हुई है।',qualification:'किसी मान्यता प्राप्त बोर्ड से कक्षा 12 (10+2) उत्तीर्ण (डाटा एंट्री ऑपरेटर ग्रेड ए पदों के लिए 12वीं कक्षा में गणित विषय आवश्यक)।'},
      howToApply:['ssc.gov.in पर एक बार पंजीकरण (OTR) पूरा करें, यदि किसी अन्य एसएससी परीक्षा के लिए पहले से नहीं किया है','लॉगिन करें और सीएचएसएल-विशिष्ट आवेदन भरें — पद वरीयता, परीक्षा केंद्र, श्रेणी','अपनी फोटो और हस्ताक्षर निर्दिष्ट माप के अनुसार अपलोड करें','शुल्क ऑनलाइन भुगतान करें — सामान्य/ओबीसी/ईडब्ल्यूएस के लिए ₹100; महिलाओं, एससी, एसटी, दिव्यांग, भूतपूर्व सैनिकों के लिए निःशुल्क','समीक्षा करें, सबमिट करें, और अपना पुष्टिकरण पृष्ठ सहेजें']
    }},
    notifTitle:'SSC CHSL 2025 (most recent cycle — SSC CHSL 2026 notification not yet released as of today)',
    applyStart:'23 Jun 2025',applyEnd:'18 Jul 2025',
    officialUrl:'http://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_chsl_2025.pdf',
    photo:{dims:'3.5 cm × 4.5 cm',px:{w:276,h:354},minKB:20,maxKB:50,format:'JPEG/JPG',notes:'white background recommended'},
    signature:{dims:'4 cm × 2 cm',px:{w:315,h:157},minKB:10,maxKB:20,format:'JPEG/JPG',notes:'PNG format and non-white backgrounds are commonly rejected'},
    details:{
      dataNote:'The SSC CHSL notification for the current cycle had not been released as of our last check — the posts/pay figures below reflect the most recently completed cycle. Confirm against the current notification on ssc.gov.in once released.',
      payGroups:[
        {level:'Level 4',band:'₹25,500–₹81,100',posts:'Postal Assistant / Sorting Assistant, Data Entry Operator, Data Entry Operator Grade A'},
        {level:'Level 2',band:'₹19,900–₹63,200',posts:'Lower Division Clerk / Junior Secretariat Assistant'}
      ],
      payNote:'Figures are 7th CPC pay-matrix bands (basic pay only) — actual in-hand adds Dearness Allowance (currently ~58% of basic) and House Rent Allowance (8–24% by city class).',
      promotion:'Commonly cited, not an official published timeline: LDC/JSA typically moves to Upper Division Clerk (UDC) / Senior Secretariat Assistant after ~5–7 years (seniority, sometimes a departmental exam). Separately, all central government employees get Modified Assured Career Progression (MACP) pay-level upgrades on completing 10, 20 and 30 years of service, regardless of actual promotion.',
      eligibility:{age:'18–27 years as on the cutoff date set by each cycle\'s notification (exact birth-date bounds change every cycle) — confirm current bounds on ssc.gov.in.',ageRelax:'Standard SSC relaxations are expected to apply (OBC +3 yrs · SC/ST +5 yrs · PwBD +10 yrs) — not independently reconfirmed for CHSL specifically.',qualification:'Class 12 (10+2) pass from a recognized board (Data Entry Operator, Grade A posts require Mathematics as a 12th-standard subject).'},
      howToApply:['Complete One-Time Registration (OTR) on ssc.gov.in, if not already done for another SSC exam','Log in and fill the CHSL-specific application — post preference, exam centres, category','Upload your photo and signature to spec','Pay the fee online — ₹100 for General/OBC/EWS; free for women, SC, ST, PwD, Ex-servicemen','Review, submit, and save your confirmation page']
    },
    verified:'26 Aug 2026'},
  {code:'IBPS-PO',name:'IBPS PO',cat:'Banking',status:'closed',popularity:7,hi:{name:'आईबीपीएस पीओ'},
    notifTitle:'CRP PO/MT-XVI — Recruitment of Probationary Officers/Management Trainees (2027-28 vacancies). Window closed; prelims already held (22–23 Aug 2026), mains expected October 2026.',
    applyStart:'01 Jul 2026',applyEnd:'26 Jul 2026 (extended)',
    officialUrl:'https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf',
    photo:{dims:'3.5 cm × 4.5 cm (200 × 230 px)',px:{w:200,h:230},minKB:20,maxKB:50,format:'JPG/JPEG',notes:'recent colour photo, light/white background, no cap or dark glasses'},
    signature:{dims:'140 × 60 px',px:{w:140,h:60},minKB:10,maxKB:20,format:'JPG/JPEG',notes:'signed in black ink on white paper, not in capitals'},
    otherDocs:[
      {label:'Left thumb impression',spec:{dims:'240 × 240 px @ 200 DPI (~3×3 cm)',px:{w:240,h:240},minKB:20,maxKB:50,format:'JPG',notes:'black/blue ink on white paper'}},
      {label:'Handwritten declaration',spec:{dims:'800 × 400 px @ 200 DPI (~10×5 cm)',px:{w:800,h:400},minKB:50,maxKB:100,format:'JPG',notes:'black ink, English, not capitals'}}],
    details:{
      dataNote:'This cycle\'s application window has already closed and prelims were held this month. The extended closing date (26 Jul) came from secondary sources, not the official corrigendum text itself — and vacancy counts vary between the original notification (6,715) and later press reports (7,365–7,565). Check ibps.in for the next cycle\'s confirmed figures.',
      payGroups:[{level:'JMGS-I (Officer Scale I)',band:'₹48,480–₹85,920 (basic; IBA Joint Note officer scale)',posts:'Probationary Officer / Management Trainee, across 11 participating public-sector banks'}],
      payNote:'In-hand pay adds Dearness Allowance, HRA and City Compensatory Allowance on top of this basic scale, and varies by posting city.',
      promotion:'Not stated in the official notification. Commonly cited (coaching-site estimate, not bank policy): Scale I → Scale II in ~3–5 years (usually requires clearing JAIIB) → Scale III in ~10–15 years, then further via internal promotion exams.',
      eligibility:{age:'20–30 years as on 01 Jul 2026 (born between 02 Jul 1996 and 01 Jul 2006)',ageRelax:'SC/ST +5 yrs · OBC(NCL) +3 yrs · PwBD +10 yrs · Ex-servicemen +5 yrs',qualification:'Graduate in any discipline, degree completed by 21 Jul 2026.'},
      howToApply:['Register at ibps.in under the CRP PO/MT link','Fill the application form and choose participating-bank/centre preferences','Upload photo, signature, left thumb impression, handwritten declaration and 10th certificate','Pay the fee online — ₹175 (SC/ST/PwBD), ₹850 (others)','Use the 2-day post-close edit window if needed (₹200 correction fee)','Download the call letter from ibps.in when released — no postal copies are sent']
    },
    verified:'26 Aug 2026'},
  {code:'IBPS-CL',name:'IBPS Clerk',cat:'Banking',status:'open',popularity:5,hi:{name:'आईबीपीएस क्लर्क'},
    notifTitle:'CRP CSA-XVI — Recruitment of Customer Service Associates (2027-28 vacancies)',
    applyStart:'01 Aug 2026',applyEnd:'28 Aug 2026 (extended)',
    officialUrl:'https://www.ibps.in/wp-content/uploads/Notification_CRP_CSA_XVI-Final.pdf',
    photo:{dims:'3.5 cm × 4.5 cm (200 × 230 px)',px:{w:200,h:230},minKB:20,maxKB:50,format:'JPG/JPEG',notes:'recent colour photo, light/white background, no cap or dark glasses'},
    signature:{dims:'140 × 60 px',px:{w:140,h:60},minKB:10,maxKB:20,format:'JPG/JPEG',notes:'signed in black ink on white paper, not in capitals'},
    otherDocs:[
      {label:'Left thumb impression',spec:{dims:'240 × 240 px @ 200 DPI (~3×3 cm)',px:{w:240,h:240},minKB:20,maxKB:50,format:'JPG',notes:'black/blue ink on white paper'}},
      {label:'Handwritten declaration',spec:{dims:'800 × 400 px @ 200 DPI (~10×5 cm)',px:{w:800,h:400},minKB:50,maxKB:100,format:'JPG',notes:'black ink, English'}}],
    details:{
      payGroups:[{level:'Clerical cadre',band:'₹24,050–₹64,480 (basic; multi-stage increments per the 12th Bipartite Settlement)',posts:'Customer Service Associate (CSA) — state/UT-wise recruitment, one state per candidate. No interview stage for this post.'}],
      payNote:'In-hand pay adds DA, HRA and CCA on top of this basic scale, and varies by posting city.',
      promotion:'Not stated in the official notification. Commonly cited (coaching-site estimate): Clerk → Officer Scale I in roughly 2–6 years depending on the seniority vs. JAIIB/CAIIB fast-track route — individual banks set their own policy.',
      eligibility:{age:'20–28 years as on 01 Aug 2026 (born between 02 Aug 1998 and 01 Aug 2006)',ageRelax:'SC/ST +5 yrs · OBC(NCL) +3 yrs · PwBD +10 yrs · Ex-servicemen (+service period, up to 3 yrs) · widowed/divorced/judicially-separated women up to 35/38/40 yrs (Gen/OBC/SC-ST)',qualification:'Graduate in any discipline, plus basic computer literacy and proficiency in the local language of the state you apply to (tested unless your 10th-standard marksheet already shows that language).'},
      howToApply:['Register at ibps.in under the CRP CSA link, choosing one state/UT to apply for','Fill the form and upload photo, signature, left thumb impression and handwritten declaration','Pay the fee — ₹175 (SC/ST/PwBD/ESM), ₹850 (others)','Use the 2-day post-close edit window if needed (₹200 correction fee)','Download the call letter from ibps.in when released']
    },
    verified:'26 Aug 2026'},
  {code:'SBI-PO',name:'SBI PO',cat:'Banking',status:'closed',popularity:8,hi:{name:'एसबीआई पीओ'},
    notifTitle:'Advt No. CRPD/PO/2026-27/09 — Recruitment of Probationary Officers. Window closed; prelims already held (1–2 Aug 2026), mains expected September 2026.',
    applyStart:'18 Jun 2026',applyEnd:'08 Jul 2026',
    officialUrl:'https://sbi.bank.in/csfile/18062026_1_Detailed_Adv.2026.pdf',
    photo:{dims:'200 × 230 px (preferred)',px:{w:200,h:230},minKB:20,maxKB:50,format:'JPG/JPEG',notes:'recent colour photo, light/white background — keep ~8 physical copies on hand too'},
    signature:{dims:'140 × 60 px (preferred)',px:{w:140,h:60},minKB:10,maxKB:20,format:'JPG/JPEG',notes:'black ink on white paper, not in capitals'},
    otherDocs:[
      {label:'Left thumb impression',spec:{dims:'240 × 240 px @ 200 DPI (~3×3 cm)',px:{w:240,h:240},minKB:20,maxKB:50,format:'JPG'}},
      {label:'Handwritten declaration',spec:{dims:'800 × 400 px @ 200 DPI (~10×5 cm)',px:{w:800,h:400},minKB:50,maxKB:100,format:'JPG'}}],
    details:{
      payGroups:[{level:'JMGS-I (Officer Scale I)',band:'₹48,480 + 4 advance increments (basic; same IBA Joint Note scale as IBPS PO)',posts:'Probationary Officer'}],
      payNote:'The official notification states an approximate total package of ₹21.97 lakh CTC at a Mumbai posting — actual in-hand and total package vary significantly by posting city due to DA/HRA/CCA. Selected candidates execute a ₹2 lakh bond to serve a minimum 3 years.',
      promotion:'The official notification only states generically that SBI\'s "attractive promotion policy... provides an opportunity to reach the Top Management Grade in a reasonably quick time," without concrete timelines. Coaching-site estimates mirror IBPS PO\'s (~3–5 years to first promotion) but aren\'t confirmed by SBI itself.',
      eligibility:{age:'21–30 years as on 01 Apr 2026',ageRelax:'Standard SBI/GoI relaxations apply for reserved categories — exact figures not independently reconfirmed for this specific cycle, check the notification',qualification:'Graduate in any discipline, degree completed by 30 Sep 2026 (final-year candidates may apply provisionally).'},
      howToApply:['Register at sbi.bank.in under Current Openings → this advertisement number','Fill the online form and upload photo, signature, thumb impression and handwritten declaration','Pay the fee — ₹750 (General/EWS/OBC), free for SC/ST/PwBD','Selection: Prelims → Mains → Psychometric Test, Group Exercise and Interview']
    },
    verified:'26 Aug 2026'},
  {code:'SBI-CL',name:'SBI Clerk',cat:'Banking',status:'open',popularity:6,hi:{name:'एसबीआई क्लर्क'},
    notifTitle:'Advt No. CRPD/CR/2026-27/17 — Recruitment of Junior Associates (Customer Support & Sales)',
    applyStart:'11 Aug 2026',applyEnd:'31 Aug 2026',
    officialUrl:'https://sbi.bank.in/webfiles/uploads/files_2627/08/JA_2026_Detailed_Advt_Eng.pdf',
    photo:{dims:'200 × 230 px (preferred)',px:{w:200,h:230},minKB:20,maxKB:50,format:'JPG/JPEG',notes:'recent colour photo, light/white background'},
    signature:{dims:'140 × 60 px (preferred)',px:{w:140,h:60},minKB:10,maxKB:20,format:'JPG/JPEG',notes:'black ink on white paper, not in capitals'},
    otherDocs:[
      {label:'Left thumb impression',spec:{dims:'240 × 240 px @ 200 DPI (~3×3 cm)',px:{w:240,h:240},minKB:20,maxKB:50,format:'JPG'}},
      {label:'Handwritten declaration',spec:{dims:'800 × 400 px @ 200 DPI (~10×5 cm)',px:{w:800,h:400},minKB:50,maxKB:100,format:'JPG'}}],
    details:{
      dataNote:'SBI is running two overlapping recruitment drives right now: this main drive (closes 31 Aug 2026) and a separate SC/ST/OBC backlog drive (Advt CRPD/CR/SPLDRIVE/2026-27/16, closes 27 Aug 2026 — even sooner). Combined vacancy totals across both drives aren\'t cleanly confirmed — check sbi.bank.in for the exact current figures for your category.',
      payGroups:[{level:'Clerical cadre',band:'₹24,050–₹64,480 basic; starting basic ₹26,730 with 2 advance increments for graduates',posts:'Junior Associate (Customer Support & Sales) — state/UT-wise recruitment, no interview stage'}],
      payNote:'Official notification states approximate total starting emoluments of ~₹46,000/month at a metro posting like Mumbai (inclusive of DA and current-rate allowances) — varies by posting city.',
      promotion:'Not addressed in the official notification. Coaching-site estimates mirror IBPS Clerk\'s promotion timelines — treat as unconfirmed.',
      eligibility:{age:'20–28 years as on 01 Apr 2026',ageRelax:'Nil application fee for SC/ST/PwBD/Ex-servicemen and their dependents; standard age relaxations apply for reserved categories',qualification:'Graduate in any discipline (by 31 Dec 2026) plus proficiency in the local language of the state applied to.'},
      howToApply:['Register at sbi.bank.in under Current Openings → the relevant advertisement number','Choose one state/UT and fill the online form','Upload photo, signature and other required documents','Pay the fee — ₹750 (General/OBC/EWS), free for SC/ST/PwBD/Ex-servicemen','No personal interview for this post — selection is exam-based only']
    },
    verified:'26 Aug 2026'},
  {code:'RRB-NTPC',name:'RRB NTPC',cat:'Railway',status:'closed',popularity:4,hi:{name:'आरआरबी एनटीपीसी'},
    notifTitle:'CEN 06/2025 (Graduate) & CEN 07/2025 (Undergraduate) — Non-Technical Popular Categories. Both windows closed since Nov 2025.',
    applyStart:'21 Oct 2025',applyEnd:'27 Nov 2025 (extended)',
    officialUrl:'https://rrbajmer.gov.in/Upload_PDF/CEN%2007-2025-NTPC%20(Under%20Graduate)%20English_compressed-638971975510934173.pdf',
    photo:{dims:'No separate upload — live webcam/front-camera capture during the application itself',format:'Live capture',notes:'no cap, mask or glasses; eyes open; non-white clothing; photographing a printed photo causes summary rejection'},
    signature:{dims:'35mm × 20mm scan box',px:{w:140,h:60},minKB:30,maxKB:49,format:'JPG/JPEG',notes:'black ink, cursive/running handwriting (not block letters), scanned at ≥100 DPI'},
    otherDocs:[{label:'SC/ST certificate (free travel pass claimants only)',notes:'PDF only, under 400 KB — confirmed for Group D\'s official notification, likely applies here too on the same portal but not independently reverified for this specific exam.'}],
    details:{
      dataNote:'Graduate-cycle (CEN 06/2025) post/pay/eligibility figures below are secondary-source only — the official notification host (rrbchennai.gov.in) was unreachable during research. Undergraduate (CEN 07/2025) figures are confirmed directly from the official PDF.',
      payGroups:[
        {level:'Level 2–3 · Undergraduate (confirmed)',band:'₹19,900–₹21,700 (basic, initial pay)',posts:'Commercial Cum Ticket Clerk (Level 3), Accounts Clerk cum Typist / Junior Clerk cum Typist / Trains Clerk (Level 2)'},
        {level:'Level 5–6 · Graduate (secondary-source, not independently confirmed)',band:'₹29,200–₹35,400 (basic)',posts:'Station Master, Goods Train Manager, Chief Commercial-cum-Ticket Supervisor, Senior Clerk cum Typist, Junior Accounts Assistant cum Typist, Traffic Assistant'}
      ],
      payNote:'Undergraduate levels are official; Graduate levels are coaching-site consensus only.',
      promotion:'Not addressed in the official notification for either post group. Any progression path cited elsewhere (e.g. Goods Guard → Senior Goods Guard, ASM → Station Master) is coaching-site material, not RRB-confirmed.',
      eligibility:{age:'18–30 years (Undergraduate posts) as on 01 Jan 2026; Graduate posts commonly reported as 18–33 years but not independently reverified this pass',ageRelax:'Standard relaxations apply for reserved categories, Ex-servicemen and PwBD per RRB\'s general norms',qualification:'Undergraduate posts: 12th pass (10+2) or equivalent, ≥50% aggregate (relaxed for SC/ST/PwBD/Ex-servicemen); typing proficiency required for Accounts/Junior Clerk cum Typist. Graduate posts: Bachelor\'s degree (commonly reported, not independently reverified this pass).'},
      howToApply:['Create an account on rrbapply.gov.in (Aadhaar/DigiLocker verification recommended)','Fill the application for your post group (Graduate or Undergraduate)','Live-capture your photo during the application — there is no separate upload','Upload your signature to spec','Pay the fee — ₹500 for UR/OBC-NCL/EWS (₹400 refunded after appearing in CBT) or ₹250 for SC/ST/women/PwBD/Ex-servicemen/Transgender/Minorities/EBC (fully refunded after appearing in CBT); refund credited only to an Aadhaar-seeded bank account']
    },
    verified:'26 Aug 2026'},
  {code:'RRB-GRP-D',name:'RRB Group D',cat:'Railway',status:'closed',popularity:3,hi:{name:'आरआरबी ग्रुप डी'},
    notifTitle:'CEN 09/2025 — Level-1 posts (Track Maintainer, Pointsman and others). Window closed; CBT held 3–25 Aug 2026.',
    applyStart:'31 Jan 2026',applyEnd:'02 Mar 2026',
    officialUrl:'https://rrbajmer.gov.in/Upload_PDF/Final-Detailed%20CEN%2009-2025%20Level-1-updated%20on%2030012026-639054049190206941.pdf',
    photo:{dims:'No separate upload — live webcam/front-camera capture during the application itself',format:'Live capture',notes:'no cap, mask or glasses; eyes open; non-white clothing; photographing a printed photo causes summary rejection'},
    signature:{dims:'35mm × 20mm scan box',px:{w:140,h:60},minKB:30,maxKB:49,format:'JPG/JPEG',notes:'black ink, cursive/running handwriting (not block letters), scanned at ≥100 DPI'},
    otherDocs:[{label:'SC/ST certificate (free travel pass claimants only)',notes:'PDF only, under 400 KB — confirmed directly from the official CEN 09/2025 notification.'}],
    details:{
      dataNote:'This is the CEN 09/2025 cycle (22,195 vacancies) — the older CEN 08/2024 cycle already concluded. "CEN 01/2026" is a different exam (RRB Assistant Loco Pilot), not Group D — no new Group D cycle has opened since 09/2025.',
      payGroups:[{level:'Level 1',band:'₹18,000 (basic, initial pay)',posts:'Track Maintainer-IV, Assistant Bridge, Assistant P.Way, Assistant Track Machine, Pointsman B, Assistant (S&T), Assistant TRD, Assistant Operations (Electrical), Assistant TL&AC, Assistant Carriage & Wagon, Assistant Loco Shed (Electrical) and other Level-1 posts — 14 designations total'}],
      payNote:'Confirmed directly from the official CEN 09/2025 notification — all Group D posts share the same Level 1 initial pay.',
      promotion:'Not addressed in the official notification. Commonly cited (coaching-site consensus, not RRB-confirmed): Track Maintainer-IV → III → II → I, then Senior/Gangman roles over time.',
      eligibility:{age:'18–33 years as on 01 Jan 2026',ageRelax:'OBC-NCL +3 yrs · SC/ST +5 yrs · PwBD +10/13/15 yrs depending on category · Ex-servicemen per formula',qualification:'10th pass / Matriculation / SSLC or equivalent from a recognized board, OR ITI/NCVT National Apprenticeship Certificate for specific posts.'},
      howToApply:['Create an account on rrbapply.gov.in (Aadhaar/DigiLocker verification recommended)','Fill the application form','Live-capture your photo during the application — there is no separate upload','Upload your signature to spec','Pay the fee — ₹500 for UR/OBC-NCL/EWS (₹400 refunded after appearing in CBT) or ₹250 for SC/ST/women/PwBD/Ex-servicemen/Transgender/Minorities/EBC (fully refunded after appearing in CBT); refund credited only to an Aadhaar-seeded bank account']
    },
    verified:'26 Aug 2026'},
  {code:'NDA',name:'NDA',cat:'Defence',status:'closed',popularity:14,hi:{name:'एनडीए'},
    notifTitle:'NDA & NA Examination (II), 2026 — Notice No. 10/2026-NDA-II — window closed; exam scheduled 13 Sep 2026',
    applyStart:'20 May 2026',applyEnd:'11 Jun 2026 (secondary-sourced correction — the original notification implies 09 Jun)',
    officialUrl:'https://www.upsc.gov.in/sites/default/files/Notif-NDA-II-2026-Engl-200526.pdf',
    photo:{dims:'No fixed pixel dimensions given in the current official instructions — file-size range only',minKB:20,maxKB:200,format:'JPG/JPEG',notes:'colour photo, plain white background, face ≥75% of frame, both ear lobes visible, no glasses glare/dark glasses; live photo capture also mandatory during the application'},
    signature:{dims:'350–500 px wide',minKB:20,maxKB:100,format:'JPG/JPEG',notes:'TRIPLE SIGNATURE required — sign three times vertically, one below the other, black ink on plain white paper, with adequate gap between each signature; scan all three as a single image'},
    details:{
      dataNote:'This cycle (NDA(II) 2026) is closed; exam scheduled 13 Sep 2026. The application window may have closed 11 Jun rather than 9 Jun (secondary-sourced, not independently confirmed against a primary addendum). The next cycle (NDA(I) 2027) is NOT yet open — only UPSC\'s advance exam calendar exists so far (notification expected ~02 Dec 2026); don\'t trust "2027 notification released" claims elsewhere yet.',
      payGroups:[
        {level:'Officer Cadet (training)',band:'₹56,100/month (Level 10 starting pay) as a training stipend',posts:'National Defence Academy, Khadakwasla — 3-year joint Army/Navy/Air Force training, then a service-specific academy before commissioning'},
        {level:'Lieutenant/equivalent on commissioning',band:'Level 10, ₹56,100–₹1,77,500 + Military Service Pay ₹15,500/month fixed (Lieutenant to Brigadier)',posts:'Rank progresses Captain (2 yrs) → Major (6 yrs) → Lt Col (13 yrs) → Colonel and above by selection, not automatically'}
      ],
      payNote:'Confirmed from the official notification\'s Appendix IV.',
      promotion:'Official (from the notification\'s Appendix IV): Lieutenant/equivalent on commission → Captain/equivalent at 2 years → Major/equivalent at 6 years → Lt Col/equivalent at 13 years → Colonel/equivalent on selection (or a 26-year time-scale) → Brigadier and above on selection only — unlike civil service, ranks above Colonel aren\'t time-bound.',
      eligibility:{age:'Unmarried, born in the specific window stated in each cycle\'s notification (NDA(II) 2026: 01 Jan 2008–01 Jan 2011, roughly 15.5–18.5 years) — this cutoff shifts every cycle, always check the current notification rather than a fixed age range.',ageRelax:'Physical/medical standards follow the Armed Forces\' Joint Manual of Medical Standards — common disqualifiers include deviated septum, hydrocele, being under/overweight, and tattoos outside the forearm/back-of-hand area.',qualification:'12th pass, any stream, for the Army wing. 12th with Physics, Chemistry and Maths for the Air Force/Navy wing and Naval Academy entry.'},
      howToApply:['Register at upsconline.nic.in — the only official application site — via UPSC\'s 4-part system (account → Universal Registration Number → Common Application Form → exam-specific module)','Upload your photo and triple signature to spec','Pay the fee — ₹100, waived for SC/ST, all women, and wards of JCO/NCO/OR in Sainik Schools','Live photo capture is mandatory at the Common Application Form stage, in addition to the uploaded photo','Download your e-admit card when released — no postal or emailed admit cards are sent']
    },
    verified:'26 Aug 2026'},
  {code:'CDS',name:'CDS',cat:'Defence',status:'closed',popularity:15,hi:{name:'सीडीएस'},
    notifTitle:'Combined Defence Services Examination (II), 2026 — Notice No. 11/2026-CDS-II — window closed; exam scheduled 13 Sep 2026',
    applyStart:'20 May 2026',applyEnd:'11 Jun 2026 (secondary-sourced correction — the original notification implies 09 Jun)',
    officialUrl:'https://www.upsc.gov.in/sites/default/files/Notification_CDS_II_English.pdf',
    photo:{dims:'No fixed pixel dimensions given in the current official instructions — file-size range only',minKB:20,maxKB:200,format:'JPG/JPEG',notes:'colour photo, plain white background, face ≥75% of frame, both ear lobes visible, no glasses glare/dark glasses; live photo capture also mandatory during the application'},
    signature:{dims:'350–500 px wide',minKB:20,maxKB:100,format:'JPG/JPEG',notes:'TRIPLE SIGNATURE required — sign three times vertically, one below the other, black ink on plain white paper, with adequate gap between each signature; scan all three as a single image'},
    details:{
      dataNote:'This cycle (CDS(II) 2026) is closed; exam scheduled 13 Sep 2026. The application window may have closed 11 Jun rather than 9 Jun (secondary-sourced, not independently confirmed). The next cycle (CDS(I) 2027) is NOT yet open — only UPSC\'s advance exam calendar exists so far (notification expected ~02 Dec 2026).',
      payGroups:[
        {level:'Officer Cadet / Gentleman Cadet (training)',band:'Same Level 10 training-stipend structure as NDA entrants',posts:'Indian Military Academy (Dehradun), Officers Training Academy (Chennai, men and women, Short Service Commission), Indian Naval Academy (Ezhimala), Air Force Academy (Hyderabad) — graduate-entry officer training'},
        {level:'Lieutenant/equivalent on commissioning',band:'Level 10, ₹56,100–₹1,77,500 + Military Service Pay ₹15,500/month fixed (Lieutenant to Brigadier)',posts:'Same rank/pay structure as NDA-route officers once commissioned'}
      ],
      payNote:'Confirmed from the official notification\'s Appendix IV (same figures as NDA, since both feed the same officer rank structure).',
      promotion:'CDS\'s own notification doesn\'t include a promotion table. The rank timeline shown for NDA (Lieutenant on commission → Captain at 2 yrs → Major at 6 yrs → Lt Col at 13 yrs → Colonel and above by selection) is inferred to apply equally once a CDS-route officer is commissioned, since both feed the same rank structure — this is an inference, not a CDS-notification quote.',
      eligibility:{age:'Varies by academy for CDS(II) 2026: IMA &amp; Indian Naval Academy 19–24 years (born 01 Jul 2003–01 Jul 2008), unmarried male. Air Force Academy 20–24 years (up to 26 with a valid Commercial Pilot Licence). Officers Training Academy (men) 19–25 years. OTA (women) 19–25 years, unmarried or issueless widows/divorcees also eligible.',qualification:'IMA/OTA: Bachelor\'s degree in any discipline. Indian Naval Academy: Engineering degree or Bachelor\'s with Physics. Air Force Academy: Bachelor\'s with Physics and Maths at 12th level, or a BE/BTech.'},
      howToApply:['Register at upsconline.nic.in — the only official application site — via UPSC\'s 4-part system (account → Universal Registration Number → Common Application Form → exam-specific module)','Upload your photo and triple signature to spec','Pay the fee — ₹100, waived for SC/ST, all women, and wards of JCO/NCO/OR in Sainik Schools','Live photo capture is mandatory at the Common Application Form stage, in addition to the uploaded photo','Download your e-admit card when released — no postal or emailed admit cards are sent']
    },
    verified:'26 Aug 2026'},
  {code:'BPSC',name:'BPSC',cat:'State PSC',status:'closed',popularity:12,hi:{name:'बीपीएससी'},
    notifTitle:'Integrated 72nd Combined (Preliminary) Competitive Examination — prelim postponed from 26 Jul 2026; tentatively rescheduled to 25 Oct 2026 per BPSC\'s own exam calendar (BPSC itself labels all its calendar dates "tentative")',
    applyStart:'07 May 2026',applyEnd:'31 May 2026',
    officialUrl:'https://bpsc.bihar.gov.in/wp-content/uploads/BPSC_content/Notices/Advertisement-Integrated-72th-CCE-PT_BPSC-20260505-p1euvo.pdf',
    photo:{dims:'No separate upload — captured live via webcam during the application',format:'Live webcam capture',notes:'ensure a clear, well-lit live photo'},
    signature:{dims:'150–220 px wide × 250–320 px tall',px:{w:185,h:285},maxKB:20,format:'JPEG',notes:'one Hindi + one English signature required, must be clearly legible'},
    otherDocs:[{label:'Physical copies',notes:'keep 5 copies of your current photograph on hand — may be required later in the process'}],
    details:{
      dataNote:'Vacancy count has moved more than once — 1230 in the original notice, 1189 in BPSC\'s official 14 Aug 2026 exam calendar, 1186 per some aggregators. Photo/signature specs above are officially confirmed accurate (verified directly against BPSC\'s own application user manual) — no correction needed there.',
      payGroups:[{level:'Levels 6, 7 and 9 depending on post',band:'Deputy Collector/DSP-equivalent posts at Level 9 (~₹53,100–₹1,67,800 basic, third-party cited, not independently verified against an official Bihar pay-matrix document)',posts:'SDO/Senior Deputy Collector, DSP, Bihar Finance Service AC, Revenue Officer, CDPO, District Commandant, Sub-Registrar, Assistant Director, District Minority Welfare Officer, and other Group B/C posts'}],
      payNote:'Pay figures are third-party estimates — an official Bihar-specific pay-matrix document could not be independently verified this pass.',
      promotion:'BPSC-to-IAS promotion via the State Civil Service quota is commonly cited at a notably longer timeline (~15–20 years) than other state PSCs — this is unverified against a primary source, treat as an estimate.',
      eligibility:{age:'As on 01 Aug 2026 — minimum 20/21/22 depending on post; maximum 37 (General male), 40 (General female / EBC/BC), 42 (SC/ST). A PwD relaxation to 47 appears in only one source — not independently confirmed.',ageRelax:'See age ranges above; women get an additional relaxation on the general maximum.',qualification:'Bachelor\'s degree, any discipline, from a recognized university. Bihar domicile is not required to apply — only to claim Bihar-specific reservation benefits.'},
      howToApply:['Complete registration at bpsconline.bihar.gov.in','Fill your profile, education and experience details','Capture your photo live via webcam during the application — no separate upload','Upload two signature images — one Hindi, one English — to spec','Submit and pay the fee']
    },
    verified:'26 Aug 2026'},
  {code:'UPPSC',name:'UPPSC',cat:'State PSC',status:'closed',popularity:11,hi:{name:'यूपीपीएससी'},
    notifTitle:'Combined State/Upper Subordinate Services (PCS) Exam 2026 — Advt No. A-1/E-1/2026 — window closed; prelim scheduled 06 Dec 2026',
    applyStart:'25 Jun 2026',applyEnd:'03 Aug 2026 (correction window to 10 Aug 2026 — some sources instead say 27 Jul/3 Aug; both are past either way)',
    officialUrl:'https://uppsc.up.nic.in',
    photo:{dims:'5 cm × 6 cm @ 200 DPI (≈394×472 px, derived from the official cm/DPI spec — the source states cm/DPI, not px directly)',maxKB:50,format:'JPG',notes:'true colour photo — confirmed from the official OTR photo-instructions PDF'},
    signature:{dims:'6 cm × 3 cm @ 200 DPI (≈472×236 px, derived)',maxKB:30,format:'JPG',notes:'true colour scan — confirmed from the official OTR photo-instructions PDF'},
    details:{
      dataNote:'Photo/signature specs above are now confirmed from an official source (uppsc.up.nic.in\'s OTR photo-instructions PDF), replacing the earlier unverified estimate — the pixel dimensions are derived from the stated cm+DPI, not quoted verbatim as pixels by UPPSC itself.',
      payGroups:[{level:'Level 9–10 (third-party cited, not independently verified against an official UP pay-matrix document)',band:'~₹56,100 basic upward for Deputy Collector/DSP-equivalent posts',posts:'Deputy Collector (SDM), DSP, Block Development Officer, Assistant Regional Transport Officer, Naib Tehsildar, Commercial Tax Officer, District Basic Education Officer, Food Safety Officer, and other Group B posts'}],
      payNote:'Pay figures are third-party estimates — an official UP-specific pay-matrix document could not be independently verified this pass.',
      promotion:'PCS officers become eligible for the State-Civil-Service-to-IAS promotion quota, commonly cited around 8–12 years of service — this is a general estimate, not verified against a UP-specific rule.',
      eligibility:{age:'21–40 years as on 01 Jul 2026, with standard relaxation for reserved categories.',ageRelax:'Standard UP-PSC reserved-category relaxations apply.',qualification:'Bachelor\'s degree from a recognized university (some posts need a specific degree or physical standard). UP domicile is not required to sit the exam — only to claim UP-specific reservation benefits.'},
      howToApply:['Complete One-Time Registration (OTR) at otr.pariksha.nic.in if not already registered','Apply for this specific PCS notification at uppsc.up.nic.in','Upload photo and signature to spec','Pay the fee and submit']
    },
    verified:'26 Aug 2026'},
  {code:'MPPSC',name:'MPPSC',cat:'State PSC',status:'open',popularity:13,hi:{name:'एमपीपीएससी'},
    notifTitle:'State Service Examination 2026 — Advt No. 29/2025. Prelim held 26 Apr 2026 (~3,044 shortlisted); Mains scheduled 7–12 Sep 2026 per MPPSC\'s own official exam calendar — this cycle is ongoing, not concluded.',
    applyStart:'10 Jan 2026',applyEnd:'09 Feb 2026 (late-fee extensions to 01 Apr 2026)',
    results:{stage:'Prelim result declared',date:'22 May 2026',note:'~3,044 candidates shortlisted for Mains — reported consistently across secondary sources but not confirmed against a primary MPPSC result-notice PDF.',url:'https://mppsc.mp.gov.in'},
    officialUrl:'https://mppsc.mp.gov.in/uploads/advertisement/Advt_State_Service_Exam_2026_Dated_31_12_2025.pdf',
    photo:{dims:'Pixel dimensions not found anywhere in the official notification text (a 29-page search found no cm/px/DPI pattern) — may only exist as a non-extractable graphic, or be enforced only by the upload widget itself',minKB:25,maxKB:200,format:'JPG only (mandatory)',notes:'the official notification states a 25–200 KB range but doesn\'t clearly separate a photo ceiling from a signature ceiling — treat this range as shared until confirmed otherwise'},
    signature:{dims:'Pixel dimensions not found in the official notification text — same caveat as photo',minKB:25,maxKB:200,format:'JPG only (mandatory)'},
    details:{
      dataNote:'This cycle is genuinely still active — Mains is scheduled 7–12 Sep 2026, about two weeks from this data\'s compile date. The KB range (25–200KB) is now confirmed from the official notification; exact pixel dimensions remain unconfirmed despite a direct search of the source document.',
      payGroups:[{level:'Level 12 for Deputy Collector/DSP-equivalent, Level 10 for other posts (both third-party cited)',band:'~₹78,800 basic (Level 12) or ~₹56,100 basic (Level 10) — notably higher banding than UPPSC/BPSC\'s cited levels for similar posts, not independently verified against an official MP pay-matrix document',posts:'Deputy Collector, DSP, District Registrar, Commercial Tax Officer, Block Development Officer (Group A); Naib Tehsildar, Sub-Registrar, Assistant Director in various departments (Group B) — 155 vacancies per the notification (some aggregators cite 156 or 191)'}],
      payNote:'Pay figures are third-party estimates — an official MP-specific pay-matrix document could not be independently verified this pass.',
      promotion:'General State-Civil-Service-to-IAS quota pattern is assumed to apply; no MP-specific timeline could be verified this pass — treat as an estimate.',
      eligibility:{age:'Minimum around 21 years; maximum commonly cited as 33 for uniformed/police-track posts, higher for others — the official notification\'s age table uses a legacy Hindi font that couldn\'t be reliably text-extracted this pass, so treat these figures as third-party, not independently confirmed.',ageRelax:'Standard reserved-category relaxations are expected to apply — not independently confirmed this pass.',qualification:'Bachelor\'s degree from a recognized university. MP domicile is not required to apply — only to claim MP-specific reservation benefits (the notification confirms domicile-linked reservation wording for SC/ST/OBC categories).'},
      howToApply:['Register and apply via the MPOnline portal (mponline.gov.in), linked from mppsc.mp.gov.in','Upload photo and signature scans (25–200 KB per above)','Pay the base fee (₹250/₹500 by category, before any late-fee penalty) and submit']
    },
    verified:'26 Aug 2026'},
  {code:'CTET',name:'CTET',cat:'Teaching',status:'open',popularity:9,hi:{name:'सीटीईटी'},
    notifTitle:'CTET September 2026 (22nd edition) — the original 06 Sep 2026 exam date was postponed (new date not yet announced); the application window has reopened for late applicants.',
    applyStart:'25 Aug 2026',applyEnd:'01 Sep 2026',
    officialUrl:'https://ctet.nic.in',
    photo:{dims:'3.5 cm × 4.5 cm',px:{w:276,h:354},minKB:10,maxKB:100,format:'JPG/JPEG',notes:'recent passport-size colour photo, light/white background'},
    signature:{dims:'3.5 cm × 1.5 cm',px:{w:276,h:118},minKB:3,maxKB:30,format:'JPG/JPEG'},
    details:{
      dataNote:'CBSE postponed the CTET September 2026 written exam that was originally scheduled for 6 Sep 2026 — a revised date hasn\'t been announced yet. The application window reopened 25 Aug–1 Sep 2026 for candidates who missed the original 11 May–10 Jun 2026 window; if you already applied then, you don\'t need to reapply.',
      payGroups:[
        {level:'Paper I (qualifies for Classes 1–5, Primary Teacher)',band:'~7th CPC Level 6, from ₹35,400 basic — coaching-site estimate, not verified against an official pay-matrix notification',posts:'Primary Teacher (PRT) posts in central government schools (KVS/NVS) and many state recruitment exams that accept CTET'},
        {level:'Paper II (qualifies for Classes 6–8, Trained Graduate Teacher)',band:'~7th CPC Level 7, from ₹44,900 basic — same caveat as above',posts:'Trained Graduate Teacher (TGT) posts, same recruiting bodies'}
      ],
      payNote:'CTET is a certification, not a recruitment exam — passing it doesn\'t itself pay a salary. It\'s a lifetime-valid eligibility certificate required before you can apply to actual teacher-recruitment exams (KVS, NVS, Central Tibetan Schools Administration, and most state TET-equivalent recruitment).',
      promotion:'Not applicable in the usual sense — CTET has no promotion path of its own. Career progression happens after recruitment into an actual teaching post, via that employer\'s own service rules.',
      eligibility:{age:'Minimum 18 years; no upper age limit',qualification:'Paper I: 12th pass (≥50%) + 2-yr Diploma in Elementary Education, or 12th (≥50%) + 4-yr B.El.Ed, or an equivalent NCTE-recognized qualification. Paper II: Graduation (≥50%) + B.Ed, or 12th (≥50%) + 4-yr B.El.Ed/B.A.Ed/B.Sc.Ed, or graduation (≥45%) + B.Ed per NCTE norms. These clauses have several state-specific sub-variants (e.g. BTC, JBT) — confirm the exact wording against the official Information Bulletin for your qualification path.'},
      howToApply:['Apply online at ctet.nic.in during the notified window','Upload your photo and signature to spec','Pay the fee online','Download and keep your confirmation page']
    },
    verified:'26 Aug 2026'},
];

const CAT_CLASS={
  'Central Govt':'cat-central','Banking':'cat-banking','Railway':'cat-railway',
  'Defence':'cat-defence','State PSC':'cat-state','Teaching':'cat-teaching'
};

/* ===== flow state ===== */
const state={
  examCode:'generic',
  exam:null,
  slots:{} // key -> {label, spec, kind:'photo'|'signature'|'generic', file, result:{url,filename,sizeKB,overTarget}}
};

function goStep(n){
  document.querySelectorAll('.fstep').forEach(el=>{
    const s=Number(el.dataset.step);
    el.classList.toggle('active',s===n);
    el.classList.toggle('done',s<n);
  });
}

/* ---- Browse-all-exams directory (exams.html) ---- */
function renderExamDirectory(){
  const box=$('examDirectory');
  if(!box) return;
  const groups={};
  APPLICATIONS.forEach(a=>{(groups[a.cat]=groups[a.cat]||[]).push(a)});
  const cats=Object.keys(groups).sort((catA,catB)=>{
    const minA=Math.min(...groups[catA].map(a=>a.popularity));
    const minB=Math.min(...groups[catB].map(a=>a.popularity));
    return minA-minB;
  });
  box.innerHTML=cats.map(cat=>{
    const exams=groups[cat].slice().sort((a,b)=>a.popularity-b.popularity);
    return '<div class="directory-section">'+
      '<div class="directory-cat-label">'+trCat(cat)+'</div>'+
      '<div class="directory-grid">'+
        exams.map(a=>
          '<a class="directory-card" href="index.html?exam='+a.code+'">'+
            '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
            '<span class="exam-result-text"><b>'+tr(a,'name')+'</b><small>'+(a.status==='open'?T('detail.applicationsOpen'):T('detail.applicationsClosed'))+'</small></span>'+
            '<span class="status-pill '+(a.status==='open'?'open':'closed')+'">'+(a.status==='open'?'Open':'Closed')+'</span>'+
          '</a>'
        ).join('')+
      '</div>'+
    '</div>';
  }).join('');
}

/* ---- Exam calendar (calendar.html) ---- */
function parseExamDate(str){
  if(!str) return null;
  const clean=str.replace(/\(.*?\)/g,'').trim();
  const d=new Date(clean);
  return isNaN(d)?null:d;
}
function daysLeft(d){
  const now=new Date();now.setHours(0,0,0,0);
  const dd=new Date(d);dd.setHours(0,0,0,0);
  return Math.round((dd-now)/86400000);
}
function renderExamCalendar(){
  const box=$('examCalendar');
  if(!box) return;
  const withDates=[],withoutDates=[];
  APPLICATIONS.forEach(a=>{
    const d=parseExamDate(a.applyEnd);
    if(d) withDates.push({a,d}); else withoutDates.push(a);
  });
  withDates.sort((x,y)=>x.d-y.d);
  const groups=[];
  withDates.forEach(({a,d})=>{
    const label=d.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
    let g=groups.find(g=>g.label===label);
    if(!g){g={label,items:[]};groups.push(g)}
    g.items.push({a,d});
  });
  box.innerHTML=groups.map(g=>
    '<div class="cal-month"><div class="cal-month-label">'+g.label+'</div>'+
      g.items.map(({a,d})=>{
        const dl=daysLeft(d);
        const pillLabel=a.status==='open'?(dl>=0?'Closes in '+dl+'d':'Open'):'Closed';
        return '<a class="cal-row" href="index.html?exam='+a.code+'">'+
          '<span class="cal-date">'+d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})+'</span>'+
          '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
          '<span class="exam-result-text"><b>'+tr(a,'name')+'</b><small>'+trCat(a.cat)+'</small></span>'+
          '<span class="status-pill '+(a.status==='open'?'open':'closed')+'">'+pillLabel+'</span>'+
        '</a>';
      }).join('')+
    '</div>'
  ).join('')+
  (withoutDates.length?
    '<div class="cal-month"><div class="cal-month-label">Dates not available</div>'+
      withoutDates.map(a=>
        '<a class="cal-row" href="index.html?exam='+a.code+'">'+
          '<span class="cal-date">—</span>'+
          '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
          '<span class="exam-result-text"><b>'+tr(a,'name')+'</b><small>Check official notification for dates</small></span>'+
          '<span class="status-pill '+(a.status==='open'?'open':'closed')+'">'+(a.status==='open'?'Open':'Closed')+'</span>'+
        '</a>'
      ).join('')+
    '</div>':'');
}

// Every open exam, nearest deadline first — the shared list behind the
// ticker and the notice board, so both always agree with each other and
// with the calendar.
function urgentExamsList(){
  return APPLICATIONS
    .filter(a=>a.status==='open')
    .map(a=>({a,d:parseExamDate(a.applyEnd)}))
    .sort((x,y)=>{
      if(!x.d&&!y.d) return 0;
      if(!x.d) return 1;
      if(!y.d) return -1;
      return x.d-y.d;
    });
}

/* ---- Notice ticker (index.html, header area) ---- */
function renderNoticeTicker(){
  const box=$('noticeTicker');
  if(!box) return;
  const urgent=urgentExamsList();
  if(!urgent.length){box.style.display='none';return}
  const items=urgent.map(({a,d})=>{
    const dl=d?daysLeft(d):null;
    const label=dl!=null?(dl>=0?'closes in '+dl+'d':'closing soon'):'applications open';
    return '<a class="notice-ticker-item" href="index.html?exam='+a.code+'"><span class="notice-ticker-dot"></span>'+tr(a,'name')+' — '+label+'</a>';
  }).join('');
  // Duplicated once so the scroll loop has no visible seam.
  box.innerHTML='<div class="notice-ticker-track">'+items+items+'</div>';
}

/* ---- Notice board (index.html sidebar) ---- */
function renderNoticeBoard(){
  const box=$('noticeBoard');
  if(!box) return;
  const urgent=urgentExamsList().slice(0,6);
  if(!urgent.length){
    box.innerHTML='<div class="notice-empty">No open applications right now — check back soon.</div>';
    return;
  }
  box.innerHTML=urgent.map(({a,d})=>{
    const dl=d?daysLeft(d):null;
    const label=dl!=null?(dl>=0?'Closes in '+dl+' day'+(dl===1?'':'s')+' · '+d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'}):'Closing soon'):'Applications open';
    return '<a class="notice-item" href="index.html?exam='+a.code+'"><b>'+tr(a,'name')+'</b><span>'+label+'</span></a>';
  }).join('');
}

/* ---- Results panel (index.html sidebar) ----
   Honest by design: we have no result-lookup database, so this only ever
   links out to each exam's own official site — either the confirmed
   result info we've researched, or a plain "not yet declared" state. Never
   a fake in-house result checker. */
function renderResultsPanel(){
  const box=$('resultsPanel');
  if(!box) return;
  const sorted=[...APPLICATIONS].sort((a,b)=>a.popularity-b.popularity);
  box.innerHTML=sorted.map(a=>{
    const r=a.results;
    const pill=r
      ?'<a class="result-pill declared" href="'+(r.url||a.officialUrl)+'" target="_blank" rel="noopener" title="'+r.stage+' · '+r.date+(r.note?' — '+r.note:'')+'">'+r.stage+' ↗</a>'
      :'<a class="result-pill pending" href="'+a.officialUrl+'" target="_blank" rel="noopener">Not declared yet</a>';
    return '<div class="result-item"><span class="rname">'+tr(a,'name')+'</span>'+pill+'</div>';
  }).join('');
}

/* ---- Step 1: exam search ---- */
// Highest-aspirant-strength exams first — this is what most visitors are
// actually here for, so they shouldn't have to type anything to find them.
function renderPopularExams(){
  const box=$('popularExams');
  if(!box) return;
  const top=[...APPLICATIONS].sort((a,b)=>a.popularity-b.popularity).slice(0,6);
  box.innerHTML='<div class="popular-label">Most applied-for right now</div>'+
    '<div class="popular-chip-row">'+top.map(a=>
      '<button type="button" class="popular-chip" onclick="selectExam(\''+a.code+'\')">'+tr(a,'name')+'</button>'
    ).join('')+'</div>';
}

// The rest of the exams, not shown as flat "most applied-for" chips —
// grouped by field (Banking, Railway, ...) so it stays a topic, not a
// separate folder to click into. Categories and exams within each are
// still ordered by aspirant-strength popularity, same as everywhere else.
function renderExamsByCategory(){
  const box=$('examByCategory');
  if(!box) return;
  const topCodes=new Set([...APPLICATIONS].sort((a,b)=>a.popularity-b.popularity).slice(0,6).map(a=>a.code));
  const rest=APPLICATIONS.filter(a=>!topCodes.has(a.code));
  const groups={};
  rest.forEach(a=>{(groups[a.cat]=groups[a.cat]||[]).push(a)});
  const cats=Object.keys(groups).sort((c1,c2)=>{
    const m1=Math.min(...groups[c1].map(a=>a.popularity));
    const m2=Math.min(...groups[c2].map(a=>a.popularity));
    return m1-m2;
  });
  box.innerHTML=cats.map(cat=>{
    const exams=groups[cat].slice().sort((a,b)=>a.popularity-b.popularity);
    return '<div class="cat-group">'+
      '<div class="popular-label">'+trCat(cat)+'</div>'+
      '<div class="popular-chip-row">'+exams.map(a=>
        '<button type="button" class="popular-chip" onclick="selectExam(\''+a.code+'\')">'+tr(a,'name')+'</button>'
      ).join('')+'</div>'+
    '</div>';
  }).join('');
}

function renderExamResults(query){
  const box=$('examResults');
  const q=(query||'').trim().toLowerCase();
  const popularBox=$('popularExams');
  const categoryBox=$('examByCategory');
  if(popularBox) popularBox.style.display=q?'none':'block';
  if(categoryBox) categoryBox.style.display=q?'none':'block';
  if(!q){box.innerHTML='';box.classList.remove('open');return}
  const matches=APPLICATIONS.filter(a=>
    tr(a,'name').toLowerCase().includes(q)||a.code.toLowerCase().includes(q)||a.cat.toLowerCase().includes(q)
  ).sort((a,b)=>a.popularity-b.popularity).slice(0,8);
  box.classList.add('open');
  if(!matches.length){
    box.innerHTML='<div class="exam-empty">No match — try a shorter search, or <button type="button" class="link-btn" onclick="skipExam()">skip and resize a file</button>.</div>';
    return;
  }
  box.innerHTML=matches.map(a=>
    '<button type="button" class="exam-result-row" onclick="selectExam(\''+a.code+'\')">'+
      '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
      '<span class="exam-result-text"><b>'+tr(a,'name')+'</b><small>'+trCat(a.cat)+'</small></span>'+
      '<span class="status-pill '+(a.status==='open'?'open':'closed')+'">'+(a.status==='open'?'Open':'Closed')+'</span>'+
    '</button>'
  ).join('');
}

function selectExam(code){
  const exam=APPLICATIONS.find(a=>a.code===code);
  if(!exam) return;
  state.exam=exam;
  state.examCode=code;
  state.slots={};
  if(exam.photo) state.slots.photo={label:'Photo',kind:'photo',spec:exam.photo,file:null,result:null};
  if(exam.signature) state.slots.signature={label:'Signature',kind:'signature',spec:exam.signature,file:null,result:null};
  (exam.otherDocs||[]).forEach((doc,i)=>{
    if(doc.spec) state.slots['otherdoc'+i]={label:doc.label,kind:'otherdoc',spec:doc.spec,file:null,result:null};
  });
  enterUploadStep();
}

function skipExam(){
  state.exam=null;
  state.examCode='generic';
  state.slots={generic:{label:'File',kind:'generic',spec:null,file:null,result:null,targetKb:50}};
  enterUploadStep();
}

function enterUploadStep(){
  $('panelExam').style.display='none';
  $('panelUpload').style.display='block';
  renderSelectedExamBar();
  renderExamDetailPanel();
  renderUploadSlots();
  renderPayBar();
  goStep(2);
}

function changeExam(){
  $('panelUpload').style.display='none';
  $('panelExam').style.display='block';
  $('examSearch').value='';
  $('examResults').innerHTML='';
  goStep(1);
}

function renderSelectedExamBar(){
  const bar=$('selectedExamBar');
  if(!state.exam){
    bar.innerHTML='<div class="selected-exam-generic">'+T('detail.noSpecificExam')+'</div>';
    return;
  }
  const a=state.exam;
  const deadline=(a.status==='open'&&a.applyEnd)?'<div class="exam-deadline">Apply by '+a.applyEnd+'</div>':'';
  bar.innerHTML=
    '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
    '<span class="exam-result-text"><b>'+tr(a,'name')+'</b><small>'+trCat(a.cat)+' · '+(a.status==='open'?T('detail.applicationsOpen'):T('detail.applicationsClosed'))+'</small>'+deadline+'</span>'+
    (a.officialUrl?'<a class="btn btn-outline btn-sm" href="'+a.officialUrl+'" target="_blank" rel="noopener">'+T('detail.officialNotice')+'</a>':'');
}

// Full picture for the selected exam — posts & pay, promotion, eligibility,
// how to apply — pulled straight from the official notification where we've
// compiled it. Where we haven't compiled it yet, say so plainly rather than
// showing nothing or guessing.
function renderExamDetailPanel(){
  const box=$('examDetailPanel');
  if(!box) return;
  const a=state.exam;
  if(!a){box.innerHTML='';return}
  // Shallow-merge the Hindi override on top of the English details, so any
  // field not yet translated for this exam still shows in English rather
  // than going blank.
  const d=(currentLang==='hi'&&a.hi&&a.hi.details)?Object.assign({},a.details,a.hi.details):(a.details||{});

  // Entries with a structured spec become their own upload slot below (like
  // photo/signature) — only show info-only entries here, so the spec isn't
  // duplicated in two places.
  const infoOnlyDocs=(a.otherDocs||[]).filter(o=>!o.spec);
  const otherDocsCard=infoOnlyDocs.length?
    '<div class="detail-card detail-card-wide"><h4>'+T('detail.otherDocs')+'</h4>'+
      infoOnlyDocs.map(o=>'<div class="detail-row"><b>'+o.label+'</b><span>'+o.notes+'</span></div>').join('')+
    '</div>':'';

  const hasCoreDetails=d.payGroups||d.eligibility||d.promotion||d.howToApply;
  if(!hasCoreDetails&&!otherDocsCard){
    box.innerHTML='<div class="detail-missing">'+T('detail.missing')+'</div>';
    return;
  }

  box.innerHTML=
    (d.dataNote?'<div class="detail-note">⚠️ '+d.dataNote+'</div>':'')+
    (hasCoreDetails?'':'<div class="detail-missing">'+T('detail.missing')+'</div>')+
    '<div class="detail-grid">'+
      (d.payGroups?
        '<div class="detail-card"><h4>'+T('detail.postsPay')+'</h4>'+
          d.payGroups.map(g=>'<div class="pay-group"><b>'+g.level+' · '+g.band+'</b><span>'+g.posts+'</span></div>').join('')+
          (d.payNote?'<p class="detail-footnote">'+d.payNote+'</p>':'')+
        '</div>':'')+
      (d.eligibility?
        '<div class="detail-card"><h4>'+T('detail.eligibility')+'</h4>'+
          '<div class="detail-row"><b>'+T('detail.age')+'</b><span>'+d.eligibility.age+'</span></div>'+
          (d.eligibility.ageRelax?'<div class="detail-row"><b>'+T('detail.relaxation')+'</b><span>'+d.eligibility.ageRelax+'</span></div>':'')+
          '<div class="detail-row"><b>'+T('detail.qualification')+'</b><span>'+d.eligibility.qualification+'</span></div>'+
        '</div>':'')+
      (d.promotion?
        '<div class="detail-card"><h4>'+T('detail.promotion')+'</h4><p>'+d.promotion+'</p></div>':'')+
      (d.howToApply?
        '<div class="detail-card detail-card-wide"><h4>'+T('detail.howToApply')+'</h4>'+
          (a.officialUrl?'<a class="btn btn-primary btn-sm apply-cta" href="'+a.officialUrl+'" target="_blank" rel="noopener">'+T('detail.applyOnOfficial')+'</a>':'')+
          (d.beforeYouStart?
            '<div class="apply-subhead">'+T('detail.beforeYouStart')+'</div>'+
            '<ul class="apply-checklist">'+d.beforeYouStart.map(s=>'<li>'+s+'</li>').join('')+'</ul>':'')+
          '<ol class="apply-steps">'+d.howToApply.map(s=>'<li>'+s+'</li>').join('')+'</ol>'+
          (d.commonMistakes?
            '<div class="apply-subhead apply-subhead-warn">'+T('detail.commonMistakes')+'</div>'+
            '<ul class="apply-checklist">'+d.commonMistakes.map(s=>'<li>'+s+'</li>').join('')+'</ul>':'')+
          (d.correctionWindow?
            '<div class="apply-subhead">'+T('detail.correctionWindow')+'</div><p class="detail-footnote" style="border-top:none;padding-top:0;margin-top:0">'+d.correctionWindow+'</p>':'')+
        '</div>':'')+
      otherDocsCard+
    '</div>';
}

/* ---- Step 2: upload slots ---- */
function specLine(spec){
  if(!spec) return '';
  const parts=[];
  if(spec.dims) parts.push(spec.dims);
  if(spec.minKB||spec.maxKB) parts.push((spec.minKB?spec.minKB+'–':'')+(spec.maxKB||'?')+' KB');
  if(spec.format) parts.push(spec.format);
  return parts.join(' · ');
}

function renderUploadSlots(){
  const box=$('uploadSlots');
  box.innerHTML=Object.keys(state.slots).map(key=>{
    const slot=state.slots[key];
    return '<div class="upload-slot" id="slot-'+key+'">'+
      '<div class="slot-head"><b>'+slot.label+'</b>'+(slot.spec?'<span class="slot-spec">'+specLine(slot.spec)+'</span>':'')+'</div>'+
      (slot.spec&&slot.spec.notes?'<div class="slot-note">'+slot.spec.notes+'</div>':'')+
      '<div class="slot-body" id="slot-body-'+key+'"></div>'+
    '</div>';
  }).join('')+
  renderMoreToolsToggle();
  Object.keys(state.slots).forEach(renderSlotBody);
}

const TOOL_SLOT_LABELS={
  pdf:'Other document (PDF)',
  pdftojpg:'PDF → JPG (first page)',
  pdfcompress:'Shrink a PDF'
};

function renderMoreToolsToggle(){
  const remaining=Object.keys(TOOL_SLOT_LABELS).filter(k=>!state.slots[k]);
  if(!remaining.length) return '';
  return '<div class="upload-slot upload-slot-pdf" id="more-tools-toggle">'+
    '<div class="slot-hint" style="margin-bottom:8px">Most exams want photo &amp; signature as JPG — that\'s covered above. Need something else for another document?</div>'+
    '<div class="more-tools-row">'+
      remaining.map(k=>'<button type="button" class="link-btn" onclick="addToolSlot(\''+k+'\')">'+TOOL_SLOT_LABELS[k]+'</button>').join('')+
    '</div>'+
  '</div>';
}

function addToolSlot(kind){
  if(state.slots[kind]) return;
  state.slots[kind]={label:TOOL_SLOT_LABELS[kind],kind,spec:null,file:null,result:null,targetKb:200};
  renderUploadSlots();
}

function renderSlotBody(key){
  const slot=state.slots[key];
  const body=$('slot-body-'+key);
  if(!body) return;

  if(slot.result){
    const unlocked=hasUnlock('bundle',state.examCode);
    body.innerHTML=
      (slot.result.previewUrl?'<img class="slot-preview" src="'+slot.result.previewUrl+'">':'')+
      '<div class="slot-status">'+(slot.result.overTarget?'⚠️ Closest possible: ':'✅ Ready: ')+slot.result.sizeKB+' KB</div>'+
      (slot.result.note?'<div class="slot-note">'+slot.result.note+'</div>':'')+
      (unlocked
        ?'<a class="btn btn-primary btn-sm" download="'+slot.result.filename+'" href="'+slot.result.url+'">Download</a>'
        :'<div class="slot-waiting">Pay once below to download every file</div>');
    return;
  }

  if(slot.results){
    const unlocked=hasUnlock('bundle',state.examCode);
    body.innerHTML=
      '<div class="batch-list">'+slot.results.map(r=>
        r.error
          ?'<div class="batch-row batch-row-error">⚠️ <b>'+r.name+'</b>: '+r.error+'</div>'
          :'<div class="batch-row">'+
              '<span class="batch-name">'+(r.overTarget?'⚠️ ':'✅ ')+r.name+'</span>'+
              '<span class="batch-size">'+r.sizeKB+' KB</span>'+
              (unlocked
                ?'<a class="btn btn-primary btn-sm" download="'+r.filename+'" href="'+r.url+'">Download</a>'
                :'<span class="batch-waiting">Pay below</span>')+
            '</div>'
      ).join('')+
      '</div>'+
      '<button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById(\'input-'+key+'\').click()">Process a different batch</button>'+
      '<input type="file" id="input-'+key+'" accept="image/jpeg,image/png,image/webp" multiple style="display:none">';
    document.getElementById('input-'+key).addEventListener('change',e=>{
      slot.files=[...e.target.files];
      slot.results=null;
      renderSlotBody(key);
    });
    return;
  }

  if(slot.kind==='generic'){
    const n=slot.files?slot.files.length:0;
    body.innerHTML=
      '<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">Click to choose one or more photos<input type="file" id="input-'+key+'" accept="image/jpeg,image/png,image/webp" multiple style="display:none">'+'</div>'+
      (n?'<div class="slot-hint">'+n+' file'+(n>1?'s':'')+' selected</div>':'')+
      '<div class="row"><label>Target KB</label><input id="kb-'+key+'" type="number" min="5" max="5000" value="'+slot.targetKb+'"></div>'+
      '<button class="btn btn-outline btn-sm" onclick="processGenericSlot(\''+key+'\')">Process'+(n>1?' all '+n:'')+'</button>';
    document.getElementById('input-'+key).addEventListener('change',e=>{
      slot.files=[...e.target.files];
      renderSlotBody(key);
    });
    return;
  }

  if(slot.kind==='pdf'){
    body.innerHTML='<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">Click to choose an image to convert<input type="file" id="input-'+key+'" accept="image/jpeg,image/png,image/webp" style="display:none"></div>';
    document.getElementById('input-'+key).addEventListener('change',e=>{
      const f=e.target.files[0];
      if(f) processPdfSlot(key,f);
    });
    return;
  }

  if(slot.kind==='pdftojpg'){
    body.innerHTML='<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">Click to choose a PDF<input type="file" id="input-'+key+'" accept="application/pdf" style="display:none"></div>';
    document.getElementById('input-'+key).addEventListener('change',e=>{
      const f=e.target.files[0];
      if(f) processPdfToJpgSlot(key,f);
    });
    return;
  }

  if(slot.kind==='pdfcompress'){
    body.innerHTML=
      '<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">Click to choose a PDF<input type="file" id="input-'+key+'" accept="application/pdf" style="display:none"></div>'+
      '<div class="row"><label>Target KB</label><input id="kb-'+key+'" type="number" min="20" max="10000" value="'+slot.targetKb+'"></div>'+
      '<button class="btn btn-outline btn-sm" onclick="processPdfCompressSlot(\''+key+'\')">Process</button>';
    document.getElementById('input-'+key).addEventListener('change',e=>{
      if(e.target.files[0]) slot.file=e.target.files[0];
    });
    return;
  }

  // photo / signature — spec-driven, auto-processes on file choice
  body.innerHTML='<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">Click to choose your '+slot.label.toLowerCase()+'<input type="file" id="input-'+key+'" accept="image/jpeg,image/png,image/webp" style="display:none"></div>';
  document.getElementById('input-'+key).addEventListener('change',e=>{
    const f=e.target.files[0];
    if(f) processSpecSlot(key,f);
  });
}

const MAX_UPLOAD_BYTES=15*1024*1024; // 15MB — generous for a phone photo, still bounds worst-case canvas work

// Returns an error message if the file can't be processed, or null if it's fine.
function validateUploadFile(file){
  if(!file.type||!file.type.startsWith('image/')) return 'That doesn\'t look like an image — choose a JPG, PNG or WebP file.';
  if(file.size>MAX_UPLOAD_BYTES) return 'That file is too large (max 15 MB) — try a smaller photo.';
  return null;
}

function validatePdfFile(file){
  if(file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name||'')) return 'That doesn\'t look like a PDF — choose a .pdf file.';
  if(file.size>MAX_UPLOAD_BYTES) return 'That file is too large (max 15 MB) — try a smaller PDF.';
  return null;
}

function showSlotError(key,message){
  const body=$('slot-body-'+key);
  if(!body) return;
  body.innerHTML='<div class="slot-error">⚠️ '+message+'</div><div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">Try another file</div>';
  const input=document.getElementById('input-'+key);
  if(input) input.addEventListener('change',e=>{
    const f=e.target.files[0];
    if(!f) return;
    const kind=state.slots[key].kind;
    if(kind==='pdf') processPdfSlot(key,f);
    else if(kind==='pdftojpg') processPdfToJpgSlot(key,f);
    else if(kind==='generic'){state.slots[key].files=[f];renderSlotBody(key)}
    else if(kind==='pdfcompress'){state.slots[key].file=f;renderSlotBody(key)}
    else processSpecSlot(key,f);
  });
}

async function processSpecSlot(key,file){
  const err=validateUploadFile(file);
  if(err){showSlotError(key,err);return}
  const slot=state.slots[key];
  const body=$('slot-body-'+key);
  body.innerHTML='<div class="slot-processing">Processing…</div>';
  const img=new Image();
  img.onerror=()=>showSlotError(key,'Couldn\'t read that file — it may be corrupted. Try a different photo.');
  img.onload=async()=>{
    const spec=slot.spec||{};
    const exactDims=Boolean(spec.px);
    const wantW=exactDims?spec.px.w:0, wantH=exactDims?spec.px.h:0;
    const targetBytes=(spec.maxKB||50)*1024;
    const {blob,overTarget}=await compressToTarget(img,{exactDims,wantW,wantH,targetBytes});
    const url=URL.createObjectURL(blob);
    slot.result={url,previewUrl:url,filename:'govtbabu-'+key+'-'+Math.round(blob.size/1024)+'kb.jpg',sizeKB:(blob.size/1024).toFixed(1),overTarget};
    renderSlotBody(key);
    renderPayBar();
  };
  img.src=URL.createObjectURL(file);
}

function loadImageFromFile(file){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=reject;
    img.src=URL.createObjectURL(file);
  });
}

// Batch mode: processes every selected file against the same target KB in
// one pass — each gets its own row and download link, all gated by the
// same single payment for this slot.
async function processGenericSlot(key){
  const slot=state.slots[key];
  if(!slot.files||!slot.files.length){alert('Choose at least one file first.');return}
  const kbInput=$('kb-'+key);
  const targetBytes=Number(kbInput.value)*1024;
  if(!targetBytes||targetBytes<5120){alert('Choose a target of at least 5 KB.');return}
  slot.targetKb=Number(kbInput.value);
  const body=$('slot-body-'+key);
  const total=slot.files.length;
  const results=[];
  for(let i=0;i<total;i++){
    const file=slot.files[i];
    body.innerHTML='<div class="slot-processing">Processing '+(i+1)+' of '+total+'…</div>';
    const err=validateUploadFile(file);
    if(err){results.push({name:file.name,error:err});continue}
    try{
      const img=await loadImageFromFile(file);
      const {blob,overTarget}=await compressToTarget(img,{exactDims:false,wantW:0,wantH:0,targetBytes});
      const url=URL.createObjectURL(blob);
      results.push({name:file.name,url,filename:'govtbabu-'+i+'-'+Math.round(blob.size/1024)+'kb.jpg',sizeKB:(blob.size/1024).toFixed(1),overTarget});
    }catch{
      results.push({name:file.name,error:'Couldn\'t read this file — it may be corrupted.'});
    }
  }
  slot.results=results;
  renderSlotBody(key);
  renderPayBar();
}

async function processPdfSlot(key,file){
  const err=validateUploadFile(file);
  if(err){showSlotError(key,err);return}
  const slot=state.slots[key];
  const body=$('slot-body-'+key);
  body.innerHTML='<div class="slot-processing">Converting…</div>';
  try{
    const pdfBlob=await jpgFileToPdfBlob(file);
    const url=URL.createObjectURL(pdfBlob);
    slot.result={url,previewUrl:null,filename:'govtbabu-document.pdf',sizeKB:(pdfBlob.size/1024).toFixed(1),overTarget:false};
    renderSlotBody(key);
    renderPayBar();
  }catch{
    showSlotError(key,'Couldn\'t convert that file — it may be corrupted. Try a different photo.');
  }
}

async function processPdfToJpgSlot(key,file){
  const err=validatePdfFile(file);
  if(err){showSlotError(key,err);return}
  const slot=state.slots[key];
  const body=$('slot-body-'+key);
  body.innerHTML='<div class="slot-processing">Extracting page 1…</div>';
  try{
    const {blob,extraPages}=await pdfToJpgBlob(file);
    const url=URL.createObjectURL(blob);
    slot.result={
      url,previewUrl:url,filename:'govtbabu-page1.jpg',sizeKB:(blob.size/1024).toFixed(1),overTarget:false,
      note:extraPages>0?('This PDF has '+(extraPages+1)+' pages — only page 1 was extracted.'):null
    };
    renderSlotBody(key);
    renderPayBar();
  }catch{
    showSlotError(key,'Couldn\'t read that PDF — it may be corrupted or password-protected.');
  }
}

async function processPdfCompressSlot(key){
  const slot=state.slots[key];
  if(!slot.file){alert('Choose a PDF first.');return}
  const kbInput=$('kb-'+key);
  const targetBytes=Number(kbInput.value)*1024;
  if(!targetBytes||targetBytes<20480){alert('Choose a target of at least 20 KB.');return}
  slot.targetKb=Number(kbInput.value);
  const body=$('slot-body-'+key);
  body.innerHTML='<div class="slot-processing">Compressing…</div>';
  try{
    const {blob,overTarget}=await compressPdfBlob(slot.file,targetBytes);
    const url=URL.createObjectURL(blob);
    slot.result={url,previewUrl:null,filename:'govtbabu-compressed.pdf',sizeKB:(blob.size/1024).toFixed(1),overTarget};
    renderSlotBody(key);
    renderPayBar();
  }catch{
    showSlotError(key,'Couldn\'t process that PDF — it may be corrupted or password-protected.');
  }
}

/* ---- Step 3: pay + download ---- */
function renderPayBar(){
  const bar=$('payBar');
  const results=Object.values(state.slots).filter(s=>s.result||(s.results&&s.results.length));
  if(!results.length){bar.style.display='none';return}
  bar.style.display='block';
  if(hasUnlock('bundle',state.examCode)){
    bar.innerHTML='<div class="unlocked-note">✅ Unlocked — download each file above.</div>';
    goStep(3);
  } else {
    bar.innerHTML='<button class="btn btn-accent btn-block" id="payAllBtn" type="button">Pay ₹29 &amp; Unlock Downloads</button>'+
      '<div class="pay-note">One payment unlocks every file above · instant download, no account needed</div>';
    $('payAllBtn').addEventListener('click',()=>{
      initiatePayment('bundle',state.examCode,()=>{
        Object.keys(state.slots).forEach(renderSlotBody);
        renderPayBar();
      },$('payAllBtn'));
    });
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const search=$('examSearch');
  if(search) search.addEventListener('input',()=>renderExamResults(search.value));
  const skipBtn=$('skipExamBtn');
  if(skipBtn) skipBtn.addEventListener('click',skipExam);
  const changeBtn=$('changeExamBtn');
  if(changeBtn) changeBtn.addEventListener('click',changeExam);
  renderPopularExams();
  renderExamsByCategory();
  renderExamDirectory();
  renderExamCalendar();
  renderNoticeTicker();
  renderNoticeBoard();
  renderResultsPanel();

  // Shareable deep link, e.g. index.html?exam=IBPS-PO — drops a visitor
  // straight into Step 2 for that exam instead of making them search.
  // Meant for WhatsApp/creator links pointing at one specific exam.
  const deepLinkCode=new URLSearchParams(location.search).get('exam');
  if(deepLinkCode&&APPLICATIONS.some(a=>a.code===deepLinkCode)) selectExam(deepLinkCode);
});
