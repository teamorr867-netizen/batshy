// ===== Dashboard.gs =====
// מדביקים קובץ זה בשיטס של הדיווח (לא בשיטס של יצירת קמפיינים)
// שלבים:
//   1. פתח שיטס הדיווח → Extensions → Apps Script
//   2. צור קובץ חדש בשם "Dashboard"
//   3. הדבק קוד זה → שמור
//   4. הרץ פונקציה: setupDashboard
//   5. אשר הרשאות גוגל
//   6. 3 טאבים נפתחים: דשבורד - חודש | דשבורד - אתמול | דשבורד - היום

// ═══════════════════════════════════════════
//  קונפיגורציה — ערכי ברירת מחדל ראשוניים
//  (אחרי הרצה ראשונה עורכים ישירות בתאים הצהובים בשיטס)
// ═══════════════════════════════════════════

// שורות לפי פרויקט: הוסף כאן שורות לשאר הפרויקטים כשתהיה מוכנה
// { project, media, channel, budget }
var DASH_CONFIG = [
  { project: "מיסדאון", media: "גוגל",    channel: "מותג",      budget: 4500  },
  { project: "מיסדאון", media: "גוגל",    channel: "גנרי",      budget: 2500  },
  { project: "מיסדאון", media: "פייסבוק", channel: "דף נחיתה",  budget: 15000 },
  { project: "מיסדאון", media: "פייסבוק", channel: "טופס ליד",  budget: 38383 }
  // דוגמה לפרויקט נוסף (הסר // כשתוסיף):
  // { project: "בית הנערה", media: "גוגל",    channel: "מותג",     budget: 0 },
  // { project: "בית הנערה", media: "פייסבוק", channel: "טופס ליד", budget: 0 }
];

// ערכים ראשוניים לפייסבוק — project|channel → [הוצאה, לידים]
// (עדכן ידנית בתאים הצהובים; ריצה מחדש של setupDashboard ישמור ערכים קיימים)
var FB_DEFAULTS = {
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
//  פונקציה ראשית
// ═══════════════════════════════════════════
function setupDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  _buildTab(ss, "דשבורד - חודש",  "מתחילת החודש עד אתמול", "חודש");
  _buildTab(ss, "דשבורד - אתמול", "סטטוס אתמול",           "אתמול");
  _buildTab(ss, "דשבורד - היום",  "סטטוס היום",             "היום");
  SpreadsheetApp.getUi().alert(
    "✅ הדשבורד נוצר בהצלחה!\n\n" +
    "3 טאבים:\n" +
    "• דשבורד - חודש (מתחילת החודש עד אתמול)\n" +
    "• דשבורד - אתמול\n" +
    "• דשבורד - היום\n\n" +
    "תאים צהובים = עדכון ידני (תקציב + פייסבוק)\n" +
    "תאים לבנים = חישוב אוטומטי"
  );
}

// ═══════════════════════════════════════════
//  בניית טאב דשבורד
// ═══════════════════════════════════════════
function _buildTab(ss, tabName, googleSrcTab, fbKey) {
  var sh = ss.getSheetByName(tabName);
  if (!sh) sh = ss.insertSheet(tabName);

  // --- שמור ערכים קיימים לפני ניקוי ---
  var savedValues = {}; // key: "project|media|channel" → { budget, fbSpend, fbLeads }
  if (sh.getLastRow() > 1) {
    var existing = sh.getRange(2, 1, sh.getLastRow() - 1, 9).getValues();
    existing.forEach(function(row) {
      var key = row[0] + "|" + row[1] + "|" + row[2];
      savedValues[key] = {
        budget:   row[3],
        fbSpend:  row[1] === "פייסבוק" ? row[4] : null,
        fbLeads:  row[1] === "פייסבוק" ? row[7] : null
      };
    });
  }

  // --- ניקוי ובניה מחדש ---
  sh.clearContents();
  sh.clearFormats();
  sh.setRightToLeft(true);

  // כותרות
  var COLS = ["פרויקט", "מדיה", "ערוץ", "תקציב ₪", "הוצאה ₪", "% ניצול", "יתרה ₪", "לידים", "עלות לליד ₪"];
  var headerRange = sh.getRange(1, 1, 1, COLS.length);
  headerRange.setValues([COLS]);
  headerRange.setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
  sh.setFrozenRows(1);

  var fbData    = FB_DEFAULTS[fbKey] || {};
  var dataRow   = 2;
  var lastProj  = "";

  DASH_CONFIG.forEach(function(cfg) {
    var r        = dataRow;
    var isGoogle = cfg.media === "גוגל";
    var saveKey  = cfg.project + "|" + cfg.media + "|" + cfg.channel;
    var fbKey2   = cfg.project + "|" + cfg.channel;
    var saved    = savedValues[saveKey] || {};

    // --- עמודות קבועות (טקסט) ---
    sh.getRange(r, 1).setValue(cfg.project);
    sh.getRange(r, 2).setValue(cfg.media);
    sh.getRange(r, 3).setValue(cfg.channel);

    // --- תקציב (D) — תא צהוב לעדכון ידני ---
    var budgetVal = (saved.budget != null && saved.budget !== "") ? saved.budget : cfg.budget;
    sh.getRange(r, 4)
      .setValue(budgetVal)
      .setBackground("#fff9c4")
      .setNumberFormat("₪#,##0");

    // --- הוצאה (E) ---
    if (isGoogle) {
      // אוטומטי מטאב גוגל אדס
      sh.getRange(r, 5).setFormula(
        "=IFERROR(SUMIFS('" + googleSrcTab + "'!D:D," +
        "'" + googleSrcTab + "'!A:A,A" + r + "," +
        "'" + googleSrcTab + "'!C:C,C" + r + "),0)"
      ).setBackground("#e8f5e9"); // ירוק בהיר = אוטומטי
    } else {
      // פייסבוק — תא צהוב ידני
      var defaultSpend = fbData[fbKey2] ? fbData[fbKey2][0] : 0;
      var spendVal = (saved.fbSpend != null && saved.fbSpend !== "") ? saved.fbSpend : defaultSpend;
      sh.getRange(r, 5).setValue(spendVal).setBackground("#fff9c4");
    }
    sh.getRange(r, 5).setNumberFormat("₪#,##0");

    // --- % ניצול (F) — נוסחה ---
    sh.getRange(r, 6).setFormula(
      '=IF(AND(D' + r + '>0,E' + r + '>0),TEXT(E' + r + '/D' + r + ',"0%"),"-")'
    ).setHorizontalAlignment("center");

    // --- יתרה (G) — נוסחה ---
    sh.getRange(r, 7).setFormula("=D" + r + "-E" + r).setNumberFormat("₪#,##0");

    // --- לידים (H) ---
    if (isGoogle) {
      sh.getRange(r, 8).setFormula(
        "=IFERROR(SUMIFS('" + googleSrcTab + "'!E:E," +
        "'" + googleSrcTab + "'!A:A,A" + r + "," +
        "'" + googleSrcTab + "'!C:C,C" + r + "),0)"
      ).setBackground("#e8f5e9");
    } else {
      var defaultLeads = fbData[fbKey2] ? fbData[fbKey2][1] : 0;
      var leadsVal = (saved.fbLeads != null && saved.fbLeads !== "") ? saved.fbLeads : defaultLeads;
      sh.getRange(r, 8).setValue(leadsVal).setBackground("#fff9c4");
    }

    // --- עלות לליד (I) — נוסחה ---
    sh.getRange(r, 9).setFormula(
      '=IF(H' + r + '>0,ROUND(E' + r + '/H' + r + ',0),"-")'
    ).setNumberFormat("₪#,##0").setHorizontalAlignment("center");

    // קו מפריד בין פרויקטים שונים
    if (lastProj && lastProj !== cfg.project) {
      sh.getRange(r, 1, 1, COLS.length).setBorder(
        true, null, null, null, null, null,
        "#1a73e8", SpreadsheetApp.BorderStyle.SOLID_MEDIUM
      );
    }
    lastProj = cfg.project;
    dataRow++;
  });

  // --- שורת סיכום ---
  var tr = dataRow;
  var lastData = dataRow - 1;
  var sumRange = sh.getRange(tr, 1, 1, COLS.length);
  sumRange.setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
  sh.getRange(tr, 3).setValue('סה"כ').setFontColor("#ffffff");
  sh.getRange(tr, 4).setFormula("=SUM(D2:D" + lastData + ")").setNumberFormat("₪#,##0");
  sh.getRange(tr, 5).setFormula("=SUM(E2:E" + lastData + ")").setNumberFormat("₪#,##0");
  sh.getRange(tr, 6).setFormula(
    '=IF(D' + tr + '>0,TEXT(E' + tr + '/D' + tr + ',"0%"),"-")'
  ).setHorizontalAlignment("center").setFontColor("#ffffff");
  sh.getRange(tr, 7).setFormula("=D" + tr + "-E" + tr).setNumberFormat("₪#,##0");
  sh.getRange(tr, 8).setFormula("=SUM(H2:H" + lastData + ")");
  sh.getRange(tr, 9).setFormula(
    '=IF(H' + tr + '>0,ROUND(E' + tr + '/H' + tr + ',0),"-")'
  ).setNumberFormat("₪#,##0").setFontColor("#ffffff");

  // --- עיצוב עמודות ---
  sh.setColumnWidth(1, 120); // פרויקט
  sh.setColumnWidth(2, 90);  // מדיה
  sh.setColumnWidth(3, 100); // ערוץ
  sh.setColumnWidth(4, 100); // תקציב
  sh.setColumnWidth(5, 100); // הוצאה
  sh.setColumnWidth(6, 80);  // %
  sh.setColumnWidth(7, 100); // יתרה
  sh.setColumnWidth(8, 70);  // לידים
  sh.setColumnWidth(9, 110); // עלות לליד
}
