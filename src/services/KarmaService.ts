import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export class KarmaService {
  private readonly client: AxiosInstance;

  constructor(client?: AxiosInstance) {
    this.client = client || axios.create({
      baseURL: env.adjutorBaseUrl,
      timeout: 8000,
      headers: env.adjutorApiKey ? { Authorization: `Bearer ${env.adjutorApiKey}` } : undefined
    });
  }

  async ensureUserIsAllowed(identities: Array<string | null | undefined>): Promise<void> {
    if (!env.karmaCheckEnabled) return;

    const values = identities.filter((identity): identity is string => Boolean(identity));
    for (const identity of values) {
      const blacklisted = await this.isBlacklisted(identity);
      if (blacklisted) {
        throw new AppError('User cannot be onboarded because a matching identity exists on Lendsqr Karma blacklist', 403, 'KARMA_BLACKLISTED');
      }
    }
  }

  async isBlacklisted(identity: string): Promise<boolean> {
    if (!env.adjutorApiKey) return false;

    try {
      const response = await this.client.get(`/verification/karma/${encodeURIComponent(identity)}`);
      return response.data?.status === 'success' && Boolean(response.data?.data);
    } catch (error: any) {
      if (error.response?.status === 404) return false;
      throw new AppError('Unable to complete Karma blacklist check', 502, 'KARMA_CHECK_FAILED');
    }
  }
}
