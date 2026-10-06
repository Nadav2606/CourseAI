const DEFAULT_ACTOR = "apify~rag-web-browser";

function normalizeResult(item, index) {
  const url = item.metadata?.url || item.searchResult?.url || "";

  const title =
    item.metadata?.title || item.searchResult?.title || "תוצאת קורס";

  const markdown = String(item.markdown || "");

  const description =
    item.searchResult?.description ||
    markdown
      .replace(/[#*_`>\[\]]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 280);

  return {
    id: String(index),
    title,
    url,
    description,
  };
}

export async function fetchCourses({ query } = {}) {
  const token = process.env.APIFY_TOKEN;

  if (!token) {
    throw new Error("APIFY_TOKEN is not set");
  }

  const cleanQuery = String(query || "")
    .trim()
    .replace(/^קורס\s+/i, "");

  if (!cleanQuery) {
    throw new Error("Course search query is required");
  }

  const actor = process.env.APIFY_COURSES_ACTOR || DEFAULT_ACTOR;

  const endpoint =
    `https://api.apify.com/v2/acts/${actor}` +
    `/run-sync-get-dataset-items` +
    `?token=${encodeURIComponent(token)}` +
    `&memory=2048`;

  const response = await fetch(endpoint, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      query: `קורס ${cleanQuery} בישראל`,

      maxResults: 5,

      outputFormats: ["markdown"],

      requestTimeoutSecs: 40,

      scrapingTool: "raw-http",

      desiredConcurrency: 5,

      maxRequestRetries: 1,

      removeCookieWarnings: false,

      debugMode: false,
    }),

    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Apify error:", errorText);

    throw new Error(`Apify request failed: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeResult).filter((result) => result.url);
}
