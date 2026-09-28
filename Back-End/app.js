const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// =====================================================
// KONFIGURASI SUPABASE
// =====================================================

const SUPABASE_URL = "https://wothkzsgirgntghxkqqr.supabase.co";
const SUPABASE_KEY = "sb_publishable_HIsUWsYI5XYrg7FuV7EoRA_YGluMM6b";


// =====================================================
// MIME TYPE
// =====================================================

const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
};


// =====================================================
// SUPABASE REQUEST
// =====================================================

async function supabaseRequest(table, method = "GET", body = null, query = "") {

    const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;

    const options = {
        method,
        headers: {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    const text = await response.text();

    let data;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!response.ok) {
        throw new Error(
            typeof data === "object"
                ? JSON.stringify(data)
                : data
        );
    }

    return data;
}


// =====================================================
// MEMBACA BODY REQUEST
// =====================================================

function readBody(req) {

    return new Promise((resolve, reject) => {

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {

            if (!body) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }

        });

        req.on("error", reject);
    });
}


// =====================================================
// RESPONSE JSON
// =====================================================

function sendJSON(res, statusCode, data) {

    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    });

    res.end(JSON.stringify(data));
}


// =====================================================
// STATIC FILE
// =====================================================

function serveStatic(res, filePath) {

    fs.readFile(filePath, (error, content) => {

        if (error) {

            res.writeHead(404, {
                "Content-Type": "text/plain"
            });

            res.end("File tidak ditemukan.");

            return;
        }

        const ext = path.extname(filePath);

        res.writeHead(200, {
            "Content-Type":
                mimeTypes[ext] || "application/octet-stream"
        });

        res.end(content);
    });
}


// =====================================================
// SERVER
// =====================================================

const server = http.createServer(async (req, res) => {

    try {

        // -------------------------------------------------
        // OPTIONS
        // -------------------------------------------------

        if (req.method === "OPTIONS") {

            res.writeHead(204, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods":
                    "GET, POST, PUT, DELETE, OPTIONS"
            });

            res.end();

            return;
        }


        // -------------------------------------------------
        // URL
        // -------------------------------------------------

        const parsedUrl = new URL(
            req.url,
            `http://${req.headers.host}`
        );

        const pathname = parsedUrl.pathname;


        // -------------------------------------------------
        // API PELANGGAN
        // -------------------------------------------------

        if (pathname === "/api/pelanggan") {

            if (req.method === "GET") {

                const data = await supabaseRequest(
                    "pelanggan",
                    "GET",
                    null,
                    "?select=*&order=id_pelanggan.desc"
                );

                sendJSON(res, 200, data);

                return;
            }

            if (req.method === "POST") {

                const body = await readBody(req);

                const data = await supabaseRequest(
                    "pelanggan",
                    "POST",
                    body
                );

                sendJSON(res, 201, data);

                return;
            }
        }


        // -------------------------------------------------
        // API PAKET
        // -------------------------------------------------

        if (pathname === "/api/paket") {

            if (req.method === "GET") {

                const data = await supabaseRequest(
                    "paket_wedding",
                    "GET",
                    null,
                    "?select=*&order=id_paket.asc"
                );

                sendJSON(res, 200, data);

                return;
            }

            if (req.method === "POST") {

                const body = await readBody(req);

                const data = await supabaseRequest(
                    "paket_wedding",
                    "POST",
                    body
                );

                sendJSON(res, 201, data);

                return;
            }
        }


        // -------------------------------------------------
        // API TRANSAKSI
        // -------------------------------------------------

        if (pathname === "/api/transaksi") {

            if (req.method === "GET") {

                const data = await supabaseRequest(
                    "transaksi_wedding",
                    "GET",
                    null,
                    "?select=*,pelanggan(nama_pelanggan),paket_wedding(nama_paket,harga)&order=id_transaksi.desc"
                );

                sendJSON(res, 200, data);

                return;
            }

            if (req.method === "POST") {

                const body = await readBody(req);

                const data = await supabaseRequest(
                    "transaksi_wedding",
                    "POST",
                    body
                );

                sendJSON(res, 201, data);

                return;
            }
        }


        // -------------------------------------------------
        // API PEMBAYARAN
        // -------------------------------------------------

        if (pathname === "/api/pembayaran") {

            if (req.method === "GET") {

                const data = await supabaseRequest(
                    "pembayaran",
                    "GET",
                    null,
                    "?select=*,transaksi_wedding(id_transaksi,total_transaksi)&order=id_pembayaran.desc"
                );

                sendJSON(res, 200, data);

                return;
            }

            if (req.method === "POST") {

                const body = await readBody(req);

                const data = await supabaseRequest(
                    "pembayaran",
                    "POST",
                    body
                );

                sendJSON(res, 201, data);

                return;
            }
        }


        // -------------------------------------------------
        // DELETE PELANGGAN
        // -------------------------------------------------

        if (pathname.startsWith("/api/pelanggan/")) {

            const id = pathname.split("/").pop();

            if (req.method === "DELETE") {

                const data = await supabaseRequest(
                    "pelanggan",
                    "DELETE",
                    null,
                    `?id_pelanggan=eq.${id}`
                );

                sendJSON(res, 200, data);

                return;
            }
        }


        // -------------------------------------------------
        // DELETE PAKET
        // -------------------------------------------------

        if (pathname.startsWith("/api/paket/")) {

            const id = pathname.split("/").pop();

            if (req.method === "DELETE") {

                const data = await supabaseRequest(
                    "paket_wedding",
                    "DELETE",
                    null,
                    `?id_paket=eq.${id}`
                );

                sendJSON(res, 200, data);

                return;
            }
        }


        // -------------------------------------------------
        // DELETE TRANSAKSI
        // -------------------------------------------------

        if (pathname.startsWith("/api/transaksi/")) {

            const id = pathname.split("/").pop();

            if (req.method === "DELETE") {

                const data = await supabaseRequest(
                    "transaksi_wedding",
                    "DELETE",
                    null,
                    `?id_transaksi=eq.${id}`
                );

                sendJSON(res, 200, data);

                return;
            }
        }


        // -------------------------------------------------
        // DELETE PEMBAYARAN
        // -------------------------------------------------

        if (pathname.startsWith("/api/pembayaran/")) {

            const id = pathname.split("/").pop();

            if (req.method === "DELETE") {

                const data = await supabaseRequest(
                    "pembayaran",
                    "DELETE",
                    null,
                    `?id_pembayaran=eq.${id}`
                );

                sendJSON(res, 200, data);

                return;
            }
        }


        // -------------------------------------------------
        // FRONTEND
        // -------------------------------------------------

        let filePath;

        if (pathname === "/") {

            filePath = path.join(
                __dirname,
                "..",
                "Front-End",
                "HTML",
                "index.html"
            );

        } else if (pathname.startsWith("/CSS/")) {

            filePath = path.join(
                __dirname,
                "..",
                "Front-End",
                pathname
            );

        } else if (pathname.startsWith("/JS/")) {

            filePath = path.join(
                __dirname,
                "..",
                "Front-End",
                pathname
            );

        } else {

            filePath = path.join(
                __dirname,
                "..",
                "Front-End",
                "HTML",
                pathname
            );
        }

        serveStatic(res, filePath);

    } catch (error) {

        console.error(error);

        sendJSON(res, 500, {
            error: error.message
        });
    }

});


server.listen(PORT, () => {

    console.log("=================================");
    console.log("SISTEM AKUNTANSI WEDDING ORGANIZER");
    console.log("=================================");
    console.log(`Server berjalan di http://localhost:${PORT}`);
});