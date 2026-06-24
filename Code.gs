// ===== META ADS — Google Sheets Integration =====

var API_VERSION = 'v21.0';
var BASE_URL = 'https://graph.facebook.com/' + API_VERSION;

// ── עמודות גיליון "קמפיינים" ──
var C = {
  CAMP_NAME:    1,  // שם קמפיין
  OBJECTIVE:    2,  // מטרה
  ADSET_NAME:   3,  // שם אד-סט
  BUDGET:       4,  // תקציב יומי ₪
  START_DATE:   5,  // תאריך התחלה
  END_DATE:     6,  // תאריך סיום
  COUNTRIES:    7,  // מדינות (IL,US...)
  AGE_MIN:      8,  // גיל מינימום
  AGE_MAX:      9,  // גיל מקסימום
  GENDER:      10,  // ALL / MALE / FEMALE
  PLACEMENT:   11,  // AUTOMATIC / FEED / STORIES / REELS
  AD_NAME:     12,  // שם מודעה
  HEADLINE:    13,  // כותרת
  TEXT:        14,  // טקסט ראשי
  IMAGE_URL:   15,  // קישור לתמונה
  DEST_URL:    16,  // קישור יעד
  CTA:         17,  // LEARN_MORE וכו'
  ACCOUNT:     18,  // חשבון פרסום
  PAGE:        19,  // דף פייסבוק
  // פלט (ממולא אוטומטית):
  STATUS:      20,
  CAMP_ID:     21,
  ADSET_ID:    22,
  AD_ID:       23
};
var NCOLS = 23;

// ─────────────────────────────────────────
function actId(id) {
  return 'act_' + String(id || '').replace(/^act_/i, '').trim();
}

function getToken() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('הגדרות');
  if (!sh) throw new Error('גיליון "הגדרות" חסר — הרץ setupSheets תחילה');
  var t = sh.getRange('B1').getValue();
  if (!t) throw new Error('הכנס Meta Access Token בתא B1 של גיליון "הגדרות"');
  return String(t).trim();
}

function metaPost(endpoint, params) {
  var url = BASE_URL + '/' + endpoint;
  var payload = Object.assign({ access_token: getToken() }, params);
  var res = UrlFetchApp.fetch(url, { method: 'post', payload: payload, muteHttpExceptions: true });
  var json = JSON.parse(res.getContentText());
  Logger.log('POST ' + endpoint + ' → ' + JSON.stringify(json).substring(0, 200));
  return json;
}

function metaGet(endpoint, params) {
  var p = Object.assign({ access_token: getToken() }, params || {});
  var qs = Object.keys(p).map(function(k){ return encodeURIComponent(k)+'='+encodeURIComponent(p[k]); }).join('&');
  var res = UrlFetchApp.fetch(BASE_URL + '/' + endpoint + '?' + qs, { muteHttpExceptions: true });
  var json = JSON.parse(res.getContentText());
  Logger.log('GET ' + endpoint + ' → ' + JSON.stringify(json).substring(0, 200));
  return json;
}

function setStatus(sheet, row, msg) {
  sheet.getRange(row, C.STATUS).setValue(msg);
  SpreadsheetApp.flush();
}

// ─── חיפוש Account ID לפי שם ───
function getAccountId(name) {
  if (!name) return null;
  name = String(name).trim();
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('חשבונות');
  if (sh && sh.getLastRow() > 1) {
    var data = sh.getRange(2, 1, sh.getLastRow()-1, 2).getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === name) return String(data[i][1]).trim();
    }
  }
  return name; // אם לא נמצא — מחזיר כמו שהוא (יכול להיות ID ישיר)
}

// ─── חיפוש Page ID לפי שם ───
function getPageId(name) {
  if (!name) return null;
  name = String(name).trim();
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('חשבונות');
  if (sh && sh.getLastRow() > 1) {
    var data = sh.getRange(2, 1, sh.getLastRow()-1, 4).getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][2]).trim() === name) return String(data[i][3]).trim();
    }
  }
  return name;
}

// ─── Placement ───
function placementTargeting(p) {
  p = String(p || '').toUpperCase();
  var m = {
    'FEED':    { publisher_platforms: ['facebook','instagram'], facebook_positions: ['feed'], instagram_positions: ['stream'] },
    'STORIES': { publisher_platforms: ['facebook','instagram'], facebook_positions: ['story'], instagram_positions: ['story'] },
    'REELS':   { publisher_platforms: ['facebook','instagram'], facebook_positions: ['facebook_reels'], instagram_positions: ['reels'] },
    'FACEBOOK_ONLY': { publisher_platforms: ['facebook'], facebook_positions: ['feed'] },
    'INSTAGRAM_ONLY':{ publisher_platforms: ['instagram'], instagram_positions: ['stream'] }
  };
  return m[p] || {}; // AUTOMATIC = ריק
}

// ─── Optimization Goal ───
function optGoal(obj) {
  var m = {
    OUTCOME_TRAFFIC: 'LINK_CLICKS',
    OUTCOME_AWARENESS: 'REACH',
    OUTCOME_ENGAGEMENT: 'POST_ENGAGEMENT',
    OUTCOME_LEADS: 'LEAD_GENERATION',
    OUTCOME_SALES: 'OFFSITE_CONVERSIONS',
    OUTCOME_APP_PROMOTION: 'APP_INSTALLS'
  };
  return m[String(obj).toUpperCase()] || 'LINK_CLICKS';
}

// ─── העלאת תמונה ───
function uploadImage(imageUrl, accountId) {
  var r = metaPost(actId(accountId) + '/adimages', { url: imageUrl });
  if (r.images) {
    var keys = Object.keys(r.images);
    if (keys.length) return r.images[keys[0]].hash;
  }
  throw new Error('שגיאה בתמונה: ' + JSON.stringify(r));
}

// ═══════════════════════════════════════════
//  פונקציה ראשית — העלאת שורה
// ═══════════════════════════════════════════
function uploadRow() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('קמפיינים');
  if (!sheet) { SpreadsheetApp.getUi().alert('❌ לא נמצא גיליון "קמפיינים" — הרץ setupSheets'); return; }

  var row = sheet.getActiveCell().getRow();
  if (row < 2) { SpreadsheetApp.getUi().alert('❌ יש לעמוד על שורת נתונים (שורה 2 ומטה)'); return; }

  var v = sheet.getRange(row, 1, 1, NCOLS).getValues()[0];

  var accountRaw = getAccountId(v[C.ACCOUNT - 1]);
  var pageId     = getPageId(v[C.PAGE - 1]);

  if (!accountRaw) { setStatus(sheet, row, '❌ חסר חשבון פרסום'); return; }
  if (!pageId)     { setStatus(sheet, row, '❌ חסר דף פייסבוק'); return; }

  var acc = actId(accountRaw);

  try {
    // ── 1. קמפיין ──
    var campId = String(sheet.getRange(row, C.CAMP_ID).getValue() || '').trim();
    if (!campId) {
      var campName = String(v[C.CAMP_NAME - 1] || '').trim();
      var objective = String(v[C.OBJECTIVE - 1] || 'OUTCOME_TRAFFIC').trim();
      if (!campName) { setStatus(sheet, row, '❌ חסר שם קמפיין'); return; }
      setStatus(sheet, row, '⏳ יוצר קמפיין...');
      var cr = metaPost(acc + '/campaigns', {
        name: campName, objective: objective,
        status: 'PAUSED', special_ad_categories: '[]'
      });
      if (cr.error) { setStatus(sheet, row, '❌ קמפיין: ' + cr.error.message); return; }
      campId = cr.id;
      sheet.getRange(row, C.CAMP_ID).setValue(campId);
    }

    // ── 2. אד-סט ──
    var adsetId = String(sheet.getRange(row, C.ADSET_ID).getValue() || '').trim();
    if (!adsetId) {
      var adsetName = String(v[C.ADSET_NAME - 1] || '').trim();
      var budget    = parseFloat(v[C.BUDGET - 1]) || 0;
      if (!adsetName) { setStatus(sheet, row, '❌ חסר שם אד-סט'); return; }
      if (!budget)    { setStatus(sheet, row, '❌ חסר תקציב יומי'); return; }

      // targeting
      var targeting = {};
      var countries = String(v[C.COUNTRIES - 1] || 'IL').split(',').map(function(c){ return c.trim().toUpperCase(); }).filter(Boolean);
      targeting.geo_locations = { countries: countries };
      var ageMin = parseInt(v[C.AGE_MIN - 1]);
      var ageMax = parseInt(v[C.AGE_MAX - 1]);
      if (ageMin) targeting.age_min = ageMin;
      if (ageMax) targeting.age_max = ageMax;
      var gender = String(v[C.GENDER - 1] || '').toUpperCase();
      if (gender === 'MALE')   targeting.genders = [1];
      if (gender === 'FEMALE') targeting.genders = [2];
      Object.assign(targeting, placementTargeting(v[C.PLACEMENT - 1]));

      var adsetParams = {
        name:              adsetName,
        campaign_id:       campId,
        daily_budget:      Math.round(budget * 100),
        billing_event:     'IMPRESSIONS',
        optimization_goal: optGoal(v[C.OBJECTIVE - 1]),
        targeting:         JSON.stringify(targeting),
        status:            'PAUSED'
      };
      var startRaw = v[C.START_DATE - 1];
      var endRaw   = v[C.END_DATE - 1];
      if (startRaw) adsetParams.start_time = Math.floor(new Date(startRaw).getTime() / 1000);
      if (endRaw)   adsetParams.end_time   = Math.floor(new Date(endRaw).getTime() / 1000);

      setStatus(sheet, row, '⏳ יוצר אד-סט...');
      var ar = metaPost(acc + '/adsets', adsetParams);
      if (ar.error) { setStatus(sheet, row, '❌ אד-סט: ' + ar.error.message); return; }
      adsetId = ar.id;
      sheet.getRange(row, C.ADSET_ID).setValue(adsetId);
    }

    // ── 3. מודעה ──
    var adName   = String(v[C.AD_NAME   - 1] || '').trim();
    var headline = String(v[C.HEADLINE  - 1] || '').trim();
    var text     = String(v[C.TEXT      - 1] || '').trim();
    var imageUrl = String(v[C.IMAGE_URL - 1] || '').trim();
    var destUrl  = String(v[C.DEST_URL  - 1] || '').trim();
    var cta      = String(v[C.CTA       - 1] || 'LEARN_MORE').trim();

    if (!adName)   { setStatus(sheet, row, '❌ חסר שם מודעה'); return; }
    if (!imageUrl) { setStatus(sheet, row, '❌ חסר URL תמונה'); return; }
    if (!destUrl)  { setStatus(sheet, row, '❌ חסר URL יעד'); return; }

    setStatus(sheet, row, '⏳ מעלה תמונה...');
    var hash = uploadImage(imageUrl, accountRaw);

    setStatus(sheet, row, '⏳ יוצר creative...');
    var creative = metaPost(acc + '/adcreatives', {
      name: adName + '_creative',
      object_story_spec: JSON.stringify({
        page_id: pageId,
        link_data: {
          image_hash:    hash,
          link:          destUrl,
          message:       text,
          name:          headline,
          call_to_action: { type: cta, value: { link: destUrl } }
        }
      })
    });
    if (creative.error) { setStatus(sheet, row, '❌ Creative: ' + creative.error.message); return; }

    setStatus(sheet, row, '⏳ יוצר מודעה...');
    var adResp = metaPost(acc + '/ads', {
      name:     adName,
      adset_id: adsetId,
      creative: JSON.stringify({ creative_id: creative.id }),
      status:   'PAUSED'
    });
    if (adResp.error) { setStatus(sheet, row, '❌ מודעה: ' + adResp.error.message); return; }

    sheet.getRange(row, C.AD_ID).setValue(adResp.id);
    setStatus(sheet, row, '✅ הועלה בהצלחה!');

  } catch(e) { setStatus(sheet, row, '❌ ' + e.message); }
}

// ═══════════════════════════════════════════
//  השהה / הפעל קמפיין
// ═══════════════════════════════════════════
function pauseCampaign()  { toggleCampaign('PAUSED'); }
function activateCampaign(){ toggleCampaign('ACTIVE'); }

function toggleCampaign(status) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('קמפיינים');
  var row = sheet.getActiveCell().getRow();
  if (row < 2) return;
  var id = String(sheet.getRange(row, C.CAMP_ID).getValue() || '').trim();
  if (!id) { setStatus(sheet, row, '❌ אין Campaign ID בשורה זו'); return; }
  try {
    var r = metaPost(id, { status: status });
    setStatus(sheet, row, r.error ? '❌ ' + r.error.message : (status === 'PAUSED' ? '⏸ מושהה' : '▶️ פעיל'));
  } catch(e) { setStatus(sheet, row, '❌ ' + e.message); }
}

// ═══════════════════════════════════════════
//  רענן חשבונות ודפים
// ═══════════════════════════════════════════
function refreshAccounts() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('חשבונות');

  var accResp  = metaGet('me/adaccounts', { fields: 'id,name', limit: 500 });
  var pageResp = metaGet('me/accounts',   { fields: 'id,name', limit: 500 });
  var accounts = accResp.data  || [];
  var pages    = pageResp.data || [];

  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow()-1, 4).clearContent();
  var rows = [];
  var maxLen = Math.max(accounts.length, pages.length);
  for (var i = 0; i < maxLen; i++) {
    rows.push([
      accounts[i] ? accounts[i].name : '',
      accounts[i] ? accounts[i].id   : '',
      pages[i]    ? pages[i].name    : '',
      pages[i]    ? pages[i].id      : ''
    ]);
  }
  if (rows.length) sh.getRange(2, 1, rows.length, 4).setValues(rows);

  // עדכון dropdowns
  var campSheet = ss.getSheetByName('קמפיינים');
  if (campSheet) {
    if (accounts.length) campSheet.getRange(2, C.ACCOUNT, 200).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(accounts.map(function(a){ return a.name; }), true).build());
    if (pages.length) campSheet.getRange(2, C.PAGE, 200).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(pages.map(function(p){ return p.name; }), true).build());
  }

  SpreadsheetApp.getUi().alert('✅ ' + accounts.length + ' חשבונות, ' + pages.length + ' דפים');
}

// ═══════════════════════════════════════════
//  בדוק חיבור
// ═══════════════════════════════════════════
function testConnection() {
  try {
    var r = metaGet('me', { fields: 'id,name' });
    SpreadsheetApp.getUi().alert(r.name ? '✅ מחובר כ: ' + r.name : '❌ ' + JSON.stringify(r));
  } catch(e) { SpreadsheetApp.getUi().alert('❌ ' + e.message); }
}

// ═══════════════════════════════════════════
//  בניית גיליונות
// ═══════════════════════════════════════════
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── הגדרות ──
  var cfg = ss.getSheetByName('הגדרות') || ss.insertSheet('הגדרות');
  cfg.getRange('A1').setValue('Meta Access Token:').setFontWeight('bold');
  cfg.setColumnWidth(1, 180);
  cfg.setColumnWidth(2, 600);

  // ── חשבונות ──
  var acc = ss.getSheetByName('חשבונות') || ss.insertSheet('חשבונות');
  acc.getRange(1,1,1,4).setValues([['שם חשבון','Account ID','שם דף','Page ID']]);
  acc.getRange(1,1,1,4).setFontWeight('bold').setBackground('#1a237e').setFontColor('white');

  // ── קמפיינים — מחפש גיליון קיים לשנות שם, אחרת יוצר ──
  // ── קמפיינים ──
  var camp = ss.getSheetByName('קמפיינים');
  if (!camp) {
    // חפש גיליון פנוי לשינוי שם
    var allSheets = ss.getSheets();
    for (var si = 0; si < allSheets.length; si++) {
      var sName = allSheets[si].getName();
      if (sName.indexOf('גיליון') >= 0 || sName.indexOf('Sheet') >= 0) {
        allSheets[si].setName('קמפיינים');
        camp = allSheets[si];
        break;
      }
    }
    // אם לא נמצא — צור חדש ושנה שם
    if (!camp) {
      var newS = ss.insertSheet();
      newS.setName('קמפיינים');
      camp = newS;
    }
  }
  camp.clearContents();
  var headers = [
    'שם קמפיין','מטרה','שם אד-סט','תקציב יומי (₪)','תאריך התחלה','תאריך סיום',
    'מדינות','גיל מינ','גיל מקס','מגדר','Placement',
    'שם מודעה','כותרת','טקסט','URL תמונה','URL יעד','CTA',
    'חשבון פרסום','דף',
    'סטטוס','Campaign ID','Adset ID','Ad ID'
  ];
  camp.getRange(1,1,1,headers.length).setValues([headers]);
  camp.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#1a237e').setFontColor('white');
  camp.setFrozenRows(1);

  // צבע עמודות פלט
  camp.getRange(1, C.STATUS, 1, 4).setBackground('#e8f5e9');
  camp.getRange(2, C.STATUS, 200, 4).setBackground('#f1f8e9');

  // Dropdowns סטטיים
  camp.getRange(2, C.OBJECTIVE, 200).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(
      ['OUTCOME_TRAFFIC','OUTCOME_AWARENESS','OUTCOME_ENGAGEMENT','OUTCOME_LEADS','OUTCOME_SALES','OUTCOME_APP_PROMOTION'], true).build());
  camp.getRange(2, C.PLACEMENT, 200).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(
      ['AUTOMATIC','FEED','STORIES','REELS','FACEBOOK_ONLY','INSTAGRAM_ONLY'], true).build());
  camp.getRange(2, C.GENDER, 200).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['ALL','MALE','FEMALE'], true).build());
  camp.getRange(2, C.CTA, 200).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(
      ['LEARN_MORE','SHOP_NOW','SIGN_UP','CONTACT_US','GET_QUOTE','DOWNLOAD','SUBSCRIBE','WATCH_MORE'], true).build());

  SpreadsheetApp.getUi().alert('✅ הגיליונות נוצרו!\n\nעכשיו:\n1. הכנס Access Token בגיליון "הגדרות" תא B1\n2. לחץ Meta Ads → רענן חשבונות\n3. מלא נתונים ולחץ "העלה שורה"');
}

// ═══════════════════════════════════════════
//  תפריט
// ═══════════════════════════════════════════
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📢 Meta Ads')
    .addItem('🚀 העלה שורה נבחרת', 'uploadRow')
    .addSeparator()
    .addItem('⏸ השהה קמפיין', 'pauseCampaign')
    .addItem('▶️ הפעל קמפיין', 'activateCampaign')
    .addSeparator()
    .addItem('🔄 רענן חשבונות ודפים', 'refreshAccounts')
    .addItem('🔗 בדוק חיבור', 'testConnection')
    .addSeparator()
    .addItem('⚙️ בנה גיליונות (setupSheets)', 'setupSheets')
    .addSeparator()
    .addItem('📊 בנה דשבורד ביצועים', 'setupDashboard')
    .addToUi();
}

// ═══════════════════════════════════════════
//  דשבורד ביצועים — קונפיגורציה
// ═══════════════════════════════════════════
var REPORTS_SHEET_ID = "1mAlhNPZnIp6wvavmwv5BPB0XMFLUiFkABO35XmKu9Ac";

// שורות הדשבורד לפי פרויקט (מדיה + ערוץ)
// גוגל: מושך אוטומטית מהטאבים של סקריפט גוגל אדס
// פייסבוק: תאים צהובים לעדכון ידני
var DASH_ROWS = [
  { project: "מיסדאון", media: "גוגל",    channel: "מותג"     },
  { project: "מיסדאון", media: "גוגל",    channel: "גנרי"     },
  { project: "מיסדאון", media: "פייסבוק", channel: "דף נחיתה" },
  { project: "מיסדאון", media: "פייסבוק", channel: "טופס ליד" }
];

// תקציבים חודשיים: [פרויקט, מדיה, ערוץ, תקציב]
var BUDGETS_DATA = [
  ["מיסדאון", "גוגל",    "מותג",      4500 ],
  ["מיסדאון", "גוגל",    "גנרי",      2500 ],
  ["מיסדאון", "פייסבוק", "דף נחיתה",  15000],
  ["מיסדאון", "פייסבוק", "טופס ליד",  38383]
];

// נתוני פייסבוק ראשוניים (עדכן ידנית בתאים הצהובים בשיטס)
// project|channel → [הוצאה, לידים]
var FB_INITIAL = {
  "חודש": {
    "מיסדאון|דף נחיתה": [13482, 15],
    "מיסדאון|טופס ליד": [24413, 56]
  },
  "אתמול": {
    "מיסדאון|דף נחיתה": [498, 0],
    "מיסדאון|טופס ליד": [2311, 9]
  },
  "היום": {
    "מיסדאון|דף נחיתה": [155, 1],
    "מיסדאון|טופס ליד": [632, 6]
  }
};

// ═══════════════════════════════════════════
//  בניית דשבורד ביצועים
// ═══════════════════════════════════════════
function setupDashboard() {
  var ss = SpreadsheetApp.openById(REPORTS_SHEET_ID);
  _createBudgetTab(ss);
  _createDashTab(ss, "דשבורד - חודש",  "מתחילת החודש עד אתמול", "חודש");
  _createDashTab(ss, "דשבורד - אתמול", "סטטוס אתמול",           "אתמול");
  _createDashTab(ss, "דשבורד - היום",  "סטטוס היום",             "היום");
  SpreadsheetApp.getUi().alert("✅ הדשבורד נוצר בהצלחה!\n\nנפתחו 4 טאבים חדשים:\n• תקציבים\n• דשבורד - חודש\n• דשבורד - אתמול\n• דשבורד - היום\n\nתאים צהובים = עדכון פייסבוק ידני");
}

function _createBudgetTab(ss) {
  var sh = ss.getSheetByName("תקציבים");
  if (!sh) sh = ss.insertSheet("תקציבים");
  sh.clearContents();
  sh.setRightToLeft(true);

  sh.getRange(1, 1, 1, 4).setValues([["פרויקט", "מדיה", "ערוץ", "תקציב חודשי ₪"]])
    .setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");

  sh.getRange(2, 1, BUDGETS_DATA.length, 4).setValues(BUDGETS_DATA);
  sh.getRange(2, 4, BUDGETS_DATA.length, 1).setNumberFormat("₪#,##0");
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, 4);
}

function _createDashTab(ss, tabName, googleSrcTab, fbKey) {
  var sh = ss.getSheetByName(tabName);
  if (!sh) sh = ss.insertSheet(tabName);

  // שמור ערכי פייסבוק קיימים לפני ניקוי
  var savedFb = {};
  if (sh.getLastRow() > 1) {
    var existing = sh.getRange(2, 1, sh.getLastRow() - 1, 9).getValues();
    existing.forEach(function(row) {
      if (row[1] === "פייסבוק" && (row[4] || row[7])) {
        savedFb[row[0] + "|" + row[2]] = [row[4], row[7]];
      }
    });
  }

  sh.clearContents();
  sh.setRightToLeft(true);

  var COLS = ["פרויקט", "מדיה", "ערוץ", "תקציב", "הוצאה", "% ניצול", "יתרה", "לידים", "עלות לליד"];
  sh.getRange(1, 1, 1, COLS.length).setValues([COLS])
    .setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
  sh.setFrozenRows(1);

  var fbData = FB_INITIAL[fbKey] || {};
  var dataRow = 2;
  var lastProject = "";

  DASH_ROWS.forEach(function(cfg) {
    var r       = dataRow;
    var isGoogle = cfg.media === "גוגל";
    var fbKey2  = cfg.project + "|" + cfg.channel;

    // עמודות בסיס
    sh.getRange(r, 1).setValue(cfg.project);
    sh.getRange(r, 2).setValue(cfg.media);
    sh.getRange(r, 3).setValue(cfg.channel);

    // תקציב — SUMIFS מטאב תקציבים
    sh.getRange(r, 4).setFormula(
      "=IFERROR(SUMIFS('תקציבים'!D:D,'תקציבים'!A:A,A" + r + ",'תקציבים'!B:B,B" + r + ",'תקציבים'!C:C,C" + r + "),0)"
    ).setNumberFormat("₪#,##0");

    if (isGoogle) {
      // הוצאה ולידים — SUMIFS מטאב גוגל
      sh.getRange(r, 5).setFormula(
        "=IFERROR(SUMIFS('" + googleSrcTab + "'!D:D,'" + googleSrcTab + "'!A:A,A" + r + ",'" + googleSrcTab + "'!C:C,C" + r + "),0)"
      );
      sh.getRange(r, 8).setFormula(
        "=IFERROR(SUMIFS('" + googleSrcTab + "'!E:E,'" + googleSrcTab + "'!A:A,A" + r + ",'" + googleSrcTab + "'!C:C,C" + r + "),0)"
      );
    } else {
      // פייסבוק — תא צהוב לעדכון ידני
      var savedVals = savedFb[fbKey2] || fbData[fbKey2] || [0, 0];
      sh.getRange(r, 5).setValue(savedVals[0]).setBackground("#fff9c4");
      sh.getRange(r, 8).setValue(savedVals[1]).setBackground("#fff9c4");
    }

    sh.getRange(r, 5).setNumberFormat("₪#,##0");

    // % ניצול
    sh.getRange(r, 6).setFormula(
      '=IF(AND(D' + r + '>0,E' + r + '>0),TEXT(E' + r + '/D' + r + ',"0%"),"-")'
    );

    // יתרה
    sh.getRange(r, 7).setFormula("=D" + r + "-E" + r).setNumberFormat("₪#,##0");

    // עלות לליד
    sh.getRange(r, 9).setFormula(
      '=IF(H' + r + '>0,ROUND(E' + r + '/H' + r + ',0),"-")'
    ).setNumberFormat("₪#,##0");

    // צבע שורה לפי מדיה
    if (isGoogle) {
      sh.getRange(r, 1, 1, COLS.length).setBackground("#e8f5e9"); // ירוק בהיר לגוגל
    }

    // קו מפריד בין פרויקטים
    if (lastProject && lastProject !== cfg.project) {
      sh.getRange(r, 1, 1, COLS.length).setBorder(true, null, null, null, null, null, "#666666", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    }
    lastProject = cfg.project;

    dataRow++;
  });

  // שורת סיכום
  var tr = dataRow;
  var lastDataRow = dataRow - 1;
  sh.getRange(tr, 1, 1, COLS.length).setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
  sh.getRange(tr, 3).setValue('סה"כ');
  sh.getRange(tr, 4).setFormula("=SUM(D2:D" + lastDataRow + ")").setNumberFormat("₪#,##0");
  sh.getRange(tr, 5).setFormula("=SUM(E2:E" + lastDataRow + ")").setNumberFormat("₪#,##0");
  sh.getRange(tr, 6).setFormula(
    '=IF(D' + tr + '>0,TEXT(E' + tr + '/D' + tr + ',"0%"),"-")'
  );
  sh.getRange(tr, 7).setFormula("=D" + tr + "-E" + tr).setNumberFormat("₪#,##0");
  sh.getRange(tr, 8).setFormula("=SUM(H2:H" + lastDataRow + ")");
  sh.getRange(tr, 9).setFormula(
    '=IF(H' + tr + '>0,ROUND(E' + tr + '/H' + tr + ',0),"-")'
  ).setNumberFormat("₪#,##0");

  sh.autoResizeColumns(1, COLS.length);
}
