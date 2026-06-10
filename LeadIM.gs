// ===== LEAD.IM CRM MODULE =====
// שולף לידים, פגישות שנקבעו ופגישות שהתקיימו מ-lead.im

/**
 * fetchLeadIMData
 *
 * מחזיר אובייקט:
 * {
 *   total: <מספר לידים כולל>,
 *   scheduled: <פגישות שנקבעו>,
 *   held: <פגישות שהתקיימו>,
 *   bySource: {
 *     "<שם מקור>": { total, scheduled, held }
 *   }
 * }
 */
function fetchLeadIMData(apiKey, baseUrl, startDate, endDate) {
  const cleanBase = baseUrl.replace(/\/$/, '');

  // ---- 1. שלוף רשימת לידים ----
  const leads = fetchLeadIMLeads(apiKey, cleanBase, startDate, endDate);

  // ---- 2. קבץ לפי מקור ----
  const bySource = {};
  let totalScheduled = 0;
  let totalHeld      = 0;

  for (const lead of leads) {
    const source = normalizeSource(lead.source || lead.utm_source || lead.channel || 'unknown');
    if (!bySource[source]) bySource[source] = { total: 0, scheduled: 0, held: 0 };

    bySource[source].total++;

    const status = String(lead.status || lead.meeting_status || '').toLowerCase();
    if (isScheduled(status)) {
      bySource[source].scheduled++;
      totalScheduled++;
    }
    if (isHeld(status)) {
      bySource[source].held++;
      totalHeld++;
    }
  }

  // ---- 3. שמור גיליון CRM לצפייה ----
  saveCRMSheet(leads, bySource);

  return {
    total:     leads.length,
    scheduled: totalScheduled,
    held:      totalHeld,
    bySource,
  };
}

// ---- Fetch leads with pagination ----

function fetchLeadIMLeads(apiKey, baseUrl, startDate, endDate) {
  const allLeads = [];
  let page       = 1;
  const perPage  = 200;

  while (true) {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date:   endDate,
      per_page:   perPage,
      page:       page,
    });

    const url  = `${baseUrl}/api/leads?${params.toString()}`;
    const resp = UrlFetchApp.fetch(url, {
      headers:            { 'Authorization': 'Bearer ' + apiKey, 'Accept': 'application/json' },
      muteHttpExceptions: true,
    });

    const code = resp.getResponseCode();
    if (code === 401) throw new Error('lead.im: Token לא תקין (401)');
    if (code === 403) throw new Error('lead.im: אין הרשאה (403)');
    if (code !== 200) throw new Error(`lead.im: שגיאה ${code} — ${resp.getContentText().substring(0, 200)}`);

    const body = JSON.parse(resp.getContentText());

    // lead.im can return { data: [...], meta: {...} }  OR  just  [...]
    const rows = Array.isArray(body) ? body : (body.data || body.leads || []);
    if (rows.length === 0) break;
    allLeads.push(...rows);

    // pagination check
    const meta       = body.meta || body.pagination || {};
    const totalPages = meta.last_page || meta.total_pages || 1;
    if (page >= totalPages || rows.length < perPage) break;
    page++;
    Utilities.sleep(300);
  }

  Logger.log('lead.im: שלפנו ' + allLeads.length + ' לידים');
  return allLeads;
}

// ---- Status helpers ----

function isScheduled(status) {
  return ['scheduled','meeting_scheduled','נקבעה פגישה','meeting booked','qualified'].includes(status);
}

function isHeld(status) {
  return ['held','meeting_held','פגישה התקיימה','attended','showed','closed','sale'].includes(status);
}

function normalizeSource(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (s.includes('facebook') || s.includes('fb') || s.includes('meta') || s.includes('פייסבוק')) return 'פייסבוק - טופס ליד';
  if (s.includes('google') || s.includes('גוגל')) return 'גוגל';
  if (s.includes('taboola') || s.includes('טאבולה'))  return 'טאבולה';
  if (s.includes('outbrain') || s.includes('אאוטבריין')) return 'אאוטבריין';
  if (s.includes('yad2') || s.includes('יד2') || s.includes('יד 2')) return 'יד 2';
  if (s.includes('madlan') || s.includes('מדלן')) return 'מדלן';
  if (s.includes('community') || s.includes('kehila') || s.includes('קהילה')) return 'הקהילה שלי';
  if (s.includes('tiktok') || s.includes('טיקטוק')) return 'טיקטוק';
  return raw;
}

// ---- Save CRM data to a sheet for review ----

function saveCRMSheet(leads, bySource) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DASH.CRM_SHEET);
  if (!sheet) sheet = ss.insertSheet(DASH.CRM_SHEET);
  sheet.clearContents();

  // Summary by source
  sheet.getRange(1, 1).setValue('סיכום לפי מקור — lead.im')
    .setFontWeight('bold').setFontSize(13);
  sheet.getRange(2, 1, 1, 4).setValues([['מקור', 'לידים', 'פגישות שנקבעו', 'פגישות שהתקיימו']])
    .setFontWeight('bold').setBackground('#4a4a8a').setFontColor('white');

  const summaryRows = Object.entries(bySource).map(([src, v]) => [src, v.total, v.scheduled, v.held]);
  if (summaryRows.length > 0) sheet.getRange(3, 1, summaryRows.length, 4).setValues(summaryRows);

  const dataStart = 3 + summaryRows.length + 2;

  // Raw leads (first 500)
  const sample = leads.slice(0, 500);
  if (sample.length > 0) {
    const allKeys = Object.keys(sample[0]);
    sheet.getRange(dataStart, 1, 1, allKeys.length).setValues([allKeys])
      .setFontWeight('bold').setBackground('#37474f').setFontColor('white');
    const dataRows = sample.map(l => allKeys.map(k => l[k] || ''));
    sheet.getRange(dataStart + 1, 1, dataRows.length, allKeys.length).setValues(dataRows);
  }

  sheet.getRange(dataStart - 1, 1).setValue('נתונים גולמיים (עד 500 שורות):').setFontWeight('bold');
  sheet.autoResizeColumns(1, 8);
}

// ---- Test connection ----

function testLeadIMConnection() {
  const cfg = getDashSettings();
  if (!cfg.leadimApiKey || !cfg.leadimApiUrl) {
    SpreadsheetApp.getUi().alert('❌ חסרים: lead.im API Key ו/או URL בגיליון "הגדרות"');
    return;
  }

  const url  = cfg.leadimApiUrl.replace(/\/$/, '') + '/api/leads?per_page=1&page=1';
  const resp = UrlFetchApp.fetch(url, {
    headers:            { 'Authorization': 'Bearer ' + cfg.leadimApiKey, 'Accept': 'application/json' },
    muteHttpExceptions: true,
  });

  const code = resp.getResponseCode();
  if (code === 200) {
    SpreadsheetApp.getUi().alert('✅ חיבור ל-lead.im תקין!\nURL: ' + cfg.leadimApiUrl);
  } else {
    SpreadsheetApp.getUi().alert('❌ שגיאת lead.im:\n' + code + '\n' + resp.getContentText().substring(0, 300));
  }
}
