import dotenv from "dotenv";
dotenv.config();

/**
 * Project Configuration matching chefboxai-api structure
 */
export default {
  database: {
    host: process.env.AUTH_DB_HOST || process.env.DB_HOST,
    port: Number.parseInt(process.env.AUTH_DB_PORT) || Number.parseInt(process.env.DB_PORT) || 5432,
    database: process.env.AUTH_DB_NAME || process.env.DB_NAME,
    username: process.env.AUTH_DB_USER || process.env.DB_USER,
    password: process.env.AUTH_DB_PASSWORD || process.env.DB_PASS || process.env.DB_PASSWORD,
    dialect: "postgres",
    logging: false,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ? `${process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS}d` : '7d',
  },

  app: {
    // Handling IIS Named Pipes
    port: Number.isNaN(Number(process.env.PORT)) ? process.env.PORT : Number(process.env.PORT) || 4000,
    apiPrefix: process.env.API_PREFIX ? (process.env.API_PREFIX.startsWith('/') ? process.env.API_PREFIX : `/${process.env.API_PREFIX}`) : '/api',
    baseUrl: process.env.BASE_URL,
    hostIp: process.env.HOST_IP || 'localhost',
    jsonLimit: process.env.JSON_LIMIT || '10mb',
  },

  security: {
    rateLimit: {
      windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, 
      max: Number.parseInt(process.env.RATE_LIMIT_MAX) || 100,
      message: process.env.RATE_LIMIT_MESSAGE || 'Too many requests.',
    },

    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? (process.env.CORS_ORIGIN || "").split(",")
          : "*",
      credentials: process.env.CORS_CREDENTIALS === "true",
    },
  },

  docs: {
    enabled:
      String(process.env.ENABLE_DOCS).trim().toLowerCase() === "true" ||
      process.env.NODE_ENV !== "production",
  },
};
