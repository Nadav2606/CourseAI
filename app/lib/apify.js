const APIFY_ACTOR_ID = "apify~google-search-scraper";

function getApifyToken() {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error("Missing APIFY_TOKEN in .env.local");
  }
  return token;
}

function buildSearchInput(query) {
  return {
    queries: `קורס ${query} בישראל`,
    maxPagesPerQuery: 1,
    countryCode: "il",
    aiOverview: { scrapeFullAiOverview: false },
    aiModeSearch: { enableAiMode: false },
    geminiSearch: { enableGemini: false },
    perplexitySearch: {
      enablePerplexity: false,
      returnImages: false,
      returnRelatedQuestions: false,
    },
    chatGptSearch: { enableChatGpt: false },
    copilotSearch: { enableCopilot: false },
    maximumLeadsEnrichmentRecords: 0,
    verifyLeadsEnrichmentEmails: false,
    websiteContentScraper: { enable: false },
    focusOnPaidAds: false,
    searchLanguage: "",
    languageCode: "",
    forceExactMatch: false,
    wordsInTitle: [],
    wordsInText: [],
    wordsInUrl: [],
    mobileResults: false,
    includeUnfilteredResults: false,
    saveHtml: false,
    saveHtmlToKeyValueStore: true,
    includeIcons: false,
  };
}

async function runActor(input) {
  const token = getApifyToken();
  const endpoint = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Apify error:", response.status, errorText);
    throw new Error(`Apify request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected Apify response: expected dataset items array");
  }
  return data;
}

function isLikelyCourse(result) {
  const title = String(result?.title || "").trim();
  const url = String(result?.url || "").trim();
  const description = String(result?.description || "").trim();
  if (!title || !url) return false;

  const haystack = `${title} ${description}`.toLowerCase();
  const rejectTitle = /(^|\s)(בחינת|בחינה|תקנון|מאגר בחינות|מועדי בחינות|ערעור על ציון)(\s|$)/;
  const courseSignal = /(קורס|לימוד|לימודים|הכשרה|תוכנית לימודים|תכנית לימודים)/;

  if (/\.pdf(?:$|[?#])/i.test(url)) return false;
  if (rejectTitle.test(title)) return false;
  return courseSignal.test(haystack);
}

function normalizeResult(result, index) {
  const description = String(result?.description || "")
    .replace(/\s*\.\.\.\s*Read more\s*$/i, "")
    .trim();

  return {
    id: `${result?.position || index + 1}-${result?.url || index}`,
    title: String(result?.title || "").trim(),
    description,
    provider: String(result?.websiteTitle || "").trim(),
    url: String(result?.url || "").trim(),
    position: Number(result?.position || index + 1),
    source: "google-search-scraper",
  };
}

export async function fetchCourses({ query }) {
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) return [];

  const datasetItems = await runActor(buildSearchInput(cleanQuery));
  const organicResults = datasetItems.flatMap((item) =>
    Array.isArray(item?.organicResults) ? item.organicResults : [],
  );

  const seen = new Set();
  return organicResults
    .filter(isLikelyCourse)
    .filter((result) => {
      const url = String(result?.url || "").trim();
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    })
    .map(normalizeResult)
    .sort((a, b) => a.position - b.position);
}
