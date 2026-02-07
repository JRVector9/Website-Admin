import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication (optional, but recommended)
  const authHeader = req.headers.authorization;
  const token = req.cookies.v9_admin_token || authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const config = req.body;

    // Save config to Upstash Redis
    await redis.set('v9_site_config', JSON.stringify(config));

    return res.status(200).json({
      success: true,
      message: 'Configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving config:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save configuration'
    });
  }
}
