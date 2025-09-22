module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    // Provide sane defaults for local development if APP_KEYS is not set
    keys: env.array('APP_KEYS', [
      'dev-key-a-0f3a4c1a9f7b4d4c8b2d7d2f3e1c9a7b',
      'dev-key-b-9a7b3c1d5e6f8a0b2c3d4e5f6a7b8c9d'
    ]),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
