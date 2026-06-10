// ===== GOOGLE ADS API MODULE =====
// שולף נתוני ביצועים מגוגל אדס דרך REST API

const GADS_API_VERSION = 'v18';
const GADS_BASE_URL    = `https://googleads.googleapis.com/${GADS_API_VERSION}`;

/**
 * fetchGoogleAdsData
 * מחזיר map של campaignId → { name, spend, leads, impressions, clicks }
 */
function fetchGoogleAdsData(customerId, devToken, loginCustomerId, startDate, endDate) {
  const oauthToken = ScriptApp.getOAuthToken();

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      metrics.cost_micros,
      metrics.conversions,
      metrics.impressions,
      metrics.clicks
    FROM campaign
    WHERE
      segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
  `.trim();

  const headers = {
    'Authorization':  'Bearer ' + oauthToken,
    'developer-token': devToken,
    'Content-Type':   'application/json',
  };
  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId;
  }

  const url = `${GADS_BASE_URL}/customers/${customerId}/googleAds:searchStream`;
  const response = UrlFetchApp.fetch(url, {
    method:          'post',
    headers:         headers,
    payload:         JSON.stringify({ query }),
    muteHttpExceptions: true,
  });

  const statusCode = response.getResponseCode();
  const text       = response.getContentText();

  if (statusCode !== 200) {
    Logger.log('Google Ads API error ' + statusCode + ': ' + text.substring(0, 500));
    throw new Error(`Google Ads API שגיאה ${statusCode}: ` + parseGadsError(text));
  }

  // searchStream מחזיר שורת JSON לכל batch
  const result = {};
  const lines  = text.split('\n').filter(l => l.trim().startsWith('{'));
  for (const line of lines) {
    try {
      const batch = JSON.parse(line);
      for (const row of (batch.results || [])) {
        const id   = row.campaign.id;
        const name = row.campaign.name;
        const spendShekels = (parseInt(row.metrics.costMicros || 0) / 1e6) * getUSDtoILS();
        const leads = parseFloat(row.metrics.conversions || 0);

        if (result[id]) {
          result[id].spend       += spendShekels;
          result[id].leads       += leads;
          result[id].impressions += parseInt(row.metrics.impressions || 0);
          result[id].clicks      += parseInt(row.metrics.clicks || 0);
        } else {
          result[id] = {
            name,
            spend:       spendShekels,
            leads:       Math.round(leads),
            impressions: parseInt(row.metrics.impressions || 0),
            clicks:      parseInt(row.metrics.clicks || 0),
          };
        }
      }
    } catch (e) { /* skip malformed lines */ }
  }

  Logger.log('Google Ads: נמצאו ' + Object.keys(result).length + ' קמפיינים');
  return result;
}

/**
 * Returns approximate USD→ILS rate.
 * You can override this with a live FX call if needed.
 */
function getUSDtoILS() {
  try {
    const resp = UrlFetchApp.fetch('https://open.er-api.com/v6/latest/USD', { muteHttpExceptions: true });
    if (resp.getResponseCode() === 200) {
      const data = JSON.parse(resp.getContentText());
      return data.rates && data.rates.ILS ? data.rates.ILS : 3.7;
    }
  } catch (e) { /* fall through */ }
  return 3.7; // fallback rate
}

function parseGadsError(text) {
  try {
    const j = JSON.parse(text);
    const err = j.error || (Array.isArray(j) && j[0] && j[0].error) || {};
    return err.message || err.details || text.substring(0, 200);
  } catch (e) {
    return text.substring(0, 200);
  }
}

// ---- Test connection ----

function testGoogleAdsConnection() {
  const cfg = getDashSettings();
  if (!cfg.googleCustomerId || !cfg.googleDevToken) {
    SpreadsheetApp.getUi().alert('❌ חסרים: Google Ads Customer ID ו/או Developer Token בגיליון "הגדרות"');
    return;
  }

  const oauthToken = ScriptApp.getOAuthToken();
  const headers = {
    'Authorization':  'Bearer ' + oauthToken,
    'developer-token': cfg.googleDevToken,
    'Content-Type':   'application/json',
  };
  if (cfg.googleLoginCustomerId) headers['login-customer-id'] = cfg.googleLoginCustomerId;

  const url = `${GADS_BASE_URL}/customers/${cfg.googleCustomerId}/googleAds:searchStream`;
  const resp = UrlFetchApp.fetch(url, {
    method:  'post',
    headers: headers,
    payload: JSON.stringify({ query: 'SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1' }),
    muteHttpExceptions: true,
  });

  const code = resp.getResponseCode();
  const text = resp.getContentText();

  if (code === 200) {
    SpreadsheetApp.getUi().alert('✅ חיבור לגוגל אדס תקין!\nCustomer ID: ' + cfg.googleCustomerId);
  } else {
    SpreadsheetApp.getUi().alert('❌ שגיאת גוגל אדס:\n' + parseGadsError(text));
  }
}
