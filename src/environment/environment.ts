export default () => ({
  production: process.env.NODE_ENV !== 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apps: process.env.APPS || 'https://staging.catapa.com',
  endpoint: {
    baseurl: process.env.BASE_URL || 'https://api-staging.catapa.com',
    contenttype: 'application/x-www-form-urlencoded'
  },
  database: {
    type: process.env.DB_TYPE || 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false
  },
  queue: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    },
    bull: {
      prefix: 'catapa-extension:dbox:queue',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true
      }
    }
  },
  encryption: {
    provider: 'kms',
    currentKeyId: process.env.CATAPA_ENCRYPTION_CURRENTKEYID,
    kms: {
      config: {
        region: process.env.AWS_REGION
      },
      keyId: process.env.AWS_KMS_KEYID
    },
    env: {
      prefix: 'CATAPA_ENCRYPTION_KEYS_',
      suffix: '_PASSWORD'
    }
  }
});
