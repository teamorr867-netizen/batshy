// ===== LeadImWebhook.gs =====
// מדביקים בשיטס הדיווח → Extensions → Apps Script → קובץ חדש "LeadImWebhook"
// אחרי שמירה: פרסם → Deploy as web app → Anyone → קבל URL
// הדבק את ה-URL בlead.im → שידור לידים → Web Hook

var LEADS_TAB = "לידים CRM";

// מיפוי utm_platform → ערוץ בעברית
var PLATFORM_MAP = {
  "brd":                "מותג",
  "gnr":                "גנרי",
  "brand":              "מותג",
  "generic":            "גנרי"
};

// utm_source → מדיה
var SOURCE_MAP = {
  "Google":     "גוגל",
  "Facebook":   "פייסבוק",
  "FacebookM":  "פייסבוק"
};

// ─── מקבל Webhook מ-lead.im ───────────────────
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(LEADS_TAB);
    if (!sh) sh = _createLeadsTab(ss);

    var data = {};
    try {
      data = JSON.parse(e.postData.contents);
    } catch(err) {
      data = e.parameter || {};
    }

    var now = new Date(); // ערך תאריך אמיתי — מאפשר COUNTIFS בדשבורד

    // UTM fields שlead.im שולחת
    var utmSource   = _get(data, ["utm_source",       "source",   "מקור"]);
    var utmPlatform = _get(data, ["utm_platform",     "platform"]);
    var utmCampaign = _get(data, ["utm_campaignname", "utm_campaign", "campaign", "קמפיין"]);

    // גזור מדיה וערוץ
    var media   = SOURCE_MAP[utmSource]    || utmSource || "";
    var channel = PLATFORM_MAP[utmPlatform] || _resolveChannel(utmSource, utmPlatform);

    // פרויקט — lead.im יכולה לשלוח כשדה נסתר בטופס
    var project = _get(data, ["project", "פרויקט", "project_name"]);

    var row = [
      now,
      project,
      media,
      channel,
      utmCampaign,
      _get(data, ["name",  "שם",     "full_name",  "first_name"]),
      _get(data, ["phone", "טלפון",  "mobile",     "phone_number"]),
      _get(data, ["email", "אימייל", "mail"]),
      _get(data, ["status","סטטוס",  "lead_status"]),
      JSON.stringify(data)
    ];

    sh.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    Logger.log("Webhook error: " + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── GET לבדיקת חיבור ────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "lead.im webhook active" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── מיפוי ערוץ לפי source+platform ──────────
// Facebook = דף נחיתה, FacebookM = טופס ליד (Meta lead form)
function _resolveChannel(utmSource, utmPlatform) {
  if (!utmPlatform) return "";
  if (utmPlatform === "Facebook/instagram") {
    if (utmSource === "FacebookM") return "טופס ליד";
    return "דף נחיתה";
  }
  return utmPlatform;
}

// ─── יצירת טאב לידים ─────────────────────────
function _createLeadsTab(ss) {
  var sh = ss.insertSheet(LEADS_TAB);
  sh.setRightToLeft(true);
  var headers = ["תאריך קליטה", "פרויקט", "מדיה", "ערוץ", "קמפיין", "שם", "טלפון", "אימייל", "סטטוס", "נתונים גולמיים"];
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, headers.length - 1);
  return sh;
}

// ─── חיפוש ערך לפי שמות שדה אפשריים ──────────
function _get(data, keys) {
  for (var i = 0; i < keys.length; i++) {
    if (data[keys[i]] !== undefined && data[keys[i]] !== null && data[keys[i]] !== "") {
      return String(data[keys[i]]);
    }
  }
  return "";
}

// ─── ספירת לידים לפרויקט + ערוץ + טווח תאריכים ───
// משמש COUNTIFS מהדשבורד: col B=פרויקט, col D=ערוץ
function countLeads(project, channel, since, until) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(LEADS_TAB);
  if (!sh || sh.getLastRow() < 2) return 0;

  var data = sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues();
  var count = 0;
  var sinceDate = new Date(since);
  var untilDate = new Date(until);
  untilDate.setHours(23, 59, 59);

  data.forEach(function(row) {
    var dateStr = String(row[0]);
    var parts   = dateStr.split(/[\/\s:]/);
    if (parts.length < 3) return;
    var rowDate    = new Date(parts[2], parts[1] - 1, parts[0]);
    var rowProject = String(row[1]);
    var rowChannel = String(row[3]);
    if (rowDate >= sinceDate && rowDate <= untilDate &&
        rowProject === project && rowChannel === channel) count++;
  });

  return count;
}

// ─── בדיקת Webhook ידנית ──────────────────────
function testWebhook() {
  var fakeData = {
    postData: {
      contents: JSON.stringify({
        utm_source:      "FacebookM",
        utm_platform:    "Facebook/instagram",
        utm_campaignname:"701Qu000008Cya5IAC",
        project:         "מיסדאון",
        name:            "ישראל ישראלי",
        phone:           "050-1234567",
        email:           "test@test.com",
        status:          "חדש"
      })
    },
    parameter: {}
  };
  var result = doPost(fakeData);
  Logger.log("✅ תוצאה: " + result.getContent());
  Logger.log("ליד בדיקה נוסף לטאב: " + LEADS_TAB);
}
