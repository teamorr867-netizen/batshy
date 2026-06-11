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
  IMAGE_URL:   15,  // תמונה ריבוע (פיד)
  STORY_URL:   16,  // תמונה סטורי 9:16
  DEST_URL:    17,  // קישור יעד
  CTA:         18,  // LEARN_MORE וכו'
  ACCOUNT:     19,  // חשבון פרסום
  PAGE:        20,  // דף פייסבוק
  // פלט (ממולא אוטומטית):
  STATUS:      21,
  CAMP_ID:     22,
  ADSET_ID:    23,
  AD_ID:       24
};
var NCOLS = 24;

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
  return name;
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
  return m[p] || {};
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

// ─── בניית creative עם שתי תמונות (ריבוע + סטורי) ───
function buildCreativeMulti(acc, pageId, adName, headline, text, destUrl, cta, squareHash, storyHash) {
  var images = [];
  var rules  = [];

  if (squareHash) {
    images.push({ hash: squareHash, adlabels: [{ name: 'square' }] });
    rules.push({
      customization_spec: {
        publisher_platforms: ['facebook','instagram'],
        facebook_positions: ['feed'],
        instagram_positions: ['stream']
      },
      image_label: { name: 'square' }
    });
  }
  if (storyHash) {
    images.push({ hash: storyHash, adlabels: [{ name: 'story' }] });
    rules.push({
      customization_spec: {
        publisher_platforms: ['facebook','instagram'],
        facebook_positions: ['story'],
        instagram_positions: ['story']
      },
      image_label: { name: 'story' }
    });
  }

  var assetFeedSpec = {
    images: images,
    titles: [{ text: headline || '' }],
    bodies: [{ text: text || '' }],
    link_urls: [{ website_url: destUrl }],
    call_to_action_types: [cta],
    asset_customization_rules: rules
  };

  return metaPost(acc + '/adcreatives', {
    name: adName + '_creative',
    asset_feed_spec: JSON.stringify(assetFeedSpec)
  });
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
      var campName  = String(v[C.CAMP_NAME - 1] || '').trim();
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
    var adName   = String(v[C.AD_NAME  - 1] || '').trim();
    var headline = String(v[C.HEADLINE - 1] || '').trim();
    var text     = String(v[C.TEXT     - 1] || '').trim();
    var imageUrl = String(v[C.IMAGE_URL - 1] || '').trim();
    var storyUrl = String(v[C.STORY_URL - 1] || '').trim();
    var destUrl  = String(v[C.DEST_URL  - 1] || '').trim();
    var cta      = String(v[C.CTA       - 1] || 'LEARN_MORE').trim();

    if (!adName)              { setStatus(sheet, row, '❌ חסר שם מודעה'); return; }
    if (!imageUrl && !storyUrl) { setStatus(sheet, row, '❌ חסר URL תמונה'); return; }
    if (!destUrl)             { setStatus(sheet, row, '❌ חסר URL יעד'); return; }

    var squareHash = null;
    var storyHash  = null;

    if (imageUrl) {
      setStatus(sheet, row, '⏳ מעלה תמונת ריבוע...');
      squareHash = uploadImage(imageUrl, accountRaw);
    }
    if (storyUrl) {
      setStatus(sheet, row, '⏳ מעלה תמונת סטורי...');
      storyHash = uploadImage(storyUrl, accountRaw);
    }

    setStatus(sheet, row, '⏳ יוצר creative...');
    var creative;

    if (squareHash && storyHash) {
      // שתי תמונות — creative מותאם לכל placement
      creative = buildCreativeMulti(acc, pageId, adName, headline, text, destUrl, cta, squareHash, storyHash);
    } else {
      // תמונה אחת — creative רגיל
      creative = metaPost(acc + '/adcreatives', {
        name: adName + '_creative',
        object_story_spec: JSON.stringify({
          page_id: pageId,
          link_data: {
            image_hash:    squareHash || storyHash,
            link:          destUrl,
            message:       text,
            name:          headline,
            call_to_action: { type: cta, value: { link: destUrl } }
          }
        })
      });
    }

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
function pauseCampaign()   { toggleCampaign('PAUSED'); }
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
  cfg.getRange('A1:A100').setTextDirection(SpreadsheetApp.TextDirection.RIGHT_TO_LEFT);
  cfg.getRange('B1').setTextDirection(SpreadsheetApp.TextDirection.LEFT_TO_RIGHT);

  // ── חשבונות ──
  var acc = ss.getSheetByName('חשבונות') || ss.insertSheet('חשבונות');
  acc.getRange(1,1,1,4).setValues([['שם חשבון','Account ID','שם דף','Page ID']]);
  acc.getRange(1,1,1,4).setFontWeight('bold').setBackground('#1a237e').setFontColor('white');
  acc.getRange(1, 1, 201, 4).setTextDirection(SpreadsheetApp.TextDirection.RIGHT_TO_LEFT);
  acc.getRange(1, 2, 201, 1).setTextDirection(SpreadsheetApp.TextDirection.LEFT_TO_RIGHT);
  acc.getRange(1, 4, 201, 1).setTextDirection(SpreadsheetApp.TextDirection.LEFT_TO_RIGHT);

  // ── קמפיינים ──
  var camp = ss.getSheetByName('קמפיינים');
  if (!camp) {
    var allSheets = ss.getSheets();
    for (var si = 0; si < allSheets.length; si++) {
      var sName = allSheets[si].getName();
      if (sName.indexOf('גיליון') >= 0 || sName.indexOf('Sheet') >= 0) {
        allSheets[si].setName('קמפיינים');
        camp = allSheets[si];
        break;
      }
    }
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
    'שם מודעה','כותרת','טקסט',
    'URL ריבוע (פיד)','URL סטורי (9:16)',
    'URL יעד','CTA',
    'חשבון פרסום','דף',
    'סטטוס','Campaign ID','Adset ID','Ad ID'
  ];
  camp.getRange(1,1,1,headers.length).setValues([headers]);
  camp.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#1a237e').setFontColor('white');
  camp.setFrozenRows(1);

  // ── כיוון טקסט ──
  camp.getRange(1, 1, 201, NCOLS).setTextDirection(SpreadsheetApp.TextDirection.RIGHT_TO_LEFT);
  camp.getRange(1, C.IMAGE_URL, 201, 2).setTextDirection(SpreadsheetApp.TextDirection.LEFT_TO_RIGHT);
  camp.getRange(1, C.DEST_URL,  201, 1).setTextDirection(SpreadsheetApp.TextDirection.LEFT_TO_RIGHT);
  camp.getRange(1, C.CAMP_ID,  201, 3).setTextDirection(SpreadsheetApp.TextDirection.LEFT_TO_RIGHT);

  // ── צבע עמודות פלט ──
  camp.getRange(1, C.STATUS, 1, 4).setBackground('#e8f5e9');
  camp.getRange(2, C.STATUS, 200, 4).setBackground('#f1f8e9');

  // ── Dropdowns ──
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

  SpreadsheetApp.getUi().alert('✅ הגיליונות נוצרו!\n\nעכשיו:\n1. הכנס Access Token בגיליון "הגדרות" תא B1\n2. לחץ Meta Ads ← רענן חשבונות\n3. מלא נתונים ולחץ "העלה שורה"');
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
    .addToUi();
}
