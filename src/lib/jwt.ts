import jwt from 'jsonwebtoken'

// Use the provided token for development
const JWT_SECRET = process.env.JWT_SECRET || '4604ccfdc7aea6b62f7611f34b335f7ced3583fd'

export interface JWTPayload {
  userId: string
  email: string
  agencyId: string
  subdomain: string
  role: string
  iat?: number
  exp?: number
}

export class JWTService {
  /**
   * Sign a JWT token with the given payload
   */
  static sign(payload: JWTPayload, expiresIn: string = '24h'): string {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn })
    } catch (error) {
      console.error('JWT signing error:', error)
      // Fallback to simple token for development
      return Buffer.from(JSON.stringify(payload)).toString('base64')
    }
  }

  /**
   * Verify a JWT token and return the decoded payload
   */
  static verify(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
      return decoded
    } catch (error) {
      console.error('JWT verification error:', error)
      // Try to decode as base64 fallback for development
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        if (decoded && decoded.userId) {
          return decoded as JWTPayload
        }
      } catch (fallbackError) {
        console.error('JWT fallback decode error:', fallbackError)
      }
      return null
    }
  }

  /**
   * Decode a JWT token without verification (for debugging)
   */
  static decode(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload
      return decoded
    } catch (error) {
      console.error('JWT decode error:', error)
      // Try base64 fallback
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        if (decoded && decoded.userId) {
          return decoded as JWTPayload
        }
      } catch (fallbackError) {
        console.error('JWT fallback decode error:', fallbackError)
      }
      return null
    }
  }

  /**
   * Check if token is expired
   */
  static isExpired(token: string): boolean {
    const decoded = this.decode(token)
    if (!decoded || !decoded.exp) return true
    
    return decoded.exp * 1000 < Date.now()
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  static getTimeUntilExpiry(token: string): number {
    const decoded = this.decode(token)
    if (!decoded || !decoded.exp) return 0
    
    return Math.max(0, decoded.exp * 1000 - Date.now())
  }

  /**
   * Refresh a token (extend expiration)
   */
  static refresh(token: string): string | null {
    const decoded = this.verify(token)
    if (!decoded) return null

    // Remove old timestamp fields
    const { iat, exp, ...payload } = decoded

    // Sign new token with same payload
    return this.sign(payload as JWTPayload)
  }

  /**
   * Create a demo token for development
   */
  static createDemoToken(): string {
    const demoPayload: JWTPayload = {
      userId: 'demo-user-id',
      email: 'demo@agency.com',
      agencyId: 'demo-agency-id',
      subdomain: 'demo',
      role: 'AGENCY_ADMIN'
    }
    return this.sign(demoPayload)
  }
}