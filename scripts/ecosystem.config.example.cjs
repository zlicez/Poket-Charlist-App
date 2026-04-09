module.exports = {
  apps: [
    {
      name: "charlist",
      script: "./dist/index.cjs",
      env: {
        NODE_ENV: "production",
        PORT: "5000",
        COOKIE_SECURE: "true",
        DATABASE_URL: "postgresql://USER:PASSWORD@HOST:5432/DBNAME",
        SESSION_SECRET: "replace-with-a-secure-random-string",
        GOOGLE_CLIENT_ID: "replace-with-google-client-id",
        GOOGLE_CLIENT_SECRET: "replace-with-google-client-secret",
      },
    },
  ],
};
