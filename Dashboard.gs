// ===== DASHBOARD MODULE =====
// דשבורד אוטומטי - מושך נתונים ממטא, גוגל אדס, ו-lead.im

const DASH = {
  SETTINGS_SHEET:  'הגדרות',
  DASHBOARD_SHEET: 'דשבורד',
  MAPPING_SHEET:   'מיפוי קמפיינים',
  CRM_SHEET:       'lead.im נתוני',
};

// ---- Settings helpers ----

function getDashSettings() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(DASH.SETTINGS_SHEET);
  if (!sheet) throw new Error('גיליון "הגדרות" לא נמצא — הפעל "הגדר דשבורד" תחילה');

  function cell(ref) {
    const v = sheet.getRange(ref).getValue();
    return (v === null || v === undefined) ? '' : String(v).trim();
  }
  function dateCell(ref) {
    const v = sheet.getRange(ref).getValue();
    if (!v) return null;
    return v instanceof Date ? v : new Date(v);
  }

  return {
    metaToken:            cell('B1'),
    googleCustomerId:     cell('B2').replace(/-/g, ''),
    googleDevToken:       cell('B3'),
    googleLoginCustomerId: cell('B4').replace(/-/g, ''),
    metaAccountId:        cell('B5'),
    leadimApiKey:         cell('B6'),
    leadimApiUrl:         cell('B7'),
    periodStart:          dateCell('B8'),
    periodEnd:            dateCell('B9'),
    projectName:          cell('B10') || 'MIDTOWN JERUSALEM - ISRAEL CANADA',
  };
}

function formatDateYMD(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateDisplay(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
}

// ---- Mapping helpers ----

function getCampaignMappings() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(DASH.MAPPING_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  return rows
    .filter(r => r[0])
    .map(r => ({
      displayName: String(r[0] || '').trim(),
      platform:    String(r[1] || 'Manual').trim(),   // Google / Meta / Manual
      campaignId:  String(r[2] || '').trim(),
      budget:      parseFloat(r[3]) || 0,
      type:        String(r[4] || 'Performance').trim(), // Performance / Awareness
      channel:     String(r[5] || '').trim(),
      manualLeads: parseInt(r[6]) || 0,                // עמודה G - לידים ידניים (לפלטפורמות Manual)
    }));
}

// ---- Main refresh ----

function refreshDashboard() {
  const ui  = SpreadsheetApp.getUi();
  const cfg = getDashSettings();

  const startStr = formatDateYMD(cfg.periodStart);
  const endStr   = formatDateYMD(cfg.periodEnd);
  if (!startStr || !endStr) {
    ui.alert('❌ יש להגדיר תאריכי תחילה וסיום בגיליון "הגדרות" (B8, B9)');
    return;
  }

  const mappings = getCampaignMappings();
  if (mappings.length === 0) {
    ui.alert('❌ אין מיפויי קמפיינים — מלאי את גיליון "מיפוי קמפיינים"');
    return;
  }

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const toast = (msg) => ss.toast(msg, '⏳ טוען...', 15);

  // 1. Meta data
  let metaData = {};
  if (cfg.metaToken && cfg.metaAccountId) {
    toast('מושך נתוני מטא...');
    try {
      metaData = fetchMetaInsights(cfg.metaToken, cfg.metaAccountId, startStr, endStr);
    } catch (e) {
      Logger.log('Meta error: ' + e.message);
      ss.toast('⚠️ שגיאת מטא: ' + e.message, 'אזהרה', 6);
    }
  }

  // 2. Google Ads data
  let googleData = {};
  if (cfg.googleCustomerId && cfg.googleDevToken) {
    toast('מושך נתוני גוגל אדס...');
    try {
      googleData = fetchGoogleAdsData(cfg.googleCustomerId, cfg.googleDevToken, cfg.googleLoginCustomerId, startStr, endStr);
    } catch (e) {
      Logger.log('Google Ads error: ' + e.message);
      ss.toast('⚠️ שגיאת גוגל: ' + e.message, 'אזהרה', 6);
    }
  }

  // 3. lead.im data
  let crmData = { total: 0, scheduled: 0, held: 0, bySource: {} };
  if (cfg.leadimApiKey && cfg.leadimApiUrl) {
    toast('מושך נתוני lead.im...');
    try {
      crmData = fetchLeadIMData(cfg.leadimApiKey, cfg.leadimApiUrl, startStr, endStr);
    } catch (e) {
      Logger.log('lead.im error: ' + e.message);
      ss.toast('⚠️ שגיאת lead.im: ' + e.message, 'אזהרה', 6);
    }
  }

  // 4. Render dashboard
  toast('בונה דשבורד...');
  renderDashboard(cfg, mappings, metaData, googleData, crmData, startStr, endStr);

  ss.toast('✅ הדשבורד עודכן בהצלחה!', 'הושלם', 5);
}

// ---- Render ----

function renderDashboard(cfg, mappings, metaData, googleData, crmData, startStr, endStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashSheet = ss.getSheetByName(DASH.DASHBOARD_SHEET);
  if (!dashSheet) dashSheet = ss.insertSheet(DASH.DASHBOARD_SHEET, 0);
  dashSheet.clearContents();
  dashSheet.clearFormats();
  dashSheet.setRightToLeft(true);

  const today       = new Date();
  const start       = cfg.periodStart ? new Date(cfg.periodStart) : new Date(startStr);
  const end         = cfg.periodEnd   ? new Date(cfg.periodEnd)   : new Date(endStr);
  const totalDays   = Math.round((end - start) / 86400000) + 1;
  const daysPassed  = Math.min(Math.max(Math.round((today - start) / 86400000), 0), totalDays);
  const daysLeft    = totalDays - daysPassed;
  const utilPct     = totalDays > 0 ? daysPassed / totalDays : 0;

  const HEADER_BG   = '#1a237e';
  const HEADER_FG   = '#ffffff';
  const SUBHDR_BG   = '#3949ab';
  const COL_BG      = '#e8eaf6';
  const TOTAL_BG    = '#283593';
  const TOTAL_FG    = '#ffffff';
  const PERF_BG     = '#e3f2fd';
  const AWARE_BG    = '#e8f5e9';

  let r = 1;

  // === Row 1: Project name ===
  dashSheet.getRange(r, 1, 1, 16).merge()
    .setValue(cfg.projectName)
    .setFontSize(16).setFontWeight('bold')
    .setBackground(HEADER_BG).setFontColor(HEADER_FG)
    .setHorizontalAlignment('center');
  r++;

  // === Row 2: Report period ===
  dashSheet.getRange(r, 1, 1, 16).merge()
    .setValue(`REPORT  ${formatDateDisplay(start)} — ${formatDateDisplay(end)}   |   עודכן: ${formatDateDisplay(today)}`)
    .setFontSize(11).setFontStyle('italic')
    .setBackground(SUBHDR_BG).setFontColor(HEADER_FG)
    .setHorizontalAlignment('center');
  r++;

  // === Row 3: Campaign duration info ===
  const infoHeaders = ['תאריך עלייה', 'תאריך ירידה', 'ימי קמפיין', 'ימים שעברו', 'ימים שנותרו', 'אחוז ניצול'];
  const infoValues  = [
    formatDateDisplay(start),
    formatDateDisplay(end),
    totalDays,
    daysPassed,
    daysLeft,
    (utilPct * 100).toFixed(1) + '%',
  ];
  dashSheet.getRange(r, 1, 1, 6).setValues([infoHeaders])
    .setFontWeight('bold').setBackground(COL_BG).setHorizontalAlignment('center');
  r++;
  dashSheet.getRange(r, 1, 1, 6).setValues([infoValues])
    .setHorizontalAlignment('center');
  r += 2;

  // ====================================================
  // Section: Online Digital Performance
  // ====================================================
  dashSheet.getRange(r, 1, 1, 16).merge()
    .setValue('Online Digital Performance')
    .setFontSize(13).setFontWeight('bold')
    .setBackground(HEADER_BG).setFontColor(HEADER_FG)
    .setHorizontalAlignment('center');
  r++;

  const perfHeaders = [
    'מדיה', 'ערוץ', 'תקציב', 'תקציב שנוצל', '% ניצול', 'יתרת תקציב',
    'תקציב יומי', 'לידים', 'עלות לליד', 'פגישות שנקבעו', '% פגישות',
    'פגישות שהתקיימו', '% פגישות שהתקיימו', 'תקציב יומי כללי', 'עלות לליד כללי'
  ];
  dashSheet.getRange(r, 1, 1, perfHeaders.length).setValues([perfHeaders])
    .setFontWeight('bold').setBackground(SUBHDR_BG).setFontColor(HEADER_FG)
    .setHorizontalAlignment('center').setWrap(true);
  r++;

  const perfMappings = mappings.filter(m => m.type === 'Performance');
  const perfStartRow = r;
  let totalBudget = 0, totalSpend = 0, totalLeads = 0;
  let totalScheduled = 0, totalHeld = 0;

  for (const m of perfMappings) {
    const { spend, leads } = resolveMetrics(m, metaData, googleData);
    const scheduled = getScheduledMeetings(m.displayName, crmData);
    const held      = getHeldMeetings(m.displayName, crmData);
    const cpl       = leads > 0 ? spend / leads : 0;
    const balance   = m.budget - spend;
    const budgetPct = m.budget > 0 ? spend / m.budget : 0;
    const dailyBudget = daysLeft > 0 ? balance / daysLeft : 0;
    const scheduledPct = leads > 0 ? scheduled / leads : 0;
    const heldPct      = leads > 0 ? held / leads : 0;

    totalBudget    += m.budget;
    totalSpend     += spend;
    totalLeads     += leads;
    totalScheduled += scheduled;
    totalHeld      += held;

    const row = [
      m.displayName,
      m.channel,
      m.budget > 0 ? m.budget : '',
      spend > 0    ? Math.round(spend * 100) / 100 : '',
      m.budget > 0 ? (budgetPct * 100).toFixed(1) + '%' : '',
      m.budget > 0 ? Math.round(balance * 100) / 100 : '',
      daysLeft > 0 && m.budget > 0 ? Math.round(dailyBudget) : '',
      leads > 0    ? leads : '',
      leads > 0    ? Math.round(cpl * 100) / 100 : '',
      scheduled > 0 ? scheduled : '',
      leads > 0 && scheduled > 0 ? (scheduledPct * 100).toFixed(1) + '%' : '',
      held > 0     ? held : '',
      leads > 0 && held > 0 ? (heldPct * 100).toFixed(1) + '%' : '',
      '', // overall daily budget (calculated in totals)
      '', // overall CPL (calculated in totals)
    ];
    dashSheet.getRange(r, 1, 1, row.length).setValues([row])
      .setBackground(PERF_BG);
    r++;
  }

  // Totals row for Performance
  const totalBudgetPct    = totalBudget > 0 ? (totalSpend / totalBudget * 100).toFixed(1) + '%' : '';
  const totalBalance      = totalBudget - totalSpend;
  const overallDailyBudget = daysLeft > 0 ? Math.round(totalBalance / daysLeft) : 0;
  const overallCpl        = totalLeads > 0 ? Math.round(totalSpend / totalLeads * 100) / 100 : 0;
  const schedPct          = totalLeads > 0 ? (totalScheduled / totalLeads * 100).toFixed(1) + '%' : '';
  const heldPct2          = totalLeads > 0 ? (totalHeld / totalLeads * 100).toFixed(1) + '%' : '';

  dashSheet.getRange(r, 1, 1, 15).setValues([[
    'סה"כ פעילות לידים', '',
    totalBudget || '',
    totalSpend > 0 ? Math.round(totalSpend * 100) / 100 : '',
    totalBudgetPct,
    Math.round(totalBalance * 100) / 100,
    '',
    totalLeads || '',
    overallCpl || '',
    totalScheduled || '',
    schedPct,
    totalHeld || '',
    heldPct2,
    overallDailyBudget || '',
    overallCpl || '',
  ]])
    .setFontWeight('bold').setBackground(TOTAL_BG).setFontColor(TOTAL_FG);
  r += 3;

  // ====================================================
  // Section: Online Digital Awareness
  // ====================================================
  const awareMappings = mappings.filter(m => m.type === 'Awareness');
  if (awareMappings.length > 0) {
    dashSheet.getRange(r, 1, 1, 12).merge()
      .setValue('Online Digital Awareness')
      .setFontSize(13).setFontWeight('bold')
      .setBackground(HEADER_BG).setFontColor(HEADER_FG)
      .setHorizontalAlignment('center');
    r++;

    const awareHeaders = ['מדיה', 'ערוץ', 'תקציב', 'תקציב שנוצל', '% ניצול', 'יתרת תקציב', 'תקציב יומי', 'חשיפות', 'הקלקות', 'CTR', 'פגישות שנקבעו', '% פגישות'];
    dashSheet.getRange(r, 1, 1, awareHeaders.length).setValues([awareHeaders])
      .setFontWeight('bold').setBackground(SUBHDR_BG).setFontColor(HEADER_FG)
      .setHorizontalAlignment('center').setWrap(true);
    r++;

    let aTotalBudget = 0, aTotalSpend = 0, aTotalImpressions = 0, aTotalClicks = 0;

    for (const m of awareMappings) {
      const { spend, impressions, clicks } = resolveMetrics(m, metaData, googleData);
      const balance   = m.budget - spend;
      const budgetPct = m.budget > 0 ? (spend / m.budget * 100).toFixed(1) + '%' : '';
      const dailyBudget = daysLeft > 0 && balance > 0 ? Math.round(balance / daysLeft) : '';
      const ctr = impressions > 0 ? (clicks / impressions * 100).toFixed(2) + '%' : '';

      aTotalBudget      += m.budget;
      aTotalSpend       += spend;
      aTotalImpressions += impressions;
      aTotalClicks      += clicks;

      dashSheet.getRange(r, 1, 1, 12).setValues([[
        m.displayName, m.channel,
        m.budget > 0 ? m.budget : '',
        spend > 0 ? Math.round(spend * 100) / 100 : '',
        budgetPct,
        m.budget > 0 ? Math.round(balance * 100) / 100 : '',
        dailyBudget,
        impressions || '',
        clicks || '',
        ctr,
        '', '',
      ]]).setBackground(AWARE_BG);
      r++;
    }

    const aCtr = aTotalImpressions > 0 ? (aTotalClicks / aTotalImpressions * 100).toFixed(2) + '%' : '';
    dashSheet.getRange(r, 1, 1, 12).setValues([[
      'סה"כ Awareness', '',
      aTotalBudget || '',
      aTotalSpend > 0 ? Math.round(aTotalSpend * 100) / 100 : '',
      aTotalBudget > 0 ? (aTotalSpend / aTotalBudget * 100).toFixed(1) + '%' : '',
      Math.round((aTotalBudget - aTotalSpend) * 100) / 100,
      '',
      aTotalImpressions || '',
      aTotalClicks || '',
      aCtr,
      '', '',
    ]]).setFontWeight('bold').setBackground(TOTAL_BG).setFontColor(TOTAL_FG);
    r++;
  }

  // ---- Column widths ----
  dashSheet.setColumnWidth(1, 200);
  dashSheet.setColumnWidth(2, 180);
  for (let c = 3; c <= 16; c++) dashSheet.setColumnWidth(c, 110);
  dashSheet.setFrozenRows(7);

  // ---- Timestamp ----
  dashSheet.getRange(r + 2, 1).setValue('עודכן אוטומטית: ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'));
}

// ---- Helpers: resolve metrics from API data ----

function resolveMetrics(mapping, metaData, googleData) {
  let spend = 0, leads = 0, impressions = 0, clicks = 0;

  if (mapping.platform === 'Meta') {
    const d = findByNameOrId(metaData, mapping.campaignId, mapping.displayName);
    if (d) {
      spend       = parseFloat(d.spend || 0);
      leads       = parseInt(d.leads || 0);
      impressions = parseInt(d.impressions || 0);
      clicks      = parseInt(d.clicks || 0);
    }
  } else if (mapping.platform === 'Google') {
    const d = findByNameOrId(googleData, mapping.campaignId, mapping.displayName);
    if (d) {
      spend       = parseFloat(d.spend || 0);
      leads       = parseInt(d.leads || 0);
      impressions = parseInt(d.impressions || 0);
      clicks      = parseInt(d.clicks || 0);
    }
  } else {
    // Manual platform — lead.im may supply leads even for manual
    leads = mapping.manualLeads || 0;
  }

  return { spend, leads, impressions, clicks };
}

function findByNameOrId(dataMap, id, name) {
  if (!dataMap) return null;
  if (id && dataMap[id]) return dataMap[id];
  // fuzzy match by name (case-insensitive, ignore extra spaces)
  const nameLower = name.toLowerCase().trim();
  for (const key of Object.keys(dataMap)) {
    const entry = dataMap[key];
    if (entry.name && entry.name.toLowerCase().trim().includes(nameLower)) return entry;
    if (nameLower.includes((entry.name || '').toLowerCase().trim())) return entry;
  }
  return null;
}

function getScheduledMeetings(channelName, crmData) {
  if (!crmData || !crmData.bySource) return 0;
  const k = channelName.toLowerCase().trim();
  for (const [src, v] of Object.entries(crmData.bySource)) {
    if (src.toLowerCase().includes(k) || k.includes(src.toLowerCase())) return v.scheduled || 0;
  }
  return 0;
}

function getHeldMeetings(channelName, crmData) {
  if (!crmData || !crmData.bySource) return 0;
  const k = channelName.toLowerCase().trim();
  for (const [src, v] of Object.entries(crmData.bySource)) {
    if (src.toLowerCase().includes(k) || k.includes(src.toLowerCase())) return v.held || 0;
  }
  return 0;
}

// ---- Menu ----

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Meta Ads')
    .addItem('🚀 העלה שורה נבחרת', 'uploadSelectedRow')
    .addSeparator()
    .addItem('📋 שכפל קמפיין', 'duplicateCampaign')
    .addSeparator()
    .addItem('⏸ השהה קמפיין', 'pauseCampaign')
    .addItem('▶️ הפעל קמפיין', 'activateCampaign')
    .addSeparator()
    .addItem('🔄 רענן רשימת חשבונות', 'refreshAccountsList')
    .addItem('🔗 בדוק חיבור מטא', 'testConnection')
    .addToUi();

  SpreadsheetApp.getUi()
    .createMenu('📊 דשבורד')
    .addItem('🔄 רענן דשבורד', 'refreshDashboard')
    .addSeparator()
    .addItem('⚙️ הגדר דשבורד (פעם ראשונה)', 'setupDashboardSheets')
    .addSeparator()
    .addItem('🔗 בדוק חיבור גוגל אדס', 'testGoogleAdsConnection')
    .addItem('🔗 בדוק חיבור lead.im', 'testLeadIMConnection')
    .addToUi();
}

// ---- Setup ----

function setupDashboardSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // הגדרות sheet — הרחב
  const s = ss.getSheetByName(DASH.SETTINGS_SHEET) || ss.insertSheet(DASH.SETTINGS_SHEET);
  const labels = [
    ['Meta Access Token:',              ''],
    ['Google Ads Customer ID:',         ''],
    ['Google Ads Developer Token:',     ''],
    ['Google Ads Login Customer ID (MCC, אופציונלי):', ''],
    ['Meta Ad Account ID (ללא act_):', ''],
    ['lead.im API Key:',                ''],
    ['lead.im API URL (בסיס):',         'https://app.lead.im'],
    ['תאריך התחלת תקופה:',              ''],
    ['תאריך סיום תקופה:',               ''],
    ['שם הפרויקט:',                      'MIDTOWN JERUSALEM - ISRAEL CANADA'],
  ];
  s.getRange(1, 1, labels.length, 2).setValues(labels);
  s.getRange(1, 1, labels.length, 1).setFontWeight('bold');
  s.setColumnWidth(1, 300);
  s.setColumnWidth(2, 500);
  s.getRange('B8:B9').setNumberFormat('dd/mm/yyyy');
  s.setRightToLeft(true);

  // מיפוי קמפיינים
  let ms = ss.getSheetByName(DASH.MAPPING_SHEET);
  if (!ms) {
    ms = ss.insertSheet(DASH.MAPPING_SHEET);
    ms.setRightToLeft(true);
    const headers = ['שם ערוץ (לדשבורד)', 'פלטפורמה', 'Campaign Name/ID', 'תקציב (₪)', 'סוג', 'ערוץ', 'לידים ידניים'];
    ms.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#4a4a8a').setFontColor('white');
    ms.setFrozenRows(1);

    const defaults = [
      ['גוגל חיפוש - מותג',    'Google', '', 0, 'Performance', 'מודעות חיפוש',           0],
      ['גוגל חיפוש - גנרי',    'Google', '', 0, 'Performance', 'מודעות חיפוש',           0],
      ['גוגל חיפוש - מתחרים',  'Google', '', 0, 'Performance', 'מודעות חיפוש',           0],
      ['גוגל - PMAX',           'Google', '', 0, 'Performance', 'Performance Max',        0],
      ['גוגל - Demand Gen',     'Google', '', 0, 'Performance', 'Demand Gen',             0],
      ['פייסבוק - דף נחיתה',   'Meta',   '', 0, 'Performance', 'באנרים סטטים + קרוסלה', 0],
      ['פייסבוק - טופס ליד',   'Meta',   '', 0, 'Performance', 'טופס ליד',               0],
      ['טאבולה',                'Manual', '', 0, 'Performance', 'מדמה תוכן',              0],
      ['הקהילה שלי',            'Manual', '', 0, 'Performance', 'מדמה תוכן',              0],
      ['יד 2',                  'Manual', '', 0, 'Performance', 'לוחות',                  0],
      ['מדלן',                  'Manual', '', 0, 'Performance', 'לוחות',                  0],
      ['אאוטבריין',             'Manual', '', 0, 'Performance', 'מדמה תוכן',              0],
      ['טיקטוק',                'Manual', '', 0, 'Performance', 'מדמה תוכן',              0],
      ['גוגל - GDN',            'Google', '', 0, 'Awareness',   'מודעות',                 0],
      ['TIME OF ISRAEL',        'Manual', '', 0, 'Awareness',   'מודעות',                 0],
      ['IDX',                   'Manual', '', 0, 'Awareness',   'מודעות',                 0],
      ['Jerusalem Post',        'Manual', '', 0, 'Awareness',   'מודעות',                 0],
    ];
    ms.getRange(2, 1, defaults.length, 7).setValues(defaults);

    const platRule = SpreadsheetApp.newDataValidation().requireValueInList(['Google','Meta','Manual'], true).build();
    const typeRule = SpreadsheetApp.newDataValidation().requireValueInList(['Performance','Awareness'], true).build();
    ms.getRange(2, 2, 50).setDataValidation(platRule);
    ms.getRange(2, 5, 50).setDataValidation(typeRule);
    ms.setColumnWidth(1, 220); ms.setColumnWidth(3, 280); ms.setColumnWidths(4, 4, 100);
  }

  // צור דשבורד ריק
  if (!ss.getSheetByName(DASH.DASHBOARD_SHEET)) {
    ss.insertSheet(DASH.DASHBOARD_SHEET, 0).setRightToLeft(true);
  } else {
    ss.getSheetByName(DASH.DASHBOARD_SHEET).setRightToLeft(true);
  }

  SpreadsheetApp.getUi().alert(
    '✅ הגדרות הדשבורד מוכנות!\n\n' +
    'צעדים הבאים:\n' +
    '1. גיליון "הגדרות" — מלאי API tokens ותאריכים\n' +
    '2. גיליון "מיפוי קמפיינים" — כתבי שמות/IDs של קמפיינים\n' +
    '3. לחצי על דשבורד ▸ "רענן דשבורד"\n\n' +
    'לפלטפורמות ידניות (טאבולה/יד2/...) — הכניסי לידים בעמודה G'
  );
}
