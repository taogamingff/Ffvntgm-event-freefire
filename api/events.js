// Vercel Serverless Function: /api/events?region=VN
// Set DANGER_EVENT_KEY in Vercel Environment Variables for production.
const ALLOWED_REGIONS = new Set([
  "VN","SG","ID","TH","TW","BR","US","SAC","NA","EU","ME","IND","PK","BD","RU","CIS"
]);
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") return res.status(405).json({status:"error",message:"Method not allowed"});
  const region = String(req.query.region || "VN").trim().toUpperCase();
  if (!ALLOWED_REGIONS.has(region)) return res.status(400).json({status:"error",message:"Region không hợp lệ"});
  const key = process.env.DANGER_EVENT_KEY || "DANGERxEVENT";
  const url = new URL("https://danger-event-info.vercel.app/event");
  url.searchParams.set("region", region);
  url.searchParams.set("key", key);
  try {
    const upstream = await fetch(url.toString(), {headers:{Accept:"application/json"}, signal:AbortSignal.timeout(12000)});
    const raw = await upstream.text();
    let data;
    try { data = JSON.parse(raw); } catch { return res.status(502).json({status:"error",message:"API nguồn không trả về JSON hợp lệ"}); }
    if (!upstream.ok) return res.status(upstream.status).json({status:"error",message:data.message || `API nguồn trả HTTP ${upstream.status}`});
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({status:"error",message:"Không kết nối được API nguồn",detail:error.message});
  }
};
