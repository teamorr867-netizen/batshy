// ===== META INSIGHTS MODULE =====
// שולף נתוני ביצועים (הוצאות, לידים) מ-Meta Marketing API

/**
 * fetchMetaInsights
 * מחזיר map של campaignId → { name, spend, leads, impressions, clicks }
 */
function fetchMetaInsights(accessToken, adAccountId, startDate, endDate) {
  const accountId = String(adAccountId).replace(/^act_/i, '');
  const endpoint  = `act_${accountId}/insights`;

  const fields = [
    'campaign_id',
    'campaign_name',
    'spend',
    'impressions',
    'clicks',
    'actions',        // contains lead events
    'cost_per_action_type',
  ].join(',');

  // Paginate through all campaigns
  let allData  = [];
  let nextUrl  = null;
  let params = {
    access_token: accessToken,
    level:        'campaign',
    fields:       fields,
    time_range:   JSON.stringify({ since: startDate, until: endDate }),
    limit:        500,
  };

  // First call
  const firstResp = metaGetDash(endpoint, params);
  if (firstResp.error) throw new Error('Meta Insights: ' + firstResp.error.message);
  allData = allData.concat(firstResp.data || []);
  nextUrl = firstResp.paging && firstResp.paging.next ? firstResp.paging.next : null;

  // Pagination
  let page = 0;
  while (nextUrl && page < 10) {
    Utilities.sleep(500);
    const pageResp = UrlFetchApp.fetch(nextUrl, { muteHttpExceptions: true });
    const parsed   = JSON.parse(pageResp.getContentText());
    if (parsed.error) break;
    allData = allData.concat(parsed.data || []);
    nextUrl = parsed.paging && parsed.paging.next ? parsed.paging.next : null;
    page++;
  }

  // Build result map
  const result = {};
  for (const item of allData) {
    const id   = item.campaign_id;
    const name = item.campaign_name;
    const spend       = parseFloat(item.spend || 0);
    const impressions = parseInt(item.impressions || 0);
    const clicks      = parseInt(item.clicks || 0);

    // Count leads from actions array
    let leads = 0;
    if (Array.isArray(item.actions)) {
      for (const action of item.actions) {
        if (
          action.action_type === 'lead'         ||
          action.action_type === 'onsite_conversion.lead_grouped' ||
          action.action_type === 'offsite_conversion.fb_pixel_lead' ||
          action.action_type === 'contact_total'
        ) {
          leads += parseInt(action.value || 0);
        }
      }
    }

    if (result[id]) {
      result[id].spend       += spend;
      result[id].leads       += leads;
      result[id].impressions += impressions;
      result[id].clicks      += clicks;
    } else {
      result[id] = { name, spend, leads, impressions, clicks };
    }
  }

  Logger.log('Meta Insights: נמצאו ' + Object.keys(result).length + ' קמפיינים');
  return result;
}

// Internal GET helper (doesn't need token from הגדרות — token is passed as arg)
function metaGetDash(endpoint, params) {
  const qs  = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
  const url = `${BASE_URL}/${endpoint}?${qs}`;
  const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  return JSON.parse(resp.getContentText());
}
