ALTER TABLE tt_auth_refresh_token
ADD device_name VARCHAR(100) NULL,
    user_agent VARCHAR(500) NULL,
    ip_address VARCHAR(100) NULL;
