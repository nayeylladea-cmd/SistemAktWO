// =====================================================
// KONFIGURASI SUPABASE
// =====================================================

const SUPABASE_URL =
    "https://wothkzsgirgntghxkqqr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_HIsUWsYI5XYrg7FuV7EoRA_YGluMM6b";


// =====================================================
// GLOBAL DATA
// =====================================================

let pelangganData = [];
let paketData = [];
let transaksiData = [];
let pembayaranData = [];


// =====================================================
// SUPABASE REQUEST
// =====================================================

async function supabaseRequest(
    table,
    method = "GET",
    body = null,
    query = ""
) {

    const url =
        `${SUPABASE_URL}/rest/v1/${table}${query}`;

    const options = {

        method: method,

        headers: {

            "apikey":
                SUPABASE_KEY,

            "Authorization":
                `Bearer ${SUPABASE_KEY}`,

            "Content-Type":
                "application/json",

            "Prefer":
                "return=representation"

        }

    };


    if (body !== null) {

        options.body =
            JSON.stringify(body);

    }


    const response =
        await fetch(url, options);


    const text =
        await response.text();


    let data;


    try {

        data =
            text
                ? JSON.parse(text)
                : null;

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
// FORMAT RUPIAH
// =====================================================

function formatRupiah(value) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value || 0));
}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }

    return new Date(tanggal).toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// =====================================================
// TOAST
// =====================================================

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// =====================================================
// LOAD SEMUA DATA
// =====================================================

async function loadData() {

    try {

        const [

            pelangganResponse,

            paketResponse,

            transaksiResponse,

            pembayaranResponse

        ] = await Promise.all([

            supabaseRequest(
                "pelanggan",
                "GET",
                null,
                "?select=*&order=id_pelanggan.desc"
            ),

            supabaseRequest(
                "paket_wedding",
                "GET",
                null,
                "?select=*&order=id_paket.asc"
            ),

            supabaseRequest(
                "transaksi_wedding",
                "GET",
                null,
                "?select=*,pelanggan(nama_pelanggan),paket_wedding(nama_paket,harga)&order=id_transaksi.desc"
            ),

            supabaseRequest(
                "pembayaran",
                "GET",
                null,
                "?select=*,transaksi_wedding(id_transaksi,total_transaksi)&order=id_pembayaran.desc"
            )

        ]);


        pelangganData =
            pelangganResponse;

        paketData =
            paketResponse;

        transaksiData =
            transaksiResponse;

        pembayaranData =
            pembayaranResponse;


        console.log("PELANGGAN:", pelangganData);

        console.log("PAKET:", paketData);

        console.log("TRANSAKSI:", transaksiData);

        console.log("PEMBAYARAN:", pembayaranData);


        renderAll();


    } catch (error) {

        console.error(
            "Gagal mengambil data Supabase:",
            error
        );


        showToast(
            "Gagal mengambil data dari Supabase."
        );

    }
}


// =====================================================
// RENDER SEMUA
// =====================================================

function renderAll() {

    renderDashboard();

    renderPelanggan();

    renderPaket();

    renderTransaksi();

    renderPembayaran();

    populateSelects();
}


// =====================================================
// DASHBOARD
// =====================================================

function renderDashboard() {

    const totalPendapatan =
        transaksiData.reduce(
            (total, transaksi) =>
                total +
                Number(transaksi.total_transaksi || 0),
            0
        );


    const totalPembayaran =
        pembayaranData.reduce(
            (total, pembayaran) =>
                total +
                Number(pembayaran.jumlah_bayar || 0),
            0
        );


    const totalPiutang =
        Math.max(
            totalPendapatan -
            totalPembayaran,
            0
        );


    document.getElementById(
        "totalPendapatan"
    ).textContent =
        formatRupiah(totalPendapatan);


    document.getElementById(
        "totalPembayaran"
    ).textContent =
        formatRupiah(totalPembayaran);


    document.getElementById(
        "totalPiutang"
    ).textContent =
        formatRupiah(totalPiutang);


    document.getElementById(
        "totalTransaksi"
    ).textContent =
        transaksiData.length;


    document.getElementById(
        "jumlahPelanggan"
    ).textContent =
        pelangganData.length;


    document.getElementById(
        "jumlahPaket"
    ).textContent =
        paketData.length;


    document.getElementById(
        "jumlahPembayaran"
    ).textContent =
        pembayaranData.length;


    const table =
        document.getElementById(
            "dashboardTable"
        );


    if (transaksiData.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Belum ada transaksi.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        transaksiData
            .slice(0, 5)
            .map(transaksi => {

                const statusClass =
                    getStatusClass(
                        transaksi.status
                    );

                return `
                    <tr>

                        <td>
                            ${escapeHTML(
                                transaksi.pelanggan
                                    ?.nama_pelanggan || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                transaksi.paket_wedding
                                    ?.nama_paket || "-"
                            )}
                        </td>

                        <td>
                            ${formatTanggal(
                                transaksi.tanggal_transaksi
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                transaksi.total_transaksi
                            )}
                        </td>

                        <td>
                            <span class="badge ${statusClass}">
                                ${transaksi.status}
                            </span>
                        </td>

                    </tr>
                `;

            })
            .join("");
}


// =====================================================
// PELANGGAN
// =====================================================

function renderPelanggan() {

    const table =
        document.getElementById(
            "pelangganTable"
        );


    if (pelangganData.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    Belum ada data pelanggan.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        pelangganData.map(pelanggan => {

            return `
                <tr>

                    <td>
                        ${pelanggan.id_pelanggan}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(
                                pelanggan.nama_pelanggan
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            pelanggan.no_telepon
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            pelanggan.email || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            pelanggan.alamat || "-"
                        )}
                    </td>

                    <td>

                        <button
                            class="btn-delete"
                            onclick="deleteData(
                                'pelanggan',
                                ${pelanggan.id_pelanggan}
                            )"
                        >
                            Hapus
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}


// =====================================================
// PAKET
// =====================================================

function renderPaket() {

    const table =
        document.getElementById(
            "paketTable"
        );


    if (paketData.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Belum ada paket.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        paketData.map(paket => {

            return `
                <tr>

                    <td>
                        ${paket.id_paket}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(
                                paket.nama_paket
                            )}
                        </strong>
                    </td>

                    <td>
                        ${formatRupiah(
                            paket.harga
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            paket.deskripsi || "-"
                        )}
                    </td>

                    <td>

                        <button
                            class="btn-delete"
                            onclick="deleteData(
                                'paket',
                                ${paket.id_paket}
                            )"
                        >
                            Hapus
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}


// =====================================================
// TRANSAKSI
// =====================================================

function renderTransaksi() {

    const table =
        document.getElementById(
            "transaksiTable"
        );


    if (transaksiData.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8">
                    Belum ada transaksi.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        transaksiData.map(transaksi => {

            const statusClass =
                getStatusClass(
                    transaksi.status
                );


            return `
                <tr>

                    <td>
                        ${transaksi.id_transaksi}
                    </td>

                    <td>
                        ${escapeHTML(
                            transaksi.pelanggan
                                ?.nama_pelanggan || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            transaksi.paket_wedding
                                ?.nama_paket || "-"
                        )}
                    </td>

                    <td>
                        ${formatTanggal(
                            transaksi.tanggal_transaksi
                        )}
                    </td>

                    <td>
                        ${formatTanggal(
                            transaksi.tanggal_acara
                        )}
                    </td>

                    <td>
                        ${formatRupiah(
                            transaksi.total_transaksi
                        )}
                    </td>

                    <td>
                        <span class="badge ${statusClass}">
                            ${transaksi.status}
                        </span>
                    </td>

                    <td>

                        <button
                            class="btn-delete"
                            onclick="deleteData(
                                'transaksi',
                                ${transaksi.id_transaksi}
                            )"
                        >
                            Hapus
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}


// =====================================================
// PEMBAYARAN
// =====================================================

function renderPembayaran() {

    const table =
        document.getElementById(
            "pembayaranTable"
        );


    if (pembayaranData.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    Belum ada pembayaran.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        pembayaranData.map(pembayaran => {

            return `
                <tr>

                    <td>
                        ${pembayaran.id_pembayaran}
                    </td>

                    <td>
                        #${pembayaran.id_transaksi}
                    </td>

                    <td>
                        ${formatTanggal(
                            pembayaran.tanggal_pembayaran
                        )}
                    </td>

                    <td>
                        <strong>
                            ${formatRupiah(
                                pembayaran.jumlah_bayar
                            )}
                        </strong>
                    </td>

                    <td>
                        ${pembayaran.metode_pembayaran}
                    </td>

                    <td>
                        ${escapeHTML(
                            pembayaran.keterangan || "-"
                        )}
                    </td>

                    <td>

                        <button
                            class="btn-delete"
                            onclick="deleteData(
                                'pembayaran',
                                ${pembayaran.id_pembayaran}
                            )"
                        >
                            Hapus
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}


// =====================================================
// SELECT OPTION
// =====================================================

function populateSelects() {

    const pelangganSelect =
        document.getElementById(
            "transaksiPelanggan"
        );


    pelangganSelect.innerHTML = `
        <option value="">
            Pilih pelanggan
        </option>
    `;


    pelangganData.forEach(pelanggan => {

        pelangganSelect.innerHTML += `
            <option value="${pelanggan.id_pelanggan}">
                ${escapeHTML(
                    pelanggan.nama_pelanggan
                )}
            </option>
        `;

    });


    const paketSelect =
        document.getElementById(
            "transaksiPaket"
        );


    paketSelect.innerHTML = `
        <option value="">
            Pilih paket
        </option>
    `;


    paketData.forEach(paket => {

        paketSelect.innerHTML += `
            <option value="${paket.id_paket}">
                ${escapeHTML(
                    paket.nama_paket
                )}
            </option>
        `;

    });


    const transaksiSelect =
        document.getElementById(
            "pembayaranTransaksi"
        );


    transaksiSelect.innerHTML = `
        <option value="">
            Pilih transaksi
        </option>
    `;


    transaksiData.forEach(transaksi => {

        const pelanggan =
            transaksi.pelanggan
                ?.nama_pelanggan || "Tanpa Nama";


        transaksiSelect.innerHTML += `
            <option value="${transaksi.id_transaksi}">
                #${transaksi.id_transaksi}
                - ${escapeHTML(pelanggan)}
                - ${formatRupiah(
                    transaksi.total_transaksi
                )}
            </option>
        `;

    });
}


// =====================================================
// FORM PELANGGAN
// =====================================================

document
    .getElementById("formPelanggan")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const data = {

                nama_pelanggan:
                    document.getElementById(
                        "namaPelanggan"
                    ).value,

                no_telepon:
                    document.getElementById(
                        "teleponPelanggan"
                    ).value,

                email:
                    document.getElementById(
                        "emailPelanggan"
                    ).value,

                alamat:
                    document.getElementById(
                        "alamatPelanggan"
                    ).value

            };


            await postData(
                "/api/pelanggan",
                data,
                this
            );
        }
    );


// =====================================================
// FORM PAKET
// =====================================================

document
    .getElementById("formPaket")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const data = {

                nama_paket:
                    document.getElementById(
                        "namaPaket"
                    ).value,

                harga:
                    Number(
                        document.getElementById(
                            "hargaPaket"
                        ).value
                    ),

                deskripsi:
                    document.getElementById(
                        "deskripsiPaket"
                    ).value

            };


            await postData(
                "/api/paket",
                data,
                this
            );
        }
    );


// =====================================================
// FORM TRANSAKSI
// =====================================================

document
    .getElementById("formTransaksi")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const data = {

                id_pelanggan:
                    Number(
                        document.getElementById(
                            "transaksiPelanggan"
                        ).value
                    ),

                id_paket:
                    Number(
                        document.getElementById(
                            "transaksiPaket"
                        ).value
                    ),

                tanggal_transaksi:
                    document.getElementById(
                        "tanggalTransaksi"
                    ).value,

                tanggal_acara:
                    document.getElementById(
                        "tanggalAcara"
                    ).value,

                total_transaksi:
                    Number(
                        document.getElementById(
                            "totalTransaksiInput"
                        ).value
                    ),

                status:
                    document.getElementById(
                        "statusTransaksi"
                    ).value

            };


            await postData(
                "/api/transaksi",
                data,
                this
            );
        }
    );


// =====================================================
// FORM PEMBAYARAN
// =====================================================

document
    .getElementById("formPembayaran")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const data = {

                id_transaksi:
                    Number(
                        document.getElementById(
                            "pembayaranTransaksi"
                        ).value
                    ),

                tanggal_pembayaran:
                    document.getElementById(
                        "tanggalPembayaran"
                    ).value,

                jumlah_bayar:
                    Number(
                        document.getElementById(
                            "jumlahBayar"
                        ).value
                    ),

                metode_pembayaran:
                    document.getElementById(
                        "metodePembayaran"
                    ).value,

                keterangan:
                    document.getElementById(
                        "keteranganPembayaran"
                    ).value

            };


            await postData(
                "/api/pembayaran",
                data,
                this
            );
        }
    );


// =====================================================
// POST DATA
// =====================================================

async function postData(url, data, form) {
    try {
        let table = "";

        if (url === "/api/pelanggan") {
            table = "pelanggan";
        } else if (url === "/api/paket") {
            table = "paket_wedding";
        } else if (url === "/api/transaksi") {
            table = "transaksi_wedding";
        } else if (url === "/api/pembayaran") {
            table = "pembayaran";
        } else {
            throw new Error("Endpoint tidak dikenali.");
        }

        console.log("Data yang dikirim:", data);
        console.log("Tabel tujuan:", table);

        await supabaseRequest(
            table,
            "POST",
            data
        );

        form.reset();

        showToast("Data berhasil disimpan.");

        await loadData();

    } catch (error) {
        console.error("ERROR INSERT:", error);

        showToast(
            "Gagal menyimpan data: " +
            error.message
        );
    }
}


// =====================================================
// DELETE DATA
// =====================================================

async function deleteData(
    type,
    id
) {

    const confirmation =
        confirm(
            "Yakin ingin menghapus data ini?"
        );


    if (!confirmation) {

        return;

    }


    try {

        let table = "";

        let primaryKey = "";


        if (type === "pelanggan") {

            table = "pelanggan";

            primaryKey = "id_pelanggan";

        }


        else if (type === "paket") {

            table = "paket_wedding";

            primaryKey = "id_paket";

        }


        else if (type === "transaksi") {

            table = "transaksi_wedding";

            primaryKey = "id_transaksi";

        }


        else if (type === "pembayaran") {

            table = "pembayaran";

            primaryKey = "id_pembayaran";

        }


        else {

            throw new Error(
                "Jenis data tidak dikenali."
            );

        }


        await supabaseRequest(
            table,
            "DELETE",
            null,
            `?${primaryKey}=eq.${id}`
        );


        showToast(
            "Data berhasil dihapus."
        );


        await loadData();


    } catch (error) {

        console.error(error);


        showToast(
            "Gagal menghapus data: " +
            error.message
        );

    }
}


// =====================================================
// NAVIGATION
// =====================================================

function showSection(
    sectionId,
    button
) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    document
        .getElementById(sectionId)
        .classList.add(
            "active-section"
        );


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove(
                "active"
            );

        });


    button.classList.add("active");


    const titles = {

        dashboard:
            "Dashboard",

        pelanggan:
            "Data Pelanggan",

        paket:
            "Paket Wedding",

        transaksi:
            "Transaksi Wedding",

        pembayaran:
            "Pembayaran"

    };


    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[sectionId];
}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {

    if (status === "Lunas") {
        return "badge-lunas";
    }

    if (status === "DP") {
        return "badge-dp";
    }

    return "badge-belum";
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =====================================================
// SET DEFAULT DATE
// =====================================================

function setDefaultDates() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const tanggalTransaksi =
        document.getElementById(
            "tanggalTransaksi"
        );

    const tanggalPembayaran =
        document.getElementById(
            "tanggalPembayaran"
        );


    if (tanggalTransaksi) {
        tanggalTransaksi.value = today;
    }

    if (tanggalPembayaran) {
        tanggalPembayaran.value = today;
    }
}


// =====================================================
// START
// =====================================================

setDefaultDates();

loadData();
