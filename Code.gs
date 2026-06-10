// ===== META ADS - Google Sheets Integration =====

const API_VERSION = 'v21.0';
const BASE_URL = 'https://graph.facebook.com/' + API_VERSION;

const COL = {
  CAMP_NAME: 1, OBJECTIVE: 2,
  ADSET_NAME: 3, DAILY_BUDGET: 4, START_DATE: 5, END_DATE: 6,
  PLACEMENT: 7, COUNTRIES_INCLUDE: 8, COUNTRIES_EXCLUDE: 9,
  CITIES_INCLUDE: 10, CITIES_EXCLUDE: 11,
  AGE_MIN: 12, AGE_MAX: 13, GENDER: 14,
  INTERESTS: 15, CUSTOM_AUDIENCES: 16,
  AD_NAME: 17, HEADLINE: 18, PRIMARY_TEXT: 19, DEST_URL: 20, IMAGE_URL: 21, CTA: 22,
  ACCOUNT: 23, PAGE: 24,
  STATUS: 25, OUT_CAMP_ID: 26, OUT_ADSET_ID: 27, OUT_AD_ID: 28
};
const TOTAL_COLS = 28;

// תמיד מחזיר act_XXXXXXX — בלי כפל
function actId(id) {
  return 'act_' + String(id || '').replace(/^act_/i, '').trim();
}

function getToken() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('הגדרות');
  if (!sheet) throw new Error('גיליון "הגדרות" לא נמצא');
  const token = sheet.getRange('B1').getValue();
  if (!token) throw new Error('לא הוזן Meta Access Token!');
  return String(token).trim();
}

function lookupAccountId(accountName) {
  if (!accountName) return null;
  const name = String(accountName).trim();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('חשבונות');
  if (sheet && sheet.getLastRow() > 1) {
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === name) return String(data[i][1]).trim();
    }
  }
  return name;
}

function lookupPageId(pageName) {
  if (!pageName) return null;
  const name = String(pageName).trim();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('חשבונות');
  if (sheet && sheet.getLastRow() > 1) {
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][2]).trim() === name) return String(data[i][3]).trim();
    }
  }
  return name;
}

function metaPost(endpoint, params) {
  const token = getToken();
  const url = BASE_URL + '/' + endpoint;
  const payload = Object.assign({ access_token: token }, params);
  const response = UrlFetchApp.fetch(url, { method: 'post', payload: payload, muteHttpExceptions: true });
  const result = JSON.parse(response.getContentText());
  Logger.log('POST /' + endpoint + ' → ' + JSON.stringify(result).substring(0, 300));
  return result;
}

function metaGet(endpoint, params) {
  const token = getToken();
  const allParams = Object.assign({ access_token: token }, params || {});
  const qs = Object.keys(allParams).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(allParams[k])).join('&');
  const url = BASE_URL + '/' + endpoint + '?' + qs;
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const result = JSON.parse(response.getContentText());
  Logger.log('GET /' + endpoint + ' → ' + JSON.stringify(result).substring(0, 300));
  return result;
}

function buildTimestamp(dateRaw, timeVal) {
  if (!dateRaw) return null;
  const d = (dateRaw instanceof Date) ? new Date(dateRaw.getTime()) : new Date(dateRaw);
  if (isNaN(d.getTime())) return null;
  let hours = 0, minutes = 0;
  if (timeVal !== null && timeVal !== undefined && timeVal !== '') {
    if (typeof timeVal === 'number') {
      const totalMinutes = Math.round(timeVal * 24 * 60);
      hours = Math.floor(totalMinutes / 60);
      minutes = totalMinutes % 60;
    } else if (timeVal instanceof Date) {
      hours = timeVal.getHours();
      minutes = timeVal.getMinutes();
    } else {
      const parts = String(timeVal).split(':');
      hours = parseInt(parts[0]) || 0;
      minutes = parseInt(parts[1]) || 0;
    }
  }
  d.setHours(hours, minutes, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function cleanTargeting(targeting) {
  if (!targeting) return { geo_locations: { countries: ['IL'] } };
  const allowedKeys = [
    'geo_locations', 'excluded_geo_locations',
    'age_min', 'age_max', 'genders',
    'flexible_spec', 'exclusions',
    'publisher_platforms', 'facebook_positions', 'instagram_positions',
    'audience_network_positions', 'messenger_positions',
    'device_platforms', 'user_os', 'user_device',
    'custom_audiences', 'excluded_custom_audiences',
    'locales', 'interests', 'behaviors',
    'relationship_statuses', 'life_events', 'industries',
    'income', 'net_worth', 'home_type', 'home_ownership'
  ];
  const cleaned = {};
  for (const key of allowedKeys) {
    if (targeting[key] !== undefined) cleaned[key] = targeting[key];
  }
  if (!cleaned.geo_locations) cleaned.geo_locations = { countries: ['IL'] };
  return cleaned;
}

function setStatus(sheet, row, msg) {
  sheet.getRange(row, COL.STATUS).setValue(msg);
  SpreadsheetApp.flush();
}

function setDupStatus(sheet, row, msg) {
  sheet.getRange(row, 8).setValue(msg);
  SpreadsheetApp.flush();
}

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
    .addItem('🔗 בדוק חיבור', 'testConnection')
    .addToUi();
}

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName('הגדרות') || ss.insertSheet('הגדרות');
  s.getRange('A1').setValue('Meta Access Token:').setFontWeight('bold');
  s.getRange('B1').setValue('');
  s.setColumnWidth(1, 180); s.setColumnWidth(2, 600);

  s = ss.getSheetByName('חשבונות') || ss.insertSheet('חשבונות');
  s.getRange(1, 1, 1, 4).setValues([['שם חשבון', 'Account ID', 'שם דף', 'Page ID']]);
  s.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#4a4a8a').setFontColor('white');

  const existingCamp = ss.getSheetByName('קמפיינים');
  if (existingCamp) ss.deleteSheet(existingCamp);
  s = ss.insertSheet('קמפיינים');
  const ch = ['שם קמפיין','מטרה','שם אד-סט','תקציב יומי (₪)','תאריך התחלה','תאריך סיום','Placement','מדינות לכלול','מדינות להחריג','ערים לכלול','ערים להחריג','גיל מינ','גיל מקס','מגדר','תחומי עניין','קהלים מותאמים','שם מודעה','כותרת','טקסט ראשי','URL יעד','URL תמונה','CTA','חשבון פרסום','דף','סטטוס','Campaign ID','Adset ID','Ad ID'];
  s.getRange(1, 1, 1, ch.length).setValues([ch]);
  s.getRange(1, 1, 1, ch.length).setFontWeight('bold').setBackground('#4a4a8a').setFontColor('white');
  s.setFrozenRows(1);
  s.getRange(2, COL.OBJECTIVE, 100).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['OUTCOME_TRAFFIC','OUTCOME_AWARENESS','OUTCOME_ENGAGEMENT','OUTCOME_LEADS','OUTCOME_SALES','OUTCOME_APP_PROMOTION'], true).build());
  s.getRange(2, COL.PLACEMENT, 100).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['AUTOMATIC','FACEBOOK_FEEDS','INSTAGRAM_FEEDS','FACEBOOK_AND_INSTAGRAM','STORIES','REELS'], true).build());
  s.getRange(2, COL.GENDER, 100).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['ALL','MALE','FEMALE'], true).build());
  s.getRange(2, COL.CTA, 100).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['LEARN_MORE','SHOP_NOW','SIGN_UP','BOOK_TRAVEL','DOWNLOAD','CONTACT_US','GET_QUOTE','SUBSCRIBE','WATCH_MORE'], true).build());
  s.getRange(2, TOTAL_COLS - 2, 100, 3).setBackground('#e8f0fe');

  s = ss.getSheetByName('שכפול') || ss.insertSheet('שכפול');
  const dh = ['Campaign ID לשכפול','שם חדש לקמפיין','חשבון פרסום','תאריך התחלה','שעת התחלה (HH:MM)','תאריך סיום','שעת סיום (HH:MM)','סטטוס','Campaign ID חדש'];
  s.getRange(1, 1, 1, dh.length).setValues([dh]);
  s.getRange(1, 1, 1, dh.length).setFontWeight('bold').setBackground('#4a4a8a').setFontColor('white');
  s.setFrozenRows(1);
  Logger.log('setupSheets הושלם!');
}

function refreshAccountsList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('חשבונות');
  const accountsResp = metaGet('me/adaccounts', { fields: 'id,name', limit: 500 });
  const accounts = accountsResp.data || [];
  const pagesResp = metaGet('me/accounts', { fields: 'id,name', limit: 500 });
  const pages = pagesResp.data || [];
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).clearContent();
  const maxRows = Math.max(accounts.length, pages.length);
  if (maxRows > 0) {
    const rows = [];
    for (let i = 0; i < maxRows; i++) {
      rows.push([accounts[i] ? accounts[i].name : '', accounts[i] ? accounts[i].id : '', pages[i] ? pages[i].name : '', pages[i] ? pages[i].id : '']);
    }
    sheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }
  updateDropdowns(accounts.map(a => a.name), pages.map(p => p.name));
  SpreadsheetApp.getUi().alert('✅ עודכנו ' + accounts.length + ' חשבונות ו-' + pages.length + ' דפים');
}

function updateDropdowns(accountNames, pageNames) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const campSheet = ss.getSheetByName('קמפיינים');
  const dupSheet = ss.getSheetByName('שכפול');
  if (accountNames && accountNames.length > 0) {
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(accountNames, true).build();
    campSheet.getRange(2, COL.ACCOUNT, 100).setDataValidation(rule);
    dupSheet.getRange(2, 3, 100).setDataValidation(rule);
  }
  if (pageNames && pageNames.length > 0) {
    campSheet.getRange(2, COL.PAGE, 100).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(pageNames, true).build());
  }
}

function getPlacementTargeting(placement) {
  const p = String(placement || '').toUpperCase();
  if (p === 'AUTOMATIC' || !p) return {};
  const map = {
    'FACEBOOK_FEEDS': { facebook_positions: ['feed'], publisher_platforms: ['facebook'] },
    'INSTAGRAM_FEEDS': { instagram_positions: ['stream'], publisher_platforms: ['instagram'] },
    'FACEBOOK_AND_INSTAGRAM': { facebook_positions: ['feed'], instagram_positions: ['stream'], publisher_platforms: ['facebook','instagram'] },
    'STORIES': { facebook_positions: ['story'], instagram_positions: ['story'], publisher_platforms: ['facebook','instagram'] },
    'REELS': { facebook_positions: ['facebook_reels'], instagram_positions: ['reels'], publisher_platforms: ['facebook','instagram'] }
  };
  return map[p] || {};
}

function buildTargeting(values) {
  const targeting = {};
  const ageMin = values[COL.AGE_MIN - 1], ageMax = values[COL.AGE_MAX - 1];
  if (ageMin) targeting.age_min = parseInt(ageMin);
  if (ageMax) targeting.age_max = parseInt(ageMax);
  const gender = String(values[COL.GENDER - 1] || '').toUpperCase();
  if (gender === 'MALE') targeting.genders = [1];
  else if (gender === 'FEMALE') targeting.genders = [2];
  const countriesInclude = String(values[COL.COUNTRIES_INCLUDE - 1] || '').trim();
  const countriesExclude = String(values[COL.COUNTRIES_EXCLUDE - 1] || '').trim();
  if (countriesInclude) targeting.geo_locations = { countries: countriesInclude.split(',').map(c => c.trim().toUpperCase()).filter(c => c) };
  if (countriesExclude) targeting.excluded_geo_locations = { countries: countriesExclude.split(',').map(c => c.trim().toUpperCase()).filter(c => c) };
  const citiesInclude = String(values[COL.CITIES_INCLUDE - 1] || '').trim();
  if (citiesInclude) {
    const cityObjs = citiesInclude.split(',').map(c => c.trim()).filter(c => c).map(city => { const key = searchCity(city); return key ? { key: key } : null; }).filter(c => c);
    if (cityObjs.length > 0) { if (!targeting.geo_locations) targeting.geo_locations = {}; targeting.geo_locations.cities = cityObjs; }
  }
  const interestsRaw = String(values[COL.INTERESTS - 1] || '').trim();
  if (interestsRaw) {
    const flexSpec = interestsRaw.split(',').map(i => i.trim()).filter(i => i).map(interest => { const id = searchInterest(interest); return id ? { id: id, name: interest } : null; }).filter(i => i);
    if (flexSpec.length > 0) targeting.flexible_spec = [{ interests: flexSpec }];
  }
  Object.assign(targeting, getPlacementTargeting(values[COL.PLACEMENT - 1]));
  if (!targeting.geo_locations) targeting.geo_locations = { countries: ['IL'] };
  return targeting;
}

function searchInterest(name) {
  try { const resp = metaGet('search', { type: 'adinterest', q: name, limit: 5 }); if (resp.data && resp.data.length > 0) return resp.data[0].id; } catch (e) {}
  return null;
}

function searchCity(name) {
  try { const resp = metaGet('search', { type: 'adgeolocation', q: name, location_types: '["city"]', limit: 5 }); if (resp.data && resp.data.length > 0) return resp.data[0].key; } catch (e) {}
  return null;
}

function getOptimizationGoal(objective) {
  const map = { 'OUTCOME_TRAFFIC': 'LINK_CLICKS', 'OUTCOME_AWARENESS': 'REACH', 'OUTCOME_ENGAGEMENT': 'POST_ENGAGEMENT', 'OUTCOME_LEADS': 'LEAD_GENERATION', 'OUTCOME_SALES': 'OFFSITE_CONVERSIONS', 'OUTCOME_APP_PROMOTION': 'APP_INSTALLS' };
  return map[String(objective).toUpperCase()] || 'LINK_CLICKS';
}

function uploadImageFromUrl(imageUrl, accountId) {
  const resp = metaPost(actId(accountId) + '/adimages', { url: imageUrl });
  if (resp.images) { const keys = Object.keys(resp.images); if (keys.length > 0) return resp.images[keys[0]].hash; }
  throw new Error('שגיאה בהעלאת תמונה: ' + JSON.stringify(resp));
}

function uploadSelectedRow() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('קמפיינים');
  if (!sheet) { SpreadsheetApp.getUi().alert('❌ לא נמצא גיליון "קמפיינים"'); return; }
  const row = sheet.getActiveCell().getRow();
  if (row < 2) { SpreadsheetApp.getUi().alert('❌ יש לבחור שורה עם נתונים'); return; }
  const values = sheet.getRange(row, 1, 1, TOTAL_COLS).getValues()[0];
  const rawAccountId = lookupAccountId(values[COL.ACCOUNT - 1]);
  const pageId = lookupPageId(values[COL.PAGE - 1]);
  if (!rawAccountId) { setStatus(sheet, row, '❌ לא נמצא חשבון: ' + values[COL.ACCOUNT - 1]); return; }
  if (!pageId) { setStatus(sheet, row, '❌ לא נמצא דף: ' + values[COL.PAGE - 1]); return; }
  const accountEndpoint = actId(rawAccountId);
  try {
    const campName = values[COL.CAMP_NAME - 1], objective = values[COL.OBJECTIVE - 1] || 'OUTCOME_TRAFFIC';
    if (!campName) { setStatus(sheet, row, '❌ חסר שם קמפיין'); return; }
    setStatus(sheet, row, '⏳ יוצר קמפיין...');
    const campResp = metaPost(accountEndpoint + '/campaigns', { name: campName, objective: objective, status: 'PAUSED', special_ad_categories: '[]' });
    if (campResp.error) { setStatus(sheet, row, '❌ ' + campResp.error.message); return; }
    const campaignId = campResp.id;
    sheet.getRange(row, COL.OUT_CAMP_ID).setValue(campaignId);

    const adsetName = values[COL.ADSET_NAME - 1], dailyBudget = values[COL.DAILY_BUDGET - 1];
    if (!adsetName) { setStatus(sheet, row, '❌ חסר שם אד-סט'); return; }
    if (!dailyBudget) { setStatus(sheet, row, '❌ חסר תקציב יומי'); return; }
    setStatus(sheet, row, '⏳ יוצר אד-סט...');
    const adsetParams = { name: adsetName, campaign_id: campaignId, daily_budget: Math.round(parseFloat(dailyBudget) * 100), billing_event: 'IMPRESSIONS', optimization_goal: getOptimizationGoal(objective), targeting: JSON.stringify(buildTargeting(values)), status: 'PAUSED' };
    const startTs = buildTimestamp(values[COL.START_DATE - 1], '00:00');
    const endTs = buildTimestamp(values[COL.END_DATE - 1], '23:59');
    if (startTs) adsetParams.start_time = startTs;
    if (endTs) adsetParams.end_time = endTs;
    const adsetResp = metaPost(accountEndpoint + '/adsets', adsetParams);
    if (adsetResp.error) { setStatus(sheet, row, '❌ ' + adsetResp.error.message); return; }
    const adsetId = adsetResp.id;
    sheet.getRange(row, COL.OUT_ADSET_ID).setValue(adsetId);
    const adName = values[COL.AD_NAME - 1], headline = values[COL.HEADLINE - 1], primaryText = values[COL.PRIMARY_TEXT - 1];
    const destUrl = values[COL.DEST_URL - 1], imageUrl = values[COL.IMAGE_URL - 1], cta = values[COL.CTA - 1] || 'LEARN_MORE';
    if (!adName) { setStatus(sheet, row, '❌ חסר שם מודעה'); return; }
    if (!imageUrl) { setStatus(sheet, row, '❌ חסר URL תמונה'); return; }
    if (!destUrl) { setStatus(sheet, row, '❌ חסר URL יעד'); return; }
    setStatus(sheet, row, '⏳ מעלה תמונה...');
    const imageHash = uploadImageFromUrl(imageUrl, rawAccountId);
    setStatus(sheet, row, '⏳ יוצר creative...');
    const creativeResp = metaPost(accountEndpoint + '/adcreatives', { name: adName + ' - Creative', object_story_spec: JSON.stringify({ page_id: pageId, link_data: { image_hash: imageHash, link: destUrl, message: primaryText || '', name: headline || '', call_to_action: { type: cta, value: { link: destUrl } } } }) });
    if (creativeResp.error) { setStatus(sheet, row, '❌ ' + creativeResp.error.message); return; }
    setStatus(sheet, row, '⏳ יוצר מודעה...');
    const adResp = metaPost(accountEndpoint + '/ads', { name: adName, adset_id: adsetId, creative: JSON.stringify({ creative_id: creativeResp.id }), status: 'PAUSED' });
    if (adResp.error) { setStatus(sheet, row, '❌ ' + adResp.error.message); return; }
    sheet.getRange(row, COL.OUT_AD_ID).setValue(adResp.id);
    setStatus(sheet, row, '✅ הועלה בהצלחה!');
  } catch (e) { setStatus(sheet, row, '❌ ' + e.message); }
}

function duplicateCampaign() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('שכפול');
  const row = sheet.getActiveCell().getRow();
  if (row < 2) { setDupStatus(sheet, 2, '❌ יש לבחור שורה עם נתונים'); return; }

  const data = sheet.getRange(row, 1, 1, 7).getValues()[0];
  const sourceCampaignId = String(data[0]).trim();
  const newName = data[1], accountName = String(data[2] || '').trim();
  const startDateRaw = data[3], startTimeRaw = data[4], endDateRaw = data[5], endTimeRaw = data[6];

  if (!sourceCampaignId) { setDupStatus(sheet, row, '❌ חסר Campaign ID לשכפול'); return; }

  // מציאת account — אם לא נבחר בעמודה C, קח מהקמפיין המקורי
  let rawAccountId = accountName ? lookupAccountId(accountName) : null;
  if (!rawAccountId) {
    const campInfo = metaGet(sourceCampaignId, { fields: 'account_id' });
    if (campInfo.account_id) rawAccountId = campInfo.account_id;
  }
  if (!rawAccountId) { setDupStatus(sheet, row, '❌ לא נמצא חשבון — בחרי בעמודה C'); return; }

  // actId מונע act_act_ בכל מצב
  const accountEndpoint = actId(rawAccountId);
  Logger.log('accountEndpoint: ' + accountEndpoint);

  try {
    setDupStatus(sheet, row, '⏳ מביא אד-סטים...');
    const sourceAdsetsResp = metaGet(sourceCampaignId + '/adsets', { fields: 'id,name', limit: 100 });
    if (sourceAdsetsResp.error) { setDupStatus(sheet, row, '❌ ' + sourceAdsetsResp.error.message); return; }
    const sourceAdsets = sourceAdsetsResp.data || [];
    if (sourceAdsets.length === 0) { setDupStatus(sheet, row, '❌ לא נמצאו אד-סטים בקמפיין המקורי'); return; }

    setDupStatus(sheet, row, '⏳ משכפל קמפיין...');
    const campCopyParams = { status_option: 'PAUSED' };
    if (newName) campCopyParams.name = String(newName);
    const campCopyResp = metaPost(sourceCampaignId + '/copies', campCopyParams);
    if (!campCopyResp || campCopyResp.error) { setDupStatus(sheet, row, '❌ ' + (campCopyResp && campCopyResp.error ? campCopyResp.error.message : 'שגיאה')); return; }
    const newCampaignId = campCopyResp.copied_campaign_id || campCopyResp.id;
    if (!newCampaignId) { setDupStatus(sheet, row, '❌ לא התקבל ID קמפיין חדש'); return; }
    sheet.getRange(row, 9).setValue(newCampaignId);

    const startTs = buildTimestamp(startDateRaw, startTimeRaw);
    const endTs = buildTimestamp(endDateRaw, endTimeRaw);
    Logger.log('startTs=' + startTs + ' endTs=' + endTs);

    const errors = [];
    let successCount = 0;

    for (let i = 0; i < sourceAdsets.length; i++) {
      const adset = sourceAdsets[i];
      setDupStatus(sheet, row, '⏳ אד-סט ' + (i + 1) + '/' + sourceAdsets.length + '...');
      Utilities.sleep(1500);

      const adsetDetails = metaGet(adset.id, { fields: 'name,daily_budget,lifetime_budget,billing_event,optimization_goal,targeting,bid_amount,bid_strategy,destination_type,promoted_object' });
      if (adsetDetails.error) { errors.push('אד-סט ' + (i+1) + ': ' + adsetDetails.error.message); continue; }

      const newAdsetParams = {
        name: adsetDetails.name,
        campaign_id: newCampaignId,
        status: 'PAUSED',
        billing_event: adsetDetails.billing_event || 'IMPRESSIONS',
        optimization_goal: adsetDetails.optimization_goal,
        targeting: JSON.stringify(cleanTargeting(adsetDetails.targeting))
      };
      if (adsetDetails.daily_budget)    newAdsetParams.daily_budget    = adsetDetails.daily_budget;
      if (adsetDetails.lifetime_budget) newAdsetParams.lifetime_budget = adsetDetails.lifetime_budget;
      if (adsetDetails.bid_amount)      newAdsetParams.bid_amount      = adsetDetails.bid_amount;
      if (adsetDetails.destination_type) newAdsetParams.destination_type = adsetDetails.destination_type;
      if (adsetDetails.promoted_object)  newAdsetParams.promoted_object  = JSON.stringify(adsetDetails.promoted_object);
      if (startTs) newAdsetParams.start_time = startTs;
      if (endTs)   newAdsetParams.end_time   = endTs;

      // accountEndpoint כבר מכיל act_ בצורה נכונה
      const newAdsetResp = metaPost(accountEndpoint + '/adsets', newAdsetParams);
      if (!newAdsetResp || newAdsetResp.error) {
        const errMsg = newAdsetResp && newAdsetResp.error ? newAdsetResp.error.message : 'שגיאה';
        errors.push('אד-סט ' + (i+1) + ' (' + adsetDetails.name + '): ' + errMsg);
        Logger.log('נכשל אד-סט ' + (i+1) + ': ' + errMsg);
        Utilities.sleep(2000);
        continue;
      }

      const newAdsetId = newAdsetResp.id;
      Logger.log('אד-סט ' + (i+1) + ' נוצר: ' + newAdsetId);
      Utilities.sleep(1000);

      const adsResp = metaGet(adset.id + '/ads', { fields: 'name,creative{id}', limit: 50 });
      for (const ad of (adsResp.data || [])) {
        Utilities.sleep(1000);
        const newAdResp = metaPost(accountEndpoint + '/ads', { name: ad.name, adset_id: newAdsetId, creative: JSON.stringify({ creative_id: ad.creative.id }), status: 'PAUSED' });
        if (newAdResp.error) Logger.log('שגיאה במודעה: ' + newAdResp.error.message);
        else Logger.log('מודעה נוצרה: ' + newAdResp.id);
      }
      successCount++;
    }

    if (errors.length > 0) {
      setDupStatus(sheet, row, '⚠️ ' + successCount + '/' + sourceAdsets.length + ' הושלמו. שגיאות: ' + errors.join(' | '));
    } else {
      setDupStatus(sheet, row, '✅ הושלם! ' + successCount + '/' + sourceAdsets.length + ' אד-סטים');
    }
  } catch (e) { setDupStatus(sheet, row, '❌ ' + e.message); }
}

function changeCampaignStatus(newStatus) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('קמפיינים');
  const row = sheet.getActiveCell().getRow();
  if (row < 2) return;
  const campaignId = String(sheet.getRange(row, COL.OUT_CAMP_ID).getValue() || '').trim();
  if (!campaignId) { setStatus(sheet, row, '❌ לא נמצא Campaign ID — יש להעלות תחילה'); return; }
  try {
    const resp = metaPost(campaignId, { status: newStatus });
    setStatus(sheet, row, resp.error ? '❌ ' + resp.error.message : (newStatus === 'PAUSED' ? '⏸ מושהה' : '▶️ פעיל'));
  } catch (e) { setStatus(sheet, row, '❌ ' + e.message); }
}

function pauseCampaign()    { changeCampaignStatus('PAUSED'); }
function activateCampaign() { changeCampaignStatus('ACTIVE'); }

function testConnection() {
  try {
    const resp = metaGet('me', { fields: 'id,name' });
    SpreadsheetApp.getUi().alert(resp.name ? '✅ חיבור תקין!\nמחובר כ: ' + resp.name : '❌ שגיאה: ' + JSON.stringify(resp));
  } catch (e) { SpreadsheetApp.getUi().alert('❌ ' + e.message); }
}
