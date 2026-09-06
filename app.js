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

// Every exam listed in APPLICATIONS has a dedicated static page generated
// at build time (monitor/publish) under exams/<code, lowercased>/ — the
// full-detail page a visitor should land on when they pick an exam, not
// the homepage's inline document-prep flow (that's reached from a CTA on
// the exam page itself, via index.html?exam=CODE).
function examPageUrl(code){ return 'exams/'+code.toLowerCase()+'/'; }

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
 'nav.home':'Home','nav.browseExams':'Find Your Exam','nav.tools':'Tools','nav.calendar':'Exam Calendar','nav.manjusha':'Downloads','nav.more':'More','nav.about':'About','nav.contact':'Contact',
 'comingSoon.tag':'Coming soon',
 'comingSoon.browseExams':'Browse Exams','comingSoon.exploreTools':'Explore Free Tools','comingSoon.backHome':'Back to Home',
 'manjusha.title':'Downloads','manjusha.lead':'Your treasure chest of exam-prep resources — syllabus breakdowns, monthly current affairs and computer science notes, all in one place. Not live yet.',
 'manjusha.syllabusTitle':'📘 Syllabus','manjusha.syllabusDesc':'Structured, exam-wise syllabus breakdowns — verified against official notifications, not scraped from anywhere else.',
 'manjusha.currentAffairsTitle':'🗞️ Current Affairs Monthly','manjusha.currentAffairsDesc':'A monthly digest of current affairs curated for government exam preparation.',
 'manjusha.csTitle':'💻 Computer Science','manjusha.csDesc':'Core computer science notes for exams that test technical and CS subjects.',
 'home.title':'Find the government exams you can actually apply for.',
 'home.lead':'Eligibility • Vacancies • Dates • Syllabus • Application — all in one place, before you apply.',
 'home.ctaBrowse':'Explore All Exams','home.ctaCalendar':'View Calendar','home.ctaEligibility':'Check My Eligibility',
 'home.privacy':'🔒 Processed entirely in your browser — your photo and signature never leave your device.',
 'home.discoveryTag':'Start here','home.discoveryHead':'Explore Government Exams',
 'home.noExamsInCat':'No exams match this filter right now.',
 'home.journeyTag':'How GovBabu helps','home.journeyHead':'One place to go from discovery to application.',
 'home.prepareTag':'Prepare','home.prepareHead':'Prepare your documents',
 'home.toolPhotoTitle':'Photo Resizer','home.toolSigTitle':'Signature Resizer',
 'home.toolCompressTitle':'Compress PDF','home.toolMergeTitle':'Merge PDF','home.toolRotateTitle':'Rotate PDF','home.toolSignPdfTitle':'Sign PDF',
 'home.toolImgToPdfTitle':'Image to PDF','home.toolPdfToJpgTitle':'PDF → JPG',
 'home.toolSplitTitle':'Split PDF','home.toolWatermarkTitle':'Watermark PDF','home.toolUnlockTitle':'Unlock PDF',
 'home.toolPhotoDesc':'Resize your photo to any exam\'s exact dimensions and file size.',
 'home.toolSigDesc':'Resize your signature scan to the exact size an exam wants.',
 'home.toolCompressDesc':'Shrink a PDF\'s file size without losing readability.',
 'home.toolMergeDesc':'Combine multiple PDFs or images into one file, in order.',
 'home.toolSplitDesc':'Pull a page range out into its own PDF.',
 'home.toolRotateDesc':'Fix a sideways or upside-down scanned page.',
 'home.toolSignPdfDesc':'Place your signature image anywhere on a PDF.',
 'home.toolWatermarkDesc':'Stamp text like "DRAFT" or your name across every page.',
 'home.toolUnlockDesc':'Remove a password from a PDF you already know the password for.',
 'home.toolImgToPdfDesc':'Turn one or more photos into a single PDF file.',
 'home.toolPdfToJpgDesc':'Save a PDF\'s first page as a JPG image.',
 'home.toolsStartHint':'Looking for a specific exam\'s spec? <a href="#top">Search above ↑</a> or pick one from <a href="#popularExams">popular exams</a>.',
 'home.personalizedHead':'Get matched automatically',
 'home.personalizedDesc':'Enter your age and qualification — see which exams fit, right now. Saved profiles and alerts are coming next.',
 'home.personalizedCheck1':'Match by your qualification','home.personalizedCheck2':'Match by your age &amp; category',
 'home.personalizedCheck3':'Get relevant exam alerts — coming soon','home.personalizedCheck4':'Track important dates — coming soon',
 'home.personalizedCta':'Check My Eligibility Now →',
 'home.showcaseStatusOpen':'Applications open',
 'home.badgeFormOpened':'Form opened','home.badgeAdmitCard':'Admit card',
 'home.badgeResultDeclared':'Result declared','home.badgeDeadlineSoon':'Deadline soon',
 'home.viewAllExams':'View all exams →','home.viewFullCalendar':'Open full calendar →',
 'home.tryNowBadge':'Try it now',
 'home.browseAll':'Browse all exams →','home.calendar':'Calendar →',
 'home.skip':'Skip — I just need to resize a file →',
 'home.changeExam':'← Change exam','home.startOver':'← Start over',
 'home.searchPlaceholder':'Search exams, departments, qualifications',
 'step.exam':'Exam','step.analysis':'Check out our analysis','step.upload':'Upload','step.download':'Download',
 'sidebar.noticeBoard':'📌 Notice Board','sidebar.results':'🏆 Results',
 'detail.postsPay':'💰 Posts &amp; Pay','detail.eligibility':'🎓 Eligibility','detail.promotion':'📈 Career Path',
 'detail.howToApply':'📝 How to Apply','detail.otherDocs':'📄 Other Documents Required',
 'detail.examPattern':'📋 Exam Pattern','detail.negativeMarking':'Negative Marking','detail.passingMarks':'Passing Marks',
 'detail.faq':'❓ Frequently Asked Questions',
 'detail.age':'Age','detail.relaxation':'Relaxation','detail.qualification':'Qualification',
 'detail.applyOnOfficial':'Apply on the official site ↗','detail.officialNotice':'Official Source ↗',
 'detail.applicationsOpen':'Applications open','detail.applicationsClosed':'Applications closed',
 'detail.beforeYouStart':'Before you start','detail.commonMistakes':'⚠ Common mistakes to avoid','detail.correctionWindow':'Correction window',
 'detail.missing':'Posts, salary &amp; promotion details aren\'t compiled yet for this exam — check the official notification above.',
 'detail.noSpecificExam':'No specific exam selected — set your own target size below.',
 'detail.dataNoteToggle':'Data note — tap to see details',
 'overview.lastDate':'Last Date','overview.vacancies':'Vacancies','detail.lastUpdatedPrefix':'🕒 Last updated:',
 'overview.status':'Status','overview.category':'Category',
 'detail.datesHead':'📅 Important Dates','detail.applyStart':'Apply Start','detail.result':'Result','detail.lastVerified':'Last Verified',
 'detail.examDate':'Exam Date','detail.admitCard':'Admit Card','detail.fee':'Application Fee',
 'detail.vacanciesHead':'🎟️ Vacancies &amp; Posts','detail.totalVacancies':'Total Vacancies','detail.payLevel':'Pay Level','detail.payBand':'Pay Band','detail.posts':'Posts','detail.post':'Post',
 'detail.beforeApply':'🧾 Before You Apply','detail.photo':'Photo','detail.signature':'Signature','detail.prepDocsCta':'Prepare these now →','detail.notAvailable':'Not available yet',
 'detail.aboutExam':'ℹ️ About the Exam','detail.conductedBy':'Conducted By',
 'detail.selectionProcess':'🧭 Selection Process','detail.section':'Section','detail.details':'Details',
 'detail.syllabusHead':'📘 Full Syllabus','detail.syllabusLede':'Want the complete topic-by-topic syllabus for this exam?','detail.viewSyllabus':'View Full Syllabus →',
 'detail.importantLinks':'🔗 Important Links','detail.quickLinks':'Quick Links','detail.relatedExams':'Related Exams',
 'detail.applyNow':'Apply Now ↗','detail.checkEligibility':'Check Eligibility','detail.notAnnounced':'Not announced yet',
 'nav.sec.dates':'Dates','nav.sec.vacancies':'Vacancies &amp; Posts','nav.sec.eligibility':'Eligibility','nav.sec.before':'Before You Apply','nav.sec.apply':'How to Apply','nav.sec.about':'About','nav.sec.career':'Career Path','nav.sec.selection':'Selection','nav.sec.pattern':'Exam Pattern','nav.sec.faq':'FAQs','nav.sec.syllabus':'Syllabus','nav.sec.links':'Links',
 'status.open':'Open','status.closing':'Closing Soon','status.closed':'Closed','status.expected':'Expected',
 'card.lastDate':'Last date:','card.closedOn':'Closed:','card.vacancies':'vacancies','card.viewDetails':'View Details',
 'card.knowMore':'Know more','card.lastCycle':'(last cycle)','card.deadlineLabel':'Application deadline',
 'card.expectedLabel':'Expected','card.closedPrefix':'Closed',
 'cal.eyebrow':'📅 Exam Calendar','cal.title':'Never miss an application deadline',
 'cal.lead':'Track government exams, application deadlines, vacancies and salary — all in one place.',
 'cal.filterAll':'All','cal.filterLive':'Live','cal.filterResults':'Results','cal.filterAdmitCard':'Admit Card',
 'cal.chipExams':'Exams','cal.chipOpen':'Open','cal.chipClosing':'Closing Soon',
 'cal.noneInWindow':'No exams in this window right now — see','cal.allExamsLink':'all exams',
 'exams.title':'Browse all exams',
 'exams.lead':'Not sure of the exact name? Every exam GovBabu covers, grouped by field — pick yours to see seats, pay, eligibility, reservation policy, how to apply, and get your documents ready.',
 'exams.searchLabel':'Search exams','exams.searchPlaceholder':'Search e.g. SSC, Railway, Banking…',
 'exams.allStates':'All states',
 'tools.title':'Tools','tools.lead':'Free, browser-based document tools — nothing you upload ever leaves your device. Applying for a specific exam? Its exact spec is on that exam\'s own page.',
 'elig.title':'Check My Eligibility','elig.lead':'Enter your age and qualification — see which exams on GovBabu you\'re likely eligible for, right now. No account, no saved profile — just a straight answer from what you enter below.',
 'elig.ageLabel':'Your age (years)','elig.qualLabel':'Highest qualification','elig.categoryLabel':'Category (optional)','elig.stateLabel':'State / domicile (optional)',
 'elig.selectOne':'Select…','elig.anyState':'Any state','elig.categoryAny':'Prefer not to say',
 'elig.categoryGeneral':'General / EWS','elig.categoryOBC':'OBC','elig.categorySC':'SC','elig.categoryST':'ST','elig.categoryPwBD':'PwBD',
 'elig.qual10th':'10th pass / Matriculation','elig.qual12th':'12th pass (10+2) / ITI / Diploma','elig.qualGraduate':'Graduate (Bachelor\'s degree)','elig.qualBTech':'B.Tech / B.E. (Engineering degree)','elig.qualPostgraduate':'Post-graduate (Master\'s degree)','elig.qualMTech':'M.Tech / M.E. (Engineering Master\'s degree)','elig.qualPhd':'Ph.D. / Doctorate',
 'elig.expHasLabel':'Do you have relevant work experience? (optional)','elig.expHasNo':'No / not applicable','elig.expHasYes':'Yes',
 'elig.expFieldLabel':'Field of experience',
 'elig.expBanking':'Banking / Financial Institution','elig.expTeaching':'Teaching / Education','elig.expEngineering':'Engineering / Technical',
 'elig.expIT':'IT / Software','elig.expLaw':'Law','elig.expAccounts':'Accounts / Finance','elig.expGovt':'Government / PSU','elig.expDefence':'Defence / Paramilitary','elig.expOther':'Other',
 'elig.submit':'Find My Eligible Exams','elig.fillRequired':'Enter your age and select your qualification first.',
 'elig.summaryPrefix':'Based on what you entered, you look eligible for','elig.summaryEligible':'exam(s)','elig.summaryBorderline':'possibly eligible with category relaxation',
 'elig.headEligible':'You look eligible for these','elig.headBorderline':'Possibly eligible — category relaxation may apply','elig.headUncertain':'Couldn\'t auto-check these — verify manually',
 'elig.noneEligible':'No exact matches from what you entered — try widening your qualification, or check the exams we couldn\'t auto-check below.',
 'elig.matchAge':'Matches your age — this exam needs {min}–{max} years',
 'elig.matchBorderline':'Just over the general age limit ({max} yrs) — you selected a reserved category, so a relaxation may cover you',
 'elig.matchExperience':'Matches your work experience — this exam\'s eligibility text asks for it',
 'elig.reasonNoData':'No eligibility details compiled yet for this exam',
 'elig.reasonUnparsed':'Age or qualification text for this exam is too complex to auto-check (multiple posts/conditions) — read it directly on the exam page',
 'elig.disclaimer':'This is an automatic, best-effort match based on the age and qualification text GovBabu has for each exam — not an official eligibility decision. Always confirm the exact eligibility rules on the exam\'s own page, and the official notification, before applying.',
 'home.popularLabel':'Most applied-for right now',
 'search.noMatch':'No match — try a shorter search, or','search.skipInstead':'skip and resize a file',
 'slot.photo':'Photo','slot.signature':'Signature',
 'slot.moreToolsHint':'Most exams want photo &amp; signature as JPG — that\'s covered above. Need something else for another document?',
 'slot.moreToolsLink':'🧰 Open all tools',
 'slot.toolOtherDoc':'📑 Image to PDF','slot.toolPdfToJpg':'🖼️ PDF → JPG (first page)','slot.toolPdfCompress':'🗜️ Shrink a PDF',
 'slot.toolPdfMerge':'🧩 Merge PDFs','slot.toolPdfRotate':'↻ Rotate a PDF','slot.toolPdfSign':'🖊️ Sign a PDF',
 'slot.toolPdfSplit':'✂️ Split a PDF','slot.toolPdfWatermark':'💧 Watermark a PDF','slot.toolPdfUnlock':'🔓 Unlock a PDF',
 'slot.chooseMergeFiles':'Click to choose 2 or more PDFs/images to merge','slot.mergeOrderHint':'Files merge in the order shown above.',
 'slot.mergeNow':'Merge into one PDF','slot.merging':'Merging…',
 'slot.mergeRasterNote':'Merged as images for reliability — text inside the original PDFs won\'t be selectable in the result.',
 'slot.rotateNow':'Rotate & download','slot.rotating':'Rotating…',
 'slot.splitFromLabel':'From page','slot.splitToLabel':'To page','slot.splitNow':'Split & download','slot.splitting':'Splitting…',
 'slot.watermarkTextLabel':'Watermark text','slot.watermarkPlaceholder':'e.g. SAMPLE, DRAFT, your name',
 'slot.watermarkNow':'Add watermark & download','slot.watermarking':'Adding watermark…',
 'slot.unlockPasswordLabel':'PDF password','slot.unlockPasswordPlaceholder':'Enter the PDF\'s password',
 'slot.unlockNow':'Unlock & download','slot.unlocking':'Unlocking…',
 'slot.choosePdfToSign':'Click to choose the PDF you want to sign','slot.loadingPreview':'Loading preview…',
 'slot.chooseSignatureImage':'Click to choose your signature image','slot.changeSignature':'Change signature',
 'slot.signClickHint':'Click anywhere on the page to place your signature there.',
 'slot.signOtherPagesHint':'Your signature is added to page 1 — other pages are kept as-is.',
 'slot.signSizeLabel':'Signature size','slot.applySignature':'Apply signature & download','slot.signing':'Signing…',
 'slot.download':'Download','slot.payToDownload':'Pay once below to download every file',
 'slot.processBatch':'Process a different batch','slot.choosePhotos':'📷 Click to choose one or more photos',
 'slot.targetKb':'Target KB','slot.targetKbHint':'Not sure what to enter? Photos are usually 20–50 KB, signatures 10–20 KB — check your exam\'s notice for the exact number.',
 'slot.process':'Process','slot.chooseImageToConvert':'Click to choose an image to convert to PDF','slot.choosePdf':'Click to choose a PDF',
 'slot.chooseYour':'Click to choose your','slot.tryAnother':'Try another file',
 'slot.processing':'Processing…','slot.converting':'Converting…','slot.extracting':'Extracting page 1…','slot.compressing':'Compressing…',
 'slot.closestPossible':'⚠️ Closest possible:','slot.ready':'✅ Ready:',
 'slot.payUnlock':'Pay ₹29 &amp; Unlock Downloads','slot.payWait':'Pay below',
 'err.notImage':'That doesn\'t look like an image — choose a JPG, PNG or WebP file.',
 'err.tooLargeImage':'That file is too large (max 15 MB) — try a smaller photo.',
 'err.notPdf':'That doesn\'t look like a PDF — choose a.pdf file.',
 'err.tooLargePdf':'That file is too large (max 15 MB) — try a smaller PDF.',
 'err.corruptedImage':'Couldn\'t read that file — it may be corrupted. Try a different photo.',
 'err.corruptedGeneric':'Couldn\'t read this file — it may be corrupted.',
 'err.corruptedConvert':'Couldn\'t convert that file — it may be corrupted. Try a different photo.',
 'err.corruptedPdfRead':'Couldn\'t read that PDF — it may be corrupted or password-protected.',
 'err.corruptedPdfProcess':'Couldn\'t process that PDF — it may be corrupted or password-protected.',
 'err.wrongPassword':'That password didn\'t work — check it and try again.',
 'err.watermarkTextRequired':'Type the text you want stamped on the PDF first.',
 'alert.chooseFileFirst':'Choose at least one file first.',
 'alert.chooseTarget5kb':'Choose a target of at least 5 KB.',
 'alert.choosePdfFirst':'Choose a PDF first.',
 'alert.mergeNeedsTwo':'Choose at least 2 files to merge.','alert.signNeedsBoth':'Choose both a PDF and a signature image first.',
 'alert.chooseTarget20kb':'Choose a target of at least 20 KB.',
 'pay.freeNote':'🎉 Free to use right now — download each file above, no payment needed.',
 'pay.unlockedNote':'✅ Unlocked — download each file above.',
 'pay.note':'One payment unlocks every file above · instant download, no account needed',
 'pay.err.couldNotStart':'Could not start payment.','pay.err.verificationFailed':'Verification failed.',
 'pay.err.notVerified':'Payment could not be verified.','pay.err.notStarted':'Payment could not be started.',
 'footer.tagline':'Government exams, applications and documents — made simpler.',
 'footer.copyright':'© 2026 GovBabu. All Rights Reserved.',
 'footer.explore':'Explore','footer.company':'Company','footer.connect':'Connect','footer.telegram':'Telegram',
 'footer.youtube':'YouTube','footer.instagram':'Instagram',
 'footer.faq':'FAQ',
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
 'about.journey1Desc':'Search or browse 50+ government exams — SSC, Railways, Banking, Defence and State PSCs — in one place, not a dozen scattered sites.',
 'about.journey2Title':'Understand',
 'about.journey2Desc':'See real vacancies, eligibility, fees and the selection process for each exam — sourced from official notifications, with every uncertain figure flagged, never silently guessed.',
 'about.journey3Title':'Check',
 'about.journey3Desc':'Enter your age and qualification once — see exactly which exams you\'re eligible for, and why. No login, no waiting.',
 'about.journey4Title':'Prepare',
 'about.journey4Desc':'Resize your photo and signature to each exam\'s exact spec, plus merge, rotate and sign PDFs — free, and processed entirely in your browser.',
 'about.journey5Title':'Apply',
 'about.journey5Desc':'Follow a clear, step-by-step guide built from the official notification — then apply directly on the exam\'s own portal, where your application belongs.',
 'about.journey6Title':'Track',
 'about.journey6Desc':'See every exam\'s deadline on one calendar, and check which results are already declared — before you hear it secondhand.',
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
 'contact.lead':'Found a data error, have an exam we should add, or just want to say something? Message us on <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">Telegram</a> for the fastest reply, or find us on Instagram and YouTube below.',
 'contact.telegramTitle':'📨 Telegram','contact.telegramDesc':'Report an error, request an exam, or send feedback — this is the fastest way to reach us.',
 'contact.instagramTitle':'📷 Instagram','contact.instagramDesc':'Follow for exam updates, deadline reminders and quick tips.',
 'contact.youtubeTitle':'▶️ YouTube','contact.youtubeDesc':'Watch walkthroughs and explainers for applications and documents.',
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
 'contact.faq5a':'Most likely, yes. We\'re actively expanding coverage. Message us on <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">Telegram</a> to tell us which exam you need, and we\'ll research and add it.',
 'contact.faq6q':'I found an error in the exam details — what do I do?',
 'contact.faq6a':'Please report it on <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">Telegram</a> with as much detail as you can (exam name, the incorrect field, and a source if you have one). We treat data corrections as high priority.',
 'contact.faq7q':'Do I need to create an account to use GovBabu?',
 'contact.faq7a':'No. There\'s no sign-up or login required for any part of the site.',
 'contact.faq8q':'Where does GovBabu get its exam information from?',
 'contact.faq8a':'Primarily from each exam\'s official notification — the PDF or page published by the conducting body (UPSC, SSC, IBPS, Railway, a state PSC, etc.). Where a detail can\'t be confirmed against a primary source, we say so in the exam\'s data note instead of guessing, and cite secondary sources when they\'re used.',
 'contact.faq9q':'How often is exam information updated?',
 'contact.faq9a':'Whenever we research or re-verify an exam, not on a fixed daily schedule. Application windows, dates and vacancy counts change often on the official side, so always cross-check the linked official notification before you submit anything.',
 'contact.faq10q':'Which exams does GovBabu cover?',
 'contact.faq10a':'SSC, Railway (RRB), Banking (IBPS/SBI/RBI), UPSC, State Exams, Defence (NDA/CDS/Agniveer), Teaching and Police exams — see the full, current list on <a href="exams.html">Browse Exams</a>. We\'re actively adding more.',
 'privacy.eyebrow':'🔒 Privacy Policy','privacy.h1':'Your data, plainly explained',
 'privacy.lead':'GovBabu is built to need as little of your data as possible. This page explains exactly what happens to what you give it.',
 'privacy.s1h':'Photo, signature and document files',
 'privacy.s1p':'Every photo, signature and PDF tool on GovBabu runs entirely in your browser using your device\'s own processing power (the HTML5 Canvas API and, for PDF tools, a library loaded from a public CDN). Your files are resized, compressed or converted locally on your device and are never uploaded to GovBabu\'s servers — because for these tools, GovBabu does not operate a server that receives them at all.',
 'privacy.s2h':'Contacting us',
 'privacy.s2p':'Our <a href="contact.html">Contact page</a> links out to our Telegram, Instagram and YouTube — GovBabu doesn\'t run a feedback form or a server that collects what you send us. Any message you send happens entirely within that platform, under its own privacy terms.',
 'privacy.s3h':'What we store in your browser',
 'privacy.s3p':'Two small preferences — your chosen language and light/dark theme — are saved using your browser\'s local storage so the site remembers them on your next visit. This stays on your device; it is not sent to us or to any third party.',
 'privacy.s4h':'Payments',
 'privacy.s4p':'GovBabu\'s document tools are currently free for every aspirant, with no payment required. If a paid unlock is introduced in the future, payment would be handled by a third-party payment processor (Razorpay) — card and payment details would go directly to that processor under its own privacy terms, not to GovBabu.',
 'privacy.s5h':'Cookies and analytics',
 'privacy.s5p':'GovBabu does not run third-party analytics or advertising trackers, and does not use cookies for tracking.',
 'privacy.s6h':'Accounts',
 'privacy.s6p':'There is no sign-up or login anywhere on GovBabu, so we don\'t hold account profiles, passwords or usage histories tied to an identity.',
 'privacy.s7h':'Copyright',
 'privacy.s7p':'GovBabu\'s own content — its design, wording, compiled exam summaries and code — is © 2026 GovBabu, unless stated otherwise. Any photo, signature or document you process through our tools stays entirely yours; as explained above, GovBabu never receives those files, so it never holds any rights to them. GovBabu does not claim ownership of official notifications, logos or other material published by UPSC, SSC, IBPS, Railway, BPSC or any other government body — those remain the property of their respective conducting authorities, and are only summarized and linked to here.',
 'privacy.s8h':'Questions about this policy',
 'privacy.s8p':'Reach us via the <a href="contact.html">Contact page</a> or message us directly on <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">Telegram</a>.',
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
 'terms.s9p':'Reach us via the <a href="contact.html">Contact page</a> or message us directly on <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">Telegram</a>.',
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
 'nav.home':'होम','nav.browseExams':'अपनी परीक्षा खोजें','nav.tools':'टूल्स','nav.calendar':'परीक्षा कैलेंडर','nav.manjusha':'डाउनलोड','nav.more':'अधिक','nav.about':'हमारे बारे में','nav.contact':'संपर्क करें',
 'comingSoon.tag':'जल्द आ रहा है',
 'comingSoon.browseExams':'सभी परीक्षाएं देखें','comingSoon.exploreTools':'मुफ़्त टूल्स देखें','comingSoon.backHome':'होम पर वापस जाएं',
 'manjusha.title':'डाउनलोड','manjusha.lead':'आपके परीक्षा-तैयारी संसाधनों की मंजूषा — सिलेबस, मासिक करेंट अफेयर्स और कंप्यूटर साइंस नोट्स, सब एक ही जगह। अभी लाइव नहीं है।',
 'manjusha.syllabusTitle':'📘 सिलेबस','manjusha.syllabusDesc':'हर परीक्षा के लिए संरचित सिलेबस — आधिकारिक अधिसूचनाओं के अनुसार सत्यापित, कहीं और से कॉपी नहीं किया गया।',
 'manjusha.currentAffairsTitle':'🗞️ मासिक करेंट अफेयर्स','manjusha.currentAffairsDesc':'सरकारी परीक्षा की तैयारी के लिए तैयार किया गया मासिक करेंट अफेयर्स डाइजेस्ट।',
 'manjusha.csTitle':'💻 कंप्यूटर साइंस','manjusha.csDesc':'तकनीकी और कंप्यूटर साइंस विषयों की परीक्षा देने वालों के लिए मुख्य नोट्स।',
 'home.title':'वो सरकारी परीक्षाएं खोजें जिनके लिए आप वाकई आवेदन कर सकते हैं।',
 'home.lead':'पात्रता • रिक्तियां • तारीखें • पाठ्यक्रम • आवेदन — सब कुछ एक ही जगह, आवेदन करने से पहले।',
 'home.ctaBrowse':'सभी परीक्षाएं देखें','home.ctaCalendar':'कैलेंडर देखें','home.ctaEligibility':'अपनी पात्रता जांचें',
 'home.privacy':'🔒 पूरी तरह आपके ब्राउज़र में प्रोसेस होता है — आपकी फोटो और हस्ताक्षर कभी आपके डिवाइस से बाहर नहीं जाते।',
 'home.browseAll':'सभी परीक्षाएं देखें →','home.calendar':'कैलेंडर →',
 'home.skip':'छोड़ें — मुझे बस फ़ाइल का साइज़ बदलना है →',
 'home.changeExam':'← परीक्षा बदलें','home.startOver':'← फिर से शुरू करें',
 'home.searchPlaceholder':'परीक्षा, विभाग, योग्यता खोजें',
 'step.exam':'परीक्षा','step.analysis':'हमारा विश्लेषण देखें','step.upload':'अपलोड','step.download':'डाउनलोड',
 'sidebar.noticeBoard':'📌 सूचना पट्ट','sidebar.results':'🏆 परिणाम',
 'detail.postsPay':'💰 पद और वेतन','detail.eligibility':'🎓 पात्रता','detail.promotion':'📈 करियर पथ',
 'detail.howToApply':'📝 आवेदन कैसे करें','detail.otherDocs':'📄 अन्य आवश्यक दस्तावेज़',
 'detail.examPattern':'📋 परीक्षा पैटर्न','detail.negativeMarking':'नकारात्मक अंकन','detail.passingMarks':'उत्तीर्ण अंक',
 'detail.faq':'❓ अक्सर पूछे जाने वाले प्रश्न',
 'detail.age':'आयु','detail.relaxation':'छूट','detail.qualification':'योग्यता',
 'detail.applyOnOfficial':'आधिकारिक साइट पर आवेदन करें ↗','detail.officialNotice':'आधिकारिक स्रोत ↗',
 'detail.applicationsOpen':'आवेदन खुले हैं','detail.applicationsClosed':'आवेदन बंद हैं',
 'detail.beforeYouStart':'शुरू करने से पहले','detail.commonMistakes':'⚠ बचने योग्य सामान्य गलतियां','detail.correctionWindow':'सुधार विंडो',
 'detail.missing':'इस परीक्षा के लिए पद, वेतन और पदोन्नति का विवरण अभी संकलित नहीं हुआ है — ऊपर दी गई आधिकारिक अधिसूचना देखें।',
 'detail.noSpecificExam':'कोई विशेष परीक्षा चयनित नहीं है — नीचे अपना लक्ष्य आकार निर्धारित करें।',
 'detail.dataNoteToggle':'डेटा नोट — विवरण देखने के लिए टैप करें',
 'overview.lastDate':'अंतिम तिथि','overview.vacancies':'रिक्तियां','detail.lastUpdatedPrefix':'🕒 आखिरी बार अपडेट:',
 'overview.status':'स्थिति','overview.category':'श्रेणी',
 'detail.datesHead':'📅 महत्वपूर्ण तिथियां','detail.applyStart':'आवेदन शुरू','detail.result':'परिणाम','detail.lastVerified':'अंतिम सत्यापन',
 'detail.examDate':'परीक्षा तिथि','detail.admitCard':'प्रवेश पत्र','detail.fee':'आवेदन शुल्क',
 'detail.vacanciesHead':'🎟️ रिक्तियां और पद','detail.totalVacancies':'कुल रिक्तियां','detail.payLevel':'वेतन स्तर','detail.payBand':'वेतन बैंड','detail.posts':'पद','detail.post':'पद',
 'detail.beforeApply':'🧾 आवेदन से पहले','detail.photo':'फ़ोटो','detail.signature':'हस्ताक्षर','detail.prepDocsCta':'अभी तैयार करें →','detail.notAvailable':'अभी उपलब्ध नहीं',
 'detail.aboutExam':'ℹ️ परीक्षा के बारे में','detail.conductedBy':'आयोजक निकाय',
 'detail.selectionProcess':'🧭 चयन प्रक्रिया','detail.section':'खंड','detail.details':'विवरण',
 'detail.syllabusHead':'📘 पूर्ण पाठ्यक्रम','detail.syllabusLede':'इस परीक्षा का पूरा विषयवार पाठ्यक्रम चाहिए?','detail.viewSyllabus':'पूर्ण पाठ्यक्रम देखें →',
 'detail.importantLinks':'🔗 महत्वपूर्ण लिंक','detail.quickLinks':'त्वरित लिंक','detail.relatedExams':'संबंधित परीक्षाएं',
 'detail.applyNow':'अभी आवेदन करें ↗','detail.checkEligibility':'पात्रता जांचें','detail.notAnnounced':'अभी घोषित नहीं हुआ',
 'nav.sec.dates':'तिथियां','nav.sec.vacancies':'रिक्तियां और पद','nav.sec.eligibility':'पात्रता','nav.sec.before':'आवेदन से पहले','nav.sec.apply':'आवेदन कैसे करें','nav.sec.about':'परिचय','nav.sec.career':'करियर पथ','nav.sec.selection':'चयन','nav.sec.pattern':'परीक्षा पैटर्न','nav.sec.faq':'प्रश्नोत्तर','nav.sec.syllabus':'पाठ्यक्रम','nav.sec.links':'लिंक',
 'status.open':'खुला','status.closing':'जल्द बंद होगा','status.closed':'बंद','status.expected':'अपेक्षित',
 'card.lastDate':'अंतिम तिथि:','card.closedOn':'बंद हुआ:','card.vacancies':'रिक्तियां','card.viewDetails':'विवरण देखें',
 'card.knowMore':'अधिक जानें','card.lastCycle':'(पिछला चक्र)','card.deadlineLabel':'आवेदन की अंतिम तिथि',
 'card.expectedLabel':'अपेक्षित','card.closedPrefix':'बंद',
 'cal.eyebrow':'📅 परीक्षा कैलेंडर','cal.title':'आवेदन की समय सीमा कभी न चूकें',
 'cal.lead':'सरकारी परीक्षाएं, आवेदन की समय सीमा, रिक्तियां और वेतन — सब एक ही जगह देखें।',
 'cal.filterAll':'सभी','cal.filterLive':'लाइव','cal.filterResults':'परिणाम','cal.filterAdmitCard':'प्रवेश पत्र',
 'cal.chipExams':'परीक्षाएं','cal.chipOpen':'खुला','cal.chipClosing':'जल्द बंद होगा',
 'cal.noneInWindow':'इस अवधि में अभी कोई परीक्षा नहीं है — देखें','cal.allExamsLink':'सभी परीक्षाएं',
 'exams.title':'सभी परीक्षाएं देखें',
 'exams.lead':'सही नाम याद नहीं? GovBabu की हर परीक्षा क्षेत्र अनुसार यहां है — अपनी परीक्षा चुनें और सीटें, वेतन, पात्रता, आरक्षण नीति, आवेदन प्रक्रिया देखें, और अपने दस्तावेज़ तैयार करें।',
 'exams.searchLabel':'परीक्षा खोजें','exams.searchPlaceholder':'खोजें जैसे SSC, रेलवे, बैंकिंग…',
 'exams.allStates':'सभी राज्य',
 'tools.title':'टूल्स','tools.lead':'मुफ़्त, ब्राउज़र-आधारित डॉक्यूमेंट टूल्स — जो भी आप अपलोड करें, वह कभी आपकी डिवाइस से बाहर नहीं जाता। किसी खास परीक्षा के लिए आवेदन कर रहे हैं? उसकी सटीक स्पेसिफिकेशन उसी परीक्षा के पेज पर है।',
 'elig.title':'अपनी पात्रता जांचें','elig.lead':'अपनी उम्र और योग्यता बताएं — देखें कि GovBabu की किन परीक्षाओं के लिए आप अभी पात्र हो सकते हैं। कोई खाता नहीं, कोई सेव प्रोफ़ाइल नहीं — बस नीचे दी गई जानकारी से सीधा जवाब।',
 'elig.ageLabel':'आपकी उम्र (वर्ष)','elig.qualLabel':'उच्चतम योग्यता','elig.categoryLabel':'श्रेणी (वैकल्पिक)','elig.stateLabel':'राज्य / निवास (वैकल्पिक)',
 'elig.selectOne':'चुनें…','elig.anyState':'कोई भी राज्य','elig.categoryAny':'बताना नहीं चाहते',
 'elig.categoryGeneral':'सामान्य / ईडब्ल्यूएस','elig.categoryOBC':'ओबीसी','elig.categorySC':'एससी','elig.categoryST':'एसटी','elig.categoryPwBD':'दिव्यांग',
 'elig.qual10th':'10वीं पास / मैट्रिक','elig.qual12th':'12वीं पास (10+2) / आईटीआई / डिप्लोमा','elig.qualGraduate':'स्नातक (बैचलर डिग्री)','elig.qualBTech':'बी.टेक / बी.ई. (इंजीनियरिंग डिग्री)','elig.qualPostgraduate':'स्नातकोत्तर (मास्टर डिग्री)','elig.qualMTech':'एम.टेक / एम.ई. (इंजीनियरिंग मास्टर डिग्री)','elig.qualPhd':'पीएच.डी. / डॉक्टरेट',
 'elig.expHasLabel':'क्या आपके पास प्रासंगिक कार्य अनुभव है? (वैकल्पिक)','elig.expHasNo':'नहीं / लागू नहीं','elig.expHasYes':'हां',
 'elig.expFieldLabel':'अनुभव का क्षेत्र',
 'elig.expBanking':'बैंकिंग / वित्तीय संस्थान','elig.expTeaching':'शिक्षण / शिक्षा','elig.expEngineering':'इंजीनियरिंग / तकनीकी',
 'elig.expIT':'आईटी / सॉफ्टवेयर','elig.expLaw':'कानून','elig.expAccounts':'लेखा / वित्त','elig.expGovt':'सरकारी / पीएसयू','elig.expDefence':'रक्षा / अर्धसैनिक','elig.expOther':'अन्य',
 'elig.submit':'मेरी पात्र परीक्षाएं खोजें','elig.fillRequired':'पहले अपनी उम्र भरें और योग्यता चुनें।',
 'elig.summaryPrefix':'आपके द्वारा दी गई जानकारी के अनुसार, आप पात्र दिखते हैं','elig.summaryEligible':'परीक्षा(ओं) के लिए','elig.summaryBorderline':'श्रेणी छूट के साथ संभावित रूप से पात्र',
 'elig.headEligible':'आप इनके लिए पात्र दिखते हैं','elig.headBorderline':'संभावित रूप से पात्र — श्रेणी छूट लागू हो सकती है','elig.headUncertain':'इन्हें स्वतः जांचा नहीं जा सका — स्वयं जांचें',
 'elig.noneEligible':'आपकी दी गई जानकारी से कोई सटीक मेल नहीं मिला — अपनी योग्यता का दायरा बढ़ाकर देखें, या नीचे उन परीक्षाओं को देखें जिन्हें हम स्वतः जांच नहीं सके।',
 'elig.matchAge':'आपकी उम्र मेल खाती है — इस परीक्षा के लिए {min}–{max} वर्ष चाहिए',
 'elig.matchBorderline':'सामान्य आयु सीमा ({max} वर्ष) से थोड़ा ऊपर — आपने आरक्षित श्रेणी चुनी है, इसलिए छूट लागू हो सकती है',
 'elig.matchExperience':'आपके कार्य अनुभव से मेल खाता है — इस परीक्षा के पात्रता विवरण में इसकी मांग है',
 'elig.reasonNoData':'इस परीक्षा के लिए अभी पात्रता विवरण तैयार नहीं है',
 'elig.reasonUnparsed':'इस परीक्षा का उम्र या योग्यता विवरण स्वतः जांचने के लिए बहुत जटिल है (कई पद/शर्तें) — परीक्षा पेज पर सीधे पढ़ें',
 'elig.disclaimer':'यह GovBabu के पास मौजूद उम्र और योग्यता विवरण के आधार पर एक स्वचालित, सर्वोत्तम-प्रयास मिलान है — कोई आधिकारिक पात्रता निर्णय नहीं। आवेदन करने से पहले हमेशा परीक्षा के अपने पेज और आधिकारिक अधिसूचना पर सटीक पात्रता नियमों की पुष्टि करें।',
 'home.popularLabel':'अभी सबसे ज़्यादा आवेदन की जा रही परीक्षाएं',
 'search.noMatch':'कोई मेल नहीं मिला — छोटा खोजशब्द आज़माएं, या','search.skipInstead':'सीधे फ़ाइल का साइज़ बदलें',
 'slot.photo':'फोटो','slot.signature':'हस्ताक्षर',
 'slot.moreToolsHint':'अधिकतर परीक्षाओं के लिए फोटो और हस्ताक्षर JPG में चाहिए — वह ऊपर हो चुका है। किसी अन्य दस्तावेज़ के लिए कुछ और चाहिए?',
 'slot.moreToolsLink':'🧰 सभी टूल खोलें',
 'slot.toolOtherDoc':'📑 इमेज को PDF बनाएं','slot.toolPdfToJpg':'🖼️ PDF → JPG (पहला पेज)','slot.toolPdfCompress':'🗜️ PDF छोटा करें',
 'slot.toolPdfMerge':'🧩 PDF मर्ज करें','slot.toolPdfRotate':'↻ PDF घुमाएं','slot.toolPdfSign':'🖊️ PDF पर हस्ताक्षर करें',
 'slot.toolPdfSplit':'✂️ PDF को विभाजित करें','slot.toolPdfWatermark':'💧 PDF पर वॉटरमार्क लगाएं','slot.toolPdfUnlock':'🔓 PDF अनलॉक करें',
 'slot.chooseMergeFiles':'मर्ज करने के लिए 2 या अधिक PDF/इमेज चुनने के लिए क्लिक करें','slot.mergeOrderHint':'फ़ाइलें ऊपर दिखाए गए क्रम में मर्ज होंगी।',
 'slot.mergeNow':'एक PDF में मर्ज करें','slot.merging':'मर्ज हो रहा है…',
 'slot.mergeRasterNote':'विश्वसनीयता के लिए इमेज के रूप में मर्ज किया गया — मूल PDF के अंदर का टेक्स्ट परिणाम में चुना नहीं जा सकेगा।',
 'slot.rotateNow':'घुमाएं और डाउनलोड करें','slot.rotating':'घुमाया जा रहा है…',
 'slot.splitFromLabel':'किस पेज से','slot.splitToLabel':'किस पेज तक','slot.splitNow':'विभाजित करें और डाउनलोड करें','slot.splitting':'विभाजित हो रहा है…',
 'slot.watermarkTextLabel':'वॉटरमार्क टेक्स्ट','slot.watermarkPlaceholder':'जैसे SAMPLE, DRAFT, आपका नाम',
 'slot.watermarkNow':'वॉटरमार्क लगाएं और डाउनलोड करें','slot.watermarking':'वॉटरमार्क लगाया जा रहा है…',
 'slot.unlockPasswordLabel':'PDF पासवर्ड','slot.unlockPasswordPlaceholder':'PDF का पासवर्ड डालें',
 'slot.unlockNow':'अनलॉक करें और डाउनलोड करें','slot.unlocking':'अनलॉक हो रहा है…',
 'slot.choosePdfToSign':'जिस PDF पर हस्ताक्षर करना है उसे चुनने के लिए क्लिक करें','slot.loadingPreview':'पूर्वावलोकन लोड हो रहा है…',
 'slot.chooseSignatureImage':'अपने हस्ताक्षर की इमेज चुनने के लिए क्लिक करें','slot.changeSignature':'हस्ताक्षर बदलें',
 'slot.signClickHint':'हस्ताक्षर वहां रखने के लिए पेज पर कहीं भी क्लिक करें।',
 'slot.signOtherPagesHint':'आपका हस्ताक्षर पेज 1 पर जोड़ा गया है — अन्य पेज वैसे ही रहेंगे।',
 'slot.signSizeLabel':'हस्ताक्षर का आकार','slot.applySignature':'हस्ताक्षर लगाएं और डाउनलोड करें','slot.signing':'हस्ताक्षर हो रहा है…',
 'slot.download':'डाउनलोड','slot.payToDownload':'हर फ़ाइल डाउनलोड करने के लिए नीचे एक बार भुगतान करें',
 'slot.processBatch':'अलग बैच प्रोसेस करें','slot.choosePhotos':'📷 एक या अधिक फोटो चुनने के लिए क्लिक करें',
 'slot.targetKb':'लक्ष्य KB','slot.targetKbHint':'समझ नहीं आ रहा क्या डालें? आमतौर पर फोटो 20–50 KB और हस्ताक्षर 10–20 KB होते हैं — सटीक संख्या के लिए अपनी परीक्षा की सूचना देखें।',
 'slot.process':'प्रोसेस करें','slot.chooseImageToConvert':'PDF बनाने के लिए एक इमेज चुनने के लिए क्लिक करें','slot.choosePdf':'PDF चुनने के लिए क्लिक करें',
 'slot.chooseYour':'चुनने के लिए क्लिक करें','slot.tryAnother':'दूसरी फ़ाइल आज़माएं',
 'slot.processing':'प्रोसेस हो रहा है…','slot.converting':'बदला जा रहा है…','slot.extracting':'पहला पेज निकाला जा रहा है…','slot.compressing':'छोटा किया जा रहा है…',
 'slot.closestPossible':'⚠️ नज़दीकी संभव साइज़:','slot.ready':'✅ तैयार:',
 'slot.payUnlock':'₹29 भुगतान करें और डाउनलोड अनलॉक करें','slot.payWait':'नीचे भुगतान करें',
 'err.notImage':'यह इमेज नहीं लग रही — JPG, PNG या WebP फ़ाइल चुनें।',
 'err.tooLargeImage':'यह फ़ाइल बहुत बड़ी है (अधिकतम 15 MB) — छोटी फोटो आज़माएं।',
 'err.notPdf':'यह PDF नहीं लग रही —.pdf फ़ाइल चुनें।',
 'err.tooLargePdf':'यह फ़ाइल बहुत बड़ी है (अधिकतम 15 MB) — छोटी PDF आज़माएं।',
 'err.corruptedImage':'यह फ़ाइल पढ़ी नहीं जा सकी — शायद यह खराब है। कोई दूसरी फोटो आज़माएं।',
 'err.corruptedGeneric':'यह फ़ाइल पढ़ी नहीं जा सकी — शायद यह खराब है।',
 'err.corruptedConvert':'इस फ़ाइल को बदला नहीं जा सका — शायद यह खराब है। कोई दूसरी फोटो आज़माएं।',
 'err.corruptedPdfRead':'यह PDF पढ़ी नहीं जा सकी — शायद यह खराब है या पासवर्ड-सुरक्षित है।',
 'err.corruptedPdfProcess':'इस PDF को प्रोसेस नहीं किया जा सका — शायद यह खराब है या पासवर्ड-सुरक्षित है।',
 'err.wrongPassword':'वह पासवर्ड काम नहीं आया — जांचें और फिर कोशिश करें।',
 'err.watermarkTextRequired':'पहले वह टेक्स्ट लिखें जो PDF पर लगाना है।',
 'alert.chooseFileFirst':'पहले कम से कम एक फ़ाइल चुनें।',
 'alert.chooseTarget5kb':'कम से कम 5 KB का टारगेट चुनें।',
 'alert.choosePdfFirst':'पहले एक PDF चुनें।',
 'alert.mergeNeedsTwo':'मर्ज करने के लिए कम से कम 2 फ़ाइलें चुनें।','alert.signNeedsBoth':'पहले एक PDF और एक हस्ताक्षर इमेज दोनों चुनें।',
 'alert.chooseTarget20kb':'कम से कम 20 KB का टारगेट चुनें।',
 'pay.freeNote':'🎉 अभी उपयोग करना मुफ़्त है — बिना भुगतान के ऊपर से हर फ़ाइल डाउनलोड करें।',
 'pay.unlockedNote':'✅ अनलॉक हो गया — ऊपर से हर फ़ाइल डाउनलोड करें।',
 'pay.note':'एक भुगतान से ऊपर की सभी फ़ाइलें अनलॉक होती हैं · तुरंत डाउनलोड, खाते की ज़रूरत नहीं',
 'pay.err.couldNotStart':'भुगतान शुरू नहीं हो सका।','pay.err.verificationFailed':'सत्यापन विफल रहा।',
 'pay.err.notVerified':'भुगतान सत्यापित नहीं हो सका।','pay.err.notStarted':'भुगतान शुरू नहीं हो सका।',
 'footer.tagline':'सरकारी परीक्षाएं, आवेदन और दस्तावेज़ — अब आसान।',
 'footer.copyright':'© 2026 GovBabu. सर्वाधिकार सुरक्षित।',
 'footer.explore':'एक्सप्लोर करें','footer.company':'कंपनी','footer.connect':'जुड़ें','footer.telegram':'टेलीग्राम',
 'footer.youtube':'यूट्यूब','footer.instagram':'इंस्टाग्राम',
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
 'about.journey1Desc':'50+ सरकारी परीक्षाएं — SSC, रेलवे, बैंकिंग, रक्षा और राज्य लोक सेवा आयोग — एक ही जगह खोजें, दर्जनों बिखरी हुई साइटों पर जाने की बजाय।',
 'about.journey2Title':'समझें',
 'about.journey2Desc':'हर परीक्षा की असली रिक्तियां, पात्रता, शुल्क और चयन प्रक्रिया देखें — आधिकारिक अधिसूचनाओं से ली गई, जहां कोई आंकड़ा अनिश्चित हो वहां साफ बताया गया है, कभी अंदाज़ा नहीं लगाया गया।',
 'about.journey3Title':'जांचें',
 'about.journey3Desc':'अपनी उम्र और योग्यता एक बार भरें — देखें आप किन परीक्षाओं के लिए पात्र हैं, और क्यों। कोई लॉगिन नहीं, कोई इंतज़ार नहीं।',
 'about.journey4Title':'तैयार करें',
 'about.journey4Desc':'अपनी फोटो और हस्ताक्षर को हर परीक्षा की सटीक स्पेसिफिकेशन में लाएं, साथ ही PDF मर्ज, घुमाएं और उस पर हस्ताक्षर करें — मुफ़्त, और पूरी तरह आपके ब्राउज़र में प्रोसेस किया गया।',
 'about.journey5Title':'आवेदन करें',
 'about.journey5Desc':'आधिकारिक अधिसूचना से बना एक स्पष्ट, चरण-दर-चरण गाइड फॉलो करें — फिर परीक्षा के अपने पोर्टल पर सीधे आवेदन करें, जहां आपका आवेदन असल में होना चाहिए।',
 'about.journey6Title':'ट्रैक करें',
 'about.journey6Desc':'हर परीक्षा की समय सीमा एक ही कैलेंडर में देखें, और जानें कौन से परिणाम पहले ही घोषित हो चुके हैं — किसी और से सुनने से पहले।',
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
 'contact.lead':'कोई डेटा गलती मिली, कोई परीक्षा जोड़नी है, या बस कुछ कहना है? सबसे तेज़ जवाब के लिए हमें <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">टेलीग्राम</a> पर मैसेज करें, या नीचे हमें इंस्टाग्राम और यूट्यूब पर खोजें।',
 'contact.telegramTitle':'📨 टेलीग्राम','contact.telegramDesc':'गलती की रिपोर्ट करें, परीक्षा जोड़ने का अनुरोध करें, या फीडबैक भेजें — हम तक पहुंचने का सबसे तेज़ तरीका।',
 'contact.instagramTitle':'📷 इंस्टाग्राम','contact.instagramDesc':'परीक्षा अपडेट, डेडलाइन रिमाइंडर और त्वरित टिप्स के लिए फॉलो करें।',
 'contact.youtubeTitle':'▶️ यूट्यूब','contact.youtubeDesc':'आवेदन और दस्तावेज़ों के लिए वॉकथ्रू और समझाने वाले वीडियो देखें।',
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
 'contact.faq5a':'ज़्यादातर मामलों में, हां। हम सक्रिय रूप से कवरेज बढ़ा रहे हैं। हमें <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">टेलीग्राम</a> पर बताएं आपको कौन सी परीक्षा चाहिए, और हम उसका शोध करके जोड़ देंगे।',
 'contact.faq6q':'मुझे परीक्षा विवरण में एक गलती मिली — मुझे क्या करना चाहिए?',
 'contact.faq6a':'कृपया इसे <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">टेलीग्राम</a> पर जितना विस्तार से हो सके रिपोर्ट करें (परीक्षा का नाम, गलत फील्ड, और अगर हो तो स्रोत)। हम डेटा सुधार को उच्च प्राथमिकता देते हैं।',
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
 'privacy.s2h':'हमसे संपर्क करना',
 'privacy.s2p':'हमारा <a href="contact.html">संपर्क पेज</a> हमारे टेलीग्राम, इंस्टाग्राम और यूट्यूब से जोड़ता है — GovBabu कोई फीडबैक फॉर्म या ऐसा सर्वर नहीं चलाता जो आपका भेजा हुआ संदेश इकट्ठा करे। आप जो भी संदेश भेजते हैं वह पूरी तरह उस प्लेटफ़ॉर्म के भीतर होता है, उसकी अपनी गोपनीयता शर्तों के तहत।',
 'privacy.s3h':'हम आपके ब्राउज़र में क्या सेव करते हैं',
 'privacy.s3p':'दो छोटी प्राथमिकताएं — आपकी चुनी हुई भाषा और लाइट/डार्क थीम — आपके ब्राउज़र के लोकल स्टोरेज में सेव की जाती हैं ताकि साइट अगली बार आपकी विज़िट पर उन्हें याद रखे। यह आपके डिवाइस पर ही रहता है; यह न हमें भेजा जाता है, न किसी तीसरे पक्ष को।',
 'privacy.s4h':'भुगतान',
 'privacy.s4p':'GovBabu के डॉक्यूमेंट टूल्स अभी हर अभ्यर्थी के लिए मुफ़्त हैं, कोई भुगतान ज़रूरी नहीं। अगर भविष्य में कोई भुगतान वाला अनलॉक शुरू किया जाता है, तो भुगतान एक तीसरे पक्ष के पेमेंट प्रोसेसर (Razorpay) द्वारा संभाला जाएगा — कार्ड और भुगतान विवरण सीधे उस प्रोसेसर के पास उसकी अपनी गोपनीयता शर्तों के तहत जाएंगे, GovBabu के पास नहीं।',
 'privacy.s5h':'कुकीज़ और एनालिटिक्स',
 'privacy.s5p':'GovBabu कोई थर्ड-पार्टी एनालिटिक्स या विज्ञापन ट्रैकर नहीं चलाता, और ट्रैकिंग के लिए कुकीज़ का इस्तेमाल नहीं करता।',
 'privacy.s6h':'खाते',
 'privacy.s6p':'GovBabu पर कहीं भी साइन-अप या लॉगिन नहीं है, इसलिए हम किसी पहचान से जुड़े खाता प्रोफाइल, पासवर्ड या उपयोग इतिहास नहीं रखते।',
 'privacy.s7h':'कॉपीराइट',
 'privacy.s7p':'GovBabu की अपनी सामग्री — इसका डिज़ाइन, लेखन, संकलित परीक्षा सारांश और कोड — जब तक अन्यथा न बताया जाए, © 2026 GovBabu की है। हमारे टूल्स से प्रोसेस की गई कोई भी फोटो, हस्ताक्षर या दस्तावेज़ पूरी तरह आपका ही रहता है; जैसा ऊपर बताया गया, GovBabu कभी वे फ़ाइलें प्राप्त ही नहीं करता, इसलिए उन पर उसका कोई अधिकार नहीं होता। GovBabu, UPSC, SSC, IBPS, रेलवे, BPSC या किसी भी अन्य सरकारी निकाय द्वारा प्रकाशित आधिकारिक सूचनाओं, लोगो या अन्य सामग्री पर स्वामित्व का दावा नहीं करता — वे संबंधित परीक्षा-संचालक प्राधिकरणों की संपत्ति हैं, और यहां केवल उनका सारांश और लिंक दिया गया है।',
 'privacy.s8h':'इस नीति के बारे में सवाल',
 'privacy.s8p':'हमें <a href="contact.html">संपर्क पेज</a> के ज़रिए या सीधे <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">टेलीग्राम</a> पर मैसेज करें।',
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
 'terms.s9p':'हमसे <a href="contact.html">संपर्क पेज</a> के ज़रिए या सीधे <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">टेलीग्राम</a> पर संपर्क करें।',
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
// dictionary instead of a per-exam translation field. Internal cat key
// stays 'State PSC' (exam data, CAT_CLASS, filter values) — only the
// displayed label changes, since this category also covers non-PSC state
// recruitment (teacher recruitment, staff selection boards, etc.), so
// "State Exams" is the more accurate name shown to visitors.
const CAT_LABEL_EN={'State PSC':'State Exams'};
const CAT_HI={
 'Central Govt':'केंद्र सरकार','Banking':'बैंकिंग','Railway':'रेलवे',
 'Defence':'रक्षा','State PSC':'राज्य परीक्षाएं','Teaching':'शिक्षण','Police':'पुलिस'
};
function trCat(cat){
 if(currentLang==='hi') return CAT_HI[cat]||cat;
 return CAT_LABEL_EN[cat]||cat;
}

// State names for grouping exams within the State Exams category — one
// shared dictionary, same pattern as CAT_HI/trCat above.
const STATE_HI={
 'Bihar':'बिहार','Uttar Pradesh':'उत्तर प्रदेश','Madhya Pradesh':'मध्य प्रदेश',
 'Delhi':'दिल्ली','Haryana':'हरियाणा','Rajasthan':'राजस्थान',
 'West Bengal':'पश्चिम बंगाल','Tamil Nadu':'तमिलनाडु','Kerala':'केरल',
 'Maharashtra':'महाराष्ट्र','Odisha':'ओडिशा','Jharkhand':'झारखंड','Telangana':'तेलंगाना'
};
function trState(st){ return currentLang==='hi'&&STATE_HI[st]?STATE_HI[st]:st; }

// No exam in the published data carries a `state` field yet (the admin
// dashboard/database don't collect one) — this fills the gap client-side
// from each exam's own code, which already encodes its state (BPSC,
// UP-LEKHPAL, RAJ-POLICE-CONST, ...). examState() prefers a real a.state
// if the data ever grows one, so this map becomes redundant on its own
// rather than needing to be ripped out.
const EXAM_STATE={
 'BPSC':'Bihar','BIHAR-POLICE-CONSTABLE':'Bihar','BIHAR-SI':'Bihar','BIHAR-TRE-4':'Bihar',
 'UPPSC':'Uttar Pradesh','UP-POLICE-CONST':'Uttar Pradesh','UP-LEKHPAL':'Uttar Pradesh','UPSSSC-PET':'Uttar Pradesh',
 'MPPSC':'Madhya Pradesh','MP-POLICE-CONST':'Madhya Pradesh',
 'RSMSSB-PATWARI':'Rajasthan','RAJ-POLICE-CONST':'Rajasthan',
 'MAH-POLICE-CONST':'Maharashtra',
 'WBPSC-WBCS':'West Bengal',
 'TNPSC-GRP4':'Tamil Nadu',
 'KPSC-LDC':'Kerala','KPSC-DEGREE-PRELIMS':'Kerala',
 'OPSC-OCS':'Odisha',
 'JPSC-CCE':'Jharkhand',
 'TGPSC-GROUP1':'Telangana',
 'DSSSB-TGT-CS':'Delhi',
 'HSSC-GRP-C':'Haryana'
};
function examState(a){ return a.state||EXAM_STATE[a.code]||null; }

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
 ['renderExamCatFilters','renderExamCardGrid','renderExamDirFilters','renderExamDirectory','renderExamCalendar','renderCalFilters','renderNoticeTicker']
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
// [{bytes,w,h},...] — one entry per page, in order.
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

async function pdfFileToCanvases(file,scale,password){
 const pdfjsLib=await loadPdfJs();
 const buf=await file.arrayBuffer();
 const params={data:buf};
 if(password) params.password=password;
 const doc=await pdfjsLib.getDocument(params).promise;
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

// Shared by every tool below that turns an arbitrary image file into a
// page-sized canvas — draws it down to at most maxDim on its longer side so
// a phone photo can't blow up a merged/converted PDF's page size.
function imageFileToCanvas(file,maxDim){
 return new Promise((resolve,reject)=>{
 const img=new Image();
 img.onload=()=>{
 const c=document.createElement('canvas'),scale=Math.min(maxDim/img.naturalWidth,maxDim/img.naturalHeight,1);
 c.width=Math.round(img.naturalWidth*scale);c.height=Math.round(img.naturalHeight*scale);
 c.getContext('2d').drawImage(img,0,0,c.width,c.height);
 resolve(c);
 };
 img.onerror=reject;
 img.src=URL.createObjectURL(file);
 });
}

async function jpgFileToPdfBlob(file){
 const c=await imageFileToCanvas(file,1600);
 const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.88));
 const bytes=new Uint8Array(await blob.arrayBuffer());
 const pdf=jpgToPdfBytes(bytes,c.width,c.height);
 return new Blob([pdf],{type:'application/pdf'});
}

// Rotates a canvas clockwise by 90/180/270 degrees, swapping width/height
// for the two quarter-turns.
function rotateCanvas(canvas,degrees){
 const swap=degrees===90||degrees===270;
 const out=document.createElement('canvas');
 out.width=swap?canvas.height:canvas.width;
 out.height=swap?canvas.width:canvas.height;
 const ctx=out.getContext('2d');
 ctx.translate(out.width/2,out.height/2);
 ctx.rotate(degrees*Math.PI/180);
 ctx.drawImage(canvas,-canvas.width/2,-canvas.height/2);
 return out;
}

// Rotates every page of a PDF by the same angle — rasterized through
// pdfFileToCanvases (the same reader compressPdfBlob/pdfToJpgBlob already
// use) and rebuilt through imagesToPdfBytes (the same writer), so Rotate
// never pulls in a second PDF library just for this.
async function rotatePdfBlob(file,degrees){
 const canvases=await pdfFileToCanvases(file,1.5);
 const pages=[];
 for(const c of canvases){
 const rotated=rotateCanvas(c,degrees);
 const blob=await new Promise(r=>rotated.toBlob(r,'image/jpeg',0.88));
 pages.push({bytes:new Uint8Array(await blob.arrayBuffer()),w:rotated.width,h:rotated.height});
 }
 return new Blob([imagesToPdfBytes(pages)],{type:'application/pdf'});
}

// Merges PDFs and images, in selection order, into one PDF. Each PDF's own
// pages are rasterized the same way every PDF-reading tool here already
// does; each image becomes its own page. The output is always an
// image-per-page PDF (same honest trade-off compressPdfBlob already makes)
// — reliable and dependency-free, at the cost of the merged PDF's text not
// being selectable, which processMergeSlot surfaces to the user rather
// than leaving them to discover it.
async function mergeFilesToPdfBlob(files){
 const pages=[];
 for(const file of files){
 if(file.type==='application/pdf'){
 const canvases=await pdfFileToCanvases(file,1.5);
 for(const c of canvases){
 const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.88));
 pages.push({bytes:new Uint8Array(await blob.arrayBuffer()),w:c.width,h:c.height});
 }
 } else {
 const c=await imageFileToCanvas(file,1600);
 const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.88));
 pages.push({bytes:new Uint8Array(await blob.arrayBuffer()),w:c.width,h:c.height});
 }
 }
 return new Blob([imagesToPdfBytes(pages)],{type:'application/pdf'});
}

// Extracts pages [from,to] (1-indexed, inclusive) from an already-rasterized
// page set into their own PDF — the same slice-and-rebuild trick as every
// other tool here, just without any per-page transform.
async function splitPdfBlob(canvases,from,to){
 const pages=[];
 for(const c of canvases.slice(from-1,to)){
 const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.88));
 pages.push({bytes:new Uint8Array(await blob.arrayBuffer()),w:c.width,h:c.height});
 }
 return new Blob([imagesToPdfBytes(pages)],{type:'application/pdf'});
}

// Stamps semi-transparent diagonal text across every page — drawn on a copy
// of each source canvas so the original stays untouched if re-applied.
async function watermarkPdfBlob(file,text){
 const canvases=await pdfFileToCanvases(file,1.5);
 const pages=[];
 for(const src of canvases){
 const c=document.createElement('canvas');c.width=src.width;c.height=src.height;
 const ctx=c.getContext('2d');
 ctx.drawImage(src,0,0);
 ctx.save();
 ctx.globalAlpha=0.25;
 ctx.fillStyle='#666';
 ctx.font='bold '+Math.round(c.width/10)+'px Arial, sans-serif';
 ctx.textAlign='center';
 ctx.textBaseline='middle';
 ctx.translate(c.width/2,c.height/2);
 ctx.rotate(-Math.PI/6);
 ctx.fillText(text,0,0);
 ctx.restore();
 const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.88));
 pages.push({bytes:new Uint8Array(await blob.arrayBuffer()),w:c.width,h:c.height});
 }
 return new Blob([imagesToPdfBytes(pages)],{type:'application/pdf'});
}

// Opens a password-protected PDF with the given password (pdf.js decrypts
// it while rendering) and rebuilds it through the same reader/writer as
// every other PDF tool here — the output PDF carries no password.
async function unlockPdfBlob(file,password){
 const canvases=await pdfFileToCanvases(file,1.5,password);
 const pages=[];
 for(const c of canvases){
 const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.9));
 pages.push({bytes:new Uint8Array(await blob.arrayBuffer()),w:c.width,h:c.height});
 }
 return new Blob([imagesToPdfBytes(pages)],{type:'application/pdf'});
}

// Draws a signature image onto one page of an already-rasterized page set
// (pageIndex, default the first) at posFrac (a fraction of that page's own
// width/height, {x,y}, matching wherever the user clicked in the preview)
// sized to widthFrac of the page's width, aspect-locked to the signature
// image itself. The source canvas is copied first so slot.pageCanvases
// stays pristine if the user repositions and re-applies.
async function signPdfBlob(canvases,sigImg,pageIndex,posFrac,widthFrac){
 const pages=[];
 for(let i=0;i<canvases.length;i++){
 const src=canvases[i];
 let c=src;
 if(i===pageIndex){
 c=document.createElement('canvas');c.width=src.width;c.height=src.height;
 const ctx=c.getContext('2d');
 ctx.drawImage(src,0,0);
 const w=c.width*widthFrac;
 const h=w*(sigImg.naturalHeight/sigImg.naturalWidth);
 ctx.drawImage(sigImg,c.width*posFrac.x-w/2,c.height*posFrac.y-h/2,w,h);
 }
 const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.9));
 pages.push({bytes:new Uint8Array(await blob.arrayBuffer()),w:c.width,h:c.height});
 }
 return new Blob([imagesToPdfBytes(pages)],{type:'application/pdf'});
}

/* ===== applications data =====
   Loaded from data/applications.generated.js (see the <script> tag in
   this page's HTML, right before this file) — generated by the monitor
   backend's publish pipeline (monitor/bin/publish.js) from its database,
   which is the actual source of truth now. Do not hand-edit exam data
   here; use the admin dashboard (monitor/admin/) or let the monitoring
   pipeline detect a real change for you to approve, then re-publish. */

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
 // Shown first when present — the most relevant fact about an exam whose
 // result is already out is that it's out, ahead of its (now moot) old
 // deadline. Real data only: reads the same a.results object
 // declaredResultsList() does, never fabricated for exams without one.
 if(a.results) meta.push('<li><span class="cal-bullet-ic">🏆</span><span>'+a.results.stage+'</span></li>');
 if(d) meta.push('<li><span class="cal-bullet-ic">⏰</span><span>'+(a.status==='open'?T('card.lastDate'):T('card.closedOn'))+' '+d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+'</span></li>');
 if(dtl.eligibility&&dtl.eligibility.qualification) meta.push('<li><span class="cal-bullet-ic">🎓</span><span class="listing-clamp">'+dtl.eligibility.qualification+'</span></li>');
 if(a.vacancies) meta.push('<li><span class="cal-bullet-ic">👥</span><span>'+a.vacancies+' '+T('card.vacancies')+'</span></li>');
 const st=examState(a);
 return '<a class="cal-notice-card exam-listing-card" href="'+examPageUrl(a.code)+'">'+
 '<div class="cal-notice-card-head">'+
 '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
 '<span class="status-pill '+status+'">'+calStatusLabel(status)+'</span>'+
 '</div>'+
 '<div class="cal-notice-card-body">'+
 '<b class="cal-notice-card-name">'+tr(a,'name')+'</b>'+
 '<small class="cal-notice-card-cat">'+trCat(a.cat)+(st?' · '+trState(st):'')+'</small>'+
 '</div>'+
 (meta.length?'<ul class="cal-notice-bullets">'+meta.join('')+'</ul>':'')+
 '<span class="cal-notice-more">'+T('card.viewDetails')+' <span class="cal-notice-arrow" aria-hidden="true">→</span></span>'+
 '</a>';
}

// Browse Exams filter bar: a merged Live chip (Open + Closing Soon — same
// 7-day "closing" threshold as calItemStatus/the calendar page, so this
// page never disagrees with the calendar about what's closing soon; Closed
// exams are dropped from the filter bar entirely, not worth surfacing here)
// plus the same real category taxonomy the homepage's explore section
// filters by. Single-select, like that section's own filter bar.
function renderExamDirFilters(){
 const box=$('examDirFilters');
 if(!box) return;
 const cats=[...new Set(APPLICATIONS.map(a=>a.cat))].sort((c1,c2)=>{
 const m1=Math.min(...APPLICATIONS.filter(a=>a.cat===c1).map(a=>a.popularity));
 const m2=Math.min(...APPLICATIONS.filter(a=>a.cat===c2).map(a=>a.popularity));
 return m1-m2;
 });
 const active=box.dataset.active||'all';
 box.innerHTML='<button type="button" class="cal-filter-btn'+(active==='all'?' is-active':'')+'" data-filter="all">'+T('cal.filterAll')+'</button>'+
 '<button type="button" class="cal-filter-btn cal-filter-btn-live'+(active==='live'?' is-active':'')+'" data-filter="live"><span class="live-dot" aria-hidden="true"></span>'+T('cal.filterLive')+'</button>'+
 cats.map(c=>'<button type="button" class="cal-filter-btn'+(active===c?' is-active':'')+'" data-filter="'+c+'">'+trCat(c)+'</button>').join('');
 box.querySelectorAll('.cal-filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
 box.querySelectorAll('.cal-filter-btn').forEach(b=>b.classList.remove('is-active'));
 btn.classList.add('is-active');
 box.dataset.active=btn.dataset.filter;
 renderExamDirectory(btn.dataset.filter);
 }));
}

function renderExamDirectory(filterKey){
 const box=$('examDirectory');
 if(!box) return;
 const filter=filterKey||$('examDirFilters')?.dataset.active||'all';
 // Live is a flat, date-ordered list (soonest deadline first) rather than
 // the category-grouped/popularity-sorted view below — urgency, not
 // category or popularity, is the point of this filter.
 if(filter==='live'){
 const list=APPLICATIONS
.map(a=>({a,d:parseExamDate(a.applyEnd)}))
.filter(({a,d})=>calItemStatus({a,d})==='open'||calItemStatus({a,d})==='closing')
.sort((x,y)=>{
 if(!x.d&&!y.d) return 0;
 if(!x.d) return 1;
 if(!y.d) return -1;
 return x.d-y.d;
 })
.map(({a})=>a);
 box.innerHTML=list.length?'<div class="directory-grid">'+list.map(renderExamListingCard).join('')+'</div>':'<p class="notice-empty">'+T('home.noExamsInCat')+'</p>';
 return;
 }
 // State Exams is grouped by state rather than shown as one flat list —
 // it spans many different state recruitment bodies (PSCs, staff
 // selection boards, teacher recruitment, etc.), so state is the useful
 // grouping here, the same way category groups the "All" view below. A
 // second, state-level chip row (scoped to this category, not a
 // page-wide control) lets a visitor jump straight to their own state
 // instead of scanning every section.
 if(filter==='State PSC'){
 const list=APPLICATIONS.filter(a=>a.cat==='State PSC');
 const groups={};
 list.forEach(a=>{const st=examState(a)||'Other';(groups[st]=groups[st]||[]).push(a)});
 const states=Object.keys(groups).sort((s1,s2)=>{
 const m1=Math.min(...groups[s1].map(a=>a.popularity));
 const m2=Math.min(...groups[s2].map(a=>a.popularity));
 return m1-m2;
 });
 const activeState=box.dataset.activeState||'all';
 const shownStates=activeState==='all'?states:states.filter(st=>st===activeState);
 const chipsHtml='<div class="cal-filter-bar state-chip-row" id="stateSubFilters">'+
 '<button type="button" class="cal-filter-btn'+(activeState==='all'?' is-active':'')+'" data-state="all">'+T('exams.allStates')+'</button>'+
 states.map(st=>'<button type="button" class="cal-filter-btn'+(activeState===st?' is-active':'')+'" data-state="'+st+'">'+trState(st)+'</button>').join('')+
 '</div>';
 const sectionsHtml=shownStates.length?shownStates.map(st=>{
 const exams=groups[st].slice().sort((a,b)=>a.popularity-b.popularity);
 return '<div class="directory-section">'+
 '<div class="directory-cat-label">'+trState(st)+'</div>'+
 '<div class="directory-grid">'+
 exams.map(renderExamListingCard).join('')+
 '</div>'+
 '</div>';
 }).join(''):'<p class="notice-empty">'+T('home.noExamsInCat')+'</p>';
 box.innerHTML=states.length?chipsHtml+sectionsHtml:sectionsHtml;
 box.querySelectorAll('#stateSubFilters .cal-filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
 box.dataset.activeState=btn.dataset.state;
 renderExamDirectory('State PSC');
 }));
 return;
 }
 let list=[...APPLICATIONS];
 if(filter!=='all') list=list.filter(a=>a.cat===filter);
 const groups={};
 list.forEach(a=>{(groups[a.cat]=groups[a.cat]||[]).push(a)});
 const cats=Object.keys(groups).sort((catA,catB)=>{
 const minA=Math.min(...groups[catA].map(a=>a.popularity));
 const minB=Math.min(...groups[catB].map(a=>a.popularity));
 return minA-minB;
 });
 box.innerHTML=cats.length?cats.map(cat=>{
 const exams=groups[cat].slice().sort((a,b)=>a.popularity-b.popularity);
 return '<div class="directory-section">'+
 '<div class="directory-cat-label">'+trCat(cat)+'</div>'+
 '<div class="directory-grid">'+
 exams.map(renderExamListingCard).join('')+
 '</div>'+
 '</div>';
 }).join(''):'<p class="notice-empty">'+T('home.noExamsInCat')+'</p>';
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
 const hasResult=!!(a.results&&a.results.stage);
 if(hasResult) bullets.push('<li><span class="cal-bullet-ic">🏆</span><span>'+a.results.stage+(a.results.date?' — '+a.results.date:'')+'</span></li>');
 const hasAdmitCard=!!a.admitCardDate;
 if(hasAdmitCard) bullets.push('<li><span class="cal-bullet-ic">🎫</span><span>'+T('detail.admitCard')+': '+a.admitCardDate+'</span></li>');
 return '<div class="cal-notice-card cal-notice-card-'+status+'" data-status="'+status+'" data-cat="'+a.cat+'" data-has-result="'+(hasResult?1:0)+'" data-has-admitcard="'+(hasAdmitCard?1:0)+'">'+
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
 '<a class="cal-notice-more" href="'+examPageUrl(a.code)+'">'+T('card.knowMore')+' <span class="cal-notice-arrow" aria-hidden="true">→</span></a>'+
 '</div>';
}

// Several independent things share one filter value, same convention as the
// homepage/exams-directory filter bars: 'all' shows everything, 'live'
// matches status (open/closing), 'results'/'admitcard' match the card's own
// has-result/has-admitcard flag (set in renderNoticeCard from real a.results/
// a.admitCardDate data — never guessed), anything else is a category name
// matched against data-cat. A raw status word ('open'/'closing'/'closed'/
// 'tentative') is also still accepted for callers that pass one directly.
function applyCalendarFilter(filterKey){
 const box=$('examCalendar');
 if(!box) return;
 const isStatus=['open','closing','closed','tentative'].includes(filterKey);
 box.querySelectorAll('.cal-notice-card').forEach(card=>{
 const status=card.dataset.status;
 const match=filterKey==='all'
 ||(filterKey==='live'?(status==='open'||status==='closing'):
 filterKey==='results'?card.dataset.hasResult==='1':
 filterKey==='admitcard'?card.dataset.hasAdmitcard==='1':
 isStatus?status===filterKey:card.dataset.cat===filterKey);
 card.style.display=match?'':'none';
 });
 box.querySelectorAll('.cal-year-month-col').forEach(col=>{
 const anyVisible=[...col.querySelectorAll('.cal-notice-card')].some(c=>c.style.display!=='none');
 col.style.display=anyVisible?'':'none';
 });
 // A year-nav link (e.g. "2025") whose year has zero visible cards under
 // the current filter is a dead button — it jumps to a now-hidden section
 // and does nothing, which reads as broken rather than just empty. Hide the
 // link itself alongside its section rather than leaving it clickable.
 const yearNav=$('calYearNav');
 box.querySelectorAll('.cal-year-block').forEach(yb=>{
 const anyVisible=[...yb.querySelectorAll('.cal-notice-card')].some(c=>c.style.display!=='none');
 yb.style.display=anyVisible?'':'none';
 if(yearNav){
 const link=yearNav.querySelector('a[href="#'+yb.id+'"]');
 if(link) link.style.display=anyVisible?'':'none';
 }
 });
}

// Same All/Live/category chip-bar pattern as renderExamDirFilters() —
// defaults to 'live' rather than 'all', so a first-time visitor lands on
// what they can actually act on right now instead of scrolling past up to
// 10 months of already-closed cycles before reaching anything current.
// Must be called after renderExamCalendar() (it applies the filter against
// cards that function just created), and re-applies the persisted active
// filter itself so a full re-render (e.g. a language switch) doesn't quietly
// reset the view back to showing everything.
function renderCalFilters(){
 const box=$('calFilterBar');
 if(!box) return;
 const cats=[...new Set(APPLICATIONS.map(a=>a.cat))].sort((c1,c2)=>{
 const m1=Math.min(...APPLICATIONS.filter(a=>a.cat===c1).map(a=>a.popularity));
 const m2=Math.min(...APPLICATIONS.filter(a=>a.cat===c2).map(a=>a.popularity));
 return m1-m2;
 });
 const requestedActive=box.dataset.active||'live';
 // "Results" and "Admit Card" are extra status-style views alongside
 // Live, but — unlike Live/category, which always have something to show
 // — each only appears once at least one exam actually has that data.
 // GovBabu never fabricates a result or admit-card date, so most exams
 // simply don't have one yet; showing the filter anyway would just be a
 // button that always lands on an empty calendar — the exact "not working
 // button" complaint that got the year-nav fix, so avoid the same mistake
 // here. Each check runs fresh on every render, so a filter appears the
 // moment real data for it shows up — no code change needed later.
 const hasResults=APPLICATIONS.some(a=>a.results&&a.results.stage);
 const hasAdmitCard=APPLICATIONS.some(a=>a.admitCardDate);
 // If the previously-active filter is one of these and its data has since
 // disappeared, fall back to 'live' rather than leaving the UI with no
 // button highlighted and a filter key nothing can match.
 const requestedStillValid=requestedActive==='all'||requestedActive==='live'||cats.includes(requestedActive)
 ||(requestedActive==='results'&&hasResults)||(requestedActive==='admitcard'&&hasAdmitCard);
 const active=requestedStillValid?requestedActive:'live';
 box.dataset.active=active;
 box.innerHTML='<button type="button" class="cal-filter-btn'+(active==='all'?' is-active':'')+'" data-filter="all">'+T('cal.filterAll')+'</button>'+
 '<button type="button" class="cal-filter-btn cal-filter-btn-live'+(active==='live'?' is-active':'')+'" data-filter="live"><span class="live-dot" aria-hidden="true"></span>'+T('cal.filterLive')+'</button>'+
 (hasResults?'<button type="button" class="cal-filter-btn'+(active==='results'?' is-active':'')+'" data-filter="results">🏆 '+T('cal.filterResults')+'</button>':'')+
 (hasAdmitCard?'<button type="button" class="cal-filter-btn'+(active==='admitcard'?' is-active':'')+'" data-filter="admitcard">🎫 '+T('cal.filterAdmitCard')+'</button>':'')+
 cats.map(c=>'<button type="button" class="cal-filter-btn'+(active===c?' is-active':'')+'" data-filter="'+c+'">'+trCat(c)+'</button>').join('');
 box.querySelectorAll('.cal-filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
 box.querySelectorAll('.cal-filter-btn').forEach(b=>b.classList.remove('is-active'));
 btn.classList.add('is-active');
 box.dataset.active=btn.dataset.filter;
 applyCalendarFilter(btn.dataset.filter);
 }));
 applyCalendarFilter(active);
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
// ticker and the homepage's "Live" filter, so they always agree with each
// other and with the calendar.
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

// Every exam with a declared result, most-popular first — mirrors
// urgentExamsList()'s role but for Result-Declared ticker items. Real data
// only: reads the same a.results object set by hand on the few exams with a
// confirmed result. No announcement-timestamp field exists yet, so results
// are shown as declared, never claimed to be "just announced".
function declaredResultsList(){
 return [...APPLICATIONS].filter(a=>a.results).sort((a,b)=>a.popularity-b.popularity);
}

// The homepage's merged "Live" filter (was two separate chips: Trending +
// Closing Soon) — open exams first, soonest deadline first, since urgency
// is what actually makes an open exam worth surfacing; then exams with a
// declared result. Admit-card and exam-date items are deliberately left
// out, same as the ticker: no real dated field for either exists anywhere
// in APPLICATIONS today (see renderNoticeTicker's own note on this), so
// none are invented here either — this list grows to include them the
// same day a real field does.
function liveExamsList(){
 const open=urgentExamsList().map(({a})=>a);
 const seen=new Set(open.map(a=>a.code));
 const results=declaredResultsList().filter(a=>!seen.has(a.code));
 return [...open,...results];
}

/* ---- Notice ticker (index.html, header area) ----
 One compact scrolling strip mixing real lifecycle events — each item
 carries its own small emoji+text badge, so the type is clear without
 relying on color alone. Classification reuses the exact same real dates
 urgentExamsList()/declaredResultsList() already expose:
 - daysLeft(applyEnd) 0–10 -> Deadline Soon
 - else applyStart within the last 10 days -> Form Opened
 - otherwise the exam is mid-window, not urgent news, and is simply
 left out of the strip (keeps it compact — not every open exam
 needs to appear here)
 Admit Card has no backing data field anywhere in APPLICATIONS today, so
 no Admit Card items are ever generated — never invented; wire one in
 here the moment a real admitCard field/timestamp exists (badge styling
 already defined, see.type-admit in styles.css). The whole ticker hides
 itself only if there's nothing to show at all. */
function renderNoticeTicker(){
 const box=$('noticeTicker');
 if(!box) return;
 const RECENCY_DAYS=10;
 const today=new Date();today.setHours(0,0,0,0);

 const items=[];
 urgentExamsList().forEach(({a,d})=>{
 const dl=d?daysLeft(d):null;
 if(dl!=null&&dl>=0&&dl<=RECENCY_DAYS){
 items.push({a,cls:'type-deadline',badgeKey:'home.badgeDeadlineSoon',label:closesPhraseShort(dl)});
 return;
 }
 const startD=parseExamDate(a.applyStart);
 const openedDaysAgo=startD?Math.round((today-startD)/86400000):null;
 if(openedDaysAgo!=null&&openedDaysAgo>=0&&openedDaysAgo<=RECENCY_DAYS){
 items.push({a,cls:'type-form',badgeKey:'home.badgeFormOpened',label:T('detail.applicationsOpen').toLowerCase()});
 return;
 }
 // Every other currently-open exam still belongs in the ticker — it's
 // real, live data (status==='open'), just not "recent" news. Previously
 // left out entirely; a visitor shouldn't have to guess an exam is open
 // just because it opened more than 10 days ago.
 items.push({a,cls:'type-form',badgeKey:'home.showcaseStatusOpen',
 label:d?(T('overview.lastDate')+': '+d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})):T('detail.applicationsOpen').toLowerCase()});
 });
 declaredResultsList().forEach(a=>{
 items.push({a,cls:'type-result',badgeKey:'home.badgeResultDeclared',label:a.results.stage});
 });

 if(!items.length){box.style.display='none';return}
 box.style.display='';
 const html=items.map(({a,cls,badgeKey,label})=>
 '<a class="notice-ticker-item" href="'+examPageUrl(a.code)+'">'+
 '<span class="notice-type-badge '+cls+'">'+T(badgeKey)+'</span>'+tr(a,'name')+' — '+label+
 '</a>'
 ).join('');
 // Duplicated once so the scroll loop has no visible seam.
 box.innerHTML='<div class="notice-ticker-track">'+html+html+'</div>';
}

// Real-data showcase of what "Analyze an Exam" means — the homepage's
// flagship proof that GovBabu is more than a notification list. Reads
// live from APPLICATIONS/details rather than hardcoding any number, so it
// can never drift out of sync with the data file, and it's the single
// place this "example exam" concept lives (no second source of truth).
// Prefers SBI Clerk (a clean, simple entry) but only while it's actually
// open — a showcase must never present a closed exam's deadline as
// something to act on. Falls back to any other open exam, or a plain empty
// state if nothing is open, rather than showing stale/expired info. Only
// shows fields with real structured data (vacancies/eligibility/pay are
// missing on some exams) — never a fabricated "competition level" or
// single salary figure.
/* ---- Step 1: exam search ---- */
// Homepage "Popular / Relevant Exams" section — real category filter chips
// (the actual taxonomy used across APPLICATIONS, not an invented one) plus
// the same listing-card component exams.html uses (name, vacancies,
// eligibility, date/status, CTA), so this section is a real preview of the
// exam directory rather than a second, thinner UI for the same data.
function renderExamCatFilters(){
 const box=$('examCatFilters');
 if(!box) return;
 const cats=[...new Set(APPLICATIONS.map(a=>a.cat))].sort((c1,c2)=>{
 const m1=Math.min(...APPLICATIONS.filter(a=>a.cat===c1).map(a=>a.popularity));
 const m2=Math.min(...APPLICATIONS.filter(a=>a.cat===c2).map(a=>a.popularity));
 return m1-m2;
 });
 const active=box.dataset.active||'live';
 box.innerHTML='<button type="button" class="cal-filter-btn'+(active==='all'?' is-active':'')+'" data-cat="all">'+T('cal.filterAll')+'</button>'+
 '<button type="button" class="cal-filter-btn cal-filter-btn-live'+(active==='live'?' is-active':'')+'" data-cat="live"><span class="live-dot" aria-hidden="true"></span>'+T('cal.filterLive')+'</button>'+
 cats.map(c=>'<button type="button" class="cal-filter-btn'+(active===c?' is-active':'')+'" data-cat="'+c+'">'+trCat(c)+'</button>').join('');
 box.querySelectorAll('.cal-filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
 box.querySelectorAll('.cal-filter-btn').forEach(b=>b.classList.remove('is-active'));
 btn.classList.add('is-active');
 box.dataset.active=btn.dataset.cat;
 renderExamCardGrid(btn.dataset.cat);
 }));
}

// Capped at 8 (popularity-sorted) — a homepage preview, not the full
// directory; "View all exams" below covers the rest via exams.html.
function renderExamCardGrid(filterCat){
 const box=$('examCardGrid');
 if(!box) return;
 const cat=filterCat||$('examCatFilters')?.dataset.active||'live';
 // "live" = liveExamsList()'s own order (open, soonest-closing first,
 // then declared results) — replaces the old separate Trending/Closing
 // Soon chips, and is never re-sorted by popularity like the other
 // filters below, since recency/urgency is the whole point here.
 let list=cat==='live'?liveExamsList():[...APPLICATIONS].sort((a,b)=>a.popularity-b.popularity);
 if(cat!=='all'&&cat!=='live') list=list.filter(a=>a.cat===cat);
 const shown=list.slice(0,8);
 box.innerHTML=shown.length?shown.map(renderExamListingCard).join(''):'<p class="notice-empty">'+T('home.noExamsInCat')+'</p>';
}

function renderExamResults(query){
 const box=$('examResults');
 const q=(query||'').trim().toLowerCase();
 const popularBox=$('popularExams');
 const categoryBox=$('examByCategory');
 if(popularBox) popularBox.style.display=q?'none':'block';
 if(categoryBox) categoryBox.style.display=q?'none':'block';
 if(!q){box.innerHTML='';box.classList.remove('open');return}
 const matches=APPLICATIONS.filter(a=>{
 const st=examState(a);
 return tr(a,'name').toLowerCase().includes(q)||a.code.toLowerCase().includes(q)||a.cat.toLowerCase().includes(q)
 ||(st&&trState(st).toLowerCase().includes(q));
 }).sort((a,b)=>a.popularity-b.popularity).slice(0,8);
 box.classList.add('open');
 if(!matches.length){
 box.innerHTML='<div class="exam-empty">'+T('search.noMatch')+' <button type="button" class="link-btn" onclick="skipExam()">'+T('search.skipInstead')+'</button>.</div>';
 return;
 }
 box.innerHTML=matches.map(a=>{
 const st=examState(a);
 return '<a class="exam-result-row" href="'+examPageUrl(a.code)+'">'+
 '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
 '<span class="exam-result-text"><b>'+tr(a,'name')+'</b><small>'+trCat(a.cat)+(st?' · '+trState(st):'')+'</small></span>'+
 '<span class="status-pill '+(a.status==='open'?'open':'closed')+'">'+calStatusLabel(a.status==='open'?'open':'closed')+'</span>'+
 '</a>';
 }).join('');
}

// Same matching logic as renderExamResults() (name/code/category/state
// substring match, popularity-sorted, capped at 8), but for the header's
// search dropdown — independent of the homepage hero search, so typing here
// never touches #popularExams/#examByCategory visibility the way the hero
// search does.
function renderHeaderSearchResults(query){
 const box=$('headerSearchResults');
 if(!box) return;
 const q=(query||'').trim().toLowerCase();
 if(!q){box.innerHTML='';box.classList.remove('open');return}
 const matches=APPLICATIONS.filter(a=>{
 const st=examState(a);
 return tr(a,'name').toLowerCase().includes(q)||a.code.toLowerCase().includes(q)||a.cat.toLowerCase().includes(q)
 ||(st&&trState(st).toLowerCase().includes(q));
 }).sort((a,b)=>a.popularity-b.popularity).slice(0,8);
 box.classList.add('open');
 if(!matches.length){
 box.innerHTML='<div class="exam-empty">'+T('search.noMatch')+'</div>';
 return;
 }
 box.innerHTML=matches.map(a=>{
 const st=examState(a);
 return '<a class="exam-result-row" href="'+examPageUrl(a.code)+'">'+
 '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
 '<span class="exam-result-text"><b>'+tr(a,'name')+'</b><small>'+trCat(a.cat)+(st?' · '+trState(st):'')+'</small></span>'+
 '<span class="status-pill '+(a.status==='open'?'open':'closed')+'">'+calStatusLabel(a.status==='open'?'open':'closed')+'</span>'+
 '</a>';
 }).join('');
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

// kind lets the homepage's Photo/Signature tool cards preset a sensible
// starting label — still the same spec-less generic resize tool underneath,
// just not always labeled "photo" when someone came in via "Signature
// Resizer". No exam-specific spec exists here either way.
const SKIP_EXAM_PRESETS={photo:{label:'Your photo',targetKb:50},signature:{label:'Your signature',targetKb:20}};
function skipExam(kind){
 const preset=SKIP_EXAM_PRESETS[kind]||SKIP_EXAM_PRESETS.photo;
 state.exam=null;
 state.examCode='generic';
 state.slots={generic:{label:preset.label,kind:'generic',spec:null,file:null,result:null,targetKb:preset.targetKb}};
 enterUploadStep();
}

// tools.html only: adds a generic (spec-less) photo or signature slot,
// same shape skipExam() builds for index.html's spec-less flow — reused
// here so Photo/Signature Resizer render identically on both pages.
function addGenericSlot(kind){
 if(state.slots[kind]) return;
 const preset=SKIP_EXAM_PRESETS[kind]||SKIP_EXAM_PRESETS.photo;
 state.slots[kind]={label:null,kind,spec:null,file:null,result:null,targetKb:preset.targetKb};
}

// tools.html's tool-box entry point. Unlike index.html's exam flow (where
// several documents genuinely get prepared side by side), tools.html is a
// pick-one-thing-at-a-time page — switching tools replaces the workspace
// instead of piling another upload box on top of whatever was open before.
function openToolsPageTool(kind){
 state.slots={};
 if(kind==='photo'||kind==='signature') addGenericSlot(kind);
 else addToolSlot(kind);
 renderUploadSlots();
 renderPayBar();
 // Scroll to the freshly-populated upload area itself, not the whole
 // #toolsWorkspace section — that section starts at the tool grid, which is
 // exactly where the visitor already is, so scrolling to it did nothing
 // visible and the newly-rendered upload box stayed off-screen below.
 const target=$('uploadSlots');
 if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
}

function enterUploadStep(){
 // The whole workspace is hidden by default on index.html (see the markup
 // comment) — this is the one place that reveals it, right when there's
 // real content to show.
 const workspace=$('prepareDocs');
 if(workspace) workspace.style.display='';
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
 // Open exams lead with a primary "Apply Now" action (plus a same-page
 // jump to Eligibility, the next thing a candidate actually needs);
 // closed exams keep the lower-emphasis "Official Notice" link, since
 // there's nothing left to apply for.
 const applyBtn=a.officialUrl?
 (a.status==='open'
 ?'<a class="btn btn-primary btn-sm" href="'+a.officialUrl+'" target="_blank" rel="noopener">'+T('detail.applyNow')+'</a>'
 :'<a class="btn btn-outline btn-sm" href="'+a.officialUrl+'" target="_blank" rel="noopener">'+T('detail.officialNotice')+'</a>')
 :'';
 const eligBtn=a.status==='open'?'<a class="btn btn-outline btn-sm" href="#sec-eligibility">'+T('detail.checkEligibility')+'</a>':'';
 bar.innerHTML=
 '<span class="exam-badge-sm '+(CAT_CLASS[a.cat]||'')+'">'+a.code.slice(0,2)+'</span>'+
 '<span class="exam-result-text"><b>'+tr(a,'name')+'</b><small>'+trCat(a.cat)+'</small>'+deadline+'</span>'+
 '<span class="status-pill '+status+'">'+calStatusLabel(status)+'</span>'+
 applyBtn+eligBtn;
}

// Full picture for the selected exam — posts & pay, promotion, eligibility,
// how to apply — pulled straight from the official notification where we've
// compiled it. Where we haven't compiled it yet, say so plainly rather than
// showing nothing or guessing.
// Age/qualification fields are either a plain string or an array of short
// bullet points (exams with more than one age band, e.g. per-post or
// per-category) — render whichever shape the data uses.
// Splits compiled research prose into one line per sentence (on ". "/"; "
// before a capital letter, digit or ₹ — never touching abbreviations like
// "SC/ST" that have no following period) so a run-on paragraph reads as
// separate lines on a phone instead of one dense block of tiny text.
function sentenceBreak(text){
 if(!text) return text;
 return text.split(/(?<=[.;])\s+(?=[A-Z0-9₹])/).map(s=>'<span class="sentence-break">'+s+'</span>').join('');
}

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

// ---- Exam analysis page: one data-driven section builder per topic ----
// Every helper below takes the exam (a) and/or its merged details (d) and
// returns either a {navLabel, html} pair or '' when the exam has nothing
// for that topic — never a fabricated placeholder. renderExamDetailPanel
// assembles only the sections that actually produced content, so the
// quick-nav never contains a dead link and the page never shows an empty
// section for exam-to-exam variation (a post-heavy exam vs. a single-post
// one, an exam with a confirmed promotion path vs. one with none, etc).

function renderVacanciesSection(a,d){
 if(!a.vacancies&&!d.payGroups&&!(a.posts&&a.posts.length)) return '';
 let body='';
 if(a.vacancies) body+='<span class="vacancy-total-label">'+T('detail.totalVacancies')+'</span><span class="vacancy-total-value">'+a.vacancies+'</span>';
 if(a.posts&&a.posts.length){
 const hPost=T('detail.post'),hQual=T('detail.qualification'),hPay=T('detail.payLevel'),hVac=T('overview.vacancies');
 body+='<div class="table-scroll"><table class="data-table"><thead><tr><th>'+hPost+'</th><th>'+hQual+'</th><th>'+hPay+'</th><th>'+hVac+'</th></tr></thead><tbody>'+
 a.posts.map(p=>'<tr><td data-label="'+hPost+'">'+p.postName+'</td><td data-label="'+hQual+'">'+(p.qualification||'—')+'</td><td data-label="'+hPay+'">'+([p.payLevel,p.payBand].filter(Boolean).join(' · ')||'—')+'</td><td data-label="'+hVac+'">'+(p.vacancies!=null?p.vacancies:(p.vacanciesDisplay||'—'))+'</td></tr>').join('')+
 '</tbody></table></div>';
 }else if(d.payGroups){
 const hLevel=T('detail.payLevel'),hBand=T('detail.payBand'),hPosts=T('detail.posts');
 body+='<div class="table-scroll"><table class="data-table"><thead><tr><th>'+hLevel+'</th><th>'+hBand+'</th><th>'+hPosts+'</th></tr></thead><tbody>'+
 d.payGroups.map(g=>'<tr><td data-label="'+hLevel+'">'+g.level+'</td><td data-label="'+hBand+'">'+g.band+'</td><td data-label="'+hPosts+'">'+g.posts+'</td></tr>').join('')+
 '</tbody></table></div>';
 if(d.payNote) body+='<p class="detail-footnote">'+sentenceBreak(d.payNote)+'</p>';
 }
 return {navLabel:T('nav.sec.vacancies'),html:'<section id="sec-vacancies" class="exam-section"><h2>'+T('detail.vacanciesHead')+'</h2>'+body+'</section>'};
}

function renderEligibilitySection(d,feeText){
 if(!d.eligibility) return '';
 const e=d.eligibility;
 const body=
 '<div class="detail-row"><b>'+T('detail.qualification')+'</b><span>'+(e.qualification?sentenceBreak(e.qualification):T('detail.notAvailable'))+'</span></div>'+
 '<div class="detail-row"><b>'+T('detail.age')+'</b>'+renderFieldValue(e.age||T('detail.notAvailable'))+'</div>'+
 (e.ageRelax?'<div class="detail-row"><b>'+T('detail.relaxation')+'</b><span>'+sentenceBreak(e.ageRelax)+'</span></div>':'')+
 (feeText?'<div class="detail-row"><b>'+T('detail.fee')+'</b><span>'+sentenceBreak(feeText)+'</span></div>':'');
 return {navLabel:T('nav.sec.eligibility'),html:'<section id="sec-eligibility" class="exam-section"><h2>'+T('detail.eligibility')+'</h2>'+body+'</section>'};
}

// Built entirely from fields that already exist for virtually every exam
// (photo/signature specs, application fee, any info-only otherDocs) —
// never a generic hardcoded checklist, per this page's "don't invent
// requirements" rule.
function renderBeforeApplySection(a,d,feeText){
 const items=[];
 if(a.photo) items.push(['📷 '+T('detail.photo'),specLine(a.photo)+(a.photo.notes?(specLine(a.photo)?' — ':'')+sentenceBreak(a.photo.notes):'')]);
 if(a.signature) items.push(['✍️ '+T('detail.signature'),specLine(a.signature)+(a.signature.notes?(specLine(a.signature)?' — ':'')+sentenceBreak(a.signature.notes):'')]);
 if(feeText) items.push(['💳 '+T('detail.fee'),sentenceBreak(feeText)]);
 (a.otherDocs||[]).forEach(o=>{
 items.push([o.label,o.spec?specLine(o.spec)+(o.spec.notes?(specLine(o.spec)?' — ':'')+sentenceBreak(o.spec.notes):''):sentenceBreak(o.notes)]);
 });
 if(!items.length) return '';
 const body='<ul class="doc-checklist">'+items.map(([label,val])=>'<li><span><b>'+label+'</b><span>'+val+'</span></span></li>').join('')+'</ul>'+
 '<p style="margin-top:14px"><a class="btn btn-primary btn-sm" href="#uploadSlots">'+T('detail.prepDocsCta')+'</a></p>';
 return {navLabel:T('nav.sec.before'),html:'<section id="sec-before" class="exam-section"><h2>'+T('detail.beforeApply')+'</h2>'+body+'</section>'};
}

function renderHowToApplySection(a,d){
 if(!d.howToApply) return '';
 let body='';
 if(a.officialUrl) body+='<a class="btn btn-primary btn-sm apply-cta" href="'+a.officialUrl+'" target="_blank" rel="noopener">'+T('detail.applyOnOfficial')+'</a>';
 if(d.beforeYouStart) body+='<div class="apply-subhead">'+T('detail.beforeYouStart')+'</div><ul class="apply-checklist">'+d.beforeYouStart.map(s=>'<li>'+s+'</li>').join('')+'</ul>';
 body+='<ol class="step-list">'+d.howToApply.map(s=>'<li>'+s+'</li>').join('')+'</ol>';
 if(d.commonMistakes) body+='<div class="apply-subhead apply-subhead-warn">'+T('detail.commonMistakes')+'</div><ul class="apply-checklist">'+d.commonMistakes.map(s=>'<li>'+s+'</li>').join('')+'</ul>';
 return {navLabel:T('nav.sec.apply'),html:'<section id="sec-apply" class="exam-section"><h2>'+T('detail.howToApply')+'</h2>'+body+'</section>'};
}

function renderAboutSection(a){
 const body=
 '<div class="detail-row"><b>'+T('detail.conductedBy')+'</b><span>'+(a.orgName||trCat(a.cat))+'</span></div>'+
 '<div class="detail-row"><b>'+T('overview.category')+'</b><span>'+trCat(a.cat)+'</span></div>'+
 (a.notifTitle?'<p class="section-lede">'+sentenceBreak(tr(a,'notifTitle'))+'</p>':'');
 return {navLabel:T('nav.sec.about'),html:'<section id="sec-about" class="exam-section"><h2>'+T('detail.aboutExam')+'</h2>'+body+'</section>'};
}

function renderCareerSection(d){
 if(!d.promotion) return '';
 return {navLabel:T('nav.sec.career'),html:'<section id="sec-career" class="exam-section"><h2>'+T('detail.promotion')+'</h2>'+renderPromotion(d.promotion)+'</section>'};
}

// The real per-exam "selection process" narrative already lives in
// examPattern.mode (e.g. "CBT-1, CBT-2, ... then Document Verification/
// Medical") — there's no separate structured stages list in the data, so
// this surfaces that same sentence as its own section instead of drawing
// an invented stage-by-stage pipeline graphic.
function renderSelectionSection(d){
 const mode=d.examPattern&&d.examPattern.mode;
 if(!mode) return '';
 return {navLabel:T('nav.sec.selection'),html:'<section id="sec-selection" class="exam-section"><h2>'+T('detail.selectionProcess')+'</h2><p class="section-lede">'+sentenceBreak(mode)+'</p></section>'};
}

function renderPatternSection(d){
 if(!d.examPattern) return '';
 const ep=d.examPattern;
 const chips=[ep.duration,ep.negativeMarking?T('detail.negativeMarking')+': '+ep.negativeMarking:'',ep.passingMarks?T('detail.passingMarks')+': '+ep.passingMarks:''].filter(Boolean);
 let body=chips.length?'<p class="section-lede">'+chips.join(' · ')+'</p>':'';
 if(ep.sections&&ep.sections.length){
 body+='<div class="table-scroll"><table class="data-table"><thead><tr><th>'+T('detail.section')+'</th><th>'+T('detail.details')+'</th></tr></thead><tbody>'+
 ep.sections.map(s=>'<tr><td data-label="'+T('detail.section')+'">'+s.name+'</td><td data-label="'+T('detail.details')+'">'+s.detail+'</td></tr>').join('')+
 '</tbody></table></div>';
 }
 if(ep.note) body+='<p class="detail-footnote">'+sentenceBreak(ep.note)+'</p>';
 if(!body) return '';
 return {navLabel:T('nav.sec.pattern'),html:'<section id="sec-pattern" class="exam-section"><h2>'+T('detail.examPattern')+'</h2>'+body+'</section>'};
}

function renderFaqSection(d){
 if(!d.faqs||!d.faqs.length) return '';
 const body=d.faqs.map(f=>'<details class="detail-note"><summary>'+f.q+'</summary><p>'+f.a+'</p></details>').join('');
 return {navLabel:T('nav.sec.faq'),html:'<section id="sec-faq" class="exam-section"><h2>'+T('detail.faq')+'</h2>'+body+'</section>'};
}

// Routes to the site's real Downloads/Syllabus destination (manjusha.html)
// rather than a syllabus route that doesn't exist yet — GovBabu's syllabus
// content isn't live per-exam, so this is the honest current destination.
function renderSyllabusSection(){
 const body='<p class="section-lede">'+T('detail.syllabusLede')+'</p><a class="btn btn-primary btn-sm" href="/manjusha.html">'+T('detail.viewSyllabus')+'</a>';
 return {navLabel:T('nav.sec.syllabus'),html:'<section id="sec-syllabus" class="exam-section"><h2>'+T('detail.syllabusHead')+'</h2>'+body+'</section>'};
}

function renderLinksSection(a){
 const links=[];
 if(a.officialUrl) links.push('<a class="btn btn-outline btn-sm" href="'+a.officialUrl+'" target="_blank" rel="noopener">'+T('detail.officialNotice')+'</a>');
 const related=APPLICATIONS.filter(e=>e.cat===a.cat&&e.code!==a.code).slice(0,5);
 const relatedHtml=related.length?
 '<div class="apply-subhead">'+T('detail.relatedExams')+'</div><ul class="apply-steps">'+related.map(e=>'<li><a href="'+examPageUrl(e.code)+'">'+tr(e,'name')+'</a></li>').join('')+'</ul>':'';
 return {navLabel:T('nav.sec.links'),html:'<section id="sec-links" class="exam-section"><h2>'+T('detail.importantLinks')+'</h2><div class="links-grid">'+links.join('')+'</div>'+relatedHtml+'</section>'};
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
 // applicationFee lives on the exam itself, not inside details, so it needs
 // its own Hindi-override check rather than riding along with the merge above.
 const feeText=(currentLang==='hi'&&a.hi&&a.hi.applicationFee)?a.hi.applicationFee:a.applicationFee;

 const hasCoreDetails=d.payGroups||(a.posts&&a.posts.length)||d.eligibility||d.promotion||d.howToApply;
 if(!hasCoreDetails){
 box.innerHTML='<div class="detail-missing">'+T('detail.missing')+'</div>';
 return;
 }

 // At-a-glance strip: everything a candidate wants in the first 30 seconds
 // (status/vacancies/dates/who's-conducting-it/qualification/age), all
 // short scalar values so each tile stays one line — the free-text detail
 // for age/qualification lives in the Eligibility section below.
 const overviewItems=[[T('overview.status'),T(a.status==='open'?'status.open':'status.closed')]];
 if(a.vacancies) overviewItems.push([T('overview.vacancies'),a.vacancies]);
 if(a.applyStart) overviewItems.push([T('detail.applyStart'),a.applyStart]);
 if(a.applyEnd) overviewItems.push([T(a.status==='open'?'overview.lastDate':'detail.applicationsClosed'),a.applyEnd]);
 overviewItems.push([T('detail.conductedBy'),a.orgName||trCat(a.cat)]);
 if(d.eligibility&&d.eligibility.qualification) overviewItems.push([T('detail.qualification'),d.eligibility.qualification]);
 if(d.eligibility&&d.eligibility.age) overviewItems.push([T('detail.age'),Array.isArray(d.eligibility.age)?d.eligibility.age.join(' · '):d.eligibility.age]);
 const quickOverview=
 '<div class="quick-overview">'+overviewItems.map(([label,value])=>
 '<div class="quick-overview-item"><span class="quick-overview-label">'+label+'</span><span class="quick-overview-value">'+value+'</span></div>'
 ).join('')+'</div>';
 const lastUpdated=a.verified?'<div class="detail-updated">'+T('detail.lastUpdatedPrefix')+' '+a.verified+'</div>':'';

 // Apply Start/End, Correction Window, Exam Date, Admit Card, Result and
 // Last Verified — each shown only when the exam actually has that field.
 // An open exam missing examDate says so explicitly ("Not announced yet")
 // rather than just omitting the row, since that's the one date an open
 // exam's candidates are actively waiting on.
 const dateRows=[];
 if(a.applyStart) dateRows.push([T('detail.applyStart'),a.applyStart]);
 if(a.applyEnd) dateRows.push([T(a.status==='open'?'overview.lastDate':'detail.applicationsClosed'),a.applyEnd]);
 if(d.correctionWindow) dateRows.push([T('detail.correctionWindow'),d.correctionWindow]);
 if(a.examDate) dateRows.push([T('detail.examDate'),a.examDate]);
 else if(a.status==='open') dateRows.push([T('detail.examDate'),T('detail.notAnnounced')]);
 if(a.admitCardDate) dateRows.push([T('detail.admitCard'),a.admitCardDate]);
 if(a.results&&a.results.stage) dateRows.push([T('detail.result'),a.results.stage+(a.results.date?' — '+a.results.date:'')]);
 if(a.verified) dateRows.push([T('detail.lastVerified'),a.verified]);
 // The two dates a candidate cares about most (apply start → last date)
 // get the prominent hero treatment; everything else is a plain row below.
 const heroDates=[];
 const secondaryRows=[...dateRows];
 if(a.applyStart){heroDates.push([T('detail.applyStart'),a.applyStart]);secondaryRows.shift()}
 if(a.applyEnd){heroDates.push([T(a.status==='open'?'overview.lastDate':'detail.applicationsClosed'),a.applyEnd]);if(secondaryRows.length&&secondaryRows[0][1]===a.applyEnd)secondaryRows.shift()}
 const datesHtml=heroDates.length?
 '<div class="dates-hero">'+heroDates.map(([label,value],i)=>
 (i>0?'<span class="dates-hero-arrow">→</span>':'')+'<div class="dates-hero-item"><span class="dates-hero-label">'+label+'</span><span class="dates-hero-value">'+value+'</span></div>'
 ).join('')+'</div>':'';
 const secondaryHtml=secondaryRows.length?
 '<div class="dates-table">'+secondaryRows.map(([label,value])=>'<div class="dates-row"><span class="dates-label">'+label+'</span><span class="dates-value">'+value+'</span></div>').join('')+'</div>':'';
 const datesSection=(datesHtml||secondaryHtml)?
 {navLabel:T('nav.sec.dates'),html:'<section id="sec-dates" class="exam-section"><h2>'+T('detail.datesHead')+'</h2>'+datesHtml+secondaryHtml+'</section>'}:'';

 const sections=[
 datesSection,
 renderVacanciesSection(a,d),
 renderEligibilitySection(d,feeText),
 renderBeforeApplySection(a,d,feeText),
 renderHowToApplySection(a,d),
 renderAboutSection(a),
 renderCareerSection(d),
 renderSelectionSection(d),
 renderPatternSection(d),
 renderFaqSection(d),
 renderSyllabusSection(),
 renderLinksSection(a),
 ].filter(Boolean);

 const quicknav='<nav class="exam-quicknav" aria-label="Section navigation">'+
 sections.map(s=>{const id=s.html.match(/id="([^"]+)"/)[1];return '<a href="#'+id+'">'+s.navLabel+'</a>'}).join('')+
 '</nav>';

 // Just the primary CTA — every fact and every other link here (status,
 // vacancies, dates, syllabus, official notice, prep-docs) is already
 // shown once, in its own section a scroll away; a second summary/"Quick
 // Links" list in the sidebar was pure duplication of the same page.
 const asideCard='<div class="aside-card">'+
 (a.officialUrl?'<a class="btn btn-primary btn-sm aside-cta" href="'+a.officialUrl+'" target="_blank" rel="noopener">'+(a.status==='open'?T('detail.applyNow'):T('detail.officialNotice'))+'</a>':'')+
 '</div>';

 box.innerHTML=
 (a.notifTitle?'<p class="exam-hero-desc">'+sentenceBreak(tr(a,'notifTitle'))+'</p>':'')+
 quickOverview+
 (d.dataNote?'<details class="detail-note"><summary>ⓘ '+T('detail.dataNoteToggle')+'</summary><p>'+sentenceBreak(d.dataNote)+'</p></details>':'')+
 quicknav+
 '<div class="exam-layout">'+
 '<div class="exam-main">'+sections.map(s=>s.html).join('')+'</div>'+
 '<aside class="exam-aside">'+asideCard+'</aside>'+
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
 if(TOOL_SLOT_KEYS[slot.kind]) return toolSlotLabel(slot.kind);
 return slot.label;
}

function renderUploadSlots(){
 const box=$('uploadSlots');
 if(!box) return;
 const keys=Object.keys(state.slots);
 // Grid, not one full-width box per document — each slot's actual content
 // is a single-line dropzone, so stacking them full-width just adds height
 // for no extra information. Two per row keeps a comfortable touch target.
 box.innerHTML='<div class="upload-slot-grid">'+keys.map(key=>{
 const slot=state.slots[key];
 return '<div class="upload-slot" id="slot-'+key+'">'+
 '<div class="slot-head"><b>'+slotDisplayLabel(slot)+'</b>'+(slot.spec?'<span class="slot-spec">'+specLine(slot.spec)+'</span>':'')+'</div>'+
 (slot.spec&&slot.spec.notes?'<div class="slot-note">'+slot.spec.notes+'</div>':'')+
 '<div class="slot-body" id="slot-body-'+key+'"></div>'+
 '</div>';
 }).join('')+'</div>'+
 renderMoreToolsToggle();
 keys.forEach(renderSlotBody);
}

const TOOL_SLOT_KEYS={
 pdf:'slot.toolOtherDoc',pdftojpg:'slot.toolPdfToJpg',pdfcompress:'slot.toolPdfCompress',
 pdfmerge:'slot.toolPdfMerge',pdfrotate:'slot.toolPdfRotate',pdfsign:'slot.toolPdfSign',
 pdfsplit:'slot.toolPdfSplit',pdfwatermark:'slot.toolPdfWatermark',pdfunlock:'slot.toolPdfUnlock'
};
function toolSlotLabel(kind){ return T(TOOL_SLOT_KEYS[kind]); }

// tools.html already lists every tool up front (see its own tool-grid),
// so this hint would just repeat itself there — only render it on pages
// (index.html's exam flow) where the rest of the toolset isn't visible.
function renderMoreToolsToggle(){
 if($('toolsWorkspace')) return '';
 const remaining=Object.keys(TOOL_SLOT_KEYS).filter(k=>!state.slots[k]);
 if(!remaining.length) return '';
 return '<div class="upload-slot upload-slot-pdf" id="more-tools-toggle">'+
 '<div class="slot-hint" style="margin-bottom:8px">'+T('slot.moreToolsHint')+'</div>'+
 '<a class="btn btn-outline btn-sm" href="tools.html">'+T('slot.moreToolsLink')+'</a>'+
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

 if(slot.kind==='pdfmerge'){
 const files=slot.files||[];
 body.innerHTML=
 (slot.error?'<div class="slot-error">⚠️ '+slot.error+'</div>':'')+
 '<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">'+T('slot.chooseMergeFiles')+
 '<input type="file" id="input-'+key+'" accept="application/pdf,image/jpeg,image/png,image/webp" multiple style="display:none"></div>'+
 (files.length?
 '<div class="merge-file-list">'+files.map((f,i)=>
 '<div class="merge-file-row"><span>'+(i+1)+'. '+f.name+'</span>'+
 '<button type="button" class="icon-btn merge-remove-btn" onclick="removeMergeFile(\''+key+'\','+i+')" aria-label="Remove">✕</button></div>'
 ).join('')+'</div>'+
 '<div class="slot-hint">'+T('slot.mergeOrderHint')+'</div>'
 :'')+
 '<button type="button" class="btn btn-primary btn-sm" '+(files.length<2?'disabled':'')+' onclick="processMergeSlot(\''+key+'\')">'+T('slot.mergeNow')+'</button>';
 document.getElementById('input-'+key).addEventListener('change',e=>{
 slot.error=null;
 slot.files=(slot.files||[]).concat([...e.target.files]);
 renderSlotBody(key);
 });
 return;
 }

 if(slot.kind==='pdfrotate'){
 const angle=slot.angle||90;
 body.innerHTML=
 (slot.error?'<div class="slot-error">⚠️ '+slot.error+'</div>':'')+
 '<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">'+(slot.file?slot.file.name:T('slot.choosePdf'))+
 '<input type="file" id="input-'+key+'" accept="application/pdf" style="display:none"></div>'+
 '<div class="rotate-angle-row">'+[90,180,270].map(a=>
 '<button type="button" class="btn btn-outline btn-sm'+(angle===a?' is-active':'')+'" onclick="setRotateAngle(\''+key+'\','+a+')">'+a+'°</button>'
 ).join('')+'</div>'+
 '<button type="button" class="btn btn-primary btn-sm" '+(slot.file?'':'disabled')+' onclick="processRotateSlot(\''+key+'\')">'+T('slot.rotateNow')+'</button>';
 document.getElementById('input-'+key).addEventListener('change',e=>{
 slot.error=null;
 if(e.target.files[0]) slot.file=e.target.files[0];
 renderSlotBody(key);
 });
 return;
 }

 if(slot.kind==='pdfsplit'){
 const errHtml=slot.error?'<div class="slot-error">⚠️ '+slot.error+'</div>':'';
 if(!slot.file){
 body.innerHTML=errHtml+
 '<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">'+T('slot.choosePdf')+
 '<input type="file" id="input-'+key+'" accept="application/pdf" style="display:none"></div>';
 document.getElementById('input-'+key).addEventListener('change',async e=>{
 const f=e.target.files[0];
 if(!f) return;
 const err=validatePdfFile(f);
 if(err){slot.error=err;renderSlotBody(key);return}
 slot.error=null;slot.file=f;slot.pageCanvases=null;
 renderSlotBody(key);
 try{
 slot.pageCanvases=await pdfFileToCanvases(f,1.5);
 slot.fromPage=1;slot.toPage=slot.pageCanvases.length;
 }catch{
 slot.error=T('err.corruptedPdfRead');slot.file=null;
 }
 renderSlotBody(key);
 });
 return;
 }
 if(!slot.pageCanvases){
 body.innerHTML=errHtml+'<div class="slot-processing">'+T('slot.loadingPreview')+'</div>';
 return;
 }
 const total=slot.pageCanvases.length;
 const pageCountNote=currentLang==='hi'?('इस PDF में कुल '+total+' पेज हैं।'):('This PDF has '+total+' page'+(total>1?'s':'')+'.');
 body.innerHTML=errHtml+
 '<div class="slot-hint">'+pageCountNote+'</div>'+
 '<div class="row"><label>'+T('slot.splitFromLabel')+'</label><input id="from-'+key+'" type="number" min="1" max="'+total+'" value="'+slot.fromPage+'"></div>'+
 '<div class="row"><label>'+T('slot.splitToLabel')+'</label><input id="to-'+key+'" type="number" min="1" max="'+total+'" value="'+slot.toPage+'"></div>'+
 '<button type="button" class="btn btn-primary btn-sm" onclick="processSplitSlot(\''+key+'\')">'+T('slot.splitNow')+'</button>';
 return;
 }

 if(slot.kind==='pdfwatermark'){
 body.innerHTML=
 (slot.error?'<div class="slot-error">⚠️ '+slot.error+'</div>':'')+
 '<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">'+(slot.file?slot.file.name:T('slot.choosePdf'))+
 '<input type="file" id="input-'+key+'" accept="application/pdf" style="display:none"></div>'+
 '<div class="row"><label>'+T('slot.watermarkTextLabel')+'</label><input id="wm-'+key+'" type="text" maxlength="40" placeholder="'+T('slot.watermarkPlaceholder')+'" value="'+(slot.text||'').replace(/"/g,'&quot;')+'"></div>'+
 '<button type="button" class="btn btn-primary btn-sm" '+(slot.file?'':'disabled')+' onclick="processWatermarkSlot(\''+key+'\')">'+T('slot.watermarkNow')+'</button>';
 document.getElementById('input-'+key).addEventListener('change',e=>{
 slot.error=null;
 if(e.target.files[0]) slot.file=e.target.files[0];
 renderSlotBody(key);
 });
 return;
 }

 if(slot.kind==='pdfunlock'){
 body.innerHTML=
 (slot.error?'<div class="slot-error">⚠️ '+slot.error+'</div>':'')+
 '<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">'+(slot.file?slot.file.name:T('slot.choosePdf'))+
 '<input type="file" id="input-'+key+'" accept="application/pdf" style="display:none"></div>'+
 '<div class="row"><label>'+T('slot.unlockPasswordLabel')+'</label><input id="pw-'+key+'" type="password" placeholder="'+T('slot.unlockPasswordPlaceholder')+'"></div>'+
 '<button type="button" class="btn btn-primary btn-sm" '+(slot.file?'':'disabled')+' onclick="processUnlockSlot(\''+key+'\')">'+T('slot.unlockNow')+'</button>';
 document.getElementById('input-'+key).addEventListener('change',e=>{
 slot.error=null;
 if(e.target.files[0]) slot.file=e.target.files[0];
 renderSlotBody(key);
 });
 return;
 }

 if(slot.kind==='pdfsign'){
 const errHtml=slot.error?'<div class="slot-error">⚠️ '+slot.error+'</div>':'';
 if(!slot.file){
 body.innerHTML=errHtml+
 '<div class="slot-dropzone" onclick="document.getElementById(\'input-'+key+'\').click()">'+T('slot.choosePdfToSign')+
 '<input type="file" id="input-'+key+'" accept="application/pdf" style="display:none"></div>';
 document.getElementById('input-'+key).addEventListener('change',async e=>{
 const f=e.target.files[0];
 if(!f) return;
 const err=validatePdfFile(f);
 if(err){slot.error=err;renderSlotBody(key);return}
 slot.error=null;slot.file=f;slot.pageCanvases=null;
 renderSlotBody(key);
 try{
 slot.pageCanvases=await pdfFileToCanvases(f,1.5);
 slot.posFrac=slot.posFrac||{x:0.5,y:0.85};
 slot.widthFrac=slot.widthFrac||0.28;
 }catch{
 slot.error=T('err.corruptedPdfRead');slot.file=null;
 }
 renderSlotBody(key);
 });
 return;
 }
 if(!slot.pageCanvases){
 body.innerHTML=errHtml+'<div class="slot-processing">'+T('slot.loadingPreview')+'</div>';
 return;
 }
 const pageImg=slot.pageCanvases[0].toDataURL('image/jpeg',0.85);
 const posFrac=slot.posFrac||{x:0.5,y:0.85};
 const widthFrac=slot.widthFrac||0.28;
 body.innerHTML=errHtml+
 '<div class="sign-preview-wrap">'+
 '<img class="sign-preview-page" id="sign-preview-'+key+'" src="'+pageImg+'">'+
 (slot.sigImg?'<img class="sign-preview-overlay" src="'+slot.sigImg.src+'" style="left:'+(posFrac.x*100)+'%;top:'+(posFrac.y*100)+'%;width:'+(widthFrac*100)+'%">':'')+
 '</div>'+
 (slot.pageCanvases.length>1?'<div class="slot-hint">'+T('slot.signOtherPagesHint')+'</div>':'')+
 (!slot.sigImg?
 '<div class="slot-dropzone" onclick="document.getElementById(\'sig-input-'+key+'\').click()">'+T('slot.chooseSignatureImage')+
 '<input type="file" id="sig-input-'+key+'" accept="image/jpeg,image/png,image/webp" style="display:none"></div>'
 :
 '<div class="slot-hint">'+T('slot.signClickHint')+'</div>'+
 '<div class="row"><label>'+T('slot.signSizeLabel')+'</label><input type="range" min="15" max="45" value="'+Math.round(widthFrac*100)+'" oninput="setSignWidth(\''+key+'\',this.value)"></div>'+
 '<button type="button" class="btn btn-primary btn-sm" onclick="processSignSlot(\''+key+'\')">'+T('slot.applySignature')+'</button> '+
 '<button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById(\'sig-input-'+key+'\').click()">'+T('slot.changeSignature')+'</button>'+
 '<input type="file" id="sig-input-'+key+'" accept="image/jpeg,image/png,image/webp" style="display:none">'
 );
 const previewEl=document.getElementById('sign-preview-'+key);
 if(previewEl) previewEl.addEventListener('click',e=>{
 const rect=previewEl.getBoundingClientRect();
 slot.posFrac={
 x:Math.min(Math.max((e.clientX-rect.left)/rect.width,0.02),0.98),
 y:Math.min(Math.max((e.clientY-rect.top)/rect.height,0.02),0.98)
 };
 renderSlotBody(key);
 });
 const sigInput=document.getElementById('sig-input-'+key);
 if(sigInput) sigInput.addEventListener('change',async e=>{
 const f=e.target.files[0];
 if(!f) return;
 const err=validateUploadFile(f);
 if(err){slot.error=err;renderSlotBody(key);return}
 slot.error=null;
 try{slot.sigImg=await loadImageFromFile(f);renderSlotBody(key)}
 catch{slot.error=T('err.corruptedImage');renderSlotBody(key)}
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

function removeMergeFile(key,index){
 const slot=state.slots[key];
 slot.files.splice(index,1);
 renderSlotBody(key);
}

async function processMergeSlot(key){
 const slot=state.slots[key];
 const files=slot.files||[];
 if(files.length<2){alert(T('alert.mergeNeedsTwo'));return}
 for(const f of files){
 const err=f.type==='application/pdf'?validatePdfFile(f):validateUploadFile(f);
 if(err){slot.error=err;renderSlotBody(key);return}
 }
 const body=$('slot-body-'+key);
 body.innerHTML='<div class="slot-processing">'+T('slot.merging')+'</div>';
 try{
 const blob=await mergeFilesToPdfBlob(files);
 const url=URL.createObjectURL(blob);
 slot.result={url,previewUrl:null,filename:'govbabu-merged.pdf',sizeKB:(blob.size/1024).toFixed(1),overTarget:false,note:T('slot.mergeRasterNote')};
 renderSlotBody(key);
 renderPayBar();
 }catch{
 slot.error=T('err.corruptedPdfProcess');
 renderSlotBody(key);
 }
}

function setRotateAngle(key,angle){
 state.slots[key].angle=angle;
 renderSlotBody(key);
}

async function processRotateSlot(key){
 const slot=state.slots[key];
 if(!slot.file){alert(T('alert.choosePdfFirst'));return}
 const err=validatePdfFile(slot.file);
 if(err){slot.error=err;renderSlotBody(key);return}
 const body=$('slot-body-'+key);
 body.innerHTML='<div class="slot-processing">'+T('slot.rotating')+'</div>';
 try{
 const blob=await rotatePdfBlob(slot.file,slot.angle||90);
 const url=URL.createObjectURL(blob);
 slot.result={url,previewUrl:null,filename:'govbabu-rotated.pdf',sizeKB:(blob.size/1024).toFixed(1),overTarget:false};
 renderSlotBody(key);
 renderPayBar();
 }catch{
 slot.error=T('err.corruptedPdfProcess');
 renderSlotBody(key);
 }
}

async function processSplitSlot(key){
 const slot=state.slots[key];
 const total=slot.pageCanvases.length;
 const fromEl=document.getElementById('from-'+key),toEl=document.getElementById('to-'+key);
 let from=Math.min(Math.max(parseInt(fromEl.value,10)||1,1),total);
 let to=Math.min(Math.max(parseInt(toEl.value,10)||total,1),total);
 if(to<from){const t=from;from=to;to=t}
 slot.fromPage=from;slot.toPage=to;
 const body=$('slot-body-'+key);
 body.innerHTML='<div class="slot-processing">'+T('slot.splitting')+'</div>';
 try{
 const blob=await splitPdfBlob(slot.pageCanvases,from,to);
 const url=URL.createObjectURL(blob);
 slot.result={url,previewUrl:null,filename:'govbabu-pages-'+from+'-'+to+'.pdf',sizeKB:(blob.size/1024).toFixed(1),overTarget:false};
 renderSlotBody(key);
 renderPayBar();
 }catch{
 slot.error=T('err.corruptedPdfProcess');
 renderSlotBody(key);
 }
}

async function processWatermarkSlot(key){
 const slot=state.slots[key];
 if(!slot.file){alert(T('alert.choosePdfFirst'));return}
 const err=validatePdfFile(slot.file);
 if(err){slot.error=err;renderSlotBody(key);return}
 const text=(document.getElementById('wm-'+key).value||'').trim();
 if(!text){slot.error=T('err.watermarkTextRequired');renderSlotBody(key);return}
 slot.text=text;slot.error=null;
 const body=$('slot-body-'+key);
 body.innerHTML='<div class="slot-processing">'+T('slot.watermarking')+'</div>';
 try{
 const blob=await watermarkPdfBlob(slot.file,text);
 const url=URL.createObjectURL(blob);
 slot.result={url,previewUrl:null,filename:'govbabu-watermarked.pdf',sizeKB:(blob.size/1024).toFixed(1),overTarget:false};
 renderSlotBody(key);
 renderPayBar();
 }catch{
 slot.error=T('err.corruptedPdfProcess');
 renderSlotBody(key);
 }
}

async function processUnlockSlot(key){
 const slot=state.slots[key];
 if(!slot.file){alert(T('alert.choosePdfFirst'));return}
 const err=validatePdfFile(slot.file);
 if(err){slot.error=err;renderSlotBody(key);return}
 const password=document.getElementById('pw-'+key).value||'';
 slot.error=null;
 const body=$('slot-body-'+key);
 body.innerHTML='<div class="slot-processing">'+T('slot.unlocking')+'</div>';
 try{
 const blob=await unlockPdfBlob(slot.file,password);
 const url=URL.createObjectURL(blob);
 slot.result={url,previewUrl:null,filename:'govbabu-unlocked.pdf',sizeKB:(blob.size/1024).toFixed(1),overTarget:false};
 renderSlotBody(key);
 renderPayBar();
 }catch(e){
 slot.error=(e&&e.name==='PasswordException')?T('err.wrongPassword'):T('err.corruptedPdfProcess');
 renderSlotBody(key);
 }
}

function setSignWidth(key,val){
 state.slots[key].widthFrac=Number(val)/100;
 renderSlotBody(key);
}

async function processSignSlot(key){
 const slot=state.slots[key];
 if(!slot.file||!slot.pageCanvases||!slot.sigImg){alert(T('alert.signNeedsBoth'));return}
 const body=$('slot-body-'+key);
 body.innerHTML='<div class="slot-processing">'+T('slot.signing')+'</div>';
 try{
 const blob=await signPdfBlob(slot.pageCanvases,slot.sigImg,0,slot.posFrac,slot.widthFrac);
 const url=URL.createObjectURL(blob);
 slot.result={url,previewUrl:null,filename:'govbabu-signed.pdf',sizeKB:(blob.size/1024).toFixed(1),overTarget:false};
 renderSlotBody(key);
 renderPayBar();
 }catch{
 slot.error=T('err.corruptedPdfProcess');
 renderSlotBody(key);
 }
}

/* ---- Eligibility checker (eligibility.html) ----
 Stateless, one-shot matching — no login, no saved profile. Age and
 qualification are the only two hard filters, because they're the only
 two fields with any real structure to lean on: eligibility.age and
 eligibility.qualification are hand-written prose (see the exam data
 itself), not a database column, so this is a best-effort parse of that
 prose, not a query. Every match says so, and anything the parser
 genuinely can't read goes in a separate "couldn't check" bucket rather
 than being silently dropped (wrongly excluded) or silently included
 (wrongly promised). State is the one exception — a.state is real,
 structured data (added alongside the exam entries themselves), so it's
 safe to hard-filter on directly. */

const QUALIFICATION_LEVELS=[
 {value:'1',labelKey:'elig.qual10th'},
 {value:'2',labelKey:'elig.qual12th'},
 {value:'3',labelKey:'elig.qualGraduate'},
 {value:'3',labelKey:'elig.qualBTech'},
 {value:'4',labelKey:'elig.qualPostgraduate'},
 {value:'4',labelKey:'elig.qualMTech'},
 {value:'5',labelKey:'elig.qualPhd'},
];

// Checked low-to-high; the LOWEST level actually mentioned in an exam's
// qualification text is treated as its entry point, since that text
// describes the minimum bar (some exams list a higher bar for specific
// posts only) — erring permissive here is the same direction parseAgeRange
// errs in, and both are corrected by the "always verify" note on every result.
const QUAL_KEYWORDS=[
 {level:1,re:/\b(10th|matriculation|class\s*10|sslc)\b/i},
 {level:2,re:/\b(12th|10\+2|senior secondary|intermediate|hsc|iti|diploma)\b/i},
 {level:3,re:/\b(graduat|bachelor|degree|b\.?a\.?\b|b\.?sc\.?\b|b\.?com\.?\b|b\.?tech\b|b\.?e\.?\b|bca\b)/i},
 {level:4,re:/\b(post.?graduat|master'?s|m\.?a\.?\b|m\.?sc\.?\b|mba|m\.?tech\b|m\.?e\.?\b)\b/i},
 {level:5,re:/\b(ph\.?d\.?|doctorate)\b/i},
];

// Optional "field of experience" a candidate can add on top of age/qualification.
// This is a soft signal, never a hard filter — same permissive philosophy as
// the age/qualification parsers above. It only affects ranking (moving a
// genuine text match to the top of the eligible list) and adds a badge; it
// never excludes an otherwise-eligible exam.
const EXPERIENCE_FIELDS=[
 {value:'banking',labelKey:'elig.expBanking',re:/bank(ing)?\b|financial institution|\bAIFI\b/i},
 {value:'teaching',labelKey:'elig.expTeaching',re:/teach|education|pedagog/i},
 {value:'engineering',labelKey:'elig.expEngineering',re:/engineer|technical/i},
 {value:'it',labelKey:'elig.expIT',re:/\bIT\b|information technology|software|computer science/i},
 {value:'law',labelKey:'elig.expLaw',re:/\blaw\b|legal/i},
 {value:'accounts',labelKey:'elig.expAccounts',re:/account|finance|chartered accountant|\bCA\b/i},
 {value:'govt',labelKey:'elig.expGovt',re:/government|public sector|\bPSU\b/i},
 {value:'defence',labelKey:'elig.expDefence',re:/defence|military|paramilitary|armed forces/i},
 {value:'other',labelKey:'elig.expOther',re:null},
];

function matchesExperience(a,expField){
 if(!expField) return false;
 const def=EXPERIENCE_FIELDS.find(f=>f.value===expField);
 if(!def||!def.re) return false;
 const q=a.details&&a.details.eligibility&&a.details.eligibility.qualification;
 if(!q) return false;
 const text=Array.isArray(q)?q.join(' '):q;
 return /experience/i.test(text)&&def.re.test(text);
}

function parseMinQualificationLevel(text){
 if(!text||typeof text!=='string') return null;
 let min=null;
 QUAL_KEYWORDS.forEach(({level,re})=>{ if(re.test(text)&&(min===null||level<min)) min=level; });
 return min;
}

// Pulls every "NN–NN years"-shaped span out of the text (it may be a
// string or an array of strings, e.g. CDS's per-academy breakdown) and
// returns the widest min/max across all of them found, rather than only
// the first clause — erring permissive, since a hard "you're not eligible"
// from a mis-parsed sub-clause would be a worse mistake than showing one
// exam too many for the candidate to rule out themselves.
function parseAgeRange(text){
 if(!text) return null;
 const items=Array.isArray(text)?text:[text];
 let min=null,max=null;
 const re=/(\d{1,2}(?:\.\d)?)\s*[–\-—]\s*(\d{1,2}(?:\.\d)?)\s*years?/gi;
 items.forEach(t=>{
 if(typeof t!=='string') return;
 let m;
 while((m=re.exec(t))){
 const a=parseFloat(m[1]),b=parseFloat(m[2]);
 if(min===null||a<min) min=a;
 if(max===null||b>max) max=b;
 }
 });
 return min===null?null:{min,max};
}

function checkEligibility({age,qualLevel,category,state,experienceField}){
 const eligible=[],borderline=[],uncertain=[];
 APPLICATIONS.forEach(a=>{
 if(state&&a.state&&a.state!==state) return; // structured — safe to hard-exclude
 const elig=a.details&&a.details.eligibility;
 if(!elig){uncertain.push({a,reason:T('elig.reasonNoData')});return}
 const ageRange=parseAgeRange(elig.age);
 const examQualLevel=parseMinQualificationLevel(elig.qualification);
 if(!ageRange||examQualLevel===null){uncertain.push({a,reason:T('elig.reasonUnparsed')});return}
 const qualOk=qualLevel>=examQualLevel;
 if(!qualOk) return; // qualification is a hard requirement, not relaxable by category
 const expMatch=matchesExperience(a,experienceField);
 if(age>=ageRange.min&&age<=ageRange.max){
 eligible.push({a,ageRange,expMatch});
 } else if(age>ageRange.max&&age<=ageRange.max+10&&category&&category!=='general'&&elig.ageRelax){
 // Over the general cutoff, but within a plausible relaxation window
 // and a reserved category was given — real relaxation text exists
 // for this exam, so surface it rather than silently excluding.
 borderline.push({a,ageRange,ageRelax:elig.ageRelax,expMatch});
 }
 });
 // Open-for-application exams are the ones a candidate can actually act on
 // right now, so they lead; a genuine work-experience text match is the
 // next-strongest personalization signal ("this exam wants exactly what
 // you bring"); popularity (lower = more applied-for, i.e. trending) is the
 // final tiebreaker within each group. Closed exams are never dropped —
 // just pushed after every open one, same "flag, don't hide" philosophy as
 // the rest of this engine.
 const byOpenThenExpThenPopularity=(x,y)=>
 ((x.a.status==='open')?0:1)-((y.a.status==='open')?0:1)
 ||(y.expMatch-x.expMatch)
 ||(x.a.popularity-y.a.popularity);
 eligible.sort(byOpenThenExpThenPopularity);borderline.sort(byOpenThenExpThenPopularity);
 uncertain.sort((x,y)=>((x.a.status==='open')?0:1)-((y.a.status==='open')?0:1)||(x.a.popularity-y.a.popularity));
 return {eligible,borderline,uncertain};
}

function eligResultCard({a,ageRange,ageRelax,expMatch},kind){
 const note=kind==='eligible'
 ?'<div class="elig-match-note elig-match-ok">✅ '+T('elig.matchAge').replace('{min}',ageRange.min).replace('{max}',ageRange.max)+'</div>'
 :'<div class="elig-match-note elig-match-borderline">⚠️ '+T('elig.matchBorderline').replace('{max}',ageRange.max)+(ageRelax?' — '+ageRelax:'')+'</div>';
 const expBadge=expMatch?'<div class="elig-match-note elig-match-exp">💼 '+T('elig.matchExperience')+'</div>':'';
 return '<div class="elig-result-group">'+note+expBadge+renderExamListingCard(a)+'</div>';
}

function eligUncertainCard({a,reason}){
 return '<div class="elig-result-group elig-result-uncertain"><div class="elig-match-note">❓ '+reason+'</div>'+renderExamListingCard(a)+'</div>';
}

// Replaces a native <select>'s own popup with a custom-styled trigger +
// dropdown, since the browser's native select-options popup renders at a
// size/style we can't control via CSS and comes out tiny and cramped on
// some browser+device combinations. The <select> itself stays in the DOM
// (opacity:0, not display:none — display:none would exempt it from
// `required` validation) so any existing code reading its .value or
// listening for its 'change' event keeps working completely unchanged;
// this only replaces what the user actually sees and clicks. Re-reads
// select.options fresh every time the menu opens, so it stays correct even
// when a caller repopulates the select's options later (e.g.
// renderEligibilityForm() setting innerHTML on eligQual/eligState).
function enhanceSelect(select){
 if(!select||select.dataset.enhanced) return;
 select.dataset.enhanced='1';
 select.tabIndex=-1;
 const wrap=document.createElement('div');
 wrap.className='custom-select';
 select.parentNode.insertBefore(wrap,select);
 wrap.appendChild(select);
 const trigger=document.createElement('button');
 trigger.type='button';
 trigger.className='custom-select-trigger';
 trigger.setAttribute('aria-haspopup','listbox');
 trigger.setAttribute('aria-expanded','false');
 const valueSpan=document.createElement('span');
 valueSpan.className='custom-select-value';
 trigger.appendChild(valueSpan);
 wrap.appendChild(trigger);
 const menu=document.createElement('div');
 menu.className='custom-select-menu';
 menu.setAttribute('role','listbox');
 wrap.appendChild(menu);

 function syncTriggerLabel(){
 const opt=select.options[select.selectedIndex];
 valueSpan.textContent=opt?opt.textContent:'';
 valueSpan.classList.toggle('is-placeholder',!!(opt&&opt.value===''&&select.selectedIndex===0));
 }
 function closeMenu(){
 menu.classList.remove('open');
 trigger.setAttribute('aria-expanded','false');
 }
 function selectIndex(idx){
 if(select.selectedIndex!==idx){
 select.selectedIndex=idx;
 select.dispatchEvent(new Event('change',{bubbles:true}));
 }
 syncTriggerLabel();
 closeMenu();
 trigger.focus();
 }
 function openMenu(){
 menu.innerHTML=[...select.options].map((o,i)=>
 '<button type="button" class="custom-select-option'+(i===select.selectedIndex?' is-selected':'')+'" data-index="'+i+'" role="option" aria-selected="'+(i===select.selectedIndex)+'">'+
 '<span class="custom-select-option-check">'+(i===select.selectedIndex?'✓':'')+'</span><span>'+o.textContent+'</span></button>'
 ).join('');
 menu.querySelectorAll('.custom-select-option').forEach(btn=>btn.addEventListener('click',()=>selectIndex(Number(btn.dataset.index))));
 menu.classList.add('open');
 trigger.setAttribute('aria-expanded','true');
 const sel=menu.querySelector('.is-selected');
 if(sel) sel.scrollIntoView({block:'nearest'});
 }
 trigger.addEventListener('click',()=>{ menu.classList.contains('open')?closeMenu():openMenu(); });
 trigger.addEventListener('keydown',e=>{
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){
 e.preventDefault();
 if(!menu.classList.contains('open')){ openMenu(); return; }
 const opts=[...menu.querySelectorAll('.custom-select-option')];
 const focused=menu.querySelector('.is-focused');
 let idx=focused?opts.indexOf(focused):-1;
 idx=e.key==='ArrowDown'?Math.min(idx+1,opts.length-1):Math.max(idx-1,0);
 opts.forEach(o=>o.classList.remove('is-focused'));
 opts[idx].classList.add('is-focused');
 opts[idx].scrollIntoView({block:'nearest'});
 }else if((e.key==='Enter'||e.key===' ')&&menu.classList.contains('open')){
 e.preventDefault();
 const focused=menu.querySelector('.is-focused')||menu.querySelector('.is-selected');
 if(focused) focused.click();
 }else if(e.key==='Escape'){
 closeMenu();
 }
 });
 document.addEventListener('click',e=>{ if(!wrap.contains(e.target)) closeMenu(); });
 // A <label for="..."> click focuses the (invisible, pointer-events:none)
 // select directly — redirect that focus to the visible trigger so the
 // label still visibly does something.
 select.addEventListener('focus',()=>trigger.focus());
 syncTriggerLabel();
}

function populateEligStateOptions(){
 const sel=$('eligState');
 if(!sel) return;
 const states=[...new Set(APPLICATIONS.map(a=>a.state).filter(Boolean))].sort();
 sel.innerHTML='<option value="">'+T('elig.anyState')+'</option>'+states.map(s=>'<option value="'+s+'">'+s+'</option>').join('');
}

function renderEligibilityForm(){
 const qualSel=$('eligQual');
 if(!qualSel) return;
 qualSel.innerHTML='<option value="">'+T('elig.selectOne')+'</option>'+QUALIFICATION_LEVELS.map(q=>'<option value="'+q.value+'">'+T(q.labelKey)+'</option>').join('');
 const expFieldSel=$('eligExpField');
 if(expFieldSel) expFieldSel.innerHTML=EXPERIENCE_FIELDS.map(f=>'<option value="'+f.value+'">'+T(f.labelKey)+'</option>').join('');
 populateEligStateOptions();
}

function runEligibilityCheck(){
 const age=Number($('eligAge').value);
 const qualLevel=Number($('eligQual').value);
 const category=$('eligCategory').value;
 const state=$('eligState').value;
 const hasExp=$('eligHasExp')&&$('eligHasExp').value==='yes';
 const experienceField=hasExp&&$('eligExpField')?$('eligExpField').value:null;
 if(!age||age<15||age>65||!qualLevel){alert(T('elig.fillRequired'));return}
 const {eligible,borderline,uncertain}=checkEligibility({age,qualLevel,category,state,experienceField});
 const section=$('eligResultsSection');
 const box=$('eligResults');
 section.style.display='block';
 const parts=[];
 parts.push('<div class="elig-summary">'+T('elig.summaryPrefix')+' <b>'+eligible.length+'</b> '+T('elig.summaryEligible')+(borderline.length?', <b>'+borderline.length+'</b> '+T('elig.summaryBorderline'):'')+'.</div>');
 if(eligible.length) parts.push('<div class="elig-group-head">'+T('elig.headEligible')+'</div>'+eligible.map(r=>eligResultCard(r,'eligible')).join(''));
 else parts.push('<p class="notice-empty">'+T('elig.noneEligible')+'</p>');
 if(borderline.length) parts.push('<div class="elig-group-head">'+T('elig.headBorderline')+'</div>'+borderline.map(r=>eligResultCard(r,'borderline')).join(''));
 if(uncertain.length){
 parts.push('<details class="elig-uncertain-details"><summary>'+T('elig.headUncertain')+' ('+uncertain.length+')</summary>'+uncertain.map(eligUncertainCard).join('')+'</details>');
 }
 box.innerHTML=parts.join('');
 section.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ---- Step 3: pay + download ---- */
function renderPayBar(){
 const bar=$('payBar');
 if(!bar) return;
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

 // "More" dropdown (About + Contact) — present in every page's header.
 const navMoreBtn=$('navMoreBtn');
 const navMoreMenu=$('navMoreMenu');
 if(navMoreBtn&&navMoreMenu){
 const closeMore=()=>{navMoreMenu.classList.remove('open');navMoreBtn.setAttribute('aria-expanded','false')};
 navMoreBtn.addEventListener('click',e=>{
 e.stopPropagation();
 const open=navMoreMenu.classList.toggle('open');
 navMoreBtn.setAttribute('aria-expanded',open?'true':'false');
 });
 document.addEventListener('click',e=>{
 if(navMoreMenu.classList.contains('open')&&!navMoreMenu.contains(e.target)&&!navMoreBtn.contains(e.target)) closeMore();
 });
 document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeMore(); });
 }

 // Header search — present in every page's header (not just the homepage
 // hero), so an exam is reachable from wherever a visitor already is.
 const headerSearchToggle=$('headerSearchToggle');
 const headerSearchBox=$('headerSearchBox');
 const headerSearchInput=$('headerSearchInput');
 if(headerSearchToggle&&headerSearchBox&&headerSearchInput){
 const closeHeaderSearch=()=>{headerSearchBox.hidden=true;headerSearchToggle.setAttribute('aria-expanded','false')};
 headerSearchToggle.addEventListener('click',e=>{
 e.stopPropagation();
 const opening=headerSearchBox.hidden;
 headerSearchBox.hidden=!opening;
 headerSearchToggle.setAttribute('aria-expanded',opening?'true':'false');
 if(opening) headerSearchInput.focus();
 });
 headerSearchInput.addEventListener('input',()=>renderHeaderSearchResults(headerSearchInput.value));
 document.addEventListener('click',e=>{
 if(!headerSearchBox.hidden&&!headerSearchBox.contains(e.target)&&!headerSearchToggle.contains(e.target)) closeHeaderSearch();
 });
 document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeHeaderSearch(); });
 }

 // Eligibility checker (eligibility.html only)
 const eligForm=$('eligForm');
 if(eligForm){
 renderEligibilityForm();
 ['eligQual','eligHasExp','eligExpField','eligCategory','eligState'].forEach(id=>enhanceSelect($(id)));
 eligForm.addEventListener('submit',e=>{ e.preventDefault(); runEligibilityCheck(); });
 const eligHasExp=$('eligHasExp');
 const eligExpFieldWrap=$('eligExpFieldWrap');
 if(eligHasExp&&eligExpFieldWrap){
 eligHasExp.addEventListener('change',()=>{
 eligExpFieldWrap.style.display=eligHasExp.value==='yes'?'':'none';
 });
 }
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
 renderExamCatFilters();
 renderExamCardGrid('live');
 renderExamDirFilters();
 renderExamDirectory('all');
 renderExamCalendar();
 renderCalFilters();
 renderNoticeTicker();

 // Shareable deep link, e.g. index.html?exam=IBPS-PO — drops a visitor
 // straight into Step 2 for that exam instead of making them search. Used
 // by exams.html listing cards, calendar.html notice cards, the homepage
 // ticker/notice board, and the Exam Analysis Showcase's own CTA — one fix
 // here covers all of those entry points. Also scrolls straight to the
 // panel: selectExam() swaps the DOM correctly, but without this the page
 // still loads scrolled to the top, so a visitor who clicked "Full
 // Analysis" would have to scroll down past the hero to see the analysis
 // that already rendered.
 const deepLinkCode=new URLSearchParams(location.search).get('exam');
 if(deepLinkCode&&APPLICATIONS.some(a=>a.code===deepLinkCode)){
 selectExam(deepLinkCode);
 const target=$('prepareDocs');
 // Instant, not smooth: this runs on first paint, before the visitor has
 // seen the page at all, so there's nothing for an animated scroll to
 // interrupt — and html{scroll-behavior:smooth} makes a 'smooth'
 // scrollIntoView here unreliable (observed landing a few px short).
 if(target) target.scrollIntoView({behavior:'instant',block:'start'});
 }
});
