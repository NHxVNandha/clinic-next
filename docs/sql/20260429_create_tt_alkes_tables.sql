CREATE TABLE tt_alkes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_alkes VARCHAR(20) NOT NULL,
    id_registrasi VARCHAR(50) NOT NULL,
    id_pasien VARCHAR(50) NOT NULL,
    kd_dokter VARCHAR(50) NULL,
    tanggal VARCHAR(20) NULL,
    total DECIMAL(18,2) NULL,
    status VARCHAR(5) NULL,
    input_by INT NULL,
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL,
    deleted_at DATETIME2 NULL
);

CREATE TABLE tt_alkes_detail (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_alkes BIGINT NOT NULL,
    kode_barang VARCHAR(100) NULL,
    nama_barang VARCHAR(255) NOT NULL,
    jumlah INT NOT NULL,
    harga DECIMAL(18,2) NOT NULL,
    total DECIMAL(18,2) NOT NULL,
    status VARCHAR(5) NULL,
    input_by INT NULL,
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL,
    deleted_at DATETIME2 NULL
);

CREATE INDEX ix_tt_alkes_id_registrasi ON tt_alkes(id_registrasi);
CREATE INDEX ix_tt_alkes_detail_id_alkes ON tt_alkes_detail(id_alkes);
