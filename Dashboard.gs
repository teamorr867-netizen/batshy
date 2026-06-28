// ===== Dashboard.gs =====
// טאב נפרד לכל פרויקט; בתוך כל טאב 3 סקשנים: חודש / אתמול / היום
//
// שלבים:
//   1. פתח שיטס הדיווח → Extensions → Apps Script
//   2. צור קובץ חדש "Dashboard" → הדבק → שמור
//   3. הרץ: setupDashboard
//   4. אשר הרשאות

// ═══════════════════════════════════════════
//  קונפיגורציה — הוסף פרויקטים כאן
// ═══════════════════════════════════════════

// כל שורה = ערוץ אחד בתוך פרויקט
// גוגל: הוצאה + לידים נשלפים אוטומטית לפי ערוץ
// פייסבוק: תאים צהובים לעדכון ידני
var DASH_CONFIG = [
  { project: "מיסדאון", media: "גוגל",    channel: "מותג",      budget: 4500  },
  { project: "מיסדאון", media: "גוגל",    channel: "גנרי",      budget: 2500  },
  { project: "מיסדאון", media: "פייסבוק", channel: "דף נחיתה",  budget: 15000 },
  { project: "מיסדאון", media: "פייסבוק", channel: "טופס ליד",  budget: 38383 }

  // הוסף פרויקטים נוספים כאן אחרי פסיק:
  // { project: "בית הנערה", media: "גוגל",    channel: "מותג",     budget: 0 },
  // { project: "בית הנערה", media: "פייסבוק", channel: "טופס ליד", budget: 0 }
];

// ערכי פייסבוק ראשוניים — project|channel → [הוצאה, לידים]
// (לפי 3 תקופות זמן)
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

// שמות טאבי גוגל אדס (לא לשנות אם הסקריפט כבר עובד)
var GOOGLE_TABS = {
  "חודש":  "מתחילת החודש עד אתמול",
  "אתמול": "סטטוס אתמול",
  "היום":  "סטטוס היום"
};

var PERIODS = ["חודש", "אתמול", "היום"];

var PERIOD_LABELS = {
  "חודש":  "מתחילת החודש עד אתמול",
  "אתמול": "סטטוס אתמול",
  "היום":  "סטטוס היום"
};

// ═══════════════════════════════════════════
//  פונקציה ראשית
// ═══════════════════════════════════════════
function setupDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // מצא את כל הפרויקטים הייחודיים (לפי סדר הופעה)
  var projects = [];
  DASH_CONFIG.forEach(function(r) {
    if (projects.indexOf(r.project) === -1) projects.push(r.project);
  });

  projects.forEach(function(proj) {
    _buildProjectTab(ss, proj);
  });

  SpreadsheetApp.getUi().alert(
    "✅ הדשבורד נוצר!\n\n" +
    "טאב לכל פרויקט עם 3 סקשנים:\n" +
    "• מתחילת החודש עד אתמול\n" +
    "• סטטוס אתמול\n" +
    "• סטטוס היום\n\n" +
    "🟡 תאים צהובים = עדכון ידני\n" +
    "🟢 תאים ירוקים = אוטומטי מגוגל"
  );
}

// ═══════════════════════════════════════════
//  בניית טאב פרויקט
// ═══════════════════════════════════════════
function _buildProjectTab(ss, project) {
  var sh = ss.getSheetByName(project);
  if (!sh) sh = ss.insertSheet(project);

  // שמור ערכים צהובים קיימים לפני ניקוי
  var saved = _saveYellowValues(sh);

  sh.clearContents();
  sh.clearFormats();
  sh.setRightToLeft(true);

  var COLS = ["מדיה", "ערוץ", "תקציב ₪", "הוצאה ₪", "% ניצול", "יתרה ₪", "לידים", "עלות לליד ₪"];
  var currentRow = 1;

  // שורות של הפרויקט הזה בלבד
  var projectRows = DASH_CONFIG.filter(function(r) { return r.project === project; });

  PERIODS.forEach(function(period) {
    var googleSrcTab = GOOGLE_TABS[period];
    var fbData = FB_DEFAULTS[period] || {};

    // ─── כותרת הסקשן ───
    var titleRange = sh.getRange(currentRow, 1, 1, COLS.length);
    titleRange.merge();
    titleRange.setValue(PERIOD_LABELS[period]);
    titleRange.setBackground("#1a73e8")
              .setFontColor("#ffffff")
              .setFontWeight("bold")
              .setFontSize(12)
              .setHorizontalAlignment("center");
    currentRow++;

    // ─── כותרות עמודות ───
    var headerRange = sh.getRange(currentRow, 1, 1, COLS.length);
    headerRange.setValues([COLS]);
    headerRange.setBackground("#e8f0fe")
               .setFontWeight("bold")
               .setHorizontalAlignment("center")
               .setBorder(null, null, true, null, null, null, "#1a73e8", SpreadsheetApp.BorderStyle.SOLID);
    currentRow++;

    var firstDataRow = currentRow;

    // ─── שורות נתונים ───
    projectRows.forEach(function(cfg) {
      var r        = currentRow;
      var isGoogle = cfg.media === "גוגל";
      var fbKey    = cfg.project + "|" + cfg.channel;
      var saveKey  = period + "|" + cfg.media + "|" + cfg.channel;

      // עמודה A: מדיה
      sh.getRange(r, 1).setValue(cfg.media);
      // עמודה B: ערוץ
      sh.getRange(r, 2).setValue(cfg.channel);

      // עמודה C: תקציב — תא צהוב ידני
      var budgetVal = (saved[saveKey + "|budget"] != null) ? saved[saveKey + "|budget"] : cfg.budget;
      sh.getRange(r, 3).setValue(budgetVal)
        .setBackground("#fff9c4")
        .setNumberFormat("₪#,##0");

      // עמודה D: הוצאה
      if (isGoogle) {
        sh.getRange(r, 4).setFormula(
          "=IFERROR(SUMIFS('" + googleSrcTab + "'!D:D," +
          "'" + googleSrcTab + "'!A:A,\"" + project + "\"," +
          "'" + googleSrcTab + "'!C:C,B" + r + "),0)"
        ).setBackground("#e8f5e9").setNumberFormat("₪#,##0");
      } else {
        var defSpend = fbData[fbKey] ? fbData[fbKey][0] : 0;
        var spendVal = (saved[saveKey + "|spend"] != null) ? saved[saveKey + "|spend"] : defSpend;
        sh.getRange(r, 4).setValue(spendVal)
          .setBackground("#fff9c4")
          .setNumberFormat("₪#,##0");
      }

      // עמודה E: % ניצול
      sh.getRange(r, 5).setFormula(
        '=IF(AND(C' + r + '>0,D' + r + '>0),TEXT(D' + r + '/C' + r + ',"0%"),"-")'
      ).setHorizontalAlignment("center");

      // עמודה F: יתרה
      sh.getRange(r, 6).setFormula("=C" + r + "-D" + r)
        .setNumberFormat("₪#,##0");

      // עמודה G: לידים
      if (isGoogle) {
        sh.getRange(r, 7).setFormula(
          "=IFERROR(SUMIFS('" + googleSrcTab + "'!E:E," +
          "'" + googleSrcTab + "'!A:A,\"" + project + "\"," +
          "'" + googleSrcTab + "'!C:C,B" + r + "),0)"
        ).setBackground("#e8f5e9");
      } else {
        // COUNTIFS על טאב "לידים CRM" לפי פרויקט + ערוץ + טווח תאריכים
        var crmFormula = _buildCrmCountifs(project, cfg.channel, period);
        sh.getRange(r, 7).setFormula(crmFormula).setBackground("#e8f5e9");
      }

      // עמודה H: עלות לליד
      sh.getRange(r, 8).setFormula(
        '=IF(G' + r + '>0,ROUND(D' + r + '/G' + r + ',0),"-")'
      ).setNumberFormat("₪#,##0").setHorizontalAlignment("center");

      // צבע שורה גוגל
      if (isGoogle) {
        sh.getRange(r, 1, 1, 2).setBackground("#e8f5e9");
      }

      currentRow++;
    });

    // ─── שורת סיכום ───
    var tr = currentRow;
    var lastData = currentRow - 1;
    sh.getRange(tr, 1, 1, COLS.length).setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
    sh.getRange(tr, 1).setValue('סה"כ').setFontColor("#ffffff");
    sh.getRange(tr, 3).setFormula("=SUM(C" + firstDataRow + ":C" + lastData + ")").setNumberFormat("₪#,##0");
    sh.getRange(tr, 4).setFormula("=SUM(D" + firstDataRow + ":D" + lastData + ")").setNumberFormat("₪#,##0");
    sh.getRange(tr, 5).setFormula(
      '=IF(C' + tr + '>0,TEXT(D' + tr + '/C' + tr + ',"0%"),"-")'
    ).setHorizontalAlignment("center").setFontColor("#ffffff");
    sh.getRange(tr, 6).setFormula("=C" + tr + "-D" + tr).setNumberFormat("₪#,##0");
    sh.getRange(tr, 7).setFormula("=SUM(G" + firstDataRow + ":G" + lastData + ")");
    sh.getRange(tr, 8).setFormula(
      '=IF(G' + tr + '>0,ROUND(D' + tr + '/G' + tr + ',0),"-")'
    ).setNumberFormat("₪#,##0").setFontColor("#ffffff");
    currentRow++;

    // ─── רווח בין סקשנים ───
    currentRow++;
  });

  // ─── רוחב עמודות ───
  sh.setColumnWidth(1, 100); // מדיה
  sh.setColumnWidth(2, 110); // ערוץ
  sh.setColumnWidth(3, 110); // תקציב
  sh.setColumnWidth(4, 110); // הוצאה
  sh.setColumnWidth(5, 90);  // %
  sh.setColumnWidth(6, 110); // יתרה
  sh.setColumnWidth(7, 80);  // לידים
  sh.setColumnWidth(8, 120); // עלות לליד
}

// ─── שמור ערכים צהובים ─────────────────────
function _saveYellowValues(sh) {
  var saved = {};
  if (sh.getLastRow() < 2) return saved;

  // קרא את הפרויקט מהמטה-דאטה של הטאב
  // סרוק את כל השורות ושמור לפי מפתח
  var lastRow = sh.getLastRow();
  var data    = sh.getRange(1, 1, lastRow, 8).getValues();
  var bgData  = sh.getRange(1, 1, lastRow, 8).getBackgrounds();

  var currentPeriod = "";
  for (var i = 0; i < data.length; i++) {
    var row  = data[i];
    var bgs  = bgData[i];
    var cell = String(row[0] || "");

    // זהה כותרת סקשן
    if (cell === "מתחילת החודש עד אתמול") { currentPeriod = "חודש"; continue; }
    if (cell === "סטטוס אתמול")           { currentPeriod = "אתמול"; continue; }
    if (cell === "סטטוס היום")            { currentPeriod = "היום"; continue; }
    if (!row[0] || !row[1])               continue;

    var media   = String(row[0]);
    var channel = String(row[1]);
    var key     = currentPeriod + "|" + media + "|" + channel;

    if (bgs[2] === "#fff9c4" && row[2] !== "") saved[key + "|budget"] = row[2];
    if (bgs[3] === "#fff9c4" && row[3] !== "") saved[key + "|spend"]  = row[3];
  }
  return saved;
}

// ─── נוסחת COUNTIFS על טאב לידים CRM ──────────
// עמודות: A=תאריך, B=פרויקט, C=מדיה, D=ערוץ
function _buildCrmCountifs(project, channel, period) {
  var crm = "לידים CRM";
  var dateFilter = "";
  if (period === "חודש") {
    dateFilter =
      ',">=",DATE(YEAR(TODAY()),MONTH(TODAY()),1),' +
      "'לידים CRM'!A:A,\"<=\",TODAY()-1";
  } else if (period === "אתמול") {
    dateFilter =
      ',">=",TODAY()-1,' +
      "'לידים CRM'!A:A,\"<=\",TODAY()-1";
  } else {
    // היום
    dateFilter =
      ',">=",TODAY(),' +
      "'לידים CRM'!A:A,\"<=\",TODAY()";
  }

  return (
    "=IFERROR(COUNTIFS(" +
      "'" + crm + "'!B:B,\"" + project + "\"," +
      "'" + crm + "'!D:D,\"" + channel + "\"," +
      "'" + crm + "'!A:A" + dateFilter +
    "),0)"
  );
}
