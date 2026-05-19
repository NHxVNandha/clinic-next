CREATE TABLE tt_laboratorium (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_laboratorium VARCHAR(20) NOT NULL,
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

CREATE TABLE tt_laboratorium_detail (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_laboratorium BIGINT NOT NULL,
    kode_pemeriksaan VARCHAR(100) NULL,
    nama_pemeriksaan VARCHAR(255) NOT NULL,
    hasil VARCHAR(255) NULL,
    jumlah INT NOT NULL,
    harga DECIMAL(18,2) NOT NULL,
    total DECIMAL(18,2) NOT NULL,
    status VARCHAR(5) NULL,
    input_by INT NULL,
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL,
    deleted_at DATETIME2 NULL
);

CREATE TABLE tt_radiologi (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_radiologi VARCHAR(20) NOT NULL,
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

CREATE TABLE tt_radiologi_detail (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_radiologi BIGINT NOT NULL,
    kode_pemeriksaan VARCHAR(100) NULL,
    nama_pemeriksaan VARCHAR(255) NOT NULL,
    hasil VARCHAR(255) NULL,
    jumlah INT NOT NULL,
    harga DECIMAL(18,2) NOT NULL,
    total DECIMAL(18,2) NOT NULL,
    status VARCHAR(5) NULL,
    input_by INT NULL,
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL,
    deleted_at DATETIME2 NULL
);

CREATE INDEX ix_tt_laboratorium_id_registrasi ON tt_laboratorium(id_registrasi);
CREATE INDEX ix_tt_laboratorium_detail_id_laboratorium ON tt_laboratorium_detail(id_laboratorium);
CREATE INDEX ix_tt_radiologi_id_registrasi ON tt_radiologi(id_registrasi);
CREATE INDEX ix_tt_radiologi_detail_id_radiologi ON tt_radiologi_detail(id_radiologi);
