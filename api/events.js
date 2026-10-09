export default async function handler(req, res) {

    /* =====================================================
       CORS + CACHE
       ===================================================== */

    res.setHeader("Access-Control-Allow-Origin", "*");

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );

    res.setHeader(
        "CDN-Cache-Control",
        "no-store"
    );

    res.setHeader(
        "Vercel-CDN-Cache-Control",
        "no-store"
    );


    /* =====================================================
       OPTIONS
       ===================================================== */

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }


    /* =====================================================
       METHOD
       ===================================================== */

    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });
    }


    /* =====================================================
       ALLOWED SERVERS
       ===================================================== */

    const allowedRegions = [
        "vn",
        "th",
        "id",
        "sg",
        "my",
        "ph",
        "br",
        "in",
        "pk",
        "bd",
        "eg"
    ];


    /* =====================================================
       REGION
       ===================================================== */

    const region = String(
        req.query?.region || ""
    ).trim().toLowerCase();


    if (!allowedRegions.includes(region)) {
        return res.status(400).json({
            success: false,
            error: "SERVER KHÔNG HỢP LỆ",
            allowedRegions
        });
    }


    /* =====================================================
       SOURCE API
       ===================================================== */

    const target =
        "https://danger-event-info.vercel.app/event" +
        `?region=${encodeURIComponent(region)}` +
        "&key=DANGERxEVENT";


    /* =====================================================
       RETRY + TIMEOUT
       ===================================================== */

    const MAX_ATTEMPTS = 2;
    const TIMEOUT = 5000;

    let lastError = null;


    for (
        let attempt = 1;
        attempt <= MAX_ATTEMPTS;
        attempt++
    ) {

        const controller = new AbortController();

        const timeout = setTimeout(
            () => controller.abort(),
            TIMEOUT
        );


        try {

            const response = await fetch(target, {
                method: "GET",

                headers: {
                    "Accept": "application/json",
                    "User-Agent": "FREE-FIRE-EVENT-UPDATE",
                    "Cache-Control": "no-cache"
                },

                cache: "no-store",

                signal: controller.signal
            });


            const text = await response.text();


            if (!response.ok) {
                throw new Error(
                    `Source API HTTP ${response.status}`
                );
            }


            if (!text.trim()) {
                throw new Error(
                    "API trả về dữ liệu rỗng"
                );
            }


            let data;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    "API nguồn không trả về JSON hợp lệ"
                );
            }


            /* =============================================
               SUCCESS
               ============================================= */

            return res.status(200).json({
                success: true,
                region,
                fetchedAt: new Date().toISOString(),
                data
            });


        } catch (error) {

            lastError = error;

            if (attempt < MAX_ATTEMPTS) {
                await new Promise(
                    resolve => setTimeout(resolve, 150)
                );
            }

        } finally {
            clearTimeout(timeout);
        }

    }


    /* =====================================================
       FAILED
       ===================================================== */

    return res.status(502).json({
        success: false,
        region,
        error: "KHÔNG THỂ LẤY DỮ LIỆU API",

        message:
            lastError?.name === "AbortError"
                ? "API timeout"
                : (
                    lastError?.message ||
                    "Unknown error"
                )
    });

}
