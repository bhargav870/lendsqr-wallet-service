import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  apiToken: process.env.API_TOKEN || 'demo-credit-test-token',
  adjutorBaseUrl: process.env.ADJUTOR_BASE_URL || 'https://adjutor.lendsqr.com/v2',
  adjutorApiKey: process.env.ADJUTOR_API_KEY || '',
  karmaCheckEnabled: process.env.KARMA_CHECK_ENABLED !== 'false'
};
