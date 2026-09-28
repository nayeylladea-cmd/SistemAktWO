DROP TABLE IF EXISTS pembayaran CASCADE;
DROP TABLE IF EXISTS transaksi_wedding CASCADE;
DROP TABLE IF EXISTS paket_wedding CASCADE;
DROP TABLE IF EXISTS pelanggan CASCADE;


-- ==========================================
-- 1. PELANGGAN
-- ==========================================

CREATE TABLE pelanggan (
    id_pelanggan BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_pelanggan VARCHAR(100) NOT NULL,
    no_telepon VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    alamat TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- 2. PAKET WEDDING
-- ==========================================

CREATE TABLE paket_wedding (
    id_paket BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_paket VARCHAR(100) NOT NULL,
    harga NUMERIC(15,2) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- 3. TRANSAKSI WEDDING
-- ==========================================

CREATE TABLE transaksi_wedding (
    id_transaksi BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    id_pelanggan BIGINT NOT NULL,
    id_paket BIGINT NOT NULL,

    tanggal_transaksi DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_acara DATE NOT NULL,

    total_transaksi NUMERIC(15,2) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'Belum Lunas',

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT transaksi_pelanggan_fk
        FOREIGN KEY (id_pelanggan)
        REFERENCES pelanggan(id_pelanggan),

    CONSTRAINT transaksi_paket_fk
        FOREIGN KEY (id_paket)
        REFERENCES paket_wedding(id_paket),

    CONSTRAINT transaksi_status_check
        CHECK (
            status IN (
                'Belum Lunas',
                'DP',
                'Lunas'
            )
        )
);


-- ==========================================
-- 4. PEMBAYARAN
-- ==========================================

CREATE TABLE pembayaran (
    id_pembayaran BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    id_transaksi BIGINT NOT NULL,

    tanggal_pembayaran DATE NOT NULL DEFAULT CURRENT_DATE,

    jumlah_bayar NUMERIC(15,2) NOT NULL,

    metode_pembayaran VARCHAR(20) NOT NULL,

    keterangan TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT pembayaran_transaksi_fk
        FOREIGN KEY (id_transaksi)
        REFERENCES transaksi_wedding(id_transaksi)
        ON DELETE CASCADE,

    CONSTRAINT pembayaran_metode_check
        CHECK (
            metode_pembayaran IN (
                'Cash',
                'Transfer',
                'QRIS'
            )
        )
);


-- ==========================================
-- DATA AWAL PAKET
-- ==========================================

INSERT INTO paket_wedding
(
    nama_paket,
    harga,
    deskripsi
)
VALUES
(
    'Paket Silver',
    15000000,
    'Dekorasi dan catering 300 pax'
),
(
    'Paket Gold',
    25000000,
    'Dekorasi premium dan catering 500 pax'
),
(
    'Paket Platinum',
    40000000,
    'Full wedding service dan catering 800 pax'
);


-- ==========================================
-- DATA AWAL PELANGGAN
-- ==========================================

INSERT INTO pelanggan
(
    nama_pelanggan,
    no_telepon,
    email,
    alamat
)
VALUES
(
    'Andi Pratama',
    '081234567890',
    'andi@email.com',
    'Semarang'
),
(
    'Sinta Maharani',
    '082345678901',
    'sinta@email.com',
    'Kendal'
);


-- ==========================================
-- DATA AWAL TRANSAKSI
-- ==========================================

INSERT INTO transaksi_wedding
(
    id_pelanggan,
    id_paket,
    tanggal_transaksi,
    tanggal_acara,
    total_transaksi,
    status
)
VALUES
(
    1,
    2,
    CURRENT_DATE,
    CURRENT_DATE + 90,
    25000000,
    'DP'
),
(
    2,
    1,
    CURRENT_DATE,
    CURRENT_DATE + 120,
    15000000,
    'Belum Lunas'
);


-- ==========================================
-- DATA AWAL PEMBAYARAN
-- ==========================================

INSERT INTO pembayaran
(
    id_transaksi,
    tanggal_pembayaran,
    jumlah_bayar,
    metode_pembayaran,
    keterangan
)
VALUES
(
    1,
    CURRENT_DATE,
    5000000,
    'Transfer',
    'Pembayaran DP'
),
(
    2,
    CURRENT_DATE,
    3000000,
    'QRIS',
    'Pembayaran awal'
);