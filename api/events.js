// Vercel Serverless Function: /api/events
// Calls the upstream Free Fire events API from the server, avoiding browser CORS issues.
const ALLOWED_REGIONS = new Set([
  "VN", "SG", "ID", "TH", "TW", "BR", "US", "SAC",
  "NA", "EU", "ME", "IND", "PK", "BD", "RU", "CIS"
]);

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Chỉ hỗ trợ phương thức GET." });
  }

  const rawRegion = (req.query && req.query.region) || "VN";
  const region = String(rawRegion).trim().toUpperCase();

  if (!ALLOWED_REGIONS.has(region)) {
    return res.status(400).json({
      success: false,
      error: "Mã khu vực không hợp lệ.",
      allowedRegions: Array.from(ALLOWED_REGIONS)
    });
  }

  const apiKey = process.env.DANGER_EVENT_KEY || "DANGERxEVENT";
  const upstream = new URL("https://danger-event-info.vercel.app/event");
  upstream.searchParams.set("region", region);
  upstream.searchParams.set("key", apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(upstream.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });

    const bodyText = await response.text();
    let payload;

    try {
      payload = JSON.parse(bodyText);
    } catch {
      return res.status(502).json({
        success: false,
        error: "API sự kiện trả về dữ liệu không phải JSON.",
        upstreamStatus: response.status
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: "Máy chủ dữ liệu sự kiện phản hồi lỗi.",
        upstreamStatus: response.status,
        details: payload
      });
    }

    return res.status(200).json(payload);
  } catch (error) {
    const timedOut = error && error.name === "AbortError";
    return res.status(timedOut ? 504 : 502).json({
      success: false,
      error: timedOut
        ? "Máy chủ dữ liệu phản hồi quá thời gian chờ."
        : "Không thể kết nối máy chủ dữ liệu sự kiện.",
      details: error && error.message ? error.message : "Unknown error"
    });
  } finally {
    clearTimeout(timeout);
  }
};
