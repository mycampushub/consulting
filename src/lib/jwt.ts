import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'

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
    return jwt.sign(payload, JWT_SECRET, { expiresIn })
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
}