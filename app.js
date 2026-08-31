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
      themeBtn.setAttribute('aria-pressed',root.getAttribute('data-theme')==='dark'?'true':'false');
      themeBtn.addEventListener('click',()=>{
        const now=root.getAttribute('data-theme')==='dark'?'light':'dark';
        root.setAttribute('data-theme',now);
        localStorage.setItem('gb-theme',now);
        themeBtn.setAttribute('aria-pressed',now==='dark'?'true':'false');
      });
    }
  });
})();

function $(id){return document.getElementById(id)}

/* ===== language: English + Hindi =====
   Scoped deliberately to these two for now — the Constitution's 8th
   Schedule actually lists 22 languages, not 8, and machine-translating all
   of GovBabu's researched exam data (pay scales, eligibility, application
   steps) into many languages at once risks introducing translation errors,
   which undermines the accuracy this whole site is built on. English and
   Hindi get done properly; more languages are a later, separately-verified
   batch, not a bigger flag added here. Every render function falls back to
   English wherever a Hindi translation doesn't exist yet, so nothing ever
   shows blank or broken. */
const LANG_STRINGS={
  en:{
    'nav.home':'Home','nav.browseExams':'Browse Exams','nav.calendar':'Calendar','nav.about':'About','nav.contact':'Contact',
    'home.title':'Everything you need to apply for a government exam',
    'home.lead':'Seats, eligibility, reservation policy and how to apply — researched and sourced for every exam. Then upload your photo &amp; signature and get them resized to the exact spec, ready to submit.',
    'home.ctaBrowse':'Browse Exams','home.ctaCalendar':'View Exam Calendar',
    'home.free':'🎉 Free for every aspirant right now — no login, no payment.',
    'home.privacy':'🔒 Processed entirely in your browser — your photo and signature never leave your device.',
    'home.whichExam':'Which exam are you applying for?',
    'home.browseAll':'Browse all exams →','home.calendar':'Calendar →',
    'home.skip':'Skip — I just need to resize a file →',
    'home.changeExam':'← Change exam','home.startOver':'← Start over',
    'home.searchPlaceholder':'Search e.g. SSC CGL, IBPS PO, UPSC…',
    'home.disclaimer':'GovBabu is independent and not affiliated with UPSC, SSC, IBPS, Railway, BPSC or any government body. Requirement details are compiled from official notifications where available — always confirm against the current official notification before submitting.',
    'step.exam':'Exam','step.analysis':'Check out our analysis','step.upload':'Upload','step.download':'Download',
    'sidebar.noticeBoard':'📌 Notice Board','sidebar.results':'🏆 Results',
    'detail.postsPay':'💰 Posts &amp; Pay','detail.eligibility':'🎓 Eligibility','detail.promotion':'📈 Promotion',
    'detail.howToApply':'📝 How to Apply','detail.otherDocs':'📄 Other Documents Required',
    'detail.age':'Age','detail.relaxation':'Relaxation','detail.qualification':'Qualification',
    'detail.applyOnOfficial':'Apply on the official site ↗','detail.officialNotice':'Official Source ↗',
    'detail.applicationsOpen':'Applications open','detail.applicationsClosed':'Applications closed',
    'detail.beforeYouStart':'Before you start','detail.commonMistakes':'⚠ Common mistakes to avoid','detail.correctionWindow':'Correction window',
    'detail.missing':'Posts, salary &amp; promotion details aren\'t compiled yet for this exam — check the official notification above.',
    'detail.noSpecificExam':'No specific exam selected — set your own target size below.',
    'detail.dataNoteToggle':'Data note — tap to see details',
    'overview.lastDate':'Last Date','overview.vacancies':'Vacancies','detail.lastUpdatedPrefix':'🕒 Last updated:',
    'status.open':'Open','status.closing':'Closing Soon','status.closed':'Closed','status.expected':'Expected',
    'card.lastDate':'Last date:','card.closedOn':'Closed:','card.vacancies':'vacancies','card.viewDetails':'View Details',
    'card.knowMore':'Know more','card.lastCycle':'(last cycle)','card.deadlineLabel':'Application deadline',
    'card.expectedLabel':'Expected','card.closedPrefix':'Closed',
    'cal.eyebrow':'📅 Exam Calendar','cal.title':'Never miss an application deadline',
    'cal.lead':'Track government exams, application deadlines, vacancies and salary — all in one place.',
    'cal.filterAll':'All','cal.filterOpen':'Open','cal.filterClosing':'Closing Soon','cal.filterClosed':'Closed',
    'cal.chipExams':'Exams','cal.chipOpen':'Open','cal.chipClosing':'Closing Soon',
    'cal.noneInWindow':'No exams in this window right now — see','cal.allExamsLink':'all exams',
    'exams.title':'Browse all exams',
    'exams.lead':'Not sure of the exact name? Every exam GovBabu covers, grouped by field — pick yours to see seats, pay, eligibility, reservation policy, how to apply, and get your documents ready.',
    'exams.searchLabel':'Search exams','exams.searchPlaceholder':'Search e.g. SSC, Railway, Banking…',
    'notice.noneOpen':'No open applications right now — check back soon.','notice.officialNotification':'Official notification ↗',
    'results.viewResult':'View result ↗','results.notDeclared':'Not declared yet',
    'home.popularLabel':'Most applied-for right now',
    'search.noMatch':'No match — try a shorter search, or','search.skipInstead':'skip and resize a file',
    'slot.photo':'Photo','slot.signature':'Signature',
    'slot.moreToolsHint':'Most exams want photo &amp; signature as JPG — that\'s covered above. Need something else for another document?',
    'slot.toolOtherDoc':'📄 Other document (PDF)','slot.toolPdfToJpg':'🖼️ PDF → JPG (first page)','slot.toolPdfCompress':'🗜️ Shrink a PDF',
    'slot.download':'Download','slot.payToDownload':'Pay once below to download every file',
    'slot.processBatch':'Process a different batch','slot.choosePhotos':'📷 Click to choose one or more photos',
    'slot.targetKb':'Target KB','slot.targetKbHint':'Not sure what to enter? Photos are usually 20–50 KB, signatures 10–20 KB — check your exam\'s notice for the exact number.',
    'slot.process':'Process','slot.chooseImageToConvert':'Click to choose an image to convert','slot.choosePdf':'Click to choose a PDF',
    'slot.chooseYour':'Click to choose your','slot.tryAnother':'Try another file',
    'slot.processing':'Processing…','slot.converting':'Converting…','slot.extracting':'Extracting page 1…','slot.compressing':'Compressing…',
    'slot.closestPossible':'⚠️ Closest possible:','slot.ready':'✅ Ready:',
    'slot.payUnlock':'Pay ₹29 &amp; Unlock Downloads','slot.payWait':'Pay below',
    'err.notImage':'That doesn\'t look like an image — choose a JPG, PNG or WebP file.',
    'err.tooLargeImage':'That file is too large (max 15 MB) — try a smaller photo.',
    'err.notPdf':'That doesn\'t look like a PDF — choose a .pdf file.',
    'err.tooLargePdf':'That file is too large (max 15 MB) — try a smaller PDF.',
    'err.corruptedImage':'Couldn\'t read that file — it may be corrupted. Try a different photo.',
    'err.corruptedGeneric':'Couldn\'t read this file — it may be corrupted.',
    'err.corruptedConvert':'Couldn\'t convert that file — it may be corrupted. Try a different photo.',
    'err.corruptedPdfRead':'Couldn\'t read that PDF — it may be corrupted or password-protected.',
    'err.corruptedPdfProcess':'Couldn\'t process that PDF — it may be corrupted or password-protected.',
    'alert.chooseFileFirst':'Choose at least one file first.',
    'alert.chooseTarget5kb':'Choose a target of at least 5 KB.',
    'alert.choosePdfFirst':'Choose a PDF first.',
    'alert.chooseTarget20kb':'Choose a target of at least 20 KB.',
    'pay.freeNote':'🎉 Free to use right now — download each file above, no payment needed.',
    'pay.unlockedNote':'✅ Unlocked — download each file above.',
    'pay.note':'One payment unlocks every file above · instant download, no account needed',
    'pay.err.couldNotStart':'Could not start payment.','pay.err.verificationFailed':'Verification failed.',
    'pay.err.notVerified':'Payment could not be verified.','pay.err.notStarted':'Payment could not be started.',
    'footer.tagline':'Government exams, applications and documents — made simpler.',
    'footer.copyright':'© 2026 GovBabu. All Rights Reserved.',
    'footer.explore':'Explore','footer.company':'Company','footer.connect':'Connect','footer.telegram':'Telegram',
    'footer.privacyPolicy':'Privacy Policy','footer.termsOfUse':'Terms of Use','footer.disclaimerLink':'Disclaimer',
    'footer.disclaimerText':'GovBabu is an independent tool and is not affiliated with UPSC, SSC, IBPS, Railway, BPSC or any government body.',
    'about.eyebrow':'Why GovBabu','about.h1':'Government exams are complicated. Understanding them shouldn\'t be.',
    'about.lead':'GovBabu helps aspirants discover the right exam, understand eligibility, prepare application documents, apply correctly and stay updated — all in one place.',
    'about.ctaExploreTools':'Explore Tools',
    'about.problemTag':'The problem',
    'about.problemHead':'A small mistake can undo months — sometimes years — of preparation.',
    'about.problem1':'Months, sometimes years, of preparation undone by one eligibility clause nobody explained in plain language',
    'about.problem2':'An application rejected on a technicality, with no chance to fix it before the deadline',
    'about.problem3':'Vacancies, cut-offs and dates scattered across a dozen websites that don\'t even agree with each other',
    'about.problem4':'No single place to track every deadline and correction window — so one gets missed',
    'about.problem5':'Aspirants paying a cyber café or an agent just to get a government form filled correctly',
    'about.problemClose':'None of this is about how hard an aspirant worked. It\'s about a process that makes it easy to lose everything over a rule, a form or a deadline — after months of real effort. That\'s the part GovBabu exists to fix.',
    'about.missionTag':'Our mission',
    'about.missionStatement':'Make every government-exam application easier to understand — and harder to get wrong.',
    'about.missionBody':'That\'s the whole idea. Not a bigger notification, not more information to sift through — just the important parts, explained plainly, with the tools to act on them.',
    'about.journeyTag':'How GovBabu helps','about.journeyHead':'From Discover to Track',
    'about.journey1Title':'Discover',
    'about.journey1Desc':'Find relevant government exams and job opportunities across India, in one place instead of a dozen scattered sites.',
    'about.journey2Title':'Understand',
    'about.journey2Desc':'See vacancies, eligibility, age limits, fees, important dates and the selection process — explained in plain language, not notification-speak.',
    'about.journey3Title':'Check',
    'about.journey3Desc':'Understand whether an exam actually fits your profile, based on the official eligibility rules — not a guess.',
    'about.journey4Title':'Prepare',
    'about.journey4Desc':'Get your photograph, signature and other required documents ready to the exact specification, right in your browser.',
    'about.journey5Title':'Apply',
    'about.journey5Desc':'Follow a clear, step-by-step guide through the application — then submit it on the official portal, where it belongs.',
    'about.journey6Title':'Track',
    'about.journey6Desc':'Keep an eye on deadlines, correction windows, admit cards and results, so nothing slips past you.',
    'about.diffTag':'Our philosophy','about.diffHead':'What makes GovBabu different',
    'about.diff1Title':'Simple',
    'about.diff1Desc':'Government notifications can run into dozens of pages. Our job is to pull out what actually matters and say it in plain language.',
    'about.diff2Title':'Source-first',
    'about.diff2Desc':'Important details should be traceable back to the official notification wherever one exists — not just repeated from another website.',
    'about.diff3Title':'Useful',
    'about.diff3Desc':'We don\'t stop at explaining a rule. We try to help you act on it — check a document, follow a step, catch a deadline.',
    'about.diff4Title':'Independent',
    'about.diff4Desc':'GovBabu isn\'t a government body, an exam-conducting authority or a coaching institute. It\'s a platform built for aspirants.',
    'about.diff5Title':'Privacy-conscious',
    'about.diff5Desc':'Document tools are designed to avoid unnecessary uploads — most processing happens right in your browser, on your own device.',
    'about.originTag':'How GovBabu got here','about.originHead':'From a document problem to a bigger one',
    'about.origin1Label':'Where we started',
    'about.origin1Body':'Why is preparing a photo, signature or PDF for a government form so unnecessarily difficult?',
    'about.origin2Label':'What we found',
    'about.origin2Body':'The paperwork was never the real problem. The whole application journey is hard to understand — vacancies, eligibility, dates and steps, scattered across sources that don\'t always agree.',
    'about.origin3Label':'Where we\'re going',
    'about.origin3Body':'Make the entire journey easier to get through — from discovering the right exam to submitting the application correctly.',
    'about.coverageTag':'Coverage','about.coverageHead':'Built for aspirants across India',
    'about.coverageLead':'GovBabu is being built to eventually cover government exams across every state and every major recruitment body. Here\'s honestly where that stands today.',
    'about.coverageTodayTitle':'✅ What GovBabu covers today',
    'about.coverageToday1':'National-level exams (SSC, Railway, Banking)',
    'about.coverageToday2':'Select state PSC and state-recruitment exams',
    'about.coverageToday3':'Defence, Teaching and Police recruitment',
    'about.coverageToday4':'See the current, full list on <a href="exams.html">Browse Exams</a>.',
    'about.coverageNextTitle':'🚧 What we\'re building toward',
    'about.coverageNext1':'Deeper coverage across every state, not just the largest ones',
    'about.coverageNext2':'More recruitment boards, including smaller but high-value exams',
    'about.coverageNext3':'Richer per-exam guidance as coverage grows',
    'about.sourcedTag':'Our approach',
    'about.sourcedHead':'Sourced, not guessed.',
    'about.sourcedBody1':'Government recruitment information changes constantly. Notifications get revised. Different websites sometimes publish different numbers for the very same exam.',
    'about.sourcedBody2':'We try to trace important details back to the official notification or official source wherever one is available, and make that source easy to find and check for yourself.',
    'about.sourcedCallout':'When something can\'t be verified, or sources conflict, we say so — instead of quietly picking one and moving on.',
    'about.privacyHead':'🔒 Your documents are yours',
    'about.privacyBody':'Application documents are sensitive. GovBabu\'s photo, signature and PDF tools are built so that everyday tasks — resizing a photo, checking a signature against a spec — can happen directly in your browser, on your own device, instead of requiring an upload to a server first.',
    'about.freeHead':'🎉 Free to use',
    'about.freeBody':'GovBabu is currently free for every aspirant — no login, no payment required. We\'re building this with feedback from aspirants like you. If paid features are ever introduced, the plan is to limit them to document-preparation tools — core exam information stays free.',
    'about.roadmapTag':'Roadmap','about.roadmapHead':'What we\'re building next',
    'about.roadmapIntro':'Here\'s the direction we\'re headed in — not all of this exists yet.',
    'about.roadmap1Title':'More exams',
    'about.roadmap1Desc':' — expanding coverage across more states and major recruitment bodies.',
    'about.roadmap2Title':'Better eligibility tools',
    'about.roadmap2Desc':' — an easier way to understand which exams you may actually be eligible for.',
    'about.roadmap3Title':'Smarter application guidance',
    'about.roadmap3Desc':' — clearer, more specific steps for confusing government application processes.',
    'about.roadmap4Title':'More document tools',
    'about.roadmap4Desc':' — exam-specific photo, signature and PDF preparation, built around what aspirants actually need.',
    'about.roadmap5Title':'Alerts &amp; tracking',
    'about.roadmap5Desc':' — help staying on top of deadlines, correction windows, admit cards and results.',
    'about.roadmap6Title':'Personalized exam discovery',
    'about.roadmap6Desc':' — eventually, exam suggestions based on your own profile, not just a static list.',
    'about.audienceHead':'Built for the person behind the application.',
    'about.audienceIntro':'Whether you\'re:',
    'about.audience1':'Applying for your first government exam',
    'about.audience2':'Applying to more than one exam at the same time',
    'about.audience3':'Not sure whether you\'re even eligible',
    'about.audience4':'Confused by photo, signature or document requirements',
    'about.audience5':'Tired of checking five different websites for one answer',
    'about.audienceClose':'…GovBabu is built to be the place that makes it easier, not one more site to check.',
    'about.finalHead':'Your next application starts here.',
    'about.finalLead':'Understand the exam. Check the requirements. Get your documents ready. Apply with confidence.',
    'about.suggestLead':'Missing a tool or exam? ',
    'about.ctaBrowse':'Browse Exams',
    'about.ctaGetStarted':'Get Started','about.ctaTelegram':'Tell us on Telegram',
    'contact.eyebrow':'💬 Contact Us','contact.h1':'Tell us what\'s missing',
    'contact.lead':'Found a data error, have an exam we should add, or just want to say something? Send it below — it opens a pre-addressed Gmail draft so it lands straight in our inbox. In a hurry? Message us on <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">Telegram</a> for a faster reply.',
    'contact.helpLabel':'What can we help with?',
    'contact.opt1':'Report an error','contact.opt2':'Request an exam','contact.opt3':'Suggest a feature','contact.opt4':'Website issue','contact.opt5':'General feedback',
    'contact.nameLabel':'Your name (optional)','contact.emailLabel':'Your email (optional, so we can reply)',
    'contact.messageLabel':'Your message','contact.messagePlaceholder':'A data error to fix, an exam to add, or anything else...',
    'contact.submitBtn':'Open Email with Feedback ↗',
    'contact.successMsg':'✅ Your email draft is open in a new tab — hit Send there to submit your feedback.',
    'contact.note1':'This opens Gmail with your message pre-filled and addressed to us. We usually reply within 2–3 days.',
    'contact.note2':'Gmail not opening, or you use a different email app? Write to us directly at <a href="mailto:manas.m.kher@gmail.com">manas.m.kher@gmail.com</a>.',
    'contact.faqHead':'Frequently asked questions',
    'contact.faq1q':'Is GovBabu free to use?',
    'contact.faq1a':'Yes — everything on GovBabu is free right now for every aspirant, no login and no payment. This is guaranteed for at least the first two months after launch. A small one-time fee may return later for the document-prep tools only; exam information will always stay free.',
    'contact.faq2q':'Is GovBabu an official government website?',
    'contact.faq2a':'No. GovBabu is an independent, privately-run tool and is not affiliated with UPSC, SSC, IBPS, Railway, BPSC or any government body. We research and link to each exam\'s official notification so you can always verify details on the source yourself.',
    'contact.faq3q':'Is my photo, signature or personal data uploaded anywhere?',
    'contact.faq3a':'Your files are processed directly in your browser — photo and signature resizing, PDF conversion and compression all happen on your own device — and are not uploaded to GovBabu\'s servers for processing.',
    'contact.faq4q':'How accurate is the exam information?',
    'contact.faq4a':'Every seat count, eligibility rule, pay level and deadline is researched against the official notification wherever one is available, with sources cited. Where something can\'t be confirmed or sources disagree, we say so instead of guessing — but application windows and dates change often, so always cross-check the official notification linked on each exam\'s page before you submit anything.',
    'contact.faq5q':'My exam isn\'t listed — can you add it?',
    'contact.faq5a':'Most likely, yes. We\'re actively expanding coverage. Use the feedback form above to tell us which exam you need, and we\'ll research and add it.',
    'contact.faq6q':'I found an error in the exam details — what do I do?',
    'contact.faq6a':'Please report it using the feedback form above with as much detail as you can (exam name, the incorrect field, and a source if you have one). We treat data corrections as high priority.',
    'contact.faq7q':'Do I need to create an account to use GovBabu?',
    'contact.faq7a':'No. There\'s no sign-up or login required for any part of the site.',
    'contact.faq8q':'Where does GovBabu get its exam information from?',
    'contact.faq8a':'Primarily from each exam\'s official notification — the PDF or page published by the conducting body (UPSC, SSC, IBPS, Railway, a state PSC, etc.). Where a detail can\'t be confirmed against a primary source, we say so in the exam\'s data note instead of guessing, and cite secondary sources when they\'re used.',
    'contact.faq9q':'How often is exam information updated?',
    'contact.faq9a':'Whenever we research or re-verify an exam, not on a fixed daily schedule. Application windows, dates and vacancy counts change often on the official side, so always cross-check the linked official notification before you submit anything.',
    'contact.faq10q':'Which exams does GovBabu cover?',
    'contact.faq10a':'SSC, Railway (RRB), Banking (IBPS/SBI/RBI), UPSC, State PSCs, Defence (NDA/CDS/Agniveer), Teaching and Police exams — see the full, current list on <a href="exams.html">Browse Exams</a>. We\'re actively adding more.',
    'privacy.eyebrow':'🔒 Privacy Policy','privacy.h1':'Your data, plainly explained',
    'privacy.lead':'GovBabu is built to need as little of your data as possible. This page explains exactly what happens to what you give it.',
    'privacy.s1h':'Photo, signature and document files',
    'privacy.s1p':'Every photo, signature and PDF tool on GovBabu runs entirely in your browser using your device\'s own processing power (the HTML5 Canvas API and, for PDF tools, a library loaded from a public CDN). Your files are resized, compressed or converted locally on your device and are never uploaded to GovBabu\'s servers — because for these tools, GovBabu does not operate a server that receives them at all.',
    'privacy.s2h':'The feedback form',
    'privacy.s2p':'The form on our <a href="contact.html">Contact page</a> does not submit to a GovBabu server either. When you press the button, it opens a pre-filled Gmail compose window in a new tab, addressed to us — the message is sent directly from your own email account when you hit Send there. If you don\'t complete that step, nothing is sent. Name and email on that form are optional and used only to reply to you.',
    'privacy.s3h':'What we store in your browser',
    'privacy.s3p':'Two small preferences — your chosen language and light/dark theme — are saved using your browser\'s local storage so the site remembers them on your next visit. This stays on your device; it is not sent to us or to any third party.',
    'privacy.s4h':'Payments',
    'privacy.s4p':'GovBabu\'s document tools are currently free for every aspirant, with no payment required. If a paid unlock is introduced in the future, payment would be handled by a third-party payment processor (Razorpay) — card and payment details would go directly to that processor under its own privacy terms, not to GovBabu.',
    'privacy.s5h':'Cookies and analytics',
    'privacy.s5p':'GovBabu does not run third-party analytics or advertising trackers, and does not use cookies for tracking.',
    'privacy.s6h':'Accounts',
    'privacy.s6p':'There is no sign-up or login anywhere on GovBabu, so we don\'t hold account profiles, passwords or usage histories tied to an identity.',
    'privacy.s7h':'Questions about this policy',
    'privacy.s7p':'Write to us via the <a href="contact.html">Contact page</a> or directly at <a href="mailto:manas.m.kher@gmail.com">manas.m.kher@gmail.com</a>.',
    'privacy.updated':'This policy describes GovBabu\'s actual technical implementation as of the date below, and will be updated if that implementation changes. Last updated: 28 Aug 2026.',
    'terms.eyebrow':'📄 Terms of Use','terms.h1':'The ground rules',
    'terms.lead':'Straightforward terms for using GovBabu — no fine-print surprises.',
    'terms.s1h':'What GovBabu is',
    'terms.s1p':'GovBabu is an independent, privately-run information and document-preparation tool for Indian government exam aspirants. It is not a government website and is not affiliated with UPSC, SSC, IBPS, Railway, BPSC or any government body — see our <a href="disclaimer.html">Disclaimer</a> for more on this.',
    'terms.s2h':'Using the site',
    'terms.s2p':'You\'re free to use GovBabu to look up exam information and to prepare your photo, signature and documents. No account or login is required. By using the site, you agree to these terms and to our <a href="privacy.html">Privacy Policy</a>.',
    'terms.s3h':'Accuracy of information',
    'terms.s3p':'We research exam details against official notifications where available and try to flag anything we couldn\'t independently confirm. Even so, application windows, dates, fees and vacancy counts change on the official side, sometimes without much notice. Information on GovBabu is provided for convenience and is not a substitute for the official notification — always verify against the official source (linked on each exam\'s page) before you rely on it, especially before submitting a form or making a payment elsewhere.',
    'terms.s4h':'No liability for decisions made using this site',
    'terms.s4p':'GovBabu is provided "as is." We do our best to keep information current and correct, but we can\'t guarantee it, and we aren\'t liable for losses arising from decisions made based on content here — including missed deadlines, rejected applications, or documents that don\'t meet a spec that changed after our last check.',
    'terms.s5h':'Document tools',
    'terms.s5p':'The photo/signature resize and PDF tools run in your own browser (see our <a href="privacy.html">Privacy Policy</a> for exactly how). We aim for accuracy against each exam\'s published specification, but the final responsibility for confirming your documents meet the current official requirement rests with you.',
    'terms.s6h':'Pricing',
    'terms.s6p':'GovBabu\'s tools are currently free for every aspirant. We may introduce a small fee for document-preparation tools in the future — never for exam information itself — and would clearly communicate any such change before it applies to you.',
    'terms.s7h':'Fair use',
    'terms.s7p':'Please don\'t scrape, automate abusive traffic against, or attempt to disrupt GovBabu. Content on the site may be shared with attribution; please don\'t republish our researched exam data as your own.',
    'terms.s8h':'Changes to these terms',
    'terms.s8p':'We may update these terms as GovBabu evolves. Continued use of the site after a change means you accept the updated terms.',
    'terms.s9h':'Questions',
    'terms.s9p':'Reach us via the <a href="contact.html">Contact page</a> or at <a href="mailto:manas.m.kher@gmail.com">manas.m.kher@gmail.com</a>.',
    'terms.updated':'Last updated: 28 Aug 2026.',
    'disclaimer.eyebrow':'⚠️ Disclaimer','disclaimer.h1':'We\'re independent — please verify',
    'disclaimer.lead':'The most important thing to know about GovBabu, in one place.',
    'disclaimer.s1h':'Not a government website',
    'disclaimer.s1p':'GovBabu is an independent, privately-run platform built to help aspirants navigate government exams more easily. It is <strong>not affiliated with, endorsed by, or operated by</strong> UPSC, SSC, IBPS, Railway (RRB), BPSC, any state PSC, or any other government body or ministry.',
    'disclaimer.s2h':'Information accuracy',
    'disclaimer.s2p':'Exam details on GovBabu — seats, eligibility, fees, dates, vacancies and how-to-apply steps — are researched against each exam\'s official notification wherever one is reachable, and we flag it plainly when something couldn\'t be independently confirmed. Application windows, dates and other details can and do change on the official side, sometimes with little notice. Always cross-check against the official notification (linked on every exam\'s page) before you rely on any detail here, especially before submitting an application or payment.',
    'disclaimer.s3h':'No guarantee of outcomes',
    'disclaimer.s3p':'Using GovBabu does not guarantee eligibility, selection, or any particular exam outcome. Final eligibility and selection are decided solely by the conducting body under its own rules.',
    'disclaimer.s4h':'External links',
    'disclaimer.s4p':'GovBabu links out to official notifications, application portals and result pages. We aren\'t responsible for the content, availability or accuracy of those external, third-party sites.',
    'disclaimer.s5h':'Document tools',
    'disclaimer.s5p':'Photo/signature resizing and PDF tools are provided to help you meet a published specification, but you\'re responsible for confirming the final files meet the current official requirement before you submit them.',
    'disclaimer.s6h':'Questions',
    'disclaimer.s6p':'If something here looks wrong or out of date, please tell us via the <a href="contact.html">Contact page</a> — data corrections are treated as high priority.',
    'disclaimer.updated':'Last updated: 28 Aug 2026.'
  },
  hi:{
    'nav.home':'होम','nav.browseExams':'सभी परीक्षाएं','nav.calendar':'परीक्षा कैलेंडर','nav.about':'हमारे बारे में','nav.contact':'संपर्क करें',
    'home.title':'सरकारी परीक्षा में आवेदन के लिए जो कुछ भी चाहिए',
    'home.lead':'सीटें, पात्रता, आरक्षण नीति और आवेदन कैसे करें — हर परीक्षा के लिए शोध और स्रोत सहित। फिर अपनी फोटो और हस्ताक्षर अपलोड करें, सही साइज़ में तैयार, जमा करने के लिए तैयार।',
    'home.ctaBrowse':'परीक्षाएं देखें','home.ctaCalendar':'परीक्षा कैलेंडर देखें',
    'home.free':'🎉 अभी सभी अभ्यर्थियों के लिए मुफ़्त — कोई लॉगिन नहीं, कोई भुगतान नहीं।',
    'home.privacy':'🔒 पूरी तरह आपके ब्राउज़र में प्रोसेस होता है — आपकी फोटो और हस्ताक्षर कभी आपके डिवाइस से बाहर नहीं जाते।',
    'home.whichExam':'आप किस परीक्षा के लिए आवेदन कर रहे हैं?',
    'home.browseAll':'सभी परीक्षाएं देखें →','home.calendar':'कैलेंडर →',
    'home.skip':'छोड़ें — मुझे बस फ़ाइल का साइज़ बदलना है →',
    'home.changeExam':'← परीक्षा बदलें','home.startOver':'← फिर से शुरू करें',
    'home.searchPlaceholder':'खोजें जैसे SSC CGL, IBPS PO, UPSC…',
    'home.disclaimer':'GovBabu एक स्वतंत्र सेवा है और UPSC, SSC, IBPS, रेलवे, BPSC या किसी भी सरकारी संस्था से संबद्ध नहीं है। विवरण जहां उपलब्ध हों वहां आधिकारिक अधिसूचनाओं से संकलित किए गए हैं — सबमिट करने से पहले हमेशा नवीनतम आधिकारिक अधिसूचना से पुष्टि करें।',
    'step.exam':'परीक्षा','step.analysis':'हमारा विश्लेषण देखें','step.upload':'अपलोड','step.download':'डाउनलोड',
    'sidebar.noticeBoard':'📌 सूचना पट्ट','sidebar.results':'🏆 परिणाम',
    'detail.postsPay':'💰 पद और वेतन','detail.eligibility':'🎓 पात्रता','detail.promotion':'📈 पदोन्नति',
    'detail.howToApply':'📝 आवेदन कैसे करें','detail.otherDocs':'📄 अन्य आवश्यक दस्तावेज़',
    'detail.age':'आयु','detail.relaxation':'छूट','detail.qualification':'योग्यता',
    'detail.applyOnOfficial':'आधिकारिक साइट पर आवेदन करें ↗','detail.officialNotice':'आधिकारिक स्रोत ↗',
    'detail.applicationsOpen':'आवेदन खुले हैं','detail.applicationsClosed':'आवेदन बंद हैं',
    'detail.beforeYouStart':'शुरू करने से पहले','detail.commonMistakes':'⚠ बचने योग्य सामान्य गलतियां','detail.correctionWindow':'सुधार विंडो',
    'detail.missing':'इस परीक्षा के लिए पद, वेतन और पदोन्नति का विवरण अभी संकलित नहीं हुआ है — ऊपर दी गई आधिकारिक अधिसूचना देखें।',
    'detail.noSpecificExam':'कोई विशेष परीक्षा चयनित नहीं है — नीचे अपना लक्ष्य आकार निर्धारित करें।',
    'detail.dataNoteToggle':'डेटा नोट — विवरण देखने के लिए टैप करें',
    'overview.lastDate':'अंतिम तिथि','overview.vacancies':'रिक्तियां','detail.lastUpdatedPrefix':'🕒 आखिरी बार अपडेट:',
    'status.open':'खुला','status.closing':'जल्द बंद होगा','status.closed':'बंद','status.expected':'अपेक्षित',
    'card.lastDate':'अंतिम तिथि:','card.closedOn':'बंद हुआ:','card.vacancies':'रिक्तियां','card.viewDetails':'विवरण देखें',
    'card.knowMore':'अधिक जानें','card.lastCycle':'(पिछला चक्र)','card.deadlineLabel':'आवेदन की अंतिम तिथि',
    'card.expectedLabel':'अपेक्षित','card.closedPrefix':'बंद',
    'cal.eyebrow':'📅 परीक्षा कैलेंडर','cal.title':'आवेदन की समय सीमा कभी न चूकें',
    'cal.lead':'सरकारी परीक्षाएं, आवेदन की समय सीमा, रिक्तियां और वेतन — सब एक ही जगह देखें।',
    'cal.filterAll':'सभी','cal.filterOpen':'खुला','cal.filterClosing':'जल्द बंद होगा','cal.filterClosed':'बंद',
    'cal.chipExams':'परीक्षाएं','cal.chipOpen':'खुला','cal.chipClosing':'जल्द बंद होगा',
    'cal.noneInWindow':'इस अवधि में अभी कोई परीक्षा नहीं है — देखें','cal.allExamsLink':'सभी परीक्षाएं',
    'exams.title':'सभी परीक्षाएं देखें',
    'exams.lead':'सही नाम याद नहीं? GovBabu की हर परीक्षा क्षेत्र अनुसार यहां है — अपनी परीक्षा चुनें और सीटें, वेतन, पात्रता, आरक्षण नीति, आवेदन प्रक्रिया देखें, और अपने दस्तावेज़ तैयार करें।',
    'exams.searchLabel':'परीक्षा खोजें','exams.searchPlaceholder':'खोजें जैसे SSC, रेलवे, बैंकिंग…',
    'notice.noneOpen':'अभी कोई आवेदन खुला नहीं है — बाद में देखें।','notice.officialNotification':'आधिकारिक सूचना ↗',
    'results.viewResult':'परिणाम देखें ↗','results.notDeclared':'अभी घोषित नहीं हुआ',
    'home.popularLabel':'अभी सबसे ज़्यादा आवेदन की जा रही परीक्षाएं',
    'search.noMatch':'कोई मेल नहीं मिला — छोटा खोजशब्द आज़माएं, या','search.skipInstead':'सीधे फ़ाइल का साइज़ बदलें',
    'slot.photo':'फोटो','slot.signature':'हस्ताक्षर',
    'slot.moreToolsHint':'अधिकतर परीक्षाओं के लिए फोटो और हस्ताक्षर JPG में चाहिए — वह ऊपर हो चुका है। किसी अन्य दस्तावेज़ के लिए कुछ और चाहिए?',
    'slot.toolOtherDoc':'📄 अन्य दस्तावेज़ (PDF)','slot.toolPdfToJpg':'🖼️ PDF → JPG (पहला पेज)','slot.toolPdfCompress':'🗜️ PDF छोटा करें',
    'slot.download':'डाउनलोड','slot.payToDownload':'हर फ़ाइल डाउनलोड करने के लिए नीचे एक बार भुगतान करें',
    'slot.processBatch':'अलग बैच प्रोसेस करें','slot.choosePhotos':'📷 एक या अधिक फोटो चुनने के लिए क्लिक करें',
    'slot.targetKb':'लक्ष्य KB','slot.targetKbHint':'समझ नहीं आ रहा क्या डालें? आमतौर पर फोटो 20–50 KB और हस्ताक्षर 10–20 KB होते हैं — सटीक संख्या के लिए अपनी परीक्षा की सूचना देखें।',
    'slot.process':'प्रोसेस करें','slot.chooseImageToConvert':'बदलने के लिए एक इमेज चुनने के लिए क्लिक करें','slot.choosePdf':'PDF चुनने के लिए क्लिक करें',
    'slot.chooseYour':'चुनने के लिए क्लिक करें','slot.tryAnother':'दूसरी फ़ाइल आज़माएं',
    'slot.processing':'प्रोसेस हो रहा है…','slot.converting':'बदला जा रहा है…','slot.extracting':'पहला पेज निकाला जा रहा है…','slot.compressing':'छोटा किया जा रहा है…',
    'slot.closestPossible':'⚠️ नज़दीकी संभव साइज़:','slot.ready':'✅ तैयार:',
    'slot.payUnlock':'₹29 भुगतान करें और डाउनलोड अनलॉक करें','slot.payWait':'नीचे भुगतान करें',
    'err.notImage':'यह इमेज नहीं लग रही — JPG, PNG या WebP फ़ाइल चुनें।',
    'err.tooLargeImage':'यह फ़ाइल बहुत बड़ी है (अधिकतम 15 MB) — छोटी फोटो आज़माएं।',
    'err.notPdf':'यह PDF नहीं लग रही — .pdf फ़ाइल चुनें।',
    'err.tooLargePdf':'यह फ़ाइल बहुत बड़ी है (अधिकतम 15 MB) — छोटी PDF आज़माएं।',
    'err.corruptedImage':'यह फ़ाइल पढ़ी नहीं जा सकी — शायद यह खराब है। कोई दूसरी फोटो आज़माएं।',
    'err.corruptedGeneric':'यह फ़ाइल पढ़ी नहीं जा सकी — शायद यह खराब है।',
    'err.corruptedConvert':'इस फ़ाइल को बदला नहीं जा सका — शायद यह खराब है। कोई दूसरी फोटो आज़माएं।',
    'err.corruptedPdfRead':'यह PDF पढ़ी नहीं जा सकी — शायद यह खराब है या पासवर्ड-सुरक्षित है।',
    'err.corruptedPdfProcess':'इस PDF को प्रोसेस नहीं किया जा सका — शायद यह खराब है या पासवर्ड-सुरक्षित है।',
    'alert.chooseFileFirst':'पहले कम से कम एक फ़ाइल चुनें।',
    'alert.chooseTarget5kb':'कम से कम 5 KB का टारगेट चुनें।',
    'alert.choosePdfFirst':'पहले एक PDF चुनें।',
    'alert.chooseTarget20kb':'कम से कम 20 KB का टारगेट चुनें।',
    'pay.freeNote':'🎉 अभी उपयोग करना मुफ़्त है — बिना भुगतान के ऊपर से हर फ़ाइल डाउनलोड करें।',
    'pay.unlockedNote':'✅ अनलॉक हो गया — ऊपर से हर फ़ाइल डाउनलोड करें।',
    'pay.note':'एक भुगतान से ऊपर की सभी फ़ाइलें अनलॉक होती हैं · तुरंत डाउनलोड, खाते की ज़रूरत नहीं',
    'pay.err.couldNotStart':'भुगतान शुरू नहीं हो सका।','pay.err.verificationFailed':'सत्यापन विफल रहा।',
    'pay.err.notVerified':'भुगतान सत्यापित नहीं हो सका।','pay.err.notStarted':'भुगतान शुरू नहीं हो सका।',
    'footer.tagline':'सरकारी परीक्षाएं, आवेदन और दस्तावेज़ — अब आसान।',
    'footer.copyright':'© 2026 GovBabu. सर्वाधिकार सुरक्षित।',
    'footer.explore':'एक्सप्लोर करें','footer.company':'कंपनी','footer.connect':'जुड़ें','footer.telegram':'टेलीग्राम',
    'footer.privacyPolicy':'गोपनीयता नीति','footer.termsOfUse':'उपयोग की शर्तें','footer.disclaimerLink':'अस्वीकरण',
    'footer.disclaimerText':'GovBabu एक स्वतंत्र सेवा है और UPSC, SSC, IBPS, रेलवे, BPSC या किसी भी सरकारी संस्था से संबद्ध नहीं है।',
    'about.eyebrow':'GovBabu क्यों','about.h1':'सरकारी परीक्षाएं वैसे ही मुश्किल हैं। इन्हें समझना मुश्किल नहीं होना चाहिए।',
    'about.lead':'GovBabu अभ्यर्थियों को सही परीक्षा खोजने, पात्रता समझने, आवेदन के दस्तावेज़ तैयार करने, सही तरीके से आवेदन करने और अपडेट रहने में मदद करता है — सब एक ही जगह।',
    'about.ctaExploreTools':'टूल्स देखें',
    'about.problemTag':'समस्या',
    'about.problemHead':'एक छोटी सी चूक महीनों — कभी-कभी सालों — की तैयारी बर्बाद कर सकती है।',
    'about.problem1':'महीनों, कभी-कभी सालों की तैयारी — पात्रता की एक ऐसी शर्त की वजह से बर्बाद, जिसे किसी ने कभी सीधी भाषा में समझाया ही नहीं',
    'about.problem2':'एक मामूली तकनीकी गड़बड़ी की वजह से आवेदन रिजेक्ट, और डेडलाइन से पहले सुधारने का कोई मौका नहीं मिला',
    'about.problem3':'रिक्तियां, कट-ऑफ और तारीखें दर्जनों वेबसाइटों में बिखरी हुईं, जो अक्सर आपस में मेल भी नहीं खातीं',
    'about.problem4':'हर डेडलाइन और सुधार विंडो पर नज़र रखने के लिए कोई एक जगह नहीं — इसलिए कोई न कोई चूक हो ही जाती है',
    'about.problem5':'सिर्फ़ सरकारी फॉर्म सही तरीके से भरवाने के लिए किसी साइबर कैफ़े या एजेंट को पैसे देने पड़ना',
    'about.problemClose':'यह इस बात पर निर्भर नहीं करता कि अभ्यर्थी ने कितनी मेहनत की। यह इस बात पर निर्भर करता है कि प्रोसेस एक नियम, एक फॉर्म या एक डेडलाइन की वजह से महीनों की असली मेहनत के बाद भी सब कुछ गंवाना कितना आसान बना देता है। GovBabu इसी हिस्से को ठीक करने के लिए है।',
    'about.missionTag':'हमारा मकसद',
    'about.missionStatement':'हर सरकारी परीक्षा के आवेदन को समझना आसान बनाना — और गलती करना मुश्किल।',
    'about.missionBody':'बस इतना ही। कोई बड़ी अधिसूचना नहीं, छानने के लिए और जानकारी नहीं — बस ज़रूरी बातें, सीधी भाषा में, और उन पर अमल करने के लिए सही टूल्स।',
    'about.journeyTag':'GovBabu कैसे मदद करता है','about.journeyHead':'डिस्कवर से ट्रैक तक',
    'about.journey1Title':'खोजें',
    'about.journey1Desc':'पूरे भारत की सरकारी परीक्षाएं और नौकरी के मौके एक ही जगह खोजें — दर्जनों बिखरी हुई साइटों पर जाने की बजाय।',
    'about.journey2Title':'समझें',
    'about.journey2Desc':'रिक्तियां, पात्रता, आयु सीमा, फीस, ज़रूरी तारीखें और चयन प्रक्रिया — सीधी भाषा में, अधिसूचना वाली भारी भाषा में नहीं।',
    'about.journey3Title':'जांचें',
    'about.journey3Desc':'समझें कि कोई परीक्षा वाकई आपकी प्रोफ़ाइल पर फिट बैठती है या नहीं — आधिकारिक पात्रता नियमों के आधार पर, अंदाज़े से नहीं।',
    'about.journey4Title':'तैयार करें',
    'about.journey4Desc':'अपनी फोटो, हस्ताक्षर और ज़रूरी दस्तावेज़ सटीक स्पेसिफिकेशन में तैयार करें, सीधे अपने ब्राउज़र में।',
    'about.journey5Title':'आवेदन करें',
    'about.journey5Desc':'स्पष्ट, चरण-दर-चरण गाइड फॉलो करें — फिर आधिकारिक पोर्टल पर जाकर आवेदन जमा करें, जहां इसे होना चाहिए।',
    'about.journey6Title':'ट्रैक करें',
    'about.journey6Desc':'डेडलाइन, सुधार विंडो, एडमिट कार्ड और परिणाम पर नज़र रखें, ताकि कुछ भी छूट न जाए।',
    'about.diffTag':'हमारी सोच','about.diffHead':'GovBabu को अलग क्या बनाता है',
    'about.diff1Title':'सरल',
    'about.diff1Desc':'सरकारी अधिसूचनाएं दर्जनों पन्नों की हो सकती हैं। हमारा काम है असल में ज़रूरी बात निकालकर सीधी भाषा में कहना।',
    'about.diff2Title':'स्रोत-पहले',
    'about.diff2Desc':'ज़रूरी जानकारी को आधिकारिक अधिसूचना तक वापस ट्रेस किया जा सकना चाहिए — किसी और वेबसाइट से दोहराई गई बात नहीं।',
    'about.diff3Title':'उपयोगी',
    'about.diff3Desc':'हम सिर्फ़ नियम बताकर नहीं रुकते। हम आपको उस पर अमल करने में मदद करते हैं — दस्तावेज़ जांचना, कदम फॉलो करना, डेडलाइन पकड़ना।',
    'about.diff4Title':'स्वतंत्र',
    'about.diff4Desc':'GovBabu कोई सरकारी संस्था, परीक्षा-आयोजक निकाय या कोचिंग इंस्टीट्यूट नहीं है। यह अभ्यर्थियों के लिए बना एक स्वतंत्र प्लेटफ़ॉर्म है।',
    'about.diff5Title':'प्राइवेसी का ध्यान',
    'about.diff5Desc':'डॉक्यूमेंट टूल्स को अनावश्यक अपलोड से बचाने के लिए बनाया गया है — ज़्यादातर प्रोसेसिंग सीधे आपके ब्राउज़र में, आपके अपने डिवाइस पर होती है।',
    'about.originTag':'GovBabu यहां तक कैसे पहुंचा','about.originHead':'एक दस्तावेज़ की समस्या से एक बड़ी समस्या तक',
    'about.origin1Label':'जहां से शुरुआत हुई',
    'about.origin1Body':'सरकारी फॉर्म के लिए फोटो, हस्ताक्षर या PDF तैयार करना इतना मुश्किल क्यों है?',
    'about.origin2Label':'हमने क्या पाया',
    'about.origin2Body':'कागज़ात कभी असली समस्या थे ही नहीं। पूरी आवेदन प्रक्रिया समझना मुश्किल है — रिक्तियां, पात्रता, तारीखें और कदम, अलग-अलग स्रोतों में बिखरे और अक्सर एक-दूसरे से मेल न खाते।',
    'about.origin3Label':'जहां हम जा रहे हैं',
    'about.origin3Body':'पूरी यात्रा को आसान बनाना — सही परीक्षा खोजने से लेकर सही तरीके से आवेदन जमा करने तक।',
    'about.coverageTag':'कवरेज','about.coverageHead':'पूरे भारत के अभ्यर्थियों के लिए',
    'about.coverageLead':'GovBabu को आख़िरकार हर राज्य और हर बड़ी भर्ती संस्था की सरकारी परीक्षाओं को कवर करने के लिए बनाया जा रहा है। ईमानदारी से बताएं तो, आज हम यहां खड़े हैं:',
    'about.coverageTodayTitle':'✅ आज GovBabu पर क्या उपलब्ध है',
    'about.coverageToday1':'राष्ट्रीय स्तर की परीक्षाएं (SSC, रेलवे, बैंकिंग)',
    'about.coverageToday2':'कुछ राज्य लोक सेवा आयोग और राज्य भर्तियां',
    'about.coverageToday3':'रक्षा, शिक्षण और पुलिस भर्ती',
    'about.coverageToday4':'पूरी और मौजूदा सूची <a href="exams.html">सभी परीक्षाएं देखें</a> पर देखें।',
    'about.coverageNextTitle':'🚧 हम आगे किस दिशा में बढ़ रहे हैं',
    'about.coverageNext1':'हर राज्य में गहराई से कवरेज, सिर्फ़ सबसे बड़े राज्यों तक सीमित नहीं',
    'about.coverageNext2':'और भर्ती बोर्ड, जिनमें छोटी लेकिन अहम परीक्षाएं भी शामिल हों',
    'about.coverageNext3':'जैसे-जैसे कवरेज बढ़ेगी, हर परीक्षा के लिए और गहरी जानकारी',
    'about.sourcedTag':'हमारा तरीका',
    'about.sourcedHead':'स्रोत आधारित, अनुमान नहीं।',
    'about.sourcedBody1':'सरकारी भर्ती की जानकारी लगातार बदलती रहती है। अधिसूचनाएं संशोधित होती हैं। कभी-कभी एक ही परीक्षा के लिए अलग-अलग वेबसाइटें अलग आंकड़े दिखाती हैं।',
    'about.sourcedBody2':'हम कोशिश करते हैं कि ज़रूरी जानकारी को, जहां भी आधिकारिक अधिसूचना उपलब्ध हो, उस तक वापस ट्रेस करें, और उस स्रोत को खुद जांचना आसान बनाएं।',
    'about.sourcedCallout':'जब कुछ पुष्टि न हो सके, या स्रोत आपस में टकराएं, तो हम चुपचाप एक नहीं चुनते — साफ़ बता देते हैं।',
    'about.privacyHead':'🔒 आपके दस्तावेज़ आपके ही हैं',
    'about.privacyBody':'आवेदन के दस्तावेज़ संवेदनशील होते हैं। GovBabu के फोटो, हस्ताक्षर और PDF टूल्स को इस तरह बनाया गया है कि रोज़मर्रा के काम — जैसे फोटो का साइज़ बदलना या हस्ताक्षर को स्पेसिफिकेशन के हिसाब से जांचना — सीधे आपके ब्राउज़र में, आपके अपने डिवाइस पर हो सकें, बिना पहले किसी सर्वर पर अपलोड किए।',
    'about.freeHead':'🎉 इस्तेमाल के लिए मुफ़्त',
    'about.freeBody':'GovBabu अभी हर अभ्यर्थी के लिए मुफ़्त है — कोई लॉगिन नहीं, कोई भुगतान नहीं। हम आप जैसे अभ्यर्थियों के फीडबैक के साथ इसे बना रहे हैं। अगर कभी सशुल्क सुविधाएं आती हैं, तो योजना उन्हें सिर्फ़ डॉक्यूमेंट-तैयारी टूल्स तक सीमित रखने की है — परीक्षा की मुख्य जानकारी हमेशा मुफ़्त रहेगी।',
    'about.roadmapTag':'रोडमैप','about.roadmapHead':'आगे हम क्या बना रहे हैं',
    'about.roadmapIntro':'हम किस दिशा में बढ़ रहे हैं — यह सब अभी मौजूद नहीं है।',
    'about.roadmap1Title':'अधिक परीक्षाएं',
    'about.roadmap1Desc':' — और राज्यों और बड़ी भर्ती संस्थाओं तक कवरेज बढ़ाना।',
    'about.roadmap2Title':'बेहतर पात्रता टूल्स',
    'about.roadmap2Desc':' — यह समझना आसान बनाना कि आप वाकई किन परीक्षाओं के लिए योग्य हैं।',
    'about.roadmap3Title':'स्मार्ट आवेदन मार्गदर्शन',
    'about.roadmap3Desc':' — उलझी हुई सरकारी आवेदन प्रक्रियाओं के लिए और स्पष्ट कदम।',
    'about.roadmap4Title':'अधिक डॉक्यूमेंट टूल्स',
    'about.roadmap4Desc':' — अभ्यर्थियों की असल ज़रूरत के अनुसार परीक्षा-विशेष फोटो, हस्ताक्षर और PDF तैयारी।',
    'about.roadmap5Title':'अलर्ट और ट्रैकिंग',
    'about.roadmap5Desc':' — डेडलाइन, सुधार विंडो, एडमिट कार्ड और परिणाम पर नज़र रखने में मदद।',
    'about.roadmap6Title':'व्यक्तिगत परीक्षा खोज',
    'about.roadmap6Desc':' — आगे चलकर, आपकी अपनी प्रोफ़ाइल के आधार पर परीक्षा सुझाव, न कि एक जैसी सूची।',
    'about.audienceHead':'उस व्यक्ति के लिए बना, जो आवेदन के पीछे है।',
    'about.audienceIntro':'चाहे आप:',
    'about.audience1':'अपनी पहली सरकारी परीक्षा के लिए आवेदन कर रहे हों',
    'about.audience2':'एक साथ कई परीक्षाओं के लिए आवेदन कर रहे हों',
    'about.audience3':'यह तय न कर पा रहे हों कि आप योग्य भी हैं या नहीं',
    'about.audience4':'फोटो, हस्ताक्षर या दस्तावेज़ की शर्तों को लेकर उलझन में हों',
    'about.audience5':'एक जवाब के लिए पांच अलग-अलग वेबसाइटें खंगालते-खंगालते थक चुके हों',
    'about.audienceClose':'…अगर इनमें से कुछ भी जाना-पहचाना लगे, तो GovBabu आपके लिए ही बना है।',
    'about.finalHead':'आपका अगला आवेदन यहीं से शुरू होता है।',
    'about.finalLead':'परीक्षा को समझें। शर्तें जांचें। दस्तावेज़ तैयार करें। पूरे भरोसे के साथ आवेदन करें।',
    'about.suggestLead':'कोई टूल या परीक्षा छूट गई? ',
    'about.ctaBrowse':'परीक्षाएं देखें',
    'about.ctaGetStarted':'शुरू करें','about.ctaTelegram':'हमें टेलीग्राम पर बताएं',
    'contact.eyebrow':'💬 संपर्क करें','contact.h1':'हमें बताएं क्या छूट गया',
    'contact.lead':'कोई डेटा गलती मिली, कोई परीक्षा जोड़नी है, या बस कुछ कहना है? नीचे भेजें — यह एक पहले से पता लिखा Gmail ड्राफ्ट खोलता है ताकि सीधे हमारे इनबॉक्स में पहुंचे। जल्दी है? तेज़ जवाब के लिए हमें <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">टेलीग्राम</a> पर मैसेज करें।',
    'contact.helpLabel':'हम किस बारे में मदद कर सकते हैं?',
    'contact.opt1':'गलती की रिपोर्ट करें','contact.opt2':'परीक्षा जोड़ने का अनुरोध करें','contact.opt3':'एक फ़ीचर सुझाएं','contact.opt4':'वेबसाइट में समस्या','contact.opt5':'सामान्य फीडबैक',
    'contact.nameLabel':'आपका नाम (वैकल्पिक)','contact.emailLabel':'आपका ईमेल (वैकल्पिक, ताकि हम जवाब दे सकें)',
    'contact.messageLabel':'आपका संदेश','contact.messagePlaceholder':'ठीक करने के लिए कोई डेटा गलती, जोड़ने के लिए कोई परीक्षा, या कुछ और...',
    'contact.submitBtn':'फीडबैक के साथ ईमेल खोलें ↗',
    'contact.successMsg':'✅ आपका ईमेल ड्राफ्ट एक नए टैब में खुला है — फीडबैक भेजने के लिए वहां Send दबाएं।',
    'contact.note1':'यह आपका संदेश पहले से भरा हुआ और हमें संबोधित Gmail में खोलता है। हम आमतौर पर 2–3 दिनों में जवाब देते हैं।',
    'contact.note2':'Gmail नहीं खुल रहा, या आप दूसरा ईमेल ऐप इस्तेमाल करते हैं? सीधे हमें <a href="mailto:manas.m.kher@gmail.com">manas.m.kher@gmail.com</a> पर लिखें।',
    'contact.faqHead':'अक्सर पूछे जाने वाले सवाल',
    'contact.faq1q':'क्या GovBabu उपयोग करना मुफ़्त है?',
    'contact.faq1a':'हां — अभी GovBabu पर सब कुछ हर अभ्यर्थी के लिए मुफ़्त है, कोई लॉगिन नहीं और कोई भुगतान नहीं। यह लॉन्च के बाद कम से कम पहले दो महीनों तक गारंटीड है। बाद में सिर्फ़ डॉक्यूमेंट-तैयारी टूल्स के लिए एक छोटी सी एकमुश्त फीस लौट सकती है; परीक्षा जानकारी हमेशा मुफ़्त रहेगी।',
    'contact.faq2q':'क्या GovBabu एक आधिकारिक सरकारी वेबसाइट है?',
    'contact.faq2a':'नहीं। GovBabu एक स्वतंत्र, निजी तौर पर चलाया जाने वाला टूल है और UPSC, SSC, IBPS, रेलवे, BPSC या किसी भी सरकारी संस्था से संबद्ध नहीं है। हम हर परीक्षा की आधिकारिक अधिसूचना का शोध करते हैं और उसे लिंक करते हैं ताकि आप हमेशा स्रोत पर खुद विवरण जांच सकें।',
    'contact.faq3q':'क्या मेरी फोटो, हस्ताक्षर या निजी डेटा कहीं अपलोड होता है?',
    'contact.faq3a':'आपकी फ़ाइलें सीधे आपके ब्राउज़र में प्रोसेस होती हैं — फोटो और हस्ताक्षर का साइज़ बदलना, PDF बदलना और छोटा करना — सब कुछ आपके ही डिवाइस पर होता है, और प्रोसेसिंग के लिए GovBabu के सर्वर पर अपलोड नहीं होतीं।',
    'contact.faq4q':'परीक्षा जानकारी कितनी सटीक है?',
    'contact.faq4a':'हर सीट संख्या, पात्रता नियम, वेतन स्तर और समय सीमा को, जहां भी उपलब्ध हो, आधिकारिक अधिसूचना के आधार पर शोध किया जाता है, स्रोत बताए जाते हैं। जहां कुछ पुष्टि न हो सके या स्रोत असहमत हों, हम अनुमान लगाने के बजाय यह साफ़ बताते हैं — लेकिन आवेदन विंडो और तारीखें अक्सर बदलती हैं, इसलिए कुछ भी सबमिट करने से पहले हमेशा हर परीक्षा के पेज पर दी गई आधिकारिक अधिसूचना से जांच करें।',
    'contact.faq5q':'मेरी परीक्षा सूची में नहीं है — क्या आप इसे जोड़ सकते हैं?',
    'contact.faq5a':'ज़्यादातर मामलों में, हां। हम सक्रिय रूप से कवरेज बढ़ा रहे हैं। ऊपर दिए गए फीडबैक फॉर्म से बताएं आपको कौन सी परीक्षा चाहिए, और हम उसका शोध करके जोड़ देंगे।',
    'contact.faq6q':'मुझे परीक्षा विवरण में एक गलती मिली — मुझे क्या करना चाहिए?',
    'contact.faq6a':'कृपया इसे ऊपर दिए गए फीडबैक फॉर्म से जितना विस्तार से हो सके रिपोर्ट करें (परीक्षा का नाम, गलत फील्ड, और अगर हो तो स्रोत)। हम डेटा सुधार को उच्च प्राथमिकता देते हैं।',
    'contact.faq7q':'क्या GovBabu इस्तेमाल करने के लिए मुझे खाता बनाना होगा?',
    'contact.faq7a':'नहीं। साइट के किसी भी हिस्से के लिए साइन-अप या लॉगिन ज़रूरी नहीं है।',
    'contact.faq8q':'GovBabu अपनी परीक्षा जानकारी कहां से लेता है?',
    'contact.faq8a':'मुख्य रूप से हर परीक्षा की आधिकारिक अधिसूचना से — वह PDF या पेज जो संचालन संस्था (UPSC, SSC, IBPS, रेलवे, राज्य PSC, आदि) द्वारा प्रकाशित किया गया हो। जहां किसी विवरण की पुष्टि प्राथमिक स्रोत से नहीं हो सकती, हम अनुमान लगाने के बजाय परीक्षा के डेटा नोट में यह बताते हैं, और उपयोग किए गए द्वितीयक स्रोतों का हवाला देते हैं।',
    'contact.faq9q':'परीक्षा जानकारी कितनी बार अपडेट होती है?',
    'contact.faq9a':'जब भी हम किसी परीक्षा का शोध या दोबारा सत्यापन करते हैं, किसी तय दैनिक शेड्यूल पर नहीं। आवेदन विंडो, तारीखें और रिक्तियों की संख्या आधिकारिक स्तर पर अक्सर बदलती हैं, इसलिए कुछ भी सबमिट करने से पहले हमेशा लिंक की गई आधिकारिक अधिसूचना से जांच करें।',
    'contact.faq10q':'GovBabu किन परीक्षाओं को कवर करता है?',
    'contact.faq10a':'SSC, रेलवे (RRB), बैंकिंग (IBPS/SBI/RBI), UPSC, राज्य PSC, रक्षा (NDA/CDS/अग्निवीर), शिक्षण और पुलिस परीक्षाएं — पूरी, मौजूदा सूची <a href="exams.html">सभी परीक्षाएं देखें</a> पर देखें। हम सक्रिय रूप से और जोड़ रहे हैं।',
    'privacy.eyebrow':'🔒 गोपनीयता नीति','privacy.h1':'आपका डेटा, साफ़ तौर पर समझाया गया',
    'privacy.lead':'GovBabu को इस तरह बनाया गया है कि आपका जितना कम हो सके उतना ही डेटा चाहिए। यह पेज ठीक-ठीक बताता है कि आप जो कुछ देते हैं उसका क्या होता है।',
    'privacy.s1h':'फोटो, हस्ताक्षर और दस्तावेज़ फ़ाइलें',
    'privacy.s1p':'GovBabu पर हर फोटो, हस्ताक्षर और PDF टूल पूरी तरह आपके ब्राउज़र में, आपके डिवाइस की अपनी प्रोसेसिंग पावर से चलता है (HTML5 Canvas API और, PDF टूल्स के लिए, एक सार्वजनिक CDN से लोड की गई लाइब्रेरी)। आपकी फ़ाइलों का साइज़ बदलना, छोटा करना या बदलना आपके डिवाइस पर स्थानीय रूप से होता है और वे कभी GovBabu के सर्वर पर अपलोड नहीं होतीं — क्योंकि इन टूल्स के लिए, GovBabu कोई ऐसा सर्वर चलाता ही नहीं जो उन्हें प्राप्त करे।',
    'privacy.s2h':'फीडबैक फॉर्म',
    'privacy.s2p':'हमारे <a href="contact.html">संपर्क पेज</a> पर मौजूद फॉर्म भी किसी GovBabu सर्वर पर सबमिट नहीं होता। जब आप बटन दबाते हैं, यह एक नए टैब में हमें संबोधित, पहले से भरा हुआ Gmail कंपोज़ विंडो खोलता है — संदेश तभी भेजा जाता है जब आप वहां Send दबाते हैं, सीधे आपके अपने ईमेल खाते से। अगर आप वह चरण पूरा नहीं करते, तो कुछ भी नहीं भेजा जाता। उस फॉर्म पर नाम और ईमेल वैकल्पिक हैं और केवल आपको जवाब देने के लिए इस्तेमाल होते हैं।',
    'privacy.s3h':'हम आपके ब्राउज़र में क्या सेव करते हैं',
    'privacy.s3p':'दो छोटी प्राथमिकताएं — आपकी चुनी हुई भाषा और लाइट/डार्क थीम — आपके ब्राउज़र के लोकल स्टोरेज में सेव की जाती हैं ताकि साइट अगली बार आपकी विज़िट पर उन्हें याद रखे। यह आपके डिवाइस पर ही रहता है; यह न हमें भेजा जाता है, न किसी तीसरे पक्ष को।',
    'privacy.s4h':'भुगतान',
    'privacy.s4p':'GovBabu के डॉक्यूमेंट टूल्स अभी हर अभ्यर्थी के लिए मुफ़्त हैं, कोई भुगतान ज़रूरी नहीं। अगर भविष्य में कोई भुगतान वाला अनलॉक शुरू किया जाता है, तो भुगतान एक तीसरे पक्ष के पेमेंट प्रोसेसर (Razorpay) द्वारा संभाला जाएगा — कार्ड और भुगतान विवरण सीधे उस प्रोसेसर के पास उसकी अपनी गोपनीयता शर्तों के तहत जाएंगे, GovBabu के पास नहीं।',
    'privacy.s5h':'कुकीज़ और एनालिटिक्स',
    'privacy.s5p':'GovBabu कोई थर्ड-पार्टी एनालिटिक्स या विज्ञापन ट्रैकर नहीं चलाता, और ट्रैकिंग के लिए कुकीज़ का इस्तेमाल नहीं करता।',
    'privacy.s6h':'खाते',
    'privacy.s6p':'GovBabu पर कहीं भी साइन-अप या लॉगिन नहीं है, इसलिए हम किसी पहचान से जुड़े खाता प्रोफाइल, पासवर्ड या उपयोग इतिहास नहीं रखते।',
    'privacy.s7h':'इस नीति के बारे में सवाल',
    'privacy.s7p':'हमें <a href="contact.html">संपर्क पेज</a> के ज़रिए या सीधे <a href="mailto:manas.m.kher@gmail.com">manas.m.kher@gmail.com</a> पर लिखें।',
    'privacy.updated':'यह नीति नीचे दी गई तारीख तक GovBabu के वास्तविक तकनीकी क्रियान्वयन का वर्णन करती है, और वह क्रियान्वयन बदलने पर इसे अपडेट किया जाएगा। अंतिम अपडेट: 28 अगस्त 2026।',
    'terms.eyebrow':'📄 उपयोग की शर्तें','terms.h1':'बुनियादी नियम',
    'terms.lead':'GovBabu इस्तेमाल करने की सीधी-सादी शर्तें — कोई छिपी हुई बारीकियां नहीं।',
    'terms.s1h':'GovBabu क्या है',
    'terms.s1p':'GovBabu भारतीय सरकारी परीक्षा अभ्यर्थियों के लिए एक स्वतंत्र, निजी तौर पर चलाया जाने वाला जानकारी और दस्तावेज़-तैयारी टूल है। यह कोई सरकारी वेबसाइट नहीं है और UPSC, SSC, IBPS, रेलवे, BPSC या किसी भी सरकारी संस्था से संबद्ध नहीं है — इस बारे में अधिक जानकारी के लिए हमारा <a href="disclaimer.html">अस्वीकरण</a> देखें।',
    'terms.s2h':'साइट का उपयोग',
    'terms.s2p':'आप परीक्षा जानकारी देखने और अपनी फोटो, हस्ताक्षर और दस्तावेज़ तैयार करने के लिए GovBabu का स्वतंत्र रूप से उपयोग कर सकते हैं। किसी खाते या लॉगिन की ज़रूरत नहीं है। साइट का उपयोग करके, आप इन शर्तों और हमारी <a href="privacy.html">गोपनीयता नीति</a> से सहमत होते हैं।',
    'terms.s3h':'जानकारी की सटीकता',
    'terms.s3p':'हम जहां उपलब्ध हो वहां परीक्षा विवरण का शोध आधिकारिक अधिसूचनाओं के आधार पर करते हैं और जो स्वतंत्र रूप से पुष्टि नहीं कर सके उसे बताने की कोशिश करते हैं। फिर भी, आवेदन विंडो, तारीखें, फीस और रिक्तियों की संख्या आधिकारिक स्तर पर बदलती रहती हैं, कभी-कभी बिना ज़्यादा सूचना के। GovBabu पर जानकारी सुविधा के लिए दी गई है और आधिकारिक अधिसूचना का विकल्प नहीं है — इस पर भरोसा करने से पहले, खासकर फॉर्म सबमिट करने या कहीं भुगतान करने से पहले, हमेशा आधिकारिक स्रोत (हर परीक्षा के पेज पर लिंक किया गया) से पुष्टि करें।',
    'terms.s4h':'इस साइट के उपयोग से लिए गए फैसलों की कोई ज़िम्मेदारी नहीं',
    'terms.s4p':'GovBabu "जैसा है वैसा" उपलब्ध कराया गया है। हम जानकारी को मौजूदा और सही रखने की पूरी कोशिश करते हैं, लेकिन इसकी गारंटी नहीं दे सकते, और यहां की सामग्री के आधार पर लिए गए फैसलों से होने वाले नुकसान के लिए ज़िम्मेदार नहीं हैं — जिसमें छूटी हुई समय सीमाएं, अस्वीकृत आवेदन, या ऐसे दस्तावेज़ शामिल हैं जो हमारी आखिरी जांच के बाद बदली गई स्पेसिफिकेशन को पूरा नहीं करते।',
    'terms.s5h':'डॉक्यूमेंट टूल्स',
    'terms.s5p':'फोटो/हस्ताक्षर साइज़ बदलने और PDF टूल्स आपके अपने ब्राउज़र में चलते हैं (ठीक कैसे, यह हमारी <a href="privacy.html">गोपनीयता नीति</a> में देखें)। हम हर परीक्षा की प्रकाशित स्पेसिफिकेशन के अनुसार सटीकता का लक्ष्य रखते हैं, लेकिन यह पुष्टि करने की अंतिम ज़िम्मेदारी आपकी है कि आपके दस्तावेज़ मौजूदा आधिकारिक आवश्यकता को पूरा करते हैं।',
    'terms.s6h':'मूल्य निर्धारण',
    'terms.s6p':'GovBabu के टूल्स अभी हर अभ्यर्थी के लिए मुफ़्त हैं। हम भविष्य में डॉक्यूमेंट-तैयारी टूल्स के लिए एक छोटी सी फीस शुरू कर सकते हैं — परीक्षा जानकारी के लिए कभी नहीं — और ऐसा कोई भी बदलाव आप पर लागू होने से पहले साफ़ तौर पर बताएंगे।',
    'terms.s7h':'उचित उपयोग',
    'terms.s7p':'कृपया GovBabu को स्क्रैप न करें, इसके खिलाफ़ स्वचालित दुरुपयोगी ट्रैफिक न भेजें, या इसे बाधित करने की कोशिश न करें। साइट की सामग्री श्रेय के साथ साझा की जा सकती है; कृपया हमारे शोध किए गए परीक्षा डेटा को अपना बताकर दोबारा प्रकाशित न करें।',
    'terms.s8h':'इन शर्तों में बदलाव',
    'terms.s8p':'GovBabu के विकसित होने के साथ हम इन शर्तों को अपडेट कर सकते हैं। बदलाव के बाद साइट का लगातार उपयोग जारी रखने का मतलब है कि आप अपडेट की गई शर्तों को स्वीकार करते हैं।',
    'terms.s9h':'सवाल',
    'terms.s9p':'हमसे <a href="contact.html">संपर्क पेज</a> के ज़रिए या <a href="mailto:manas.m.kher@gmail.com">manas.m.kher@gmail.com</a> पर संपर्क करें।',
    'terms.updated':'अंतिम अपडेट: 28 अगस्त 2026।',
    'disclaimer.eyebrow':'⚠️ अस्वीकरण','disclaimer.h1':'हम स्वतंत्र हैं — कृपया पुष्टि करें',
    'disclaimer.lead':'GovBabu के बारे में सबसे ज़रूरी बात, एक ही जगह पर।',
    'disclaimer.s1h':'यह कोई सरकारी वेबसाइट नहीं है',
    'disclaimer.s1p':'GovBabu एक स्वतंत्र, निजी तौर पर चलाया जाने वाला प्लेटफ़ॉर्म है जो अभ्यर्थियों को सरकारी परीक्षाओं को आसानी से समझने में मदद करने के लिए बनाया गया है। यह UPSC, SSC, IBPS, रेलवे (RRB), BPSC, किसी भी राज्य PSC, या किसी भी अन्य सरकारी संस्था या मंत्रालय से <strong>संबद्ध, अनुमोदित या संचालित नहीं</strong> है।',
    'disclaimer.s2h':'जानकारी की सटीकता',
    'disclaimer.s2p':'GovBabu पर परीक्षा विवरण — सीटें, पात्रता, फीस, तारीखें, रिक्तियां और आवेदन के चरण — जहां भी पहुंच संभव है वहां हर परीक्षा की आधिकारिक अधिसूचना के आधार पर शोध किए जाते हैं, और जब कुछ स्वतंत्र रूप से पुष्टि न हो सके तो हम इसे साफ़ तौर पर बताते हैं। आवेदन विंडो, तारीखें और अन्य विवरण आधिकारिक स्तर पर बदल सकते हैं और बदलते हैं, कभी-कभी बिना ज़्यादा सूचना के। यहां किसी भी विवरण पर भरोसा करने से पहले, खासकर आवेदन या भुगतान सबमिट करने से पहले, हमेशा आधिकारिक अधिसूचना (हर परीक्षा के पेज पर लिंक की गई) से जांच करें।',
    'disclaimer.s3h':'परिणाम की कोई गारंटी नहीं',
    'disclaimer.s3p':'GovBabu का उपयोग पात्रता, चयन, या किसी विशेष परीक्षा परिणाम की गारंटी नहीं देता। अंतिम पात्रता और चयन केवल संचालन संस्था द्वारा अपने नियमों के तहत तय किया जाता है।',
    'disclaimer.s4h':'बाहरी लिंक',
    'disclaimer.s4p':'GovBabu आधिकारिक अधिसूचनाओं, आवेदन पोर्टल और परिणाम पेजों से लिंक करता है। उन बाहरी, तीसरे पक्ष की साइटों की सामग्री, उपलब्धता या सटीकता के लिए हम ज़िम्मेदार नहीं हैं।',
    'disclaimer.s5h':'डॉक्यूमेंट टूल्स',
    'disclaimer.s5p':'फोटो/हस्ताक्षर का साइज़ बदलने और PDF टूल्स आपको प्रकाशित स्पेसिफिकेशन पूरी करने में मदद करने के लिए दिए गए हैं, लेकिन सबमिट करने से पहले यह पुष्टि करने की ज़िम्मेदारी आपकी है कि अंतिम फ़ाइलें मौजूदा आधिकारिक आवश्यकता को पूरा करती हैं।',
    'disclaimer.s6h':'सवाल',
    'disclaimer.s6p':'अगर यहां कुछ गलत या पुराना लगे, तो कृपया हमें <a href="contact.html">संपर्क पेज</a> के ज़रिए बताएं — डेटा सुधार को हम उच्च प्राथमिकता देते हैं।',
    'disclaimer.updated':'अंतिम अपडेट: 28 अगस्त 2026।'
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
  'Defence':'रक्षा','State PSC':'राज्य लोक सेवा आयोग','Teaching':'शिक्षण','Police':'पुलिस'
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
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const key=el.dataset.i18nPlaceholder;
    if(dict[key]!=null) el.setAttribute('placeholder',dict[key]);
  });
  document.documentElement.lang=lang;
  // Re-render every exam-data-driven view so it picks up Hindi fields too.
  ['renderPopularExams','renderExamsByCategory','renderExamDirectory','renderExamCalendar','renderNoticeTicker','renderNoticeBoard','renderResultsPanel']
    .forEach(fn=>{ if(typeof window[fn]==='function') window[fn](); });
  if(typeof state!=='undefined'&&state.exam){
    renderSelectedExamBar();
    renderExamDetailPanel();
    renderUploadSlots();
    if(typeof renderPayBar==='function') renderPayBar();
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
   meant to survive someone opening dev tools.

   FREE_MODE: the site is free for every aspirant for its first two months
   (no Razorpay account is even connected yet) — flip this back to false
   once that period ends to re-enable the paywall. The order→verify→unlock
   pipeline below is untouched and still works in mock mode for testing. */
const FREE_MODE=true;
function unlockKey(tool,examCode){return 'gb-unlock:'+tool+':'+examCode}
function storeUnlock(tool,examCode,token){sessionStorage.setItem(unlockKey(tool,examCode),token)}
function hasUnlock(tool,examCode){return FREE_MODE||Boolean(sessionStorage.getItem(unlockKey(tool,examCode)))}

function loadScript(src){
  return new Promise((resolve,reject)=>{
    if(document.querySelector('script[src="'+src+'"]')){resolve();return}
    const s=document.createElement('script');
    s.src=src;s.onload=()=>resolve();s.onerror=()=>reject(new Error('Could not load '+src));
    document.head.appendChild(s);
  });
}

async function initiatePayment(tool,examCode,onUnlocked,btn){
  if(btn){btn.disabled=true;btn.textContent=T('slot.processing')}
  try{
    const orderRes=await fetch('/api/create-order',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({tool,examCode})
    });
    const order=await orderRes.json();
    if(!orderRes.ok) throw new Error(order.error||T('pay.err.couldNotStart'));

    if(order.mock){
      // No Razorpay account configured yet on the server — exercises the
      // same order -> verify -> unlock pipeline without moving real money.
      const verifyRes=await fetch('/api/verify-payment',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({tool,examCode,order_id:order.order_id,mock:true})
      });
      const data=await verifyRes.json();
      if(!verifyRes.ok) throw new Error(data.error||T('pay.err.verificationFailed'));
      storeUnlock(tool,examCode,data.unlock_token);
      onUnlocked();
      return;
    }

    await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    const rzp=new Razorpay({
      key:order.key_id,amount:order.amount,currency:'INR',name:'GovBabu',
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
          if(!verifyRes.ok) throw new Error(data.error||T('pay.err.notVerified'));
          storeUnlock(tool,examCode,data.unlock_token);
          onUnlocked();
        }catch(err){alert(err.message)}
      }
    });
    rzp.open();
  }catch(err){
    alert(err.message||T('pay.err.notStarted'));
  }finally{
    if(btn){btn.disabled=false;btn.textContent=T('slot.payUnlock').replace('&amp;','&')}
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
  {code:'UPSC',name:'UPSC Civil Services',cat:'Central Govt',status:'closed',popularity:13,hi:{name:'यूपीएससी सिविल सेवा'},
    notifTitle:'Civil Services Examination, 2026 — Notice No. 05/2026-CSE (Mains in progress; window for this cycle is closed)',
    applyStart:'04 Feb 2026',applyEnd:'27 Feb 2026 (extended)',
    officialUrl:'https://www.upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-060226Rev.pdf',
    photo:{dims:'350 × 350 px',px:{w:350,h:350},minKB:20,maxKB:300,format:'JPG/JPEG',notes:'white/off-white background, face ~75% of frame, filename must be photo.jpg'},
    signature:{dims:'~350–500 px wide (exact box unconfirmed)',minKB:20,maxKB:100,format:'JPG/JPEG',notes:'black ink, white background, filename must be signature.jpg — re-verify exact px on upsconline.nic.in at apply time'},
    details:{
      dataNote:'UPSC has fully retired the old One-Time Registration (OTR) system in favour of the Aadhaar-based Universal Registration Number (URN) portal at upsconline.nic.in — OTR terminology is no longer used in the candidate-facing UI as of 2026 (re-confirmed 27 Aug 2026 across multiple current sources). Signature pixel dimensions remain genuinely unresolved between sources — the 20–100 KB file-size figure is solid, the exact width/height is not (sources disagree between ~350–500 px and other pixel/DPI conversions).',
      payGroups:[{level:'Level 10 (Junior Time Scale)',band:'₹56,100 – ₹1,77,500 (basic)',posts:'~24 Group A/B services — IAS, IPS, IFS and other Central Civil Services — allocated by rank, category and preference after the interview stage'}],
      payNote:'All Group A services (including IAS/IPS) enter at the same Level 10 basic pay — DA/HRA and other allowances add to this and vary by posting.',
      promotion:{caveat:'Not an official document — a commonly cited coaching-site estimate for the IAS career path.',steps:['Sub-Divisional Magistrate — first 0–4 years','Additional Collector — around 4–9 years','District Magistrate / Collector — around 9–13 years','Joint Secretary, Government of India — around 17–22 years','Secretary, Government of India — around 30–35 years','Actual timelines vary a lot by state cadre and how many officers joined in your batch year']},
      eligibility:{age:'21–32 years (general/EWS) as on 1 August of the exam year',ageRelax:'OBC (non-creamy layer) up to 35 · SC/ST up to 37 · PwBD up to 42',qualification:'Bachelor\'s degree in any discipline from a recognized university (final-year candidates may apply provisionally in some cycles).'},
      howToApply:['Register on the current UPSC application portal (upsconline.nic.in) via the Universal Registration Number (URN) system — the old OTR system has been fully retired','Fill the common application form, then the exam-specific Civil Services application','Upload photo and signature to spec','Pay the fee online (exemptions apply for SC/ST/PwBD/women per UPSC norms)','Submit before the deadline — corrections are typically allowed only in a short post-close window']
    },
    verified:'27 Aug 2026'},
  {code:'SSC-CGL',vacancies:'12,256',name:'SSC CGL',cat:'Central Govt',status:'closed',popularity:1,hi:{name:'एसएससी सीजीएल',details:{
      payGroups:[
        {level:'लेवल 8',band:'₹47,600–₹1,51,100',posts:'सहायक लेखा परीक्षा अधिकारी, सहायक लेखा अधिकारी'},
        {level:'लेवल 7',band:'₹44,900–₹1,42,400',posts:'सहायक अनुभाग अधिकारी, निरीक्षक (आयकर), निरीक्षक (केंद्रीय उत्पाद शुल्क/जीएसटी), निरीक्षक (निवारक अधिकारी/परीक्षक), सहायक प्रवर्तन अधिकारी, उप निरीक्षक (सीबीआई), निरीक्षक (डाक), निरीक्षक (केंद्रीय नारकोटिक्स ब्यूरो)'},
        {level:'लेवल 6',band:'₹35,400–₹1,12,400',posts:'कार्यकारी सहायक, अनुसंधान सहायक, प्रभागीय लेखाकार, उप निरीक्षक (एनआईए), उप निरीक्षक/जेआईओ (नारकोटिक्स नियंत्रण ब्यूरो), कनिष्ठ सांख्यिकी अधिकारी, सांख्यिकी अन्वेषक ग्रेड II, कार्यालय अधीक्षक, अनुभाग प्रमुख (डीजीएफटी)'},
        {level:'लेवल 5',band:'₹29,200–₹92,300',posts:'लेखा परीक्षक, लेखाकार / कनिष्ठ लेखाकार'},
        {level:'लेवल 4',band:'₹25,500–₹81,100',posts:'डाक/छँटाई सहायक, वरिष्ठ सचिवालय सहायक (यूडीसी), वरिष्ठ प्रशासनिक सहायक, कर सहायक, उप-निरीक्षक (केंद्रीय नारकोटिक्स ब्यूरो)'}
      ],
      payNote:'आंकड़े 7वें वेतन आयोग की वेतन-मैट्रिक्स सीमाएं हैं (केवल मूल वेतन) — वास्तविक हाथ में आने वाला वेतन महंगाई भत्ता (वर्तमान में मूल वेतन का ~58%) और मकान किराया भत्ता (शहर श्रेणी अनुसार 8–24%) जोड़ने के बाद बनता है।',
      promotion:{caveat:'आधिकारिक समयसीमा नहीं है — यह एक सामान्यतः बताया जाने वाला अनुमान है।',steps:['इंस्पेक्टर/एएसओ स्तर → अधीक्षक/अधिकारी ग्रेड — लगभग 5–7 वर्ष','अधीक्षक/अधिकारी → सहायक आयुक्त-समकक्ष — लगभग 12–17 वर्ष','इसके बाद वरिष्ठता, विभागीय परीक्षाओं और सीमित विभागीय प्रतियोगी परीक्षाओं (एलडीसीई) के माध्यम से आगे पदोन्नति होती है']},
      eligibility:{age:['ग्रुप सी पद: 18–27 वर्ष','ग्रुप बी पद (जैसे इंस्पेक्टर, एएसओ): 30 वर्ष तक','सांख्यिकी पद: 32 वर्ष तक','सटीक आयु सीमा आपके पद पर निर्भर करती है — हमेशा वर्तमान अधिसूचना से पुष्टि करें'],ageRelax:'ओबीसी +3 वर्ष · एससी/एसटी +5 वर्ष · दिव्यांग +10 वर्ष · भूतपूर्व सैनिक नियमानुसार',qualification:'किसी भी मान्यता प्राप्त विश्वविद्यालय से किसी भी विषय में स्नातक (सांख्यिकी/जेएसओ पदों के लिए गणित या सांख्यिकी विषय आवश्यक)।'},
      howToApply:['ssc.gov.in पर मोबाइल, ईमेल, आधार/पहचान पत्र और कक्षा 10 के विवरण के साथ एक बार पंजीकरण (OTR) पूरा करें','अपने OTR क्रेडेंशियल से लॉगिन करें और सीजीएल आवेदन फॉर्म भरें','3 परीक्षा केंद्रों तक और अपनी श्रेणी/पद वरीयताएं चुनें','अपनी फोटो और हस्ताक्षर निर्दिष्ट माप के अनुसार अपलोड करें','शुल्क ऑनलाइन भुगतान करें — सामान्य/ओबीसी/ईडब्ल्यूएस के लिए ₹100; महिलाओं, एससी, एसटी, दिव्यांग, भूतपूर्व सैनिकों के लिए निःशुल्क','समीक्षा करें और सबमिट करें — पुष्टिकरण पृष्ठ डाउनलोड करें']
    }},
    notifTitle:'SSC CGL 2026 — Combined Graduate Level Examination, 2026 (12,256 vacancies, Group B & C); application window closed 25 Jun 2026 (extended); Tier 1 tentative Aug–Sep 2026, Tier 2 tentative Dec 2026',
    applyStart:'21 May 2026',applyEnd:'25 Jun 2026 (extended from 22 Jun 2026)',
    officialUrl:'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf',
    photo:{dims:'3.5 cm × 4.5 cm',px:{w:276,h:354},minKB:20,maxKB:50,format:'JPEG/JPG'},
    signature:{dims:'4 cm × 2 cm',px:{w:315,h:157},minKB:10,maxKB:20,format:'JPEG/JPG',notes:'signed on white paper, black ink pen'},
    details:{
      dataNote:'CORRECTED (27 Aug 2026 audit): this entry previously presented the 2025 cycle as "most recent — 2026 not yet released," which was stale. SSC CGL 2026 was actually notified 21 May 2026, closed 25 Jun 2026 (extended from 22 Jun, ~28 lakh applications), for 12,256 vacancies (Group B & C), with Tier 1 tentatively Aug–Sep 2026 and Tier 2 tentatively Dec 2026 — confirmed across multiple independent sources (Deccan Herald, Oliveboard, Adda247, PW Live, Careerpower, Testbook). The application window is unambiguously closed, so status:\'closed\' is correct — only the underlying cycle/dates were stale. The exact SSC advertisement/notice number for CGL 2026 could not be independently confirmed (only vacancy count and dates are well-corroborated) — the officialUrl follows the same ssc.gov.in filename pattern as prior years but hasn\'t been directly fetched.',
      payGroups:[
        {level:'Level 8',band:'₹47,600–₹1,51,100',posts:'Assistant Audit Officer, Assistant Accounts Officer'},
        {level:'Level 7',band:'₹44,900–₹1,42,400',posts:'Assistant Section Officer, Inspector (Income Tax), Inspector (Central Excise/GST), Inspector (Preventive Officer/Examiner), Assistant Enforcement Officer, Sub Inspector (CBI), Inspector (Posts), Inspector (Central Bureau of Narcotics)'},
        {level:'Level 6',band:'₹35,400–₹1,12,400',posts:'Executive Assistant, Research Assistant, Divisional Accountant, Sub Inspector (NIA), Sub-Inspector/JIO (Narcotics Control Bureau), Junior Statistical Officer, Statistical Investigator Grade II, Office Superintendent, Section Head (DGFT)'},
        {level:'Level 5',band:'₹29,200–₹92,300',posts:'Auditor, Accountant / Junior Accountant'},
        {level:'Level 4',band:'₹25,500–₹81,100',posts:'Postal/Sorting Assistant, Senior Secretariat Assistant (UDC), Senior Administrative Assistant, Tax Assistant, Sub-Inspector (Central Bureau of Narcotics)'}
      ],
      payNote:'Figures are 7th CPC pay-matrix bands (basic pay only) — actual in-hand adds Dearness Allowance (currently ~58% of basic) and House Rent Allowance (8–24% by city class).',
      promotion:{caveat:'Not an official timeline — a commonly cited estimate.',steps:['Inspector / ASO level → Superintendent / Officer grade — around 5–7 years','Superintendent / Officer → Assistant-Commissioner-equivalent — around 12–17 years','Further promotions happen through seniority, departmental exams, and Limited Departmental Competitive Exams (LDCE)']},
      eligibility:{age:['Group C posts: 18–27 years','Group B posts (like Inspector, ASO): up to 30 years','Statistical posts: up to 32 years','Exact limit depends on your specific post — always confirm against the current notification'],ageRelax:'OBC +3 yrs · SC/ST +5 yrs · PwBD +10 yrs · Ex-servicemen per rules',qualification:'Bachelor\'s degree in any discipline from a recognized university (Statistical/JSO posts require Maths or Statistics as a subject).'},
      howToApply:['Complete One-Time Registration (OTR) on ssc.gov.in with mobile, email, Aadhaar/ID and Class 10 details','Log in with your OTR credentials and fill the CGL application form','Select up to 3 exam centres and your category/post preferences','Upload your photo and signature to spec','Pay the fee online — ₹100 for General/OBC/EWS; free for women, SC, ST, PwBD, Ex-servicemen','Review and submit — download the confirmation page']
    },
    verified:'27 Aug 2026'},
  {code:'SSC-CHSL',name:'SSC CHSL',cat:'Central Govt',status:'closed',popularity:3,hi:{name:'एसएससी सीएचएसएल',details:{
      dataNote:'वर्तमान चक्र के लिए एसएससी सीएचएसएल अधिसूचना हमारी अंतिम जांच तक जारी नहीं हुई थी — नीचे दिए गए पद/वेतन आंकड़े सबसे हाल के पूर्ण हुए चक्र को दर्शाते हैं। जारी होने पर ssc.gov.in पर वर्तमान अधिसूचना से पुष्टि करें।',
      payGroups:[
        {level:'लेवल 4',band:'₹25,500–₹81,100',posts:'डाक सहायक / छँटाई सहायक, डाटा एंट्री ऑपरेटर, डाटा एंट्री ऑपरेटर ग्रेड ए'},
        {level:'लेवल 2',band:'₹19,900–₹63,200',posts:'निम्न श्रेणी लिपिक / कनिष्ठ सचिवालय सहायक'}
      ],
      payNote:'आंकड़े 7वें वेतन आयोग की वेतन-मैट्रिक्स सीमाएं हैं (केवल मूल वेतन) — वास्तविक हाथ में आने वाला वेतन महंगाई भत्ता (वर्तमान में मूल वेतन का ~58%) और मकान किराया भत्ता (शहर श्रेणी अनुसार 8–24%) जोड़ने के बाद बनता है।',
      promotion:{caveat:'आधिकारिक समयसीमा नहीं है — यह एक सामान्यतः बताया जाने वाला अनुमान है।',steps:['एलडीसी/जेएसए → अपर डिवीजन क्लर्क (यूडीसी) / वरिष्ठ सचिवालय सहायक — लगभग 5–7 वर्ष (वरिष्ठता के आधार पर, कभी-कभी विभागीय परीक्षा)','इसके अलावा, सभी केंद्र सरकार कर्मचारियों को वास्तविक पदोन्नति की परवाह किए बिना 10, 20 और 30 वर्ष की सेवा पूरी करने पर वेतन-स्तर उन्नयन (एमएसीपी) मिलता है']},
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
      promotion:{caveat:'Not an official timeline — a commonly cited estimate.',steps:['LDC / JSA → Upper Division Clerk (UDC) / Senior Secretariat Assistant — around 5–7 years (by seniority, sometimes a departmental exam)','Separately, all central government employees get a pay-level upgrade (MACP) after 10, 20 and 30 years of service, whether or not they\'ve actually been promoted']},
      eligibility:{age:'18–27 years as on the cutoff date set by each cycle\'s notification (exact birth-date bounds change every cycle) — confirm current bounds on ssc.gov.in.',ageRelax:'Standard SSC relaxations are expected to apply (OBC +3 yrs · SC/ST +5 yrs · PwBD +10 yrs) — not independently reconfirmed for CHSL specifically.',qualification:'Class 12 (10+2) pass from a recognized board (Data Entry Operator, Grade A posts require Mathematics as a 12th-standard subject).'},
      howToApply:['Complete One-Time Registration (OTR) on ssc.gov.in, if not already done for another SSC exam','Log in and fill the CHSL-specific application — post preference, exam centres, category','Upload your photo and signature to spec','Pay the fee online — ₹100 for General/OBC/EWS; free for women, SC, ST, PwD, Ex-servicemen','Review, submit, and save your confirmation page']
    },
    verified:'26 Aug 2026'},
  {code:'SSC-GD',vacancies:'25,487',name:'SSC GD Constable',cat:'Police',status:'closed',popularity:2,hi:{name:'एसएससी जीडी कांस्टेबल'},
    notifTitle:'Constable (GD) in CAPFs and SSF, and Rifleman (GD) in Assam Rifles Examination, 2026 (F.No. HQ-C-3007/10/2025-C-3) — most recent completed cycle; SSC GD 2027 notification (per SSC\'s own tentative calendar) is due ~Sept 2026, not yet released as of verification',
    applyStart:'01 Dec 2025',applyEnd:'31 Dec 2025 (23:00 hrs)',
    officialUrl:'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_CTGD_2026.pdf',
    photo:{dims:'No separate upload — live webcam/front-camera capture during the Online Application Form itself (candidate cannot upload a pre-existing photo)',format:'Live capture',notes:'must be captured in good light against a plain background, no cap/mask/glasses/spectacles/earphones, full-frontal face inside the camera-delineated area; photographing an existing printed photo causes summary rejection — confirmed from the official 01.12.2025 Notice, Paras 8.4 and 13.12'},
    signature:{dims:'6.0 cm × 2.0 cm',minKB:10,maxKB:20,format:'JPEG/JPG',notes:'scanned signature (not live-captured, unlike the photo) — the official Notice gives only cm × KB, no pixel dimension; blurred/miniature signatures are rejected summarily'},
    details:{
      dataNote:'(1) Photo is LIVE-CAPTURED via webcam during the application (RRB-style), not uploaded with a fixed px spec — this differs from SSC CGL/CHSL\'s upload-based photo. Only the signature is an uploaded scan. Confirmed directly from the official Notice of Examination dated 01.12.2025, Paras 8.3–8.7 and 13.9–13.12. (2) Applicant volume: coaching-site reporting (careerpower.in) cites "over 48.83 lakh candidates" for this 2026 cycle against 25,487 vacancies — a secondary figure, not an official SSC press release or RTI reply we could independently verify, but consistent with SSC\'s own multi-lakh scale for GD and clearing the >2 lakh threshold by a wide margin under any plausible reading. (3) PwBD/PwD candidates are explicitly NOT eligible for this exam (official Notice, Instruction 8) — an unusual exclusion worth flagging since most other exams on this site don\'t carry it. (4) Next cycle: per SSC\'s own official Tentative Calendar of Examinations 2026-27 (published 08.01.2026), the 2027 GD exam is scheduled for advertisement in September 2026 — not yet released as of this verification (26 Aug 2026).',
      payGroups:[{level:'Level 3',band:'₹21,700 – ₹69,100 (basic, 7th CPC Pay Matrix; commonly reported starting in-hand ~₹23,527/month with allowances)',posts:'Constable (General Duty) in BSF, CISF, CRPF, ITBP, SSB and the Secretariat Security Force (SSF); Rifleman (GD) in Assam Rifles — one single notification and pay level covers all seven forces; candidates rank all seven as preferences and are allocated a force by merit-cum-preference after PST/PET/medical.'}],
      payNote:'Confirmed from the official Notice, Para 2: a single Pay Level-3 band applies uniformly whichever of the seven forces a candidate is finally allotted to — there is no separate, higher-paying force. In-hand pay adds Dearness Allowance, House Rent Allowance and (for most CAPFs) Risk & Hardship Allowance on top of this basic band.',
      promotion:{caveat:'Not covered in the official notification — a commonly cited, unconfirmed coaching-site estimate.',steps:['Constable → Head Constable — commonly reported around 8–10 years (departmental exam / seniority)','Head Constable → Assistant Sub-Inspector → Sub-Inspector','Separately, all central forces give a pay-level upgrade (MACP) after 10, 20 and 30 years of service']},
      eligibility:{age:'18–23 years as on 01 Jan 2026 for this cycle (born not before 02 Jan 2003 and not after 01 Jan 2008) — the cutoff date shifts every cycle; confirm against the next notification.',ageRelax:'SC/ST +5 years · OBC +3 years · Ex-servicemen +3 years after deducting military service · children/dependents of 1984 riot victims: UR/EWS +5, OBC +8, SC/ST +10 years. PwBD/PwD candidates are NOT eligible to apply for this exam at all (explicitly stated in the Notice) — unlike most other exams on this site.',qualification:'Matriculation / Class 10 pass from a recognized Board. Selection also requires a Physical Standard Test (PST) and Physical Efficiency Test (PET): minimum height 170 cm male / 157 cm female (relaxed for Scheduled Tribes and several hill/North-East categories, down to as low as 150 cm female ST of NE states); minimum chest 80 cm unexpanded with 5 cm expansion for male (not measured for female); PET race — male 5 km in 24 minutes, female 1.6 km in 8.5 minutes (relaxed timings for Ladakh-region candidates). Category-wise relaxation tables are extensive — see the official Notice, Paras 12.4–12.5, before assuming you qualify.'},
      howToApply:['Complete One-Time Registration (OTR) on the new ssc.gov.in portal (an OTR from the old ssc.nic.in site will not carry over) — you can also apply via the official "mySSC" mobile app','Opt in to Aadhaar-Based Authentication during OTR if possible — this exempts you from carrying printed photos/ID at the exam centre and from strict photo/signature rejection rules','Log in and fill the Constable (GD) application — personal details, 10th-pass qualification, domicile State/UT, and up to three exam-centre preferences','Rank all seven forces (BSF, CISF, CRPF, SSB, ITBP, Assam Rifles, SSF) in strict order of priority — this cannot be changed after submission','When prompted, sit for the live in-application webcam photo capture (no photo upload option exists) — plain background, no cap/glasses, full-frontal view','Upload your scanned signature (6.0 cm × 2.0 cm, JPEG, 10–20 KB, black/blue ink on white paper)','Pay the ₹100 fee online (BHIM UPI/net banking/card) — waived for women, SC, ST and Ex-servicemen — by the fee deadline (one day after the application closes)','Use the 3-day correction window immediately after closing to fix any OTR/application errors (₹200 first correction, ₹500 second) — no changes allowed afterward','Download and save your Admission Certificate when released; sit the Computer Based Examination, then (if shortlisted) the PST/PET, Detailed Medical Examination and Document Verification stages in sequence']
    },
    verified:'26 Aug 2026'},
  {code:'SSC-MTS',tentativeNextMonth:'2026-08',tentativeNext:'Next cycle expected around Aug 2026, per SSC\'s own tentative exam calendar — not yet officially released.',vacancies:'5,464',name:'SSC MTS',cat:'Central Govt',status:'closed',popularity:4,hi:{name:'एसएससी एमटीएस'},
    notifTitle:'Multi-Tasking (Non-Technical) Staff and Havaldar (CBIC & CBN) Examination, 2025 (F.No. E/15/2025-C-2 Section) — most recent fully-confirmed cycle; SSC MTS 2026 notification (originally due ~30 Jun 2026 per SSC\'s own calendar) is reported by multiple trackers as delayed/not yet released as of our most recent check (~Aug 2026) — genuinely unresolved, see dataNote',
    applyStart:'26 Jun 2025',applyEnd:'24 Jul 2025 (23:00 hrs)',
    officialUrl:'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_mts_2025.pdf',
    photo:{dims:'No separate upload — live webcam/front-camera capture during the Online Application Form itself',format:'Live capture',notes:'good light, plain background, no cap/mask/glasses/spectacles/earphones; face fully inside the camera-delineated area — confirmed from the official 26.06.2025 Notice, Paras 10.3–10.5'},
    signature:{dims:'6.0 cm × 2.0 cm',minKB:10,maxKB:20,format:'JPEG/JPG',notes:'scanned signature only (photo is live-captured, not uploaded) — no pixel dimension given in the official Notice, cm × KB only'},
    details:{
      dataNote:'(1) Photo is live-captured via webcam (same as SSC GD/CPO), not an uploaded file with a px spec — confirmed from the official 26.06.2025 Notice (F.No. E/15/2025-C-2), Paras 10.3–10.6. (2) Applicant volume: coaching-site reporting (adda247) cites "36.17 lakh candidates applied... against 5,464 vacancies" for this cycle — a secondary figure, not an SSC press release or RTI reply we could independently verify, but far above the >2 lakh threshold under any plausible reading. MTS vacancies were reportedly revised upward in-cycle (one careers360 report cites a revised tentative total of 8,021, incl. 6,078 for the 18–25 age band, 732 for 18–27, and 1,211 Havaldar posts) — we could not independently confirm this revision against an official corrigendum, so treat the higher figure as provisional. (3) MTS 2026: per SSC\'s own official Tentative Calendar of Examinations 2026-27 (published 08.01.2026), this exam was due for advertisement in June 2026, closing July 2026, exam Sept–Nov 2026. Coaching-site trackers conflict on whether it was actually released — one claims a 30 June 2026 release, several others say it was postponed and "expected in August 2026." We could not resolve this against a primary SSC source, so we\'ve used the last FULLY CONFIRMED cycle (2025) here rather than guess at unconfirmed 2026 dates — re-verify directly against ssc.gov.in before relying on this for the current cycle.',
      payGroups:[{level:'Level 1',band:'₹18,000 – ₹56,900 (basic, 7th CPC Pay Matrix)',posts:'Multi-Tasking Staff (Non-Technical) — Group C, non-gazetted, non-ministerial posts across central government Ministries/Departments/Offices and Constitutional/Statutory Bodies, in various States/UTs'},{level:'Level 1',band:'₹18,000 – ₹56,900 (basic; same Pay Level as MTS)',posts:'Havaldar — Central Board of Indirect Taxes & Customs (CBIC) and Central Bureau of Narcotics (CBN), Department of Revenue, Ministry of Finance. Recruited through the SAME notification/exam as MTS, but Havaldar candidates additionally must clear a Physical Efficiency Test (PET) and Physical Standard Test (PST) that MTS candidates do not.'}],
      payNote:'Confirmed from the official Notice, Para 1: MTS and Havaldar are both Pay Level-1 posts despite the different departments/duties. In-hand pay adds Dearness Allowance, HRA and Transport Allowance depending on posting.',
      promotion:{caveat:'Not covered in the official notification — a commonly cited, unconfirmed coaching-site estimate.',steps:['MTS / Havaldar promotion to higher Group C grades depends on seniority, departmental exams, and vacancies in your specific department','Separately, all central government employees get a pay-level upgrade (MACP) after 10, 20 and 30 years of service, regardless of promotion']},
      eligibility:{age:['Most MTS posts: 18–25 years, as on 01 Aug 2025 (born between 02 Aug 2000 and 01 Aug 2007)','Havaldar (CBIC/CBN) and a few specified MTS posts: 18–27 years (born not before 02 Aug 1998)','Exact age band depends on your specific post — check the vacancy annexure'],ageRelax:'SC/ST +5 years · OBC +3 years · PwBD (Unreserved/EWS) +10 years · PwBD (OBC) +13 years · PwBD (SC/ST) +15 years · Ex-servicemen +3 years after deducting military service · defence personnel disabled in action +3 years (+8 for SC/ST) · Central Govt civilian employees with 3+ years\' service up to age 40 (45 for SC/ST) · widows/divorced/judicially-separated women up to age 35 (40 for SC/ST).',qualification:'Matriculation / Class 10 pass from a recognized Board. Havaldar candidates additionally must clear a Physical Efficiency Test (walking 1,600 m in 15 min male / 1 km in 20 min female) and Physical Standard Test (height 157.5 cm male, relaxable to 152.5 cm for Garhwali/Assamese/Gorkha/ST candidates — chest 81 cm expanded with 5 cm minimum expansion; height 152 cm female, weight 48 kg, both relaxable for the same categories). MTS itself carries no PET/PST requirement.'},
      howToApply:['Complete One-Time Registration (OTR) on the new ssc.gov.in portal (an old ssc.nic.in OTR will not carry over) or via the official "mySSC" mobile app','Opt in to Aadhaar-Based Authentication if possible, to avoid strict photo/signature rejection rules and carrying printed ID to the exam','Log in and fill the MTS/Havaldar application — 10th-pass qualification, your age-group (18–25 or 18–27), and whether you wish to be considered for Havaldar (CBIC/CBN)','Give your Post-cum-State/UT/Cadre-Controlling-Authority preferences in strict priority order using the codes in the Notice\'s annexure — this cannot be changed later','Sit for the live in-application webcam photo capture when prompted (no photo upload option exists)','Upload your scanned signature (6.0 cm × 2.0 cm, JPEG/JPG, 10–20 KB)','Pay the ₹100 fee online — waived for women, SC, ST, PwBD and Ex-servicemen — by the fee deadline','Use the 3-day correction window right after closing to fix errors (₹200 first correction, ₹500 second)','Download your Admission Certificate and sit the two-session Computer Based Examination (Session-I: Numerical & Reasoning; Session-II: General Awareness & English — negative marking applies only in Session-II)','If shortlisted for Havaldar, additionally appear for the Physical Efficiency Test / Physical Standard Test at a CBIC/CBN-notified centre']
    },
    verified:'26 Aug 2026'},
  {code:'SSC-CPO',tentativeNextMonth:'2026-08',tentativeNext:'Next cycle expected around Aug 2026, per SSC\'s own tentative exam calendar — not yet officially released.',vacancies:'3,073',name:'SSC CPO',cat:'Police',status:'closed',popularity:19,hi:{name:'एसएससी सीपीओ'},
    notifTitle:'Sub-Inspector in Delhi Police and Central Armed Police Forces Examination, 2025 (F.No. E/13/2025-C-2 Section) — most recent fully-confirmed cycle (Paper-I held 09–12 Dec 2025; PET/PST qualifiers declared 30 Mar 2026); SSC CPO 2026 notification (originally due ~31 May 2026 per SSC\'s own calendar) had NOT been confirmed released as of our most recent check (~Aug 2026) — see dataNote',
    applyStart:'26 Sep 2025',applyEnd:'16 Oct 2025 (23:00 hrs)',
    officialUrl:'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_capf_2025.pdf',
    photo:{dims:'No separate upload — live webcam/front-camera capture during the Online Application Form itself',format:'Live capture',notes:'good light, plain background, no cap/mask/glasses/spectacles; face fully inside the camera-delineated area — confirmed from the official 26.09.2025 Notice, Paras 8.1–8.5'},
    signature:{dims:'6.0 cm × 2.0 cm',minKB:10,maxKB:20,format:'JPEG/JPG',notes:'scanned signature only (photo is live-captured, not uploaded) — no pixel dimension given in the official Notice, cm × KB only'},
    details:{
      dataNote:'(1) Photo is live-captured via webcam (same pattern as SSC GD/MTS), not uploaded with a px spec — confirmed from the official 26.09.2025 Notice (F.No. E/13/2025-C-2), Paras 8.1–8.6. (2) Applicant volume: this cycle\'s Paper-I attendance was unusually low — coaching-site analysis (pw.live) reports only ~1,76,634 candidates actually appeared (~30–31% turnout, said to be the lowest in 5–6 years) against an estimated ~5 lakh registered candidates; that ~5 lakh figure is a secondary/coaching-site estimate, not an SSC press release or RTI reply, but even the confirmed appeared-count plus normal no-show rates makes actual registrations comfortably clear 2 lakh. We could not independently verify an exact official registration total. (3) Vacancies: the notification opened with 3,073 posts (142 Delhi Police SI male + 70 female + 2,861 CAPF SI GD); secondary sources (careers360, adda247) later reported a revised tentative total of 5,308, which we could not independently confirm against an official corrigendum — treat the higher figure as provisional. (4) CPO 2026: per SSC\'s own official Tentative Calendar of Examinations 2026-27, this exam was due for advertisement in May 2026, closing June 2026. Multiple independent trackers confirm this date passed with no notice and that the notification was still "delayed"/"expected in August 2026" as of early-to-mid August 2026; we found no confirmation it had actually been released as of 26 Aug 2026. We have therefore used the last FULLY CONFIRMED cycle (2025) as the base entry rather than guess at unconfirmed 2026 dates — re-verify directly against ssc.gov.in before relying on this for the current cycle.',
      payGroups:[{level:'Level 6',band:'₹35,400 – ₹1,12,400 (basic, 7th CPC Pay Matrix)',posts:'Sub-Inspector (Executive), male and female — Delhi Police (classified Group C by Delhi Police); Sub-Inspector (GD) — Central Armed Police Forces (CRPF, BSF, ITBP, CISF, SSB) (Group B, Non-Gazetted, Non-Ministerial). One common notification and exam covers both; candidates give ranked preferences between Delhi Police and the CAPFs.'}],
      payNote:'Confirmed from the official Notice, Paras 1.1–1.2: both Delhi Police SI (Executive) and CAPF SI (GD) sit at the same Level-6 pay band despite different Group classifications (C vs B). Male candidates for Delhi Police SI additionally need a valid LMV (Motorcycle & Car) driving licence to be eligible for Delhi Police at all — without one, male candidates can only be considered for CAPF SI posts (Notice, Para 7.7).',
      promotion:{caveat:'Not covered in the official notification — a commonly cited, unconfirmed coaching-site estimate.',steps:['Sub-Inspector → Inspector — commonly reported around 8–10+ years (by seniority / departmental exam, varies by force)','Higher ranks via Limited Departmental Competitive Exams','Separately, a pay-level upgrade (MACP) applies after 10, 20 and 30 years of service']},
      eligibility:{age:['This cycle: 20–25 years, as on 01 Aug 2025 (born between 02 Aug 2000 and 01 Aug 2005) — the cutoff shifts every cycle','Departmental Delhi Police candidates (Constables, Head Constables, ASIs with 3+ years\' service): relaxed ceiling of 30–35 years, depending on category'],ageRelax:'SC/ST +5 years · OBC +3 years · Ex-servicemen +3 years after deducting military service · widows/divorced/judicially-separated women (Delhi Police SI only) up to age 35 (40 for SC/ST) · departmental Delhi Police candidates up to 30 (UR/EWS), 33 (OBC) or 35 (SC/ST).',qualification:'Bachelor\'s degree in any discipline from a recognized university. Selection also requires a Physical Standard Test and Physical Endurance Test: height 170 cm male / 157 cm female (relaxed to 165/162.5 cm for hill-area/ST categories, down to 154 cm for female ST); chest 80→85 cm (unexpanded→expanded) for male, no chest requirement for female; PET — male 100 m in 16 sec, 1.6 km in 6.5 min, long jump 3.65 m, high jump 1.2 m, 16 lb shot put 4.5 m; female 100 m in 18 sec, 800 m in 4 min, long jump 2.7 m, high jump 0.9 m. Eyesight standard is unusually strict — 6/6 (better eye) and 6/9 (worse eye) distant vision WITHOUT any corrective lenses or surgery, plus no knock-knee/flat-foot/varicose-vein/squint — worth independently re-confirming if you wear glasses, since this could disqualify glasses-wearers outright.'},
      howToApply:['Complete One-Time Registration (OTR) on the new ssc.gov.in portal (an old ssc.nic.in OTR will not carry over) or via the official "mySSC" mobile app','Opt in to Aadhaar-Based Authentication if possible, to avoid strict photo/signature rejection rules and carrying printed ID to the exam','Log in and fill the SI application — Bachelor\'s-degree qualification, and (male candidates) whether you hold a valid LMV driving licence, which gates Delhi Police eligibility','Choose up to three exam centres in order of preference','Sit for the live in-application webcam photo capture when prompted (no photo upload option exists)','Upload your scanned signature (6.0 cm × 2.0 cm, JPEG/JPG, 10–20 KB)','Pay the ₹100 fee online — waived for women, SC, ST and Ex-servicemen — by the fee deadline','Use the 3-day correction window right after closing to fix errors (₹200 first correction, ₹500 second)','Download your Admission Certificate and sit Paper-I (General Intelligence, GK, Quantitative Aptitude, English — 2 hours, sectional 30-minute timers per part)','If shortlisted, appear for PST/PET at a CAPF/Delhi-Police-notified centre, then Paper-II (English Language & Comprehension), and finally the Detailed Medical Examination']
    },
    verified:'26 Aug 2026'},
  {code:'IBPS-PO',vacancies:'650',name:'IBPS PO',cat:'Banking',status:'closed',popularity:9,hi:{name:'आईबीपीएस पीओ'},
    notifTitle:'CRP PO/MT-XVI — Recruitment of Probationary Officers/Management Trainees (2027-28 vacancies). Window closed; prelims already held (22–23 Aug 2026), mains expected October 2026.',
    applyStart:'01 Jul 2026',applyEnd:'26 Jul 2026 (extended)',
    officialUrl:'https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf',
    photo:{dims:'3.5 cm × 4.5 cm (200 × 230 px)',px:{w:200,h:230},minKB:20,maxKB:50,format:'JPG/JPEG',notes:'recent colour photo, light/white background, no cap or dark glasses'},
    signature:{dims:'140 × 60 px',px:{w:140,h:60},minKB:10,maxKB:20,format:'JPG/JPEG',notes:'signed in black ink on white paper, not in capitals'},
    otherDocs:[
      {label:'Left thumb impression',spec:{dims:'240 × 240 px @ 200 DPI (~3×3 cm)',px:{w:240,h:240},minKB:20,maxKB:50,format:'JPG',notes:'black/blue ink on white paper'}},
      {label:'Handwritten declaration',spec:{dims:'800 × 400 px @ 200 DPI (~10×5 cm)',px:{w:800,h:400},minKB:50,maxKB:100,format:'JPG',notes:'black ink, English, not capitals'}}],
    details:{
      dataNote:'This cycle\'s application window has already closed and prelims were held this month. Re-verified 27 Aug 2026: the 20 Jul 2026 IBPS corrigendum confirmed both the extended closing date (26 Jul 2026, up from 21 Jul) and the revised vacancy count (6,715 → 7,365, +650 posts) — cross-checked across multiple independent sources. The previously-cited 7,365–7,565 range can be narrowed to the single confirmed figure of 7,365; 7,565 traces to an apparent typo on one aggregator page and has no independent support.',
      payGroups:[{level:'JMGS-I (Officer Scale I)',band:'₹48,480–₹85,920 (basic; IBA Joint Note officer scale)',posts:'Probationary Officer / Management Trainee, across 11 participating public-sector banks'}],
      payNote:'In-hand pay adds Dearness Allowance, HRA and City Compensatory Allowance on top of this basic scale, and varies by posting city.',
      promotion:{caveat:'Not stated in the official notification — a commonly cited coaching-site estimate, not official bank policy.',steps:['Scale I → Scale II — around 3–5 years (usually requires clearing the JAIIB exam)','Scale II → Scale III — around 10–15 years','Further promotions happen through internal bank promotion exams']},
      eligibility:{age:'20–30 years as on 01 Jul 2026 (born between 02 Jul 1996 and 01 Jul 2006)',ageRelax:'SC/ST +5 yrs · OBC(NCL) +3 yrs · PwBD +10 yrs · Ex-servicemen +5 yrs',qualification:'Graduate in any discipline, degree completed by 21 Jul 2026.'},
      howToApply:['Register at ibps.in under the CRP PO/MT link','Fill the application form and choose participating-bank/centre preferences','Upload photo, signature, left thumb impression, handwritten declaration and 10th certificate','Pay the fee online — ₹175 (SC/ST/PwBD), ₹850 (others)','Use the 2-day post-close edit window if needed (₹200 correction fee)','Download the call letter from ibps.in when released — no postal copies are sent']
    },
    verified:'27 Aug 2026'},
  {code:'IBPS-CL',name:'IBPS Clerk',cat:'Banking',status:'open',popularity:7,hi:{name:'आईबीपीएस क्लर्क'},
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
      promotion:{caveat:'Not stated in the official notification — a commonly cited coaching-site estimate.',steps:['Clerk → Officer Scale I — roughly 2–6 years, depending on seniority vs. the JAIIB/CAIIB fast-track route','Each bank sets its own exact promotion policy']},
      eligibility:{age:'20–28 years as on 01 Aug 2026 (born between 02 Aug 1998 and 01 Aug 2006)',ageRelax:'SC/ST +5 yrs · OBC(NCL) +3 yrs · PwBD +10 yrs · Ex-servicemen (+service period, up to 3 yrs) · widowed/divorced/judicially-separated women up to 35/38/40 yrs (Gen/OBC/SC-ST)',qualification:'Graduate in any discipline, plus basic computer literacy and proficiency in the local language of the state you apply to (tested unless your 10th-standard marksheet already shows that language).'},
      howToApply:['Register at ibps.in under the CRP CSA link, choosing one state/UT to apply for','Fill the form and upload photo, signature, left thumb impression and handwritten declaration','Pay the fee — ₹175 (SC/ST/PwBD/ESM), ₹850 (others)','Use the 2-day post-close edit window if needed (₹200 correction fee)','Download the call letter from ibps.in when released']
    },
    verified:'26 Aug 2026'},
  {code:'SBI-PO',name:'SBI PO',cat:'Banking',status:'closed',popularity:10,hi:{name:'एसबीआई पीओ'},
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
      promotion:{caveat:'SBI\'s own notification only says there\'s an "attractive promotion policy" without giving concrete timelines.',steps:['Coaching-site estimates mirror IBPS PO\'s — around 3–5 years to first promotion — but this is not confirmed by SBI itself']},
      eligibility:{age:'21–30 years as on 01 Apr 2026',ageRelax:'Standard SBI/GoI relaxations apply for reserved categories — exact figures not independently reconfirmed for this specific cycle, check the notification',qualification:'Graduate in any discipline, degree completed by 30 Sep 2026 (final-year candidates may apply provisionally).'},
      howToApply:['Register at sbi.bank.in under Current Openings → this advertisement number','Fill the online form and upload photo, signature, thumb impression and handwritten declaration','Pay the fee — ₹750 (General/EWS/OBC), free for SC/ST/PwBD','Selection: Prelims → Mains → Psychometric Test, Group Exercise and Interview']
    },
    verified:'26 Aug 2026'},
  {code:'SBI-CL',vacancies:'1,538',name:'SBI Clerk',cat:'Banking',status:'open',popularity:8,hi:{name:'एसबीआई क्लर्क'},
    notifTitle:'Advt No. CRPD/CR/2026-27/17 — Recruitment of Junior Associates (Customer Support & Sales)',
    applyStart:'11 Aug 2026',applyEnd:'31 Aug 2026',
    officialUrl:'https://sbi.bank.in/webfiles/uploads/files_2627/08/JA_2026_Detailed_Advt_Eng.pdf',
    photo:{dims:'200 × 230 px (preferred)',px:{w:200,h:230},minKB:20,maxKB:50,format:'JPG/JPEG',notes:'recent colour photo, light/white background'},
    signature:{dims:'140 × 60 px (preferred)',px:{w:140,h:60},minKB:10,maxKB:20,format:'JPG/JPEG',notes:'black ink on white paper, not in capitals'},
    otherDocs:[
      {label:'Left thumb impression',spec:{dims:'240 × 240 px @ 200 DPI (~3×3 cm)',px:{w:240,h:240},minKB:20,maxKB:50,format:'JPG'}},
      {label:'Handwritten declaration',spec:{dims:'800 × 400 px @ 200 DPI (~10×5 cm)',px:{w:800,h:400},minKB:50,maxKB:100,format:'JPG'}}],
    details:{
      dataNote:'SBI is running two overlapping recruitment drives right now: this main drive (closes 31 Aug 2026) and a separate SC/ST/OBC backlog drive (Advt CRPD/CR/SPLDRIVE/2026-27/16, 1,538 posts, closes 27 Aug 2026 — today). Combined vacancy totals across both drives aren\'t cleanly confirmed — check sbi.bank.in for the exact current figures for your category.',
      payGroups:[{level:'Clerical cadre',band:'₹24,050–₹64,480 basic; starting basic ₹26,730 with 2 advance increments for graduates',posts:'Junior Associate (Customer Support & Sales) — state/UT-wise recruitment, no interview stage'}],
      payNote:'Official notification states approximate total starting emoluments of ~₹46,000/month at a metro posting like Mumbai (inclusive of DA and current-rate allowances) — varies by posting city.',
      promotion:{caveat:'Not addressed in the official notification — treat as unconfirmed.',steps:['Coaching-site estimates mirror IBPS Clerk\'s promotion timelines']},
      eligibility:{age:'20–28 years as on 01 Apr 2026',ageRelax:'Nil application fee for SC/ST/PwBD/Ex-servicemen and their dependents; standard age relaxations apply for reserved categories',qualification:'Graduate in any discipline (by 31 Dec 2026) plus proficiency in the local language of the state applied to.'},
      howToApply:['Register at sbi.bank.in under Current Openings → the relevant advertisement number','Choose one state/UT and fill the online form','Upload photo, signature and other required documents','Pay the fee — ₹750 (General/OBC/EWS), free for SC/ST/PwBD/Ex-servicemen','No personal interview for this post — selection is exam-based only']
    },
    verified:'27 Aug 2026'},
  {code:'RRB-NTPC',name:'RRB NTPC',cat:'Railway',status:'closed',popularity:6,hi:{name:'आरआरबी एनटीपीसी'},
    notifTitle:'CEN 06/2025 (Graduate) & CEN 07/2025 (Undergraduate) — Non-Technical Popular Categories. Both windows closed since Nov 2025.',
    applyStart:'21 Oct 2025',applyEnd:'27 Nov 2025 (extended)',
    officialUrl:'https://rrbajmer.gov.in/Upload_PDF/CEN%2007-2025-NTPC%20(Under%20Graduate)%20English_compressed-638971975510934173.pdf',
    photo:{dims:'No separate upload — live webcam/front-camera capture during the application itself',format:'Live capture',notes:'no cap, mask or glasses; eyes open; non-white clothing; photographing a printed photo causes summary rejection'},
    signature:{dims:'35mm × 20mm scan box',px:{w:140,h:60},minKB:30,maxKB:49,format:'JPG/JPEG',notes:'black ink, cursive/running handwriting (not block letters), scanned at ≥100 DPI'},
    otherDocs:[{label:'SC/ST certificate (free travel pass claimants only)',notes:'PDF only, under 400 KB — confirmed for Group D\'s official notification, likely applies here too on the same portal but not independently reverified for this specific exam.'}],
    details:{
      dataNote:'RE-VERIFIED 27 Aug 2026: Graduate-cycle (CEN 06/2025) figures are now confirmed directly from the official CEN 06/2025 PDF (fetched via rrb.indianrailways.gov.in, the RRBs\' unified portal) — this also caught a real error in the previous entry, which lumped all six Graduate posts into one Level 5–6 band; Traffic Assistant is actually Level 4 (₹25,500), outside that range. Age reference date for both Graduate and Undergraduate posts is confirmed as on 01 Jan 2026. Undergraduate (CEN 07/2025) figures remain confirmed as before.',
      payGroups:[
        {level:'Level 2–3 · Undergraduate (confirmed)',band:'₹19,900–₹21,700 (basic, initial pay)',posts:'Commercial Cum Ticket Clerk (Level 3), Accounts Clerk cum Typist / Junior Clerk cum Typist / Trains Clerk (Level 2)'},
        {level:'Level 6 · Graduate (confirmed)',band:'₹35,400 (basic)',posts:'Chief Commercial-cum-Ticket Supervisor (161 vacancies), Station Master (615 vacancies)'},
        {level:'Level 5 · Graduate (confirmed)',band:'₹29,200 (basic)',posts:'Goods Train Manager (3,416 vacancies), Junior Accounts Assistant cum Typist (921 vacancies), Senior Clerk cum Typist (638 vacancies)'},
        {level:'Level 4 · Graduate (confirmed)',band:'₹25,500 (basic)',posts:'Traffic Assistant (59 vacancies)'}
      ],
      payNote:'All levels — Undergraduate and Graduate — are now confirmed directly from the official CEN 06/2025 and CEN 07/2025 PDFs. Note Traffic Assistant is Level 4 (₹25,500), distinct from the other five Graduate posts which are Level 5–6.',
      promotion:{caveat:'Not addressed in the official notification for either post group — anything cited elsewhere is coaching-site material, not RRB-confirmed.',steps:['Examples sometimes cited: Goods Guard → Senior Goods Guard, or ASM → Station Master']},
      eligibility:{age:['Undergraduate posts: 18–30 years, as on 01 Jan 2026','Graduate posts: commonly reported as 18–33 years, but not independently reverified this pass'],ageRelax:'Standard relaxations apply for reserved categories, Ex-servicemen and PwBD per RRB\'s general norms',qualification:'Undergraduate posts: 12th pass (10+2) or equivalent, ≥50% aggregate (relaxed for SC/ST/PwBD/Ex-servicemen); typing proficiency required for Accounts/Junior Clerk cum Typist. Graduate posts: Bachelor\'s degree (commonly reported, not independently reverified this pass).'},
      howToApply:['Create an account on rrbapply.gov.in (Aadhaar/DigiLocker verification recommended)','Fill the application for your post group (Graduate or Undergraduate)','Live-capture your photo during the application — there is no separate upload','Upload your signature to spec','Pay the fee — ₹500 for UR/OBC-NCL/EWS (₹400 refunded after appearing in CBT) or ₹250 for SC/ST/women/PwBD/Ex-servicemen/Transgender/Minorities/EBC (fully refunded after appearing in CBT); refund credited only to an Aadhaar-seeded bank account']
    },
    verified:'27 Aug 2026'},
  {code:'RRB-GRP-D',vacancies:'22,195',name:'RRB Group D',cat:'Railway',status:'closed',popularity:5,hi:{name:'आरआरबी ग्रुप डी'},
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
      promotion:{caveat:'Not addressed in the official notification — coaching-site consensus, not RRB-confirmed.',steps:['Track Maintainer IV → III → II → I, then Senior / Gangman roles over time']},
      eligibility:{age:'18–33 years as on 01 Jan 2026',ageRelax:'OBC-NCL +3 yrs · SC/ST +5 yrs · PwBD +10/13/15 yrs depending on category · Ex-servicemen per formula',qualification:'10th pass / Matriculation / SSLC or equivalent from a recognized board, OR ITI/NCVT National Apprenticeship Certificate for specific posts.'},
      howToApply:['Create an account on rrbapply.gov.in (Aadhaar/DigiLocker verification recommended)','Fill the application form','Live-capture your photo during the application — there is no separate upload','Upload your signature to spec','Pay the fee — ₹500 for UR/OBC-NCL/EWS (₹400 refunded after appearing in CBT) or ₹250 for SC/ST/women/PwBD/Ex-servicemen/Transgender/Minorities/EBC (fully refunded after appearing in CBT); refund credited only to an Aadhaar-seeded bank account']
    },
    verified:'26 Aug 2026'},
  {code:'RRB-ALP',vacancies:'11,127',name:'RRB ALP',cat:'Railway',status:'closed',popularity:17,hi:{name:'आरआरबी एएलपी'},
    notifTitle:'CEN 01/2026 — Assistant Loco Pilot (ALP), 11,127 vacancies across 21 RRBs/17 railway zones. Application window closed 14 Jun 2026; CBT 1 reported as tentatively scheduled for August 2026 by secondary sources (exact date not independently confirmed).',
    applyStart:'15 May 2026',applyEnd:'14 Jun 2026 (11:59 PM)',
    officialUrl:'https://www.rrbchennai.gov.in/downloads/CEN%2001_2026%20english%20.pdf',
    photo:{dims:'No separate upload — live webcam/front-camera capture during the application itself',format:'Live capture',notes:'no cap, mask or glasses/spectacles; eyes open; look straight ahead with neutral expression; non-white/dark clothing preferred; photographing a printed or digital photo causes rejection'},
    signature:{dims:'35mm × 20mm scan box',px:{w:140,h:60},minKB:30,maxKB:49,format:'JPG/JPEG',notes:'black ink, cursive/running handwriting (not block/capital/disjointed letters), scanned at ≥100 DPI — sourced from a secondary summary of the official CEN 01/2026 Application FAQ document.'},
    otherDocs:[{label:'SC/ST certificate (free travel pass claimants only)',notes:'PDF only, under 400 KB — confirmed pattern on other RRB CENs on the same portal, not independently reverified for this specific exam.'}],
    details:{
      dataNote:'Applicant volume for this exact cycle is confirmed: RRB\'s own zone-wise form fill-up data (as reported by secondary aggregators, e.g. Testbook) puts total applications at 8,40,944 for CEN 01/2026\'s 11,127 vacancies (≈76 applicants per vacancy), comfortably above the 2-lakh threshold. RE-VERIFIED 27 Aug 2026 against the primary CEN 01/2026 PDF (fetched directly from rrbchennai.gov.in): age reference date is confirmed as "as on 01-07-2026" — the "1 Jan 2026" figure circulating in some secondary sources was incorrect. Signature spec and the SC/ST-certificate spec are now also primary-confirmed. CBT 1 has NOT yet been officially scheduled as of 27 Aug 2026 — "August 2026" remains an unconfirmed secondary-source estimate; watch rrbapply.gov.in and regional RRB sites for the city intimation slip.',
      payGroups:[{level:'Level 2 (7th CPC)',band:'₹19,900 (basic, initial pay)',posts:'Assistant Loco Pilot (ALP) — single post, 11,127 vacancies'}],
      payNote:'Pay Level 2 / ₹19,900 initial basic confirmed directly against the primary CEN 01/2026 PDF, and matches the historical ALP pay level from prior cycles.',
      promotion:{caveat:'Not addressed in the official notification — coaching-site consensus, not RRB-confirmed.',steps:['Assistant Loco Pilot → Loco Pilot (Goods) — after a minimum of about 2 years\' service and about 60,000 km of running experience as an Assistant','Loco Pilot (Goods) → Loco Pilot (Mail/Express) → Senior Loco Pilot → Loco Inspector / Loco Supervisor','Departmental exams can also open routes to Power Controller, Crew Controller, or Loco Foreman','Reaching senior driving roles (e.g. Rajdhani/Shatabdi links) is commonly cited as taking 8–10+ years overall']},
      eligibility:{age:'18–30 years, as on 01 Jul 2026 — confirmed directly from the official CEN 01/2026 notification (Para 5, age table). The earlier "1 Jan 2026" figure circulating in some secondary sources is incorrect.',ageRelax:'OBC-NCL +3 yrs, SC/ST +5 yrs, Ex-servicemen per standard formula — consistent with RRB\'s general norms.',qualification:'Matriculation/SSLC plus ITI (NCVT/SCVT-recognized) in one of: Fitter, Electrician, Instrument Mechanic, Millwright/Maintenance Mechanic, Mechanic (Radio & TV), Electronics Mechanic, Mechanic (Motor Vehicle), Wireman, Tractor Mechanic, Armature & Coil Winder, Mechanic (Diesel), Heat Engine, Turner, Machinist, Refrigeration & Air-Conditioning Mechanic — OR Matriculation/SSLC plus a 3-year diploma in Mechanical/Electrical/Electronics/Automobile Engineering (or combination streams of these) in lieu of ITI, from a recognized institution.'},
      howToApply:['Create an account on rrbapply.gov.in (Aadhaar/DigiLocker verification recommended)','Select CEN 01/2026 (ALP) and register with mobile number, email ID and personal details','Fill the application form, choosing preferred RRB zone(s) per the notification\'s option rules','Live-capture your photo during the application — there is no separate upload','Upload your signature to spec (35mm × 20mm, 140×60px, 30–49KB, JPG/JPEG, cursive black ink)','Upload ITI/diploma and category certificates as required','Pay the fee — ₹500 for UR/OBC-NCL/EWS (₹400 refunded after appearing in CBT 1) or ₹250 for SC/ST/women/PwBD/Ex-servicemen/Transgender/Minorities/EBC (fully refunded after appearing in CBT 1); refund credited only to an Aadhaar-seeded bank account','Review and submit before the 14 Jun 2026 deadline','Download and retain the application confirmation/registration slip; watch rrbapply.gov.in and your regional RRB site for CBT 1 city/date intimation']
    },
    verified:'27 Aug 2026'},
  {code:'RRB-JE',name:'RRB JE',cat:'Railway',status:'open',popularity:18,hi:{name:'आरआरबी जेई'},
    notifTitle:'CEN 04/2026 — Junior Engineer (JE), Junior Engineer (IT), Depot Material Superintendent (DMS) & Chemical and Metallurgical Assistant (CMA). Corrigendum-1 (18 Aug 2026) added the CMA post and revised vacancies from 3,993 to 4,029.',
    applyStart:'14 Aug 2026',applyEnd:'13 Sep 2026 (fee payment allowed through 15 Sep; modification window 16–25 Sep — confirmed directly against the primary CEN 04/2026 PDF)',
    officialUrl:'https://rrb.indianrailways.gov.in/chandigarh',
    photo:{dims:'No separate upload — live webcam/front-camera capture during the application itself',format:'Live capture',notes:'no cap, mask or glasses; eyes open; non-white/dark clothing preferred, neutral expression; photographing a printed photo causes summary rejection — confirmed directly against the primary CEN 04/2026 PDF (Para 14.4).'},
    signature:{dims:'35mm × 20mm scan box',px:{w:140,h:60},minKB:30,maxKB:49,format:'JPG/JPEG',notes:'black ink, cursive/running handwriting (not block letters), scanned at ≥100 DPI — confirmed directly against the primary CEN 04/2026 PDF (Para 14.5.1).'},
    otherDocs:[{label:'SC/ST certificate (free travel pass claimants only)',notes:'PDF only, under 400 KB — confirmed pattern on other RRB CENs on the same portal, not independently reverified for this specific exam.'}],
    details:{
      dataNote:'RE-VERIFIED 27 Aug 2026: the primary CEN 04/2026 notification PDF (77 pages) plus Corrigendum-1 (18 Aug 2026) have now been retrieved and cross-checked directly, via rrb.indianrailways.gov.in — every pay, eligibility, vacancy, and photo/signature figure below is confirmed against the official document. No discrepancies found: pay Level 6/₹35,400 for all four posts (main CEN table + Corrigendum-1 Para 2.1 for CMA), vacancy revision 3,993→4,029 (+35 CMA +1 additional JE/Electrical/TRS post at RRB Secunderabad), Corrigendum-1 dated 18-08-2026, age 18–33 as on 01.01.2027, CMA qualification (B.Sc. with Physics & Chemistry, ≥45%), and application/modification-window dates all match the primary source exactly.',
      payGroups:[
        {level:'Level 6 (7th CPC)',band:'₹35,400 (basic, initial pay) — confirmed directly against the primary CEN 04/2026 PDF',posts:'Junior Engineer (JE), Junior Engineer (IT), Depot Material Superintendent (DMS)'},
        {level:'Level 6 (7th CPC) — added by Corrigendum-1',band:'₹35,400 (basic, initial pay) — confirmed directly against Corrigendum-1, Para 2.1',posts:'Chemical & Metallurgical Assistant (CMA) — new post added 18 Aug 2026, 35 vacancies'}
      ],
      payNote:'All four posts are confirmed at Pay Level 6 with ₹35,400 initial basic pay, verified directly against the primary CEN 04/2026 PDF and Corrigendum-1.',
      promotion:{caveat:'Not addressed in the official notification — coaching-site consensus, not RRB-confirmed.',steps:['Junior Engineer (JE) → Senior Section Engineer (SSE) → Assistant Divisional Engineer (ADE) → Divisional Engineer (DE) → Senior Divisional Engineer (SDE)','Roughly 5–7 years per step, based on seniority-cum-suitability and departmental exams']},
      eligibility:{
        age:['UR / EWS: 18–33 years, as on 01.01.2027 — confirmed directly against the primary CEN 04/2026 notification','OBC-NCL: 18–36 years (+3 years relaxation)','SC / ST: 18–38 years (+5 years relaxation)','Ex-servicemen and PwBD candidates get further relaxation under RRB\'s standard formula'],
        ageRelax:'OBC-NCL +3 yrs, SC/ST +5 yrs, PwBD up to +10/13/15 yrs depending on category, Ex-servicemen per standard formula — consistent with RRB\'s general norms.',
        qualification:'JE / JE (IT): 3-year diploma OR BE/B.Tech in the engineering discipline mapped to the specific post/exam-group — reported streams include Mechanical, Production, Automobile, Manufacturing, Mechatronics, Industrial, Machining, Instrumentation & Control, Tools & Die Making, Electrical, Electronics, Communication, Computer Science/Engineering, Information Technology, and Civil Engineering (exact post-to-discipline mapping runs to dozens of sub-categories in the official notification — not reproduced in full here). DMS: 3-year diploma in any engineering discipline. CMA: B.Sc. with Physics and Chemistry as principal subjects, minimum 45% marks. Qualification must be completed on or before the application closing date; results-awaited candidates are not eligible per secondary sources.'
      },
      howToApply:['Create an account on rrbapply.gov.in (Aadhaar/DigiLocker verification recommended)','Select CEN 04/2026 and register with mobile number, email ID and personal details','Fill the application form and choose your preferred post(s)/RRB zone(s) per the notification\'s option rules','Live-capture your photo during the application — there is no separate upload','Upload your signature to spec (35mm × 20mm, 140×60px, 30–49KB, JPG/JPEG)','Upload educational/category certificates as required','Pay the fee — ₹500 for UR/OBC-NCL/EWS (₹400 refunded after appearing in CBT 1) or ₹250 for SC/ST/women/PwBD/Ex-servicemen/Transgender/Minorities/EBC (fully refunded after appearing in CBT 1); refund credited only to an Aadhaar-seeded bank account','Review and submit before the 13 Sep 2026 deadline; use the modification window afterward if corrections are needed','Download and retain the application confirmation/registration slip for future reference']
    },
    verified:'27 Aug 2026'},
  {code:'NDA',name:'NDA',cat:'Defence',status:'closed',popularity:20,hi:{name:'एनडीए'},
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
      promotion:{caveat:'Official — from the notification\'s Appendix IV. Unlike civil service, ranks above Colonel are not time-bound.',steps:['Lieutenant (or equivalent) — on commission','Captain (or equivalent) — at 2 years','Major (or equivalent) — at 6 years','Lt Col (or equivalent) — at 13 years','Colonel (or equivalent) — on selection, or a 26-year time-scale','Brigadier and above — on selection only']},
      eligibility:{age:'Unmarried, born in the specific window stated in each cycle\'s notification (NDA(II) 2026: 01 Jan 2008–01 Jan 2011, roughly 15.5–18.5 years) — this cutoff shifts every cycle, always check the current notification rather than a fixed age range.',ageRelax:'Physical/medical standards follow the Armed Forces\' Joint Manual of Medical Standards — common disqualifiers include deviated septum, hydrocele, being under/overweight, and tattoos outside the forearm/back-of-hand area.',qualification:'12th pass, any stream, for the Army wing. 12th with Physics, Chemistry and Maths for the Air Force/Navy wing and Naval Academy entry.'},
      howToApply:['Register at upsconline.nic.in — the only official application site — via UPSC\'s 4-part system (account → Universal Registration Number → Common Application Form → exam-specific module)','Upload your photo and triple signature to spec','Pay the fee — ₹100, waived for SC/ST, all women, and wards of JCO/NCO/OR in Sainik Schools','Live photo capture is mandatory at the Common Application Form stage, in addition to the uploaded photo','Download your e-admit card when released — no postal or emailed admit cards are sent']
    },
    verified:'26 Aug 2026'},
  {code:'CDS',name:'CDS',cat:'Defence',status:'closed',popularity:21,hi:{name:'सीडीएस'},
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
      promotion:{caveat:'CDS\'s own notification doesn\'t include a promotion table — this is an inference, not a CDS-notification quote.',steps:['Once commissioned, a CDS-route officer is expected to follow the same rank structure as NDA: Lieutenant on commission → Captain at 2 yrs → Major at 6 yrs → Lt Col at 13 yrs → Colonel and above by selection']},
      eligibility:{age:'Varies by academy for CDS(II) 2026: IMA &amp; Indian Naval Academy 19–24 years (born 01 Jul 2003–01 Jul 2008), unmarried male. Air Force Academy 20–24 years (up to 26 with a valid Commercial Pilot Licence). Officers Training Academy (men) 19–25 years. OTA (women) 19–25 years, unmarried or issueless widows/divorcees also eligible.',qualification:'IMA/OTA: Bachelor\'s degree in any discipline. Indian Naval Academy: Engineering degree or Bachelor\'s with Physics. Air Force Academy: Bachelor\'s with Physics and Maths at 12th level, or a BE/BTech.'},
      howToApply:['Register at upsconline.nic.in — the only official application site — via UPSC\'s 4-part system (account → Universal Registration Number → Common Application Form → exam-specific module)','Upload your photo and triple signature to spec','Pay the fee — ₹100, waived for SC/ST, all women, and wards of JCO/NCO/OR in Sainik Schools','Live photo capture is mandatory at the Common Application Form stage, in addition to the uploaded photo','Download your e-admit card when released — no postal or emailed admit cards are sent']
    },
    verified:'26 Aug 2026'},
  {code:'AGNIVEER-ARMY',vacancies:'25,000+',name:'Agniveer (Indian Army)',cat:'Defence',status:'closed',popularity:12,hi:{name:'अग्निवीर (भारतीय सेना)'},
    notifTitle:'Indian Army Agniveer Common Entrance Examination (CEE) 2026 — notification released 12 Feb 2026 for 25,000+ vacancies across Agniveer General Duty (GD), Technical, Clerk/Store Keeper Technical, Tradesman, and specialist categories (Pharma, Nursing Assistant, Women Military Police); application window closed, CEE conducted 01–15 Jun 2026, zone/ARO-wise merit lists declared 12 Jul 2026 — candidates are now moving through document verification, physical/medical stages',
    applyStart:'13 Feb 2026',applyEnd:'01 Apr 2026 (some secondary sources report an extension to 10 Apr 2026 — not independently confirmed against a primary Army addendum)',
    officialUrl:'https://joinindianarmy.nic.in/',
    photo:{dims:'~413×531 px (unconfirmed against the live portal — this figure comes from third-party exam-photo-resizing tool sites, not a fetched official instruction page; verify on joinindianarmy.nic.in before applying)',minKB:20,maxKB:50,format:'JPG/JPEG',notes:'Reported requirement: recent colour photo with candidate\'s name and photo-capture date overlaid in a white band at the bottom. UNCONFIRMED spec — could not independently verify against the live official portal this session.'},
    signature:{dims:'~413×177 px (same caveat as photo — third-party sourced, not confirmed against the live portal)',minKB:5,maxKB:20,format:'JPG/JPEG',notes:'No evidence found of a TRIPLE-signature requirement like UPSC\'s NDA/CDS — every source describes a single signature scan. This is the opposite of NDA\'s unusual requirement, but not independently confirmed against the live joinindianarmy.nic.in form this session — verify before applying.'},
    details:{
      dataNote:'Agnipath is a 4-year tour-of-duty scheme distinct from pre-2022 permanent enrollment — do not confuse Agniveer terms (Seva Nidhi, 25% retention) with older regular-soldier pension/pay rules. This entry covers ARMY Agniveer only. Navy (Agniveer) and Air Force (Agniveer Vayu) run separate CEEs/portals and are comparably large in relative terms (Navy/Air Force together budget ~6,000 seats/year vs Army\'s ~40,000) — worth adding as separate entries later for full tri-service coverage. Applicant volume: ~12.8 lakh applicants in 2024 (up ~10% from 11.3 lakh in 2023), per Army recruitment data reported by ThePrint — Army-only, not tri-service.',
      payGroups:[
        {level:'Year 1',band:'₹30,000/month gross — ₹9,000/month to Seva Nidhi contribution, ~₹21,000/month in-hand',posts:'Agniveer General Duty, Technical, Clerk/Store Keeper Technical, Tradesman, and specialist categories — same package structure across categories'},
        {level:'Year 2',band:'₹33,000/month gross — ₹9,900/month to Seva Nidhi contribution',posts:'same as above'},
        {level:'Year 3',band:'₹36,500/month gross — ₹10,950/month to Seva Nidhi contribution',posts:'same as above'},
        {level:'Year 4',band:'₹40,000/month gross — ₹12,000/month to Seva Nidhi contribution, ~₹28,000/month in-hand',posts:'same as above'}
      ],
      payNote:'Figures (₹30,000→40,000 gross progression, 30% individual contribution matched by an equal Government contribution into the Seva Nidhi corpus) match the original 2022 Agnipath scheme announcement and are consistently repeated across sources; risk/hardship, dress, and travel allowances are paid on top. On exit after 4 years, the Seva Nidhi lump sum is commonly cited at ~₹11.71 lakh (tax-exempt) — this includes interest; could not independently verify the exact current interest rate this session, so treat the ₹11.71 lakh figure as approximate/commonly-cited rather than freshly confirmed against a primary PIB release.',
      promotion:{caveat:'Official Agnipath policy.',steps:['After the 4-year engagement, up to 25% of each batch of Agniveers may apply for the permanent/regular cadre (based on performance, discipline and organisational requirement)','Those selected continue under regular Army terms — about a 15-year engagement, with further promotion eligibility','The remaining ~75% exit with the Seva Nidhi lump sum, a skill certificate, and priority consideration for some government/paramilitary jobs — this is priority only, not a guaranteed job']},
      eligibility:{age:'17.5–21 years — exact birth-date window shifts every CEE cycle (like NDA), so always check the current notification rather than a fixed range',ageRelax:'Standard SC/ST/OBC/PwBD relaxations reported by coaching sources but not independently confirmed against a primary Army circular this session — verify before relying on any specific relaxation figure',qualification:'Varies by category: General Duty (GD) — Class 10 pass with 45% marks aggregate and 33% per subject; Technical — Class 12 pass with 50% aggregate and 40% per subject in Physics/Chemistry/Maths and English, OR a 1-year technical course (NSQF Level 4) after Class 10; Clerk/Store Keeper Technical — Class 12 pass in any stream with 60% aggregate, 50% per subject, and 50% in English plus Maths/Accounts/Book-Keeping, plus basic computer proficiency; Tradesman — Class 10 pass with 33% marks for most trades, Class 8 pass accepted for a few specific trades (e.g. Cook, Washerman, Mess Keeper). These per-category figures are corroborated across several secondary sources but were not verified against a single fetched primary PDF this session — cross-check against the current CEE notification before publishing as final.'},
      howToApply:['Register on joinindianarmy.nic.in and complete the online CEE application form (choose category — GD/Technical/Clerk-SKT/Tradesman/etc.)','Upload photo and signature to the portal\'s current specifications (verify live — see notes above)','Pay the application/exam fee via the online payment gateway','Download the CEE admit card when released (typically ~2 weeks before the exam)','Appear for the Common Entrance Examination (CEE) — computer-based test at designated centres','Wait for the zone/ARO-wise CEE merit list to be declared','Report to the Army Recruiting Office (ARO) rally venue per your merit-list category/zone for the Physical Fitness Test (PFT) — running, beam, and other events','Clear the Physical Measurement Test (PMT) — height, weight, chest measurements against category-specific standards','Undergo document verification at the rally site','Undergo the detailed Medical Examination at Military Hospital/designated medical facility','Await the final merit list combining CEE score + PFT/PMT/medical clearance','Receive enrollment/joining instructions for Agniveer training at the allotted Regimental Training Centre']
    },
    verified:'26 Aug 2026'},
  {code:'BPSC',vacancies:'1,189',name:'BPSC',cat:'State PSC',status:'closed',popularity:15,hi:{name:'बीपीएससी'},
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
      promotion:{caveat:'Unverified against a primary source — treat as an estimate.',steps:['BPSC-to-IAS promotion via the State Civil Service quota is commonly cited as notably longer than other state PSCs — around 15–20 years']},
      eligibility:{age:['Minimum age: 20, 21 or 22 years depending on post, as on 01 Aug 2026','Maximum age: 37 years (General male), 40 years (General female / EBC / BC), 42 years (SC/ST)','A PwD relaxation up to 47 appears in only one source — not independently confirmed'],ageRelax:'See age ranges above; women get an additional relaxation on the general maximum.',qualification:'Bachelor\'s degree, any discipline, from a recognized university. Bihar domicile is not required to apply — only to claim Bihar-specific reservation benefits.'},
      howToApply:['Complete registration at bpsconline.bihar.gov.in','Fill your profile, education and experience details','Capture your photo live via webcam during the application — no separate upload','Upload two signature images — one Hindi, one English — to spec','Submit and pay the fee']
    },
    verified:'26 Aug 2026'},
  {code:'UPPSC',name:'UPPSC',cat:'State PSC',status:'closed',popularity:14,hi:{name:'यूपीपीएससी'},
    notifTitle:'Combined State/Upper Subordinate Services (PCS) Exam 2026 — Advt No. A-1/E-1/2026 — window closed; prelim scheduled 06 Dec 2026',
    applyStart:'25 Jun 2026',applyEnd:'03 Aug 2026 (correction window to 10 Aug 2026 — some sources instead say 27 Jul/3 Aug; both are past either way)',
    officialUrl:'https://uppsc.up.nic.in',
    photo:{dims:'5 cm × 6 cm @ 200 DPI (≈394×472 px, derived from the official cm/DPI spec — the source states cm/DPI, not px directly)',maxKB:50,format:'JPG',notes:'true colour photo — confirmed from the official OTR photo-instructions PDF'},
    signature:{dims:'6 cm × 3 cm @ 200 DPI (≈472×236 px, derived)',maxKB:30,format:'JPG',notes:'true colour scan — confirmed from the official OTR photo-instructions PDF'},
    details:{
      dataNote:'Photo/signature specs above are now confirmed from an official source (uppsc.up.nic.in\'s OTR photo-instructions PDF), replacing the earlier unverified estimate — the pixel dimensions are derived from the stated cm+DPI, not quoted verbatim as pixels by UPPSC itself.',
      payGroups:[{level:'Level 9–10 (third-party cited, not independently verified against an official UP pay-matrix document)',band:'~₹56,100 basic upward for Deputy Collector/DSP-equivalent posts',posts:'Deputy Collector (SDM), DSP, Block Development Officer, Assistant Regional Transport Officer, Naib Tehsildar, Commercial Tax Officer, District Basic Education Officer, Food Safety Officer, and other Group B posts'}],
      payNote:'Pay figures are third-party estimates — an official UP-specific pay-matrix document could not be independently verified this pass.',
      promotion:{caveat:'A general estimate, not verified against a UP-specific rule.',steps:['PCS officers become eligible for the State-Civil-Service-to-IAS promotion quota after around 8–12 years of service']},
      eligibility:{age:'21–40 years as on 01 Jul 2026, with standard relaxation for reserved categories.',ageRelax:'Standard UP-PSC reserved-category relaxations apply.',qualification:'Bachelor\'s degree from a recognized university (some posts need a specific degree or physical standard). UP domicile is not required to sit the exam — only to claim UP-specific reservation benefits.'},
      howToApply:['Complete One-Time Registration (OTR) at otr.pariksha.nic.in if not already registered','Apply for this specific PCS notification at uppsc.up.nic.in','Upload photo and signature to spec','Pay the fee and submit']
    },
    verified:'26 Aug 2026'},
  {code:'MPPSC',name:'MPPSC',cat:'State PSC',status:'closed',popularity:16,hi:{name:'एमपीपीएससी'},
    notifTitle:'State Service Examination 2026 — Advt No. 29/2025. Prelim held 26 Apr 2026 (~3,044 shortlisted); Mains scheduled 7–12 Sep 2026 per MPPSC\'s own official exam calendar — this cycle is ongoing, not concluded.',
    applyStart:'10 Jan 2026',applyEnd:'09 Feb 2026 (late-fee extensions to 01 Apr 2026)',
    results:{stage:'Prelim result declared',date:'22 May 2026',note:'~3,044 candidates shortlisted for Mains — reported consistently across secondary sources but not confirmed against a primary MPPSC result-notice PDF.',url:'https://mppsc.mp.gov.in'},
    officialUrl:'https://mppsc.mp.gov.in/uploads/advertisement/Advt_State_Service_Exam_2026_Dated_31_12_2025.pdf',
    photo:{dims:'Pixel dimensions not found anywhere in the official notification text (a 29-page search found no cm/px/DPI pattern) — may only exist as a non-extractable graphic, or be enforced only by the upload widget itself',minKB:25,maxKB:200,format:'JPG only (mandatory)',notes:'the official notification states a 25–200 KB range but doesn\'t clearly separate a photo ceiling from a signature ceiling — treat this range as shared until confirmed otherwise'},
    signature:{dims:'Pixel dimensions not found in the official notification text — same caveat as photo',minKB:25,maxKB:200,format:'JPG only (mandatory)'},
    details:{
      dataNote:'STATUS CORRECTED (27 Aug 2026 audit): status changed from \'open\' to \'closed\' — the application window (09 Feb 2026, late-fee extended to 01 Apr 2026) closed nearly 5 months ago, but the stale \'open\' status was causing the site\'s Notice Board/ticker to mislabel this exam "closing soon" with no application window actually open. The recruitment PROCESS itself is still active and ongoing, not concluded: Prelim held 26 Apr 2026 (~3,044 shortlisted), admit cards released last week of Aug 2026, Mains scheduled 7–12 Sep 2026 per MPPSC\'s own exam calendar (confirmed against Careers360/PW Live/StudyIQ/Adda247/Drishti IAS as of this audit — one low-quality aggregator showed a conflicting "08–13 Aug 2026" but that appears to be a stale template date, not a real postponement). Vacancy count (155, per the notification) is sometimes inflated to 191 by aggregators — that 191 figure is the combined total including MPPSC\'s separately-notified State Forest Service Exam, not a correction to the State Service total; 155 remains correct here. The KB range (25–200KB) is confirmed from the official notification; exact pixel dimensions remain unconfirmed despite a direct search of the source document.',
      payGroups:[{level:'Level 12 for Deputy Collector/DSP-equivalent, Level 10 for other posts (both third-party cited)',band:'~₹78,800 basic (Level 12) or ~₹56,100 basic (Level 10) — notably higher banding than UPPSC/BPSC\'s cited levels for similar posts, not independently verified against an official MP pay-matrix document',posts:'Deputy Collector, DSP, District Registrar, Commercial Tax Officer, Block Development Officer (Group A); Naib Tehsildar, Sub-Registrar, Assistant Director in various departments (Group B) — 155 vacancies per the notification (some aggregators cite 156 or 191)'}],
      payNote:'Pay figures are third-party estimates — an official MP-specific pay-matrix document could not be independently verified this pass.',
      promotion:{caveat:'No MP-specific timeline could be verified — treat as an estimate.',steps:['The general State-Civil-Service-to-IAS quota pattern is assumed to apply']},
      eligibility:{age:['Minimum age: around 21 years','Maximum age: commonly cited as 33 years for uniformed/police-track posts, higher for other posts','The official notification\'s age table uses a legacy Hindi font that couldn\'t be reliably read this pass — treat these figures as third-party, not independently confirmed'],ageRelax:'Standard reserved-category relaxations are expected to apply — not independently confirmed this pass.',qualification:'Bachelor\'s degree from a recognized university. MP domicile is not required to apply — only to claim MP-specific reservation benefits (the notification confirms domicile-linked reservation wording for SC/ST/OBC categories).'},
      howToApply:['Register and apply via the MPOnline portal (mponline.gov.in), linked from mppsc.mp.gov.in','Upload photo and signature scans (25–200 KB per above)','Pay the base fee (₹250/₹500 by category, before any late-fee penalty) and submit']
    },
    verified:'27 Aug 2026'},
  {code:'CTET',name:'CTET',cat:'Teaching',status:'open',popularity:11,hi:{name:'सीटीईटी'},
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
      promotion:{caveat:'Not applicable in the usual sense.',steps:['CTET itself has no promotion path — career progression happens after you\'re recruited into an actual teaching post, under that employer\'s own service rules']},
      eligibility:{age:'Minimum 18 years; no upper age limit',qualification:'Paper I: 12th pass (≥50%) + 2-yr Diploma in Elementary Education, or 12th (≥50%) + 4-yr B.El.Ed, or an equivalent NCTE-recognized qualification. Paper II: Graduation (≥50%) + B.Ed, or 12th (≥50%) + 4-yr B.El.Ed/B.A.Ed/B.Sc.Ed, or graduation (≥45%) + B.Ed per NCTE norms. These clauses have several state-specific sub-variants (e.g. BTC, JBT) — confirm the exact wording against the official Information Bulletin for your qualification path.'},
      howToApply:['Apply online at ctet.nic.in during the notified window','Upload your photo and signature to spec','Pay the fee online','Download and keep your confirmation page']
    },
    verified:'26 Aug 2026'},
  {code:'UP-POLICE-CONST',vacancies:'32,679',name:'UP Police Constable',cat:'Police',status:'closed',popularity:22,hi:{name:'यूपी पुलिस कांस्टेबल'},
    notifTitle:'Constable Civil Police & Equivalent Posts Direct Recruitment-2025 (आरक्षी नागरिक पुलिस एवं समकक्ष पद सीधी भर्ती-2025) — UPPRPB, 32,679 posts',
    applyStart:'31 Dec 2025',applyEnd:'30 Jan 2026 (fee payment window extended to 02 Feb 2026)',
    officialUrl:'https://uppbpb.gov.in/',
    photo:{dims:'3.5 cm × 4.5 cm',minKB:20,maxKB:50,format:'JPG/JPEG',notes:'Recent color photo, plain/off-white background, face covering ~70% of frame, no cap/goggles, both ears visible — uploaded file (not live webcam capture), per UPPRPB OTR/application-form guidance repeated across coaching-site resizer tools; verify exact px dimensions against the live form at application time as UPPRPB does not always publish a separate photo-spec PDF.'},
    signature:{dims:'3.5 cm × 1.5 cm',minKB:5,maxKB:20,format:'JPG/JPEG',notes:'Signed in black/blue ink on white paper, uploaded as a scanned file — same caveat as photo spec above (sourced from secondary application-guide sites, not a located official spec PDF).'},
    details:{
      dataNote:'(1) This is the most recent UP Police Constable (Civil Police and equivalent — PAC/Armed Police, Special Security Force, Mounted Police, Jail Warder, Female Constable) direct recruitment cycle, notified 31 Dec 2025 by UPPRPB (Uttar Pradesh Police Recruitment and Promotion Board, uppbpb.gov.in). Application window closed 30 Jan 2026 (fee till 02 Feb 2026), so status is "closed" for fresh applications — however the recruitment PROCESS is still running: the written exam (PBT) was held 8–10 June 2026, and the official site (uppbpb.gov.in) shows active notices dated 10 Aug 2026 about Document Verification / Physical Standard Test (DV/PST) admit cards, meaning the cycle is currently at the DV/PST stage as of this verification date. (2) Vacancy count (32,679) and the 31 Dec 2025 / 8–10 Jun 2026 dates are corroborated across many secondary/coaching sites (Testbook, Careers360, Oliveboard, PW Live, CareerPower) but the official notification PDF itself could not be directly retrieved — treat exact figures as secondary-sourced pending direct PDF confirmation (re-attempted 27 Aug 2026, still unreachable). (3) Applicant-volume figures (the 40–60 lakh scale this exam is known for) could NOT be confirmed for this specific 2026 cycle — no official or secondary figure was found reporting total applications received. For context only: the prior UP Police Constable cycle (2023–24, 60,244 posts) was widely reported in the press as having received roughly 48 lakh applications — that number belongs to the PREVIOUS cycle, not this one, and is coaching/news-site reporting, not an official UPPRPB release. (4) RE-VERIFIED 27 Aug 2026: age-relaxation compounding for reserved categories was previously mislabeled — see corrected ageRelax field. General-category post-relaxation figures (18–25 male / 18–28 female) were already correct. Reserved-category (SC/ST/OBC) post-relaxation figures are 18–34 (male) / 18–37 (female), not 18–31/18–34 as previously stated (31/34 is the PRE-relaxation reserved-category ceiling). Still secondary-sourced pending direct confirmation against the official UPPRPB notification PDF, which remains unretrievable via search or direct site access.',
      payGroups:[{level:'Level 3',band:'₹21,700 – ₹69,100 (basic, 7th CPC Pay Matrix; secondary-sourced, matches standard UP police constable pay level reported across recruitment-news sites)',posts:'Constable (Civil Police) and equivalent — PAC/Armed Police Constable, Special Security Force (SSF) Constable, Mounted Police Constable, Jail Warder, Female Constable — 32,679 posts combined across all categories in this cycle'}],
      payNote:'Basic pay under Level 3 of the UP Pay Matrix, plus DA, HRA, and other allowances as admissible to Uttar Pradesh government employees; exact allowance rates not independently verified in this pass.',
      promotion:{caveat:'Not independently verified against an official UPPRPB promotion-rules document.',steps:['Standard UP Police hierarchy: Constable → Head Constable → Assistant Sub-Inspector (ASI) → Sub-Inspector (SI)','Promotion happens departmentally, by seniority, over a career']},
      eligibility:{age:['Base general-category limit: 18–22 years (male) / 18–25 years (female), as on 01 Jul 2026','UP govt separately announced a one-time extra 3-year age relaxation for this cycle, across all categories','The cutoff and reference date shift every cycle — verify against the live notification'],ageRelax:'SC/ST/OBC candidates get standard reservation-category age relaxation on top of the general limit, plus the UP government\'s one-time +3-year relaxation (order dated ~5 Jan 2026) that applies across all categories for this cycle. Multiple secondary sources (testbook, oliveboard, pw.live, adda247), consistent with a government news-service item (newsonair.gov.in, 5 Jan 2026), agree the reserved-category (SC/ST/OBC) ceiling BEFORE the special +3-year order is 31 years (male) / 34 years (female), and AFTER it is applied the resulting upper limits are 34 years (male) / 37 years (female) — this corrects a previous reading, which had mislabeled the pre-relaxation 31/34 figures as the post-relaxation numbers. Still not confirmed against the official PDF itself, so treat as approximate.',qualification:'Passed Class 12 (Intermediate) or equivalent from a recognized board.'},
      howToApply:['Step 1: Register on the UPPRPB One Time Registration (OTR) portal at uppbpb.gov.in with basic personal details, mobile number and email.','Step 2: Log in and fill the Constable Civil Police 2025 application form with educational, category and physical-eligibility details.','Step 3: Upload scanned photograph (3.5 cm × 4.5 cm, 20–50 KB, JPG) and signature (3.5 cm × 1.5 cm, 5–20 KB, JPG) as per the specification on the live form.','Step 4: Pay the application fee online (₹500 for General/OBC/EWS; ₹400 for SC/ST, per secondary reporting) via the payment gateway.','Step 5: Review and submit the form; download/print the confirmation page for records.','Step 6: Await written exam (PBT) admit card, appear for the exam, then proceed through Document Verification (DV), Physical Standard Test (PST) and Physical Efficiency Test (PET) — PST/PET standards: male height ≥168 cm (Gen/OBC/SC), ≥160 cm (ST), chest 79–84 cm (Gen/OBC)/77–82 cm (SC) with expansion, weight ≥50 kg, 4.8 km run in 25 min; female height ≥152 cm (Gen/OBC/SC), ≥147 cm (ST), no chest measurement, weight ≥40 kg, 2.4 km run in 14 min — per secondary reporting (Oliveboard, CareerPower, uppjob.com), not independently confirmed against an official PST/PET standards PDF.']
    },
    verified:'27 Aug 2026'},
  {code:'IBPS-RRB',name:'IBPS RRB',cat:'Banking',status:'closed',popularity:23,hi:{name:'आईबीपीएस आरआरबी'},
    notifTitle:'CRP RRBs XIV — Common Recruitment Process for Officers (Scale-I, II & III) and Office Assistants (Multipurpose) in Regional Rural Banks. Single notification/application window covers both the Officer and Office Assistant tracks (separate exam fee per track). Online registration 01 Sep – 28 Sep 2025 (extended).',
    applyStart:'01 Sep 2025',applyEnd:'28 Sep 2025 (extended via corrigendum from original 21 Sep 2025)',
    officialUrl:'https://www.ibps.in/wp-content/uploads/CRP-RRBs-XIV_Final_AD-27.09.25.pdf',
    photo:{dims:'4.5 cm × 3.5 cm (200 × 230 px, preferred)',px:{w:200,h:230},minKB:20,maxKB:50,format:'JPG/JPEG',notes:'recent colour passport-style photo, light/preferably white background, no cap or dark glasses (religious headwear allowed if face fully visible); candidate must also live-capture a photo via webcam/mobile during registration in addition to this uploaded scan'},
    signature:{dims:'140 × 60 px (preferred)',px:{w:140,h:60},minKB:10,maxKB:20,format:'JPG/JPEG',notes:'signed in black ink on white paper, not in capital letters'},
    otherDocs:[
      {label:'Left thumb impression',spec:{dims:'240 × 240 px @ 200 DPI (~3×3 cm)',px:{w:240,h:240},minKB:20,maxKB:50,format:'JPG/JPEG',notes:'black or blue ink on white paper; right thumb or another finger/toe may be substituted per the notification\'s fallback rules if left thumb is unavailable'}},
      {label:'Handwritten declaration',spec:{dims:'800 × 400 px @ 200 DPI (~10×5 cm)',px:{w:800,h:400},minKB:50,maxKB:100,format:'JPG/JPEG',notes:'declaration text specified in the notification, written by the candidate in English, not in capital letters, black ink on white paper'}}],
    details:{
      dataNote:'This is the CRP RRBs XIV (2025) cycle — the most recently closed IBPS RRB cycle as of this verification (26 Aug 2026); no CRP RRBs XV notification had been published on ibps.in as of that date, though several coaching/aggregator sites (e.g. careerpower.in, adda247.com) speculate a next cycle "on 31 Aug 2026" — that date is unconfirmed and not sourced to any official IBPS document, so it is not used here. Officer (Scale I/II/III) and Office Assistant posts share a single detailed notification and common important-dates schedule, but candidates apply and pay fees separately per track — treated here as one entry per the SSC-GD-style multi-post convention. Total vacancy count is disputed across secondary sources following IBPS\'s revised-vacancy update — coaching sites variously report 13,217 / 13,294 / 13,301 / 13,516 total posts; we could not independently sum the bank-wise Annexure I table in the primary 71-page notification (ibps.in, CRP-RRBs-XIV_Final_AD-27.09.25.pdf) in this pass to arbitrate between these figures, so no single total is asserted here — verify against the primary PDF\'s Annexure I before publishing a headline vacancy number. Pay scale is NOT stated in the IBPS notification itself (RRB officer/assistant pay follows the NABARD/RRB bipartite wage settlement administered separately from IBPS); figures below are coaching-site reporting (careerpower.in, testbook.com) of the pay scale, not an IBPS-published figure — flagged accordingly.',
      payGroups:[
        {level:'Office Assistant (Multipurpose)',band:'Basic ₹24,050 (reported RRB bipartite-settlement scale; not stated in the IBPS notification itself — coaching-site figure, unconfirmed against a primary pay-scale document)',posts:'Office Assistant (Multipurpose), Group "B", across participating Regional Rural Banks'},
        {level:'Officer Scale-I (Assistant Manager)',band:'Basic ₹48,480, scale ₹48,480–2000/7–62,480–2340/2–67,160–2680/7–85,920 (reported RRB officer bipartite-settlement scale; not stated in the IBPS notification itself)',posts:'Officer Scale-I (Assistant Manager), Group "A"'},
        {level:'Officer Scale-II (Manager) / Scale-III (Senior Manager)',band:'Higher basic pay than Scale-I per RRB officer scale; exact figures not independently confirmed this pass',posts:'Officer Scale-II — General Banking Officer, IT Officer, Chartered Accountant, Law Officer, Treasury Manager, Marketing Officer, Agricultural Officer; Officer Scale-III — Senior Manager'}],
      payNote:'The IBPS detailed notification (Clause covering remuneration is not present in this document; RRB pay follows the separate NABARD/RRB officer and Office Assistant bipartite wage settlements) does not itself publish pay-scale figures. All pay figures above are secondary/coaching-site reporting (careerpower.in, testbook.com) of the applicable bipartite-settlement scale — confirm against the allotted RRB\'s own pay circular before relying on them.',
      promotion:{caveat:'Not covered by IBPS — each Regional Rural Bank sets its own promotion policy, and no figures are available here.'},
      eligibility:{age:['Office Assistant: 18–28 years','Officer Scale I: above 18, below 30 years','Officer Scale II: above 21, below 32 years','Officer Scale III: above 21, below 40 years','All as on 01 Sep 2025, per the official notification\'s birth-date windows'],ageRelax:'SC/ST +5 yrs · OBC(NCL) +3 yrs · PwBD +10 yrs · Ex-servicemen: actual defence service + 3 yrs (8 yrs for disabled ESM from SC/ST), subject to standard maximums — confirmed from the official notification',qualification:'Office Assistant & Officer Scale-I: Bachelor\'s degree in any discipline from a recognized university, plus local-language proficiency as prescribed by the participating RRB. Officer Scale-II (General Banking): Bachelor\'s degree with ≥50% aggregate + 2 years\' officer experience in a bank/FI. Officer Scale-II Specialist posts (IT/CA/Law/Treasury/Marketing/Agricultural Officer) and Scale-III each carry their own degree + relevant post-qualification experience requirement (1–5 years depending on post) — see official notification for the full post-wise table.'},
      howToApply:['Register at ibps.in under the CRP RRBs XIV link, choosing the Officer or Office Assistant application separately as applicable','Fill the application form with personal, educational and category details, and select RRB/state preferences per the notification\'s option rules','Upload photograph (or live-capture via webcam/mobile), signature, left thumb impression and handwritten declaration as per the specifications above; also upload SSC/10th-standard and category certificates where applicable','Pay the fee online — ₹175 (SC/ST/PwBD, plus Ex-servicemen for Office Assistant) or ₹850 (all others), inclusive of GST','Use the post-close Edit Window (announced separately on ibps.in) if corrections are needed','Download call letters for the Preliminary, Main/Single exam and (for Officer posts) interview from ibps.in when released']
    },
    verified:'26 Aug 2026'},
  {code:'SSC-JE',vacancies:'1,731',name:'SSC JE',cat:'Central Govt',status:'closed',popularity:24,hi:{name:'एसएससी जेई'},
    notifTitle:'Junior Engineer (Civil, Mechanical, Electrical and Quantity Surveying & Contracts) Examination, 2025 (F.No. HQ-C-3019/2/2025-C-3) — for CPWD, CWC, MES, Department of Posts, BRO and other user departments; 1,340 posts notified at launch, revised to 1,731 in the final result declared 3 Aug 2026. This is the most recently CLOSED cycle — SSC JE 2026 was only "expected after 15 Aug 2026" per coaching sites and had not been located on ssc.gov.in as of this research (26 Aug 2026).',
    applyStart:'30 Jun 2025',applyEnd:'21 Jul 2025 (23:00 hrs)',
    officialUrl:'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/tentative_vacancies_05082025.pdf',
    photo:{dims:'3.5 cm × 4.5 cm (unverified against primary PDF — see dataNote)',minKB:20,maxKB:50,format:'JPEG',
      notes:'Passport-size colour photo, light/plain background, no cap/spectacles/shadows; commonly required to show a printed photo-taken date on SSC forms. SSC JE is traditionally an upload-based flow (unlike the live-webcam-capture now used for SSC MTS/CHSL/CGL) — this should be re-confirmed against the JE 2025 notice PDF before treating as settled.'},
    signature:{dims:'4.0 cm × 2.0 cm',minKB:10,maxKB:20,format:'JPEG',
      notes:'Handwritten signature in black ink on white paper, scanned; block/capital letters and digital signatures not accepted.'},
    details:{
      dataNote:'(1) Figures above blend SSC\'s official notice-board documents (vacancy/result PDFs located on ssc.gov.in) with coaching-site summaries (careerpower, adda247, examphoto.in, engineersacademy) for photo/signature KB and cm specs, which were NOT independently confirmed against the primary June 2025 notification PDF text — flagged as secondary-source figures. (2) The exact original 30 Jun 2025 notification PDF filename could not be retrieved via search; officialUrl above points to a verified real ssc.gov.in notice-board attachment (tentative vacancy notice) from the same cycle — check ssc.gov.in Notice Board directly for the canonical notification. (3) Cycle timeline (all confirmed via ssc.gov.in notice-board search hits): Paper-I held 3–6 Dec 2025, Paper-II held 7 Apr 2026, Paper-II result 9 Jul 2026, final result 3 Aug 2026 (1,731 selected of 14,062 Paper-II appearances).',
      payGroups:[{level:'Level 6',band:'₹35,400 – ₹1,12,400 (basic, 7th CPC Pay Matrix, Group B Non-Gazetted)',posts:'Junior Engineer (Civil/Mechanical/Electrical/Quantity Surveying & Contracts) — CPWD, CWC (Central Water Commission), MES (Military Engineer Services), Department of Posts, BRO (Border Roads Organisation), Farakka Barrage Project, CWPRS and other user departments'}],
      payNote:'Pay level and recruiting departments reflect the standard SSC JE cadre structure; the department-wise vacancy split for 2025 changed between the tentative (1,340) and final (1,731) vacancy notices — check the final vacancy PDF on ssc.gov.in for the department-wise breakup.',
      promotion:{caveat:'No promotion timeline is stated by SSC — JE is an entry-level post.',steps:['Career progression (for example, to Assistant Engineer) is decided independently by each recruiting department\'s own rules','Specific "X years to promotion" figures seen on coaching sites are unverified — don\'t treat them as official']},
      eligibility:{age:['Most posts: not exceeding 30 years, as on 01 Jan 2026','CPWD posts: up to 32 years','Exact department-wise cutoffs are in the official notice'],
        ageRelax:'SC/ST +5 years · OBC +3 years · PwBD +10 years (unreserved, higher for reserved-category PwBD) · Ex-Servicemen and Central Govt employees per standard government norms — verify exact figures against the notice PDF',
        qualification:'3-year Diploma or Degree (B.E./B.Tech) in Civil/Mechanical/Electrical Engineering from a recognised university/institution depending on post and department; Quantity Surveying & Contracts posts require a Degree/Diploma in Civil Engineering or Quantity Surveying — exact department-wise qualification matrix is in the notification'},
      howToApply:['Step 1: Complete One-Time Registration (if not already registered) on ssc.gov.in','Step 2: Log in and fill the JE 2025 application with personal, educational and department-preference details','Step 3: Upload scanned photograph and signature per the notice specifications','Step 4: Pay the application fee (₹100; exempted for women/SC/ST/PwBD/Ex-Servicemen) online','Step 5: Submit and retain the confirmation page/printout']
    },
    verified:'26 Aug 2026'},
  {code:'EPFO-SSA',name:'EPFO Social Security Assistant',cat:'Central Govt',status:'closed',popularity:25,hi:{name:'ईपीएफओ एसएसए'},
    notifTitle:'Recruitment of Social Security Assistant (SSA, formerly "Assistant") and Stenographer in EPFO — Advertisement dated 24 Mar 2023 (2,674 SSA + 185 Stenographer posts). This remains the most recent CONFIRMED SSA recruitment cycle as of 26 Aug 2026 — no newer official SSA vacancy notification was located; treat any "2025/2026 EPFO SSA notification" claims on coaching sites as unconfirmed speculation (see dataNote).',
    applyStart:'27 Mar 2023',applyEnd:'26 Apr 2023',
    officialUrl:'https://www.epfo.gov.in/recruitments/',
    photo:{dims:'not stated in accessible secondary sources — verify cm dimensions against the official PDF',minKB:10,maxKB:200,format:'JPG/JPEG',
      notes:'Recent scanned photograph. A left-hand thumb-impression scan (10–200 KB, same format) was also required as a separate upload alongside photo and signature.'},
    signature:{dims:'not independently confirmed',minKB:4,maxKB:30,format:'JPG/JPEG',
      notes:'Scanned signature upload; KB range is from coaching-site summaries of the 2023 notification (bankersadda/careerpower), not independently re-verified against the primary PDF text.'},
    details:{
      dataNote:'(1) EPFO recruits SSA directly through its own Recruitment Cell — the advertisement is published on EPFO\'s own portal, NOT via SSC. For the 2023 cycle, the Computer-Based Examination itself was administered on EPFO\'s behalf by the National Testing Agency (NTA) as testing partner (per the official advertisement and NTA\'s recruitment portal). (2) This 2023 cycle (closed 26 Apr 2023) is the most recent SSA recruitment found; a circular dated 24 Nov 2025 on epfindia.gov.in references "reallocation of states in the cadre of SSA DR 2024 batch," indicating candidates selected from the 2023 advertisement were still being allocated as the "2024 batch" as recently as Nov 2025 — consistent with no newer SSA vacancy round since. (3) Multiple coaching sites (careerpower, testbook, oliveboard, ixambee) claim an EPFO SSA 2025 or 2026 cycle is "expected soon," with conflicting claims about who will conduct it next (some say NTA again, one says IBPS) — none of this is an official EPFO announcement and it is NOT reflected in status/dates here; status is set to "closed" (last confirmed cycle) rather than "upcoming." (4) RE-VERIFIED 27 Aug 2026: the old epfindia.gov.in PDF link now 404s after EPFO migrated its site to epfo.gov.in (a WordPress-based redesign) — officialUrl updated to the live epfo.gov.in/recruitments/ page, which currently shows "No jobs found," directly confirming (from a primary source) that no new SSA cycle exists as of this date.',
      payGroups:[{level:'Level 5',band:'₹29,200 – ₹92,300 (basic, 7th CPC Pay Matrix)',posts:'Social Security Assistant (SSA) — clerical/assistant cadre across EPFO regional and zonal offices. Stenographer posts were recruited in the same 2023 cycle at a separate pay level not detailed here.'}],
      payNote:'Level 5 is the verifiable 7th CPC figure from the 2023 advertisement; some secondary sources additionally cite a pre-7th-CPC-style "grade pay ₹2,400" figure that mixes old and new pay-commission terminology — not used here as it could not be reconciled with the official Level 5 matrix.',
      promotion:{caveat:'No verified promotion schedule is available for this post — don\'t treat any figure from other sources as confirmed.'},
      eligibility:{age:'18–27 years (per the 2023 advertisement)',
        ageRelax:'Standard central government relaxations apply for SC/ST/OBC/PwBD/Ex-Servicemen — exact category-wise figures for this cycle were not independently re-verified here',
        qualification:'Bachelor\'s degree from a recognised university, plus a typing speed of 35 wpm in English or 30 wpm in Hindi on computer'},
      howToApply:['Step 1: Register on the EPFO recruitment portal (linked from epfindia.gov.in; hosted via NTA for the 2023 cycle)','Step 2: Fill personal, educational and category details in the online application','Step 3: Upload scanned photograph, signature and left-hand thumb impression per the notice specifications','Step 4: Pay the application fee online','Step 5: Submit and retain the confirmation/printout for reference']
    },
    verified:'27 Aug 2026'},
  {code:'RBI-ASSISTANT',vacancies:'650',name:'RBI Assistant',cat:'Banking',status:'closed',popularity:26,hi:{name:'आरबीआई सहायक'},
    notifTitle:'Recruitment for the post of Assistant — Panel Year 2025, 650 vacancies across RBI offices. Application window 16 Feb – 10 Mar 2026 (extended from 08 Mar 2026).',
    applyStart:'16 Feb 2026',applyEnd:'10 Mar 2026 (extended from original 08 Mar 2026 — secondary sources now consistently agree on this specific pairing; primary RBI PDF still unreachable to confirm directly)',
    officialUrl:'https://opportunities.rbi.org.in',
    photo:{dims:'4.5 cm × 3.5 cm (200 × 230 px)',px:{w:200,h:230},minKB:20,maxKB:50,format:'JPG/JPEG',notes:'recent colour photo, light/white background, no cap or dark glasses — reported by multiple coaching-site aggregators (guidely.in, sahiphoto.in and others) as matching the IBPS-style spec used across RBI/IBPS banking recruitment; the primary RBI notification PDF could not be directly retrieved in this research pass (network access to opportunities.rbi.org.in document links was unreliable in the research environment), so this is not independently confirmed against the primary document'},
    signature:{dims:'140 × 60 px',px:{w:140,h:60},minKB:10,maxKB:20,format:'JPG/JPEG',notes:'signed in black ink on white paper, not in capital letters — same caveat as photo spec above: sourced from secondary coverage, not independently confirmed against the primary RBI PDF'},
    otherDocs:[
      {label:'Left thumb impression',spec:{dims:'240 × 240 px @ 200 DPI (~3×3 cm)',px:{w:240,h:240},minKB:20,maxKB:50,format:'JPG/JPEG',notes:'black/blue ink on white paper — secondary-source figure, not independently confirmed against the primary notification'}},
      {label:'Handwritten declaration',spec:{dims:'800 × 400 px @ 200 DPI (~10×5 cm)',px:{w:800,h:400},minKB:50,maxKB:100,format:'JPG/JPEG',notes:'black ink, English, not in capital letters — secondary-source figure, not independently confirmed against the primary notification'}}],
    details:{
      dataNote:'This is the "Panel Year 2025" cycle (notification dated 16 Feb 2026), the most recent RBI Assistant cycle as of this verification — application window already closed. The primary RBI notification PDF (expected on rbi.org.in / opportunities.rbi.org.in) could not be directly retrieved in this research pass — the RBI recruitment portal appears to be a JS-rendered application and direct PDF links were not discoverable via search or direct requests in the time available. All figures below (vacancy count, pay scale, age/qualification, fee, document upload specs, application timeline) are cross-checked across several independently-agreeing coaching/aggregator sources (careerpower.in, testbook.com, adda247.com, bankersadda.com, mahendras.org, guidely.in) rather than confirmed against RBI\'s own primary document — treat all figures here as unverified against the primary source and confirm against opportunities.rbi.org.in before publishing. RE-ATTEMPTED retrieval 27 Aug 2026: located what appear to be the actual primary PDF URLs on rbidocs.rbi.org.in (detailed advertisement and window-extension notice), but both are behind a CAPTCHA wall and still not programmatically retrievable — the "PDF unreachable" caveat stands. However, cross-checking against a wider set of independent secondary sources this pass resolved the extended-deadline dispute: original close was 08 Mar 2026, extended to 10 Mar 2026 (11:59 PM) — every source giving both dates agrees on this pairing, so 10 Mar is treated as the correct final date pending primary confirmation. The correction-window dates (14–15 Mar 2026, ₹200 fee) are also now confirmed across multiple independent sources rather than loosely reported. Note that RBI Assistant recruitment (prelims/mains) is conducted by IBPS on RBI\'s behalf, which is consistent with the document specs matching the IBPS PO/RRB pattern exactly.',
      payGroups:[{level:'Assistant',band:'Basic ₹29,000, reported scale ₹29,000–1700(3)–34,100–2040(4)–42,260–2720(6)–58,580–2950(2)–64,480–3370(3)–74,590–4050(1)–78,640 (12th bipartite-settlement clerical scale, as reported by coaching-site sources — not confirmed against a primary RBI pay circular)',posts:'Assistant (clerical grade), 650 vacancies across RBI offices — post-wise/office-wise breakup not independently verified'}],
      payNote:'Pay figures are secondary/coaching-site reporting of the applicable bipartite-settlement clerical scale; not confirmed against a primary RBI document in this pass.',
      promotion:{caveat:'Not addressed in any source reviewed — no promotion-timeline claim can be made.'},
      eligibility:{age:'20–28 years as on 01 Feb 2026 (secondary-source reporting; reference date not confirmed against the primary notification)',ageRelax:'Standard RBI/IBPS-pattern relaxations reportedly apply (SC/ST, OBC-NCL, PwBD, Ex-servicemen) but exact figures were not independently confirmed against the primary notification this pass',qualification:'Bachelor\'s degree in any discipline with a minimum of 50% aggregate marks (pass class for SC/ST/PwBD candidates, per secondary-source reporting), plus proficiency in word processing on a computer — not independently confirmed against the primary notification'},
      howToApply:['Register at opportunities.rbi.org.in under the Assistant recruitment link','Fill the application form with personal, educational and category details, and select preferred RBI office/centre per the notification\'s option rules','Upload photograph, signature, left thumb impression and handwritten declaration as per the specifications above','Pay the fee online — reported as ₹50 + GST for SC/ST/PwBD/Ex-servicemen (≈₹59 total) and ₹450 + GST for all others (≈₹531 total), per secondary-source reporting, not confirmed against the primary fee clause','Use the post-close correction window (14–15 Mar 2026, ₹200 fee — confirmed across multiple independent secondary sources) if corrections to centre/parents\' names/marks are needed','Download call letters from opportunities.rbi.org.in when released for Prelims, Mains and the Language Proficiency Test (LPT)']
    },
    verified:'27 Aug 2026'},
  {code:'IB-ACIO',vacancies:'3,717',name:'IB ACIO',cat:'Central Govt',status:'closed',popularity:27,hi:{name:'आईबी एसीआईओ'},
    notifTitle:'Assistant Central Intelligence Officer Grade-II/Executive Examination, 2025 — notification released by the Ministry of Home Affairs (Intelligence Bureau) on 18–19 Jul 2025 for 3,717 posts (General 1,537 / OBC 946 / EWS 442, remainder SC/ST per category-wise breakup). This is the most recent IB ACIO cycle; its application window closed long ago and the full selection process has since concluded (Tier-I: 16–18 Sep 2025 · Tier-II: 11 Jan 2026 · Interviews: Apr 2026 · Final result: 3 Jun 2026) — included as the latest cycle per IB ACIO\'s known irregular/multi-year notification pattern, not as a currently live exam.',
    applyStart:'19 Jul 2025',applyEnd:'10 Aug 2025 (fee payment till 12 Aug 2025)',
    officialUrl:'https://www.mha.gov.in/en/notification/vacancies/recruitment-post-of-acio-iiexe-ib-reg',
    photo:{dims:'not confirmed — see dataNote',minKB:100,maxKB:200,format:'JPG/JPEG',
      notes:'Recent scanned passport-size photograph. Exact cm dimensions not found in accessible secondary sources; MHA\'s ACIO application flow is upload-based (not live-capture) per secondary sources — direct notification PDF text not independently retrieved to confirm cm specs.'},
    signature:{dims:'not confirmed',minKB:80,maxKB:150,format:'JPG/JPEG',
      notes:'Scan of the signature area only (not the full page). KB range from coaching-site summaries (careerpower, rrbapply), not independently verified against the primary MHA notification PDF.'},
    details:{
      dataNote:'(1) IB ACIO Grade-II/Executive is recruited directly by MHA/IB via mha.gov.in (applications were also routed through www.ncs.gov.in) — NOT by SSC. This is distinct from a separate, smaller "ACIO Grade-II/Technical" recruitment (2025 cycle: 258 posts) that MHA ran on a different notification around the same period; do not conflate the two. (2) RE-VERIFIED 27 Aug 2026: found a more specific officialUrl (MHA\'s actual ACIO-II/Exe notification page, replacing the bare domain root previously used) — however its underlying PDF/photo-signature-spec content still could not be extracted (the page\'s static HTML only exposes a generic certificate link; the real attachment needs JS rendering not reachable via fetch in this pass, and a second candidate PDF on ncs.gov.in is intercepted by that site\'s SPA router). The photo/signature cm/KB-spec caveat below therefore remains accurate and unresolved. (3) As flagged previously, IB ACIO notification timing is historically irregular (multi-year gaps between cycles have occurred); re-checked 27 Aug 2026 — no IB ACIO 2026 notification has been released, and the expected window has slipped further, from "June–Aug 2026" to now "Oct/Nov 2026" per multiple sources. This 2025 cycle remains the most recent one, its process essentially complete (final result 3 Jun 2026) — do not infer a new cycle is imminent.',
      payGroups:[{level:'Level 7',band:'₹44,900 – ₹1,42,400 (basic, 7th CPC Pay Matrix, General Central Service, Group C Non-Gazetted, Non-Ministerial)',posts:'Assistant Central Intelligence Officer (ACIO) Grade-II/Executive — Intelligence Bureau, Ministry of Home Affairs; carries a 20% Special Security Allowance plus other admissible central government allowances per secondary-source summaries (not independently verified against the primary notification text)'}],
      payNote:'Level 7 and the 20% Special Security Allowance figure are repeated consistently across secondary sources but were not cross-checked against the primary MHA PDF directly — treat the allowance percentage as provisional pending direct verification.',
      promotion:{caveat:'No official promotion timeline was found in available sources — don\'t treat any schedule as confirmed.'},
      eligibility:{age:'18–27 years as on 10 Aug 2025 (the application closing date) — born not before 11 Aug 1998 and not after 10 Aug 2007. Multiple independent secondary sources now consistently confirm this exact birth-date window; the earlier "20–28" figure surfaced by one source appears to be an isolated aggregator-table error and is not corroborated elsewhere.',
        ageRelax:'Standard central government relaxations for SC/ST/OBC/PwBD/Ex-Servicemen apply; exact figures not independently re-verified for this cycle',
        qualification:'Graduation (Bachelor\'s degree) in any discipline from a recognised university, plus working knowledge of computers'},
      howToApply:['Step 1: Register on the MHA recruitment portal (mha.gov.in) or via www.ncs.gov.in','Step 2: Fill personal, educational and category details in the online application','Step 3: Upload scanned photograph and signature per the notice specifications','Step 4: Pay the application fee online','Step 5: Submit and retain the confirmation/printout for reference; selection proceeds via Tier-I (objective), Tier-II (descriptive) and an Interview']
    },
    verified:'27 Aug 2026'},
];

const CAT_CLASS={
  'Central Govt':'cat-central','Banking':'cat-banking','Railway':'cat-railway',
  'Defence':'cat-defence','State PSC':'cat-state','Teaching':'cat-teaching','Police':'cat-police'
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
// Reuses the calendar page's card/status system (badge, status pill, bullet
// list, "→" CTA) so the two exam-browsing surfaces feel like the same
// product rather than two different UIs — see calItemStatus/CAL_STATUS_LABEL.
function renderExamListingCard(a){
  const d=parseExamDate(a.applyEnd);
  const status=calItemStatus({a,d,tentative:false});
  const dtl=(currentLang==='hi'&&a.hi&&a.hi.details)?Object.assign({},a.details,a.hi.details):(a.details||{});
  const meta=[];
  if(d) meta.push('<li><span class="cal-bullet-ic">⏰</span><span>'+(a.status==='open'?T('card.lastDate'):T('card.closedOn'))+' '+d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+'</span></li>');
  if(dtl.eligibility&&dtl.eligibility.qualification) meta.push('<li><span class="cal-bullet-ic">🎓</span><span class="listing-clamp">'+dtl.eligibility.qualification+'</span></li>');
  if(a.vacancies) meta.push('<li><span class="cal-bullet-ic">👥</span><span>'+a.vacancies+' '+T('card.vacancies')+'</span></li>');
  return '<a class="cal-notice-card exam-listing-card" href="index.html?exam='+a.code+'">'+
    '<div class="cal-notice-card-head">'+
      '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
      '<span class="status-pill '+status+'">'+calStatusLabel(status)+'</span>'+
    '</div>'+
    '<div class="cal-notice-card-body">'+
      '<b class="cal-notice-card-name">'+tr(a,'name')+'</b>'+
      '<small class="cal-notice-card-cat">'+trCat(a.cat)+'</small>'+
    '</div>'+
    (meta.length?'<ul class="cal-notice-bullets">'+meta.join('')+'</ul>':'')+
    '<span class="cal-notice-more">'+T('card.viewDetails')+' <span class="cal-notice-arrow" aria-hidden="true">→</span></span>'+
  '</a>';
}

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
        exams.map(renderExamListingCard).join('')+
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

// Deadline phrases mix a translated word with an interpolated number, and
// Hindi's word order for this ("5 दिनों में बंद होगा") differs from
// English's ("closes in 5 days") — a flat key/value T() lookup can't express
// that reordering, so these get a small dedicated helper per shape instead.
function closesTodayTomorrowInDays(dl){
  if(currentLang==='hi'){
    if(dl===0) return 'आज बंद होगा';
    if(dl===1) return 'कल बंद होगा';
    return dl+' दिनों में बंद होगा';
  }
  if(dl===0) return 'closes today';
  if(dl===1) return 'closes tomorrow';
  return 'closes in '+dl+' days';
}
// Same phrase without the leading verb, for contexts that already show
// "Closes"/"Last date" as a separate label (e.g. the ticker's "Name — …").
function closesPhraseShort(dl){
  if(currentLang==='hi'){
    if(dl<0) return 'जल्द बंद होगा';
    if(dl===0) return 'आज बंद होगा';
    if(dl===1) return 'कल बंद होगा';
    return dl+' दिनों में बंद होगा';
  }
  if(dl<0) return 'closing soon';
  if(dl===0) return 'closes today';
  if(dl===1) return 'closes tomorrow';
  return 'closes in '+dl+' days';
}
// A short, human pay-band line for a calendar card — takes the exam's
// first (usually highest/entry) pay level as-is, no computed min/max across
// levels, so it's always a direct quote of real data rather than something
// we derived. If there are more levels, we just say how many more.
function payBullet(details){
  if(!details||!details.payGroups||!details.payGroups.length) return null;
  const g=details.payGroups[0];
  // Only split on a space+paren, so a parenthetical increment count glued
  // straight onto a number (e.g. a bipartite-settlement scale like
  // "₹29,000–1700(3)–34,100–...") isn't mistaken for an explanatory aside
  // and chopped mid-number.
  let band=g.band.split(/\s\(/)[0].trim();
  if(/\d\(\d/.test(band)){
    // A real multi-step increment scale, not a simple range — showing the
    // whole thing is unreadable on a card, so just show the starting figure.
    const m=band.match(/₹[\d,]+/);
    band=m?('From '+m[0].replace(/,$/,'')):band;
  }
  const extra=details.payGroups.length>1?' (+'+(details.payGroups.length-1)+' more level'+(details.payGroups.length>2?'s':'')+')':'';
  return band+extra;
}

// The calendar only shows exams with a cycle inside a ~16-month window
// (10 months back, 6 months ahead of today) — old closed cycles with no
// recent or upcoming activity (e.g. an exam whose last confirmed window was
// years ago) are excluded here rather than cluttering a "calendar" view;
// they're still fully reachable via exams.html. An exam whose real applyEnd
// falls outside the window but has a `tentativeNextMonth` (sourced from that
// exam's own commission's published tentative exam calendar) still appears,
// placed in that expected month and marked clearly as not yet released.
function calendarWindow(){
  const now=new Date();
  const start=new Date(now); start.setMonth(start.getMonth()-10);
  const end=new Date(now); end.setMonth(end.getMonth()+6);
  return {start,end};
}

const CAL_MONTH_NAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];
const CAL_MONTH_NAMES_HI=['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'];
function calMonthName(i){ return currentLang==='hi'?CAL_MONTH_NAMES_HI[i]:CAL_MONTH_NAMES[i]; }
const CAL_CLOSING_SOON_DAYS=7;

// One of 'open' / 'closing' / 'closed' / 'tentative' — drives the status
// pill, the card's left accent bar, and the filter bar's data-status match.
function calItemStatus({a,d,tentative}){
  if(tentative) return 'tentative';
  if(a.status!=='open') return 'closed';
  const dl=daysLeft(d);
  return (dl>=0&&dl<=CAL_CLOSING_SOON_DAYS)?'closing':'open';
}

const CAL_STATUS_LABEL_KEYS={open:'status.open',closing:'status.closing',closed:'status.closed',tentative:'status.expected'};
// Function, not a static object, so it re-reads currentLang on every call
// instead of getting baked into English (or whatever language was active)
// at script-load time.
function calStatusLabel(status){ return T(CAL_STATUS_LABEL_KEYS[status]); }

// The deadline is the whole point of this page, so it gets its own labeled
// block (not just another bullet) — a small muted label, then the date as
// the bold value, with the relative "in N days" as a lighter same-line
// suffix rather than a second bold element (hierarchy, not everything bold).
// "in N days"/"today" without the leading verb (the date itself is already
// the headline value here) — same word-order problem as closesTodayTomorrowInDays.
function relativeDaysSuffix(dl){
  if(dl<0) return '';
  if(currentLang==='hi') return dl===0?'आज':dl+' दिन में';
  return dl===0?'today':'in '+dl+' day'+(dl===1?'':'s');
}

function renderDeadlineBlock(item){
  const {a,d,tentative}=item;
  if(tentative){
    return '<div class="cal-deadline"><span class="cal-deadline-label">📅 '+T('card.expectedLabel')+'</span>'+
      '<span class="cal-deadline-value">'+a.tentativeNext+'</span></div>';
  }
  const dateStr=d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  if(a.status==='open'){
    const dl=daysLeft(d);
    const rel=dl>=0?' <span class="cal-deadline-rel">· '+relativeDaysSuffix(dl)+'</span>':'';
    const closingClass=(dl>=0&&dl<=CAL_CLOSING_SOON_DAYS)?' is-closing':'';
    return '<div class="cal-deadline"><span class="cal-deadline-label">⏰ '+T('card.deadlineLabel')+'</span>'+
      '<span class="cal-deadline-value'+closingClass+'">'+dateStr+'</span>'+rel+'</div>';
  }
  return '<div class="cal-deadline"><span class="cal-deadline-label">⏰ '+T('card.deadlineLabel')+'</span>'+
    '<span class="cal-deadline-value is-closed">'+T('card.closedPrefix')+' · '+dateStr+'</span></div>';
}

function renderNoticeCard(item){
  const {a,tentative}=item;
  const status=calItemStatus(item);
  const bullets=[];
  const lastCycleTag=tentative?' <span class="cal-card-lastcycle">'+T('card.lastCycle')+'</span>':'';
  if(a.vacancies) bullets.push('<li><span class="cal-bullet-ic">👥</span><span><b>'+a.vacancies+'</b> '+T('card.vacancies')+lastCycleTag+'</span></li>');
  const pay=payBullet(a.details);
  if(pay) bullets.push('<li><span class="cal-bullet-ic">💰</span><span>'+pay+lastCycleTag+'</span></li>');
  return '<div class="cal-notice-card cal-notice-card-'+status+'" data-status="'+status+'">'+
    '<div class="cal-notice-card-head">'+
      '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
      '<span class="status-pill '+status+'">'+calStatusLabel(status)+'</span>'+
    '</div>'+
    '<div class="cal-notice-card-body">'+
      '<b class="cal-notice-card-name">'+tr(a,'name')+'</b>'+
      '<small class="cal-notice-card-cat">'+trCat(a.cat)+'</small>'+
    '</div>'+
    (bullets.length?'<ul class="cal-notice-bullets">'+bullets.join('')+'</ul>':'')+
    renderDeadlineBlock(item)+
    '<a class="cal-notice-more" href="index.html?exam='+a.code+'">'+T('card.knowMore')+' <span class="cal-notice-arrow" aria-hidden="true">→</span></a>'+
  '</div>';
}

// Filters cards by data-status ('all' shows everything), then hides any
// month column or year block left with no visible cards so the filtered
// view never shows an empty heading.
function applyCalendarFilter(filterKey){
  const box=$('examCalendar');
  if(!box) return;
  box.querySelectorAll('.cal-notice-card').forEach(card=>{
    card.style.display=(filterKey==='all'||card.dataset.status===filterKey)?'':'none';
  });
  box.querySelectorAll('.cal-year-month-col').forEach(col=>{
    const anyVisible=[...col.querySelectorAll('.cal-notice-card')].some(c=>c.style.display!=='none');
    col.style.display=anyVisible?'':'none';
  });
  box.querySelectorAll('.cal-year-block').forEach(yb=>{
    const anyVisible=[...yb.querySelectorAll('.cal-notice-card')].some(c=>c.style.display!=='none');
    yb.style.display=anyVisible?'':'none';
  });
}

// Real calendar table shape: one row per calendar year, months placed
// side-by-side left-to-right within that row (December sits right after
// November since both are 2025; the row scrolls horizontally if there are
// more months than fit) — a new row starts only when the year actually
// changes, e.g. January 2026 drops to its own row. Each month is a column
// holding a notification card per exam in it (bullets + "Know more" link,
// not a day grid). Months with zero exams are skipped entirely.
function renderExamCalendar(){
  const box=$('examCalendar');
  if(!box) return;
  const {start,end}=calendarWindow();
  const items=[];
  APPLICATIONS.forEach(a=>{
    const d=parseExamDate(a.applyEnd);
    if(d&&d>=start&&d<=end){
      items.push({a,d,tentative:false});
    }else if(a.tentativeNextMonth){
      const td=parseExamDate(a.tentativeNextMonth+'-15');
      if(td&&td>=start&&td<=end) items.push({a,d:td,tentative:true});
    }
  });

  const chipsBox=$('calSummaryChips');
  const yearNavBox=$('calYearNav');

  if(!items.length){
    box.innerHTML='<div class="notice-empty">'+T('cal.noneInWindow')+' <a href="exams.html">'+T('cal.allExamsLink')+'</a>.</div>';
    if(chipsBox) chipsBox.innerHTML='';
    if(yearNavBox) yearNavBox.innerHTML='';
    return;
  }
  items.sort((x,y)=>x.d-y.d);

  if(chipsBox){
    const openCount=items.filter(it=>calItemStatus(it)==='open').length;
    const closingCount=items.filter(it=>calItemStatus(it)==='closing').length;
    chipsBox.innerHTML=
      '<span class="cal-chip">'+items.length+' '+T('cal.chipExams')+'</span>'+
      '<span class="cal-chip cal-chip-open">'+openCount+' '+T('cal.chipOpen')+'</span>'+
      '<span class="cal-chip cal-chip-closing">'+closingCount+' '+T('cal.chipClosing')+'</span>';
  }

  // year -> month index -> items in that month
  const years={};
  items.forEach(item=>{
    const y=item.d.getFullYear(), m=item.d.getMonth();
    years[y]=years[y]||{};
    (years[y][m]=years[y][m]||[]).push(item);
  });
  const yearList=Object.keys(years).map(Number).sort((x,y)=>x-y);

  if(yearNavBox){
    yearNavBox.innerHTML=yearList.map(y=>'<a href="#cal-year-'+y+'" class="cal-year-nav-link">'+y+'</a>').join('');
  }

  box.innerHTML=yearList.map(y=>{
    const monthIdxs=Object.keys(years[y]).map(Number).sort((a,b)=>a-b);
    const monthCols=monthIdxs.map(m=>
      '<div class="cal-year-month-col">'+
        '<div class="cal-year-month-heading"><span class="cal-month-dot" aria-hidden="true"></span><h3 class="cal-year-month-col-title">'+calMonthName(m)+'</h3></div>'+
        '<div class="cal-year-month-cards">'+years[y][m].map(renderNoticeCard).join('')+'</div>'+
      '</div>'
    ).join('');
    return '<section class="cal-year-block" id="cal-year-'+y+'" aria-label="Exams in '+y+'">'+
      '<div class="cal-year-heading"><h2 class="cal-year-number">'+y+'</h2><span class="cal-year-line" aria-hidden="true"></span></div>'+
      '<div class="cal-year-row">'+monthCols+'</div>'+
    '</section>';
  }).join('');
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
    const label=dl==null?T('detail.applicationsOpen').toLowerCase():closesPhraseShort(dl);
    return '<a class="notice-ticker-item" href="index.html?exam='+a.code+'"><span class="notice-ticker-dot"></span>'+tr(a,'name')+' — '+label+'</a>';
  }).join('');
  // Duplicated once so the scroll loop has no visible seam.
  box.innerHTML='<div class="notice-ticker-track">'+items+items+'</div>';
}

/* ---- Notice board (index.html sidebar) ----
   Shows every exam currently in the application process (status:'open'),
   full list (no cap) — this is meant to be a real notice board, not a
   trimmed highlight reel. Each entry names the exam and links straight to
   its own official notification PDF/page, in addition to the on-site
   exam page. */
function renderNoticeBoard(){
  const box=$('noticeBoard');
  if(!box) return;
  const urgent=urgentExamsList();
  if(!urgent.length){
    box.innerHTML='<div class="notice-empty">'+T('notice.noneOpen')+'</div>';
    return;
  }
  box.innerHTML=urgent.map(({a,d})=>{
    const dl=d?daysLeft(d):null;
    const dateStr=(d&&dl!=null&&dl>=0)?(' · '+d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})):'';
    const phrase=dl==null?T('detail.applicationsOpen'):closesPhraseShort(dl);
    const label=phrase.charAt(0).toUpperCase()+phrase.slice(1)+dateStr;
    return '<div class="notice-item">'+
      '<a class="notice-item-name" href="index.html?exam='+a.code+'"><b>'+tr(a,'name')+'</b><span>'+label+'</span></a>'+
      (a.officialUrl?'<a class="notice-official-link" href="'+a.officialUrl+'" target="_blank" rel="noopener">'+T('notice.officialNotification')+'</a>':'')+
      '</div>';
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
    // Only ever a link to the result itself (r.url) when one is declared —
    // never the application notification PDF, and no link at all when a
    // result hasn't been declared, so nothing pending gets a dead/irrelevant
    // attachment.
    const meta=r
      ?'<span class="result-date">'+r.stage+' · '+r.date+'</span>'+
       (r.url?'<a class="result-pill declared" href="'+r.url+'" target="_blank" rel="noopener">'+T('results.viewResult')+'</a>':'')
      :'<span class="result-pill pending">'+T('results.notDeclared')+'</span>';
    return '<div class="result-item"><span class="rname">'+tr(a,'name')+'</span><div class="result-meta">'+meta+'</div></div>';
  }).join('');
}

/* ---- Step 1: exam search ---- */
// Highest-aspirant-strength exams first — this is what most visitors are
// actually here for, so they shouldn't have to type anything to find them.
function renderPopularExams(){
  const box=$('popularExams');
  if(!box) return;
  const top=[...APPLICATIONS].sort((a,b)=>a.popularity-b.popularity).slice(0,6);
  box.innerHTML='<div class="popular-label">'+T('home.popularLabel')+'</div>'+
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
    box.innerHTML='<div class="exam-empty">'+T('search.noMatch')+' <button type="button" class="link-btn" onclick="skipExam()">'+T('search.skipInstead')+'</button>.</div>';
    return;
  }
  box.innerHTML=matches.map(a=>
    '<button type="button" class="exam-result-row" onclick="selectExam(\''+a.code+'\')">'+
      '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
      '<span class="exam-result-text"><b>'+tr(a,'name')+'</b><small>'+trCat(a.cat)+'</small></span>'+
      '<span class="status-pill '+(a.status==='open'?'open':'closed')+'">'+calStatusLabel(a.status==='open'?'open':'closed')+'</span>'+
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
  state.slots={generic:{label:'Your photo',kind:'generic',spec:null,file:null,result:null,targetKb:50}};
  enterUploadStep();
}

function enterUploadStep(){
  $('panelExam').style.display='none';
  $('panelUpload').style.display='block';
  renderSelectedExamBar();
  renderExamDetailPanel();
  renderUploadSlots();
  renderPayBar();
  updateChangeExamBtnLabel();
  goStep(3);
}

// "Change exam" only makes sense when an exam is actually selected — in the
// generic/skip-exam flow there's no exam to change, so the label should read
// as a plain reset instead.
function updateChangeExamBtnLabel(){
  const btn=$('changeExamBtn');
  if(!btn) return;
  const key=state.exam?'home.changeExam':'home.startOver';
  btn.dataset.i18n=key;
  btn.innerHTML=T(key);
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
  const d=parseExamDate(a.applyEnd);
  const status=calItemStatus({a,d,tentative:false});
  const deadline=(a.status==='open'&&a.applyEnd)?'<div class="exam-deadline">Apply by '+a.applyEnd+'</div>':'';
  bar.innerHTML=
    '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
    '<span class="exam-result-text"><b>'+tr(a,'name')+'</b><small>'+trCat(a.cat)+'</small>'+deadline+'</span>'+
    '<span class="status-pill '+status+'">'+calStatusLabel(status)+'</span>'+
    (a.officialUrl?'<a class="btn btn-outline btn-sm" href="'+a.officialUrl+'" target="_blank" rel="noopener">'+T('detail.officialNotice')+'</a>':'');
}

// Full picture for the selected exam — posts & pay, promotion, eligibility,
// how to apply — pulled straight from the official notification where we've
// compiled it. Where we haven't compiled it yet, say so plainly rather than
// showing nothing or guessing.
// Age/qualification fields are either a plain string or an array of short
// bullet points (exams with more than one age band, e.g. per-post or
// per-category) — render whichever shape the data uses.
function renderFieldValue(v){
  if(Array.isArray(v)) return '<ul>'+v.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
  return '<span>'+v+'</span>';
}

// Promotion is either a plain string (legacy/fallback) or {caveat, steps} —
// caveat is a short one-line confidence/source note, steps are simple-English
// bullet points for the actual progression facts.
function renderPromotion(p){
  if(!p) return '';
  if(typeof p==='string') return '<p>'+p+'</p>';
  let html='';
  if(p.caveat) html+='<p class="promotion-caveat">'+p.caveat+'</p>';
  if(p.steps&&p.steps.length) html+='<ul class="promotion-steps">'+p.steps.map(s=>'<li>'+s+'</li>').join('')+'</ul>';
  return html;
}

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

  // Quick Overview only ever shows fields we actually have real data for
  // (last date, qualification, vacancies) — never a placeholder/"N/A" for
  // fields like conducting body or fee that aren't tracked in the data yet.
  const overviewItems=[];
  if(a.applyEnd) overviewItems.push([T('overview.lastDate'),a.applyEnd]);
  if(d.eligibility&&d.eligibility.qualification&&typeof d.eligibility.qualification==='string') overviewItems.push([T('detail.qualification'),d.eligibility.qualification]);
  if(a.vacancies) overviewItems.push([T('overview.vacancies'),a.vacancies]);
  const quickOverview=overviewItems.length?
    '<div class="quick-overview">'+overviewItems.map(([label,value])=>
      '<div class="quick-overview-item"><span class="quick-overview-label">'+label+'</span><span class="quick-overview-value">'+value+'</span></div>'
    ).join('')+'</div>':'';
  const lastUpdated=a.verified?'<div class="detail-updated">'+T('detail.lastUpdatedPrefix')+' '+a.verified+'</div>':'';

  box.innerHTML=
    quickOverview+
    (d.dataNote?'<details class="detail-note"><summary>ⓘ '+T('detail.dataNoteToggle')+'</summary><p>'+d.dataNote+'</p></details>':'')+
    (hasCoreDetails?'':'<div class="detail-missing">'+T('detail.missing')+'</div>')+
    '<div class="detail-grid">'+
      (d.payGroups?
        '<div class="detail-card"><h4>'+T('detail.postsPay')+'</h4>'+
          d.payGroups.map(g=>'<div class="pay-group"><b>'+g.level+' · '+g.band+'</b><span>'+g.posts+'</span></div>').join('')+
          (d.payNote?'<p class="detail-footnote">'+d.payNote+'</p>':'')+
        '</div>':'')+
      (d.eligibility?
        '<div class="detail-card"><h4>'+T('detail.eligibility')+'</h4>'+
          '<div class="detail-row"><b>'+T('detail.age')+'</b>'+renderFieldValue(d.eligibility.age)+'</div>'+
          (d.eligibility.ageRelax?'<div class="detail-row"><b>'+T('detail.relaxation')+'</b><span>'+d.eligibility.ageRelax+'</span></div>':'')+
          '<div class="detail-row"><b>'+T('detail.qualification')+'</b><span>'+d.eligibility.qualification+'</span></div>'+
        '</div>':'')+
      (d.promotion?
        '<div class="detail-card"><h4>'+T('detail.promotion')+'</h4>'+renderPromotion(d.promotion)+'</div>':'')+
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
    '</div>'+
    lastUpdated;
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

// The label shown for a slot is computed at render time from its kind, not
// read from a value snapshotted into state when the slot was created — that
// snapshot would stay frozen in whatever language was active at that moment
// and not update on a later language switch. otherdoc labels come from
// per-exam research data with no Hindi variant yet, so they fall back to
// English by the same graceful-fallback rule the rest of the exam data uses.
function slotDisplayLabel(slot){
  if(slot.kind==='photo') return T('slot.photo');
  if(slot.kind==='signature') return T('slot.signature');
  if(slot.kind==='pdf'||slot.kind==='pdftojpg'||slot.kind==='pdfcompress') return toolSlotLabel(slot.kind);
  return slot.label;
}

function renderUploadSlots(){
  const box=$('uploadSlots');
  box.innerHTML=Object.keys(state.slots).map(key=>{
    const slot=state.slots[key];
    return '<div class="upload-slot" id="slot-'+key+'">'+
      '<div class="slot-head"><b>'+slotDisplayLabel(slot)+'</b>'+(slot.spec?'<span class="slot-spec">'+specLine(slot.spec)+'</span>':'')+'</div>'+
      (slot.spec&&slot.spec.notes?'<div class="slot-note">'+slot.spec.notes+'</div>':'')+
      '<div class="slot-body" id="slot-body-'+key+'"></div>'+
    '</div>';
  }).join('')+
  renderMoreToolsToggle();
  Object.keys(state.slots).forEach(renderSlotBody);
}

const TOOL_SLOT_KEYS={pdf:'slot.toolOtherDoc',pdftojpg:'slot.toolPdfToJpg',pdfcompress:'slot.toolPdfCompress'};
function toolSlotLabel(kind){ return T(TOOL_SLOT_KEYS[kind]); }

function renderMoreToolsToggle(){
  const remaining=Object.keys(TOOL_SLOT_KEYS).filter(k=>!state.slots[k]);
  if(!remaining.length) return '';
  return '<div class="upload-slot upload-slot-pdf" id="more-tools-toggle">'+
    '<div class="slot-hint" style="margin-bottom:8px">'+T('slot.moreToolsHint')+'</div>'+
    '<div class="more-tools-row">'+
      remaining.map(k=>'<button type="button" class="btn btn-outline btn-sm" onclick="addToolSlot(\''+k+'\')">'+toolSlotLabel(k)+'</button>').join('')+
    '</div>'+
  '</div>';
}

function addToolSlot(kind){
  if(state.slots[kind]) return;
  state.slots[kind]={label:null,kind,spec:null,file:null,result:null,targetKb:200};
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
      '<div class="slot-status">'+(slot.result.overTarget?T('slot.closestPossible'):T('slot.ready'))+' '+slot.result.sizeKB+' KB</div>'+
      (slot.result.note?'<div class="slot-note">'+slot.result.note+'</div>':'')+
      (unlocked
        ?'<a class="btn btn-primary btn-sm" download="'+slot.result.filename+'" href="'+slot.result.url+'">'+T('slot.download')+'</a>'
        :'<div class="slot-waiting">'+T('slot.payToDownload')+'</div>');
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
                ?'<a class="btn btn-primary btn-sm" download="'+r.filename+'" href="'+r.url+'">'+T('slot.download')+'</a>'
                :'<span class="batch-waiting">'+T('slot.payWait')+'</span>')+
            '</div>'
      ).join('')+
      '</div>'+
      '<button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById(\'input-'+key+'\').click()">'+T('slot.processBatch')+'</button>'+
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
    const filesSelected=currentLang==='hi'?(n+' फ़ाइल चुनी गईं'):(n+' file'+(n>1?'s':'')+' selected');
    const processLabel=n>1?(currentLang==='hi'?T('slot.process')+' (सभी '+n+')':T('slot.process')+' all '+n):T('slot.process');
    body.innerHTML=
      '<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">'+T('slot.choosePhotos')+'<input type="file" id="input-'+key+'" accept="image/jpeg,image/png,image/webp" multiple style="display:none">'+'</div>'+
      (n?'<div class="slot-hint">'+filesSelected+'</div>':'')+
      '<div class="row"><label>'+T('slot.targetKb')+'</label><input id="kb-'+key+'" type="number" min="5" max="5000" value="'+slot.targetKb+'"></div>'+
      '<div class="slot-hint">'+T('slot.targetKbHint')+'</div>'+
      '<button class="btn btn-primary btn-sm" onclick="processGenericSlot(\''+key+'\')">'+processLabel+'</button>';
    document.getElementById('input-'+key).addEventListener('change',e=>{
      slot.files=[...e.target.files];
      renderSlotBody(key);
    });
    return;
  }

  if(slot.kind==='pdf'){
    body.innerHTML='<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">'+T('slot.chooseImageToConvert')+'<input type="file" id="input-'+key+'" accept="image/jpeg,image/png,image/webp" style="display:none"></div>';
    document.getElementById('input-'+key).addEventListener('change',e=>{
      const f=e.target.files[0];
      if(f) processPdfSlot(key,f);
    });
    return;
  }

  if(slot.kind==='pdftojpg'){
    body.innerHTML='<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">'+T('slot.choosePdf')+'<input type="file" id="input-'+key+'" accept="application/pdf" style="display:none"></div>';
    document.getElementById('input-'+key).addEventListener('change',e=>{
      const f=e.target.files[0];
      if(f) processPdfToJpgSlot(key,f);
    });
    return;
  }

  if(slot.kind==='pdfcompress'){
    body.innerHTML=
      '<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">'+T('slot.choosePdf')+'<input type="file" id="input-'+key+'" accept="application/pdf" style="display:none"></div>'+
      '<div class="row"><label>'+T('slot.targetKb')+'</label><input id="kb-'+key+'" type="number" min="20" max="10000" value="'+slot.targetKb+'"></div>'+
      '<button class="btn btn-outline btn-sm" onclick="processPdfCompressSlot(\''+key+'\')">'+T('slot.process')+'</button>';
    document.getElementById('input-'+key).addEventListener('change',e=>{
      if(e.target.files[0]) slot.file=e.target.files[0];
    });
    return;
  }

  // photo / signature — spec-driven, auto-processes on file choice
  body.innerHTML='<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">'+T('slot.chooseYour')+' '+slotDisplayLabel(slot).toLowerCase()+'<input type="file" id="input-'+key+'" accept="image/jpeg,image/png,image/webp" style="display:none"></div>';
  document.getElementById('input-'+key).addEventListener('change',e=>{
    const f=e.target.files[0];
    if(f) processSpecSlot(key,f);
  });
}

const MAX_UPLOAD_BYTES=15*1024*1024; // 15MB — generous for a phone photo, still bounds worst-case canvas work

// Returns an error message if the file can't be processed, or null if it's fine.
function validateUploadFile(file){
  if(!file.type||!file.type.startsWith('image/')) return T('err.notImage');
  if(file.size>MAX_UPLOAD_BYTES) return T('err.tooLargeImage');
  return null;
}

function validatePdfFile(file){
  if(file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name||'')) return T('err.notPdf');
  if(file.size>MAX_UPLOAD_BYTES) return T('err.tooLargePdf');
  return null;
}

function showSlotError(key,message){
  const body=$('slot-body-'+key);
  if(!body) return;
  body.innerHTML='<div class="slot-error">⚠️ '+message+'</div><div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">'+T('slot.tryAnother')+'</div>';
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
  body.innerHTML='<div class="slot-processing">'+T('slot.processing')+'</div>';
  const img=new Image();
  img.onerror=()=>showSlotError(key,T('err.corruptedImage'));
  img.onload=async()=>{
    const spec=slot.spec||{};
    const exactDims=Boolean(spec.px);
    const wantW=exactDims?spec.px.w:0, wantH=exactDims?spec.px.h:0;
    const targetBytes=(spec.maxKB||50)*1024;
    const {blob,overTarget}=await compressToTarget(img,{exactDims,wantW,wantH,targetBytes});
    const url=URL.createObjectURL(blob);
    slot.result={url,previewUrl:url,filename:'govbabu-'+key+'-'+Math.round(blob.size/1024)+'kb.jpg',sizeKB:(blob.size/1024).toFixed(1),overTarget};
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
  if(!slot.files||!slot.files.length){alert(T('alert.chooseFileFirst'));return}
  const kbInput=$('kb-'+key);
  const targetBytes=Number(kbInput.value)*1024;
  if(!targetBytes||targetBytes<5120){alert(T('alert.chooseTarget5kb'));return}
  slot.targetKb=Number(kbInput.value);
  const body=$('slot-body-'+key);
  const total=slot.files.length;
  const results=[];
  for(let i=0;i<total;i++){
    const file=slot.files[i];
    const processingLabel=currentLang==='hi'?(total+' में से '+(i+1)+' प्रोसेस हो रहा है…'):('Processing '+(i+1)+' of '+total+'…');
    body.innerHTML='<div class="slot-processing">'+processingLabel+'</div>';
    const err=validateUploadFile(file);
    if(err){results.push({name:file.name,error:err});continue}
    try{
      const img=await loadImageFromFile(file);
      const {blob,overTarget}=await compressToTarget(img,{exactDims:false,wantW:0,wantH:0,targetBytes});
      const url=URL.createObjectURL(blob);
      results.push({name:file.name,url,filename:'govbabu-'+i+'-'+Math.round(blob.size/1024)+'kb.jpg',sizeKB:(blob.size/1024).toFixed(1),overTarget});
    }catch{
      results.push({name:file.name,error:T('err.corruptedGeneric')});
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
  body.innerHTML='<div class="slot-processing">'+T('slot.converting')+'</div>';
  try{
    const pdfBlob=await jpgFileToPdfBlob(file);
    const url=URL.createObjectURL(pdfBlob);
    slot.result={url,previewUrl:null,filename:'govbabu-document.pdf',sizeKB:(pdfBlob.size/1024).toFixed(1),overTarget:false};
    renderSlotBody(key);
    renderPayBar();
  }catch{
    showSlotError(key,T('err.corruptedConvert'));
  }
}

async function processPdfToJpgSlot(key,file){
  const err=validatePdfFile(file);
  if(err){showSlotError(key,err);return}
  const slot=state.slots[key];
  const body=$('slot-body-'+key);
  body.innerHTML='<div class="slot-processing">'+T('slot.extracting')+'</div>';
  try{
    const {blob,extraPages}=await pdfToJpgBlob(file);
    const url=URL.createObjectURL(blob);
    const pageCount=extraPages+1;
    const extraPagesNote=currentLang==='hi'?('इस PDF में '+pageCount+' पेज हैं — केवल पेज 1 निकाला गया।'):('This PDF has '+pageCount+' pages — only page 1 was extracted.');
    slot.result={
      url,previewUrl:url,filename:'govbabu-page1.jpg',sizeKB:(blob.size/1024).toFixed(1),overTarget:false,
      note:extraPages>0?extraPagesNote:null
    };
    renderSlotBody(key);
    renderPayBar();
  }catch{
    showSlotError(key,T('err.corruptedPdfRead'));
  }
}

async function processPdfCompressSlot(key){
  const slot=state.slots[key];
  if(!slot.file){alert(T('alert.choosePdfFirst'));return}
  const kbInput=$('kb-'+key);
  const targetBytes=Number(kbInput.value)*1024;
  if(!targetBytes||targetBytes<20480){alert(T('alert.chooseTarget20kb'));return}
  slot.targetKb=Number(kbInput.value);
  const body=$('slot-body-'+key);
  body.innerHTML='<div class="slot-processing">'+T('slot.compressing')+'</div>';
  try{
    const {blob,overTarget}=await compressPdfBlob(slot.file,targetBytes);
    const url=URL.createObjectURL(blob);
    slot.result={url,previewUrl:null,filename:'govbabu-compressed.pdf',sizeKB:(blob.size/1024).toFixed(1),overTarget};
    renderSlotBody(key);
    renderPayBar();
  }catch{
    showSlotError(key,T('err.corruptedPdfProcess'));
  }
}

/* ---- Step 3: pay + download ---- */
function renderPayBar(){
  const bar=$('payBar');
  const results=Object.values(state.slots).filter(s=>s.result||(s.results&&s.results.length));
  if(!results.length){bar.style.display='none';return}
  bar.style.display='block';
  if(hasUnlock('bundle',state.examCode)){
    bar.innerHTML=FREE_MODE
      ?'<div class="unlocked-note">'+T('pay.freeNote')+'</div>'
      :'<div class="unlocked-note">'+T('pay.unlockedNote')+'</div>';
    goStep(4);
  } else {
    bar.innerHTML='<button class="btn btn-accent btn-block" id="payAllBtn" type="button">'+T('slot.payUnlock')+'</button>'+
      '<div class="pay-note">'+T('pay.note')+'</div>';
    $('payAllBtn').addEventListener('click',()=>{
      initiatePayment('bundle',state.examCode,()=>{
        Object.keys(state.slots).forEach(renderSlotBody);
        renderPayBar();
      },$('payAllBtn'));
    });
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  // Mobile header menu — present on every page. The nav links stay inline
  // on desktop (CSS handles that); below the breakpoint they collapse into
  // this toggled dropdown so they never spill off-screen on a phone.
  const navToggle=$('navToggle');
  const headerNav=$('headerNav');
  if(navToggle&&headerNav){
    const closeNav=()=>{headerNav.classList.remove('open');navToggle.setAttribute('aria-expanded','false')};
    navToggle.addEventListener('click',()=>{
      const open=headerNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded',open?'true':'false');
    });
    headerNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeNav));
    document.addEventListener('click',e=>{
      if(headerNav.classList.contains('open')&&!headerNav.contains(e.target)&&!navToggle.contains(e.target)) closeNav();
    });
  }

  const filterBtns=document.querySelectorAll('.cal-filter-btn');
  if(filterBtns.length){
    filterBtns.forEach(btn=>btn.addEventListener('click',()=>{
      filterBtns.forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyCalendarFilter(btn.dataset.filter);
    }));
  }

  // Browse Exams live search — filters cards by name/category text, hiding
  // any category section left with nothing matching.
  const directorySearch=$('directorySearch');
  if(directorySearch){
    directorySearch.addEventListener('input',()=>{
      const q=directorySearch.value.trim().toLowerCase();
      document.querySelectorAll('.directory-section').forEach(section=>{
        let anyVisible=false;
        section.querySelectorAll('.exam-listing-card').forEach(card=>{
          const match=!q||card.textContent.toLowerCase().includes(q);
          card.style.display=match?'':'none';
          if(match) anyVisible=true;
        });
        section.style.display=anyVisible?'':'none';
      });
    });
  }

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
