const ALLOWED_REGIONS = [
  "VN", "SG", "ID", "TH", "TW", "BR", "US", "SAC",
  "NA", "EU", "ME", "IND", "PK", "BD", "RU", "CIS"
];

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });
  }

  const region = String(req.query.region || "VN")
    .trim()
    .toUpperCase();

  if (!ALLOWED_REGIONS.includes(region)) {
    return res.status(400).json({
      success: false,
      error: "Khu vực không hợp lệ."
    });
  }

  const apiKey =
    process.env.DANGER_EVENT_KEY || "DANGERxEVENT";

  const apiUrl = new URL(
    "https://danger-event-info.vercel.app/event"
  );

  apiUrl.searchParams.set("region", region);
  apiUrl.searchParams.set("key", apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    15000
  );

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        success: false,
        error: "API nguồn không trả về JSON hợp lệ."
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: "API nguồn phản hồi lỗi.",
        upstreamStatus: response.status,
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(
      error.name === "AbortError" ? 504 : 502
    ).json({
      success: false,
      error: error.name === "AbortError"
        ? "API phản hồi quá thời gian chờ."
        : "Không thể kết nối API nguồn."
    });

  } finally {
    clearTimeout(timeout);
  }
};
