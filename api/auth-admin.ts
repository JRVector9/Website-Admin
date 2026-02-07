import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple JWT-like token creation (using base64)
function createToken(password: string): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (24 * 60 * 60); // 24 hours expiration

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    password,
    exp,
    iat: now
  })).toString('base64');

  // Simple signature (in production, use proper HMAC)
  const signature = Buffer.from(`${process.env.ADMIN_PASSWORD}:${exp}`).toString('base64');

  return `${header}.${payload}.${signature}`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    if (password === correctPassword) {
      const token = createToken(password);
      return res.status(200).json({
        success: true,
        token,
        message: 'Authentication successful'
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}
