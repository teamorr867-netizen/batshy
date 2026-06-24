// ===== Google Ads Script — דשבורד ביצועים =====
// מריץ ב: Google Ads → כלים → סקריפטים
// כותב ל: Google Sheets (SHEET_ID)
// תזמון: יומי בשעת חצות

var SHEET_ID = "1mAlhNPZnIp6wvavmwv5BPB0XMFLUiFkABO35XmKu9Ac";

// Customer ID (ללא מקפים) → שם פרויקט
var PROJECTS = {
  "5330883146": "מיסדאון",
  "6104516290": "בית הנערה",
  "8681658800": "שי",
  "9577056552": "דובמב",
  "8782961272": "וום",
  "2012344431": "ריבנו",
  "5231492870": "מותג"
};

// Campaign ID → ערוץ (מותג / גנרי / וכו')
// הוסף כאן Campaign IDs של כל הפרויקטים
var CAMPAIGN_MAP = {
  "23384565774": "מותג",   // מיסדאון — גוגל מותג
  "23393919742": "גנרי"    // מיסדאון — גוגל גנרי
};

// ─────────────────────────────────────────
function main() {
  var today = new Date();
  var yest  = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  var first = new Date(today.getFullYear(), today.getMonth(), 1);
  var ss    = SpreadsheetApp.openById(SHEET_ID);

  buildSheet(ss, "מתחילת החודש עד אתמול", fmt(first), fmt(yest));
  buildSheet(ss, "סטטוס אתמול",           fmt(yest),  fmt(yest));
  buildSheet(ss, "סטטוס היום",            fmt(today), fmt(today));
}

function buildSheet(ss, name, since, until) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  sh.setRightToLeft(true);

  var headers = ["פרויקט", "שם קמפיין", "ערוץ", "הוצאה ₪", "לידים", "עלות לליד ₪", "עודכן"];
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");

  var updated = Utilities.formatDate(new Date(), "Asia/Jerusalem", "dd/MM/yyyy HH:mm");
  var rows = [];

  var query =
    "SELECT campaign.id, campaign.name, metrics.cost_micros, metrics.conversions " +
    "FROM campaign WHERE campaign.status = 'ENABLED' " +
    "AND metrics.impressions > 0 " +
    "AND segments.date BETWEEN '" + since + "' AND '" + until + "'";

  if (typeof MccApp !== "undefined") {
    var iter = MccApp.accounts().get();
    while (iter.hasNext()) {
      MccApp.select(iter.next());
      fetchRows(query, updated, rows);
    }
  } else {
    fetchRows(query, updated, rows);
  }

  if (rows.length > 0) {
    sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
    sh.getRange(2, 4, rows.length, 1).setNumberFormat("₪#,##0");
    sh.getRange(2, 6, rows.length, 1).setNumberFormat("₪#,##0");
  }

  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, headers.length);
}

function fetchRows(query, updated, rows) {
  var custId  = AdsApp.currentAccount().getCustomerId().replace(/-/g, "");
  var project = PROJECTS[custId] || AdsApp.currentAccount().getName();
  var result  = AdsApp.search(query);

  while (result.hasNext()) {
    var r       = result.next();
    var campId  = r.campaign.id;
    var channel = CAMPAIGN_MAP[campId] || "";
    var cost    = r.metrics.costMicros / 1000000;
    var conv    = parseFloat(r.metrics.conversions) || 0;
    var cpl     = conv > 0 ? Math.round(cost / conv) : 0;
    rows.push([project, r.campaign.name, channel, Math.round(cost), Math.round(conv), cpl, updated]);
  }
}

function fmt(d) {
  return d.getFullYear() + "-" +
    ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
    ("0" + d.getDate()).slice(-2);
}
