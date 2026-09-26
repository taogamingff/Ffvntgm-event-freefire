export default async function handler(req, res) {

    /* =====================================================
       CORS
       ===================================================== */

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );


    /* =====================================================
       OPTIONS
       ===================================================== */

    if(req.method === "OPTIONS"){
        return res.status(204).end();
    }


    /* =====================================================
       METHOD
       ===================================================== */

    if(req.method !== "GET"){

        return res.status(405).json({
            success:false,
            error:"Method Not Allowed"
        });

    }


    /* =====================================================
       SERVER ALLOWED
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
       GET REGION
       ===================================================== */

    const region =
        String(
            req.query?.region || ""
        )
        .trim()
        .toLowerCase();


    if(!allowedRegions.includes(region)){

        return res.status(400).json({

            success:false,

            error:"SERVER KHÔNG HỢP LỆ",

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
       RETRY
       ===================================================== */

    const maxAttempts = 3;

    let lastError = null;


    for(
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ){

        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                ()=>{
                    controller.abort();
                },
                15000
            );


        try{

            const response =
                await fetch(
                    target,
                    {
                        method:"GET",

                        headers:{
                            "Accept":
                                "application/json",

                            "User-Agent":
                                "FREE-FIRE-EVENT-UPDATE"
                        },

                        signal:
                            controller.signal
                    }
                );


            const text =
                await response.text();


            clearTimeout(timeout);


            /* =============================================
               HTTP ERROR
               ============================================= */

            if(!response.ok){

                throw new Error(
                    `Source API HTTP ${response.status}`
                );

            }


            /* =============================================
               EMPTY
               ============================================= */

            if(!text.trim()){

                throw new Error(
                    "API trả về dữ liệu rỗng"
                );

            }


            /* =============================================
               JSON
               ============================================= */

            let data;

            try{

                data =
                    JSON.parse(text);

            }catch{

                throw new Error(
                    "API nguồn không trả về JSON hợp lệ"
                );

            }


            /* =============================================
               CACHE
               ============================================= */

            res.setHeader(
                "Cache-Control",
                "public, s-maxage=30, stale-while-revalidate=60"
            );


            /* =============================================
               SUCCESS
               ============================================= */

            return res.status(200).json({

                success:true,

                region,

                fetchedAt:
                    new Date().toISOString(),

                data

            });


        }catch(error){

            clearTimeout(timeout);

            lastError = error;


            /* =============================================
               RETRY DELAY
               ============================================= */

            if(
                attempt <
                maxAttempts
            ){

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            attempt * 700
                        )
                );

            }

        }

    }


    /* =====================================================
       SOURCE FAILED
       ===================================================== */

    return res.status(502).json({

        success:false,

        region,

        error:
            "KHÔNG THỂ LẤY DỮ LIỆU API",

        message:
            lastError?.name === "AbortError"
                ? "API timeout"
                : (
                    lastError?.message ||
                    "Unknown error"
                )

    });

    }
