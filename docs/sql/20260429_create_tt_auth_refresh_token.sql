CREATE TABLE tt_auth_refresh_token (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(128) NOT NULL,
    expires_at DATETIME2 NOT NULL,
    revoked_at DATETIME2 NULL,
    device_name VARCHAR(100) NULL,
    user_agent VARCHAR(500) NULL,
    ip_address VARCHAR(100) NULL,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NULL
);

CREATE INDEX ix_tt_auth_refresh_token_user_id
    ON tt_auth_refresh_token(user_id);

CREATE UNIQUE INDEX ux_tt_auth_refresh_token_token_hash
    ON tt_auth_refresh_token(token_hash);
