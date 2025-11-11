/**
 * Email Pattern Generator
 * Generates and verifies email patterns when Snov.io has no data
 *
 * COST: 1 credit per verification
 * FALLBACK: When Snov.io Domain Search returns 0 contacts
 */

import { snovClient } from '@/lib/snov/client'
import type { LinkedInContact } from './linkedin-scraper'

export interface GeneratedEmail {
  email: string
  pattern: string
  confidence: 'high' | 'medium' | 'low'
  verified: boolean
  status: 'valid' | 'catch-all' | 'invalid' | 'unknown'
}

export class EmailPatternGenerator {
  /**
   * Generate all common email patterns for a contact
   * Based on industry research: most common patterns
   */
  generatePatterns(firstName: string, lastName: string, domain: string): Array<{pattern: string, email: string, likelihood: number}> {
    const fn = firstName.toLowerCase()
    const ln = lastName.toLowerCase()
    const firstInitial = fn[0] || ''
    const lastInitial = ln[0] || ''

    // Patterns ordered by likelihood (industry data)
    return [
      { pattern: 'first.last@domain', email: `${fn}.${ln}@${domain}`, likelihood: 46 }, // 46% of companies
      { pattern: 'first@domain', email: `${fn}@${domain}`, likelihood: 23 }, // 23% of companies
      { pattern: 'flast@domain', email: `${firstInitial}${ln}@${domain}`, likelihood: 12 }, // 12% of companies
      { pattern: 'firstlast@domain', email: `${fn}${ln}@${domain}`, likelihood: 8 }, // 8% of companies
      { pattern: 'first_last@domain', email: `${fn}_${ln}@${domain}`, likelihood: 5 }, // 5% of companies
      { pattern: 'last.first@domain', email: `${ln}.${fn}@${domain}`, likelihood: 3 }, // 3% of companies
      { pattern: 'f.last@domain', email: `${firstInitial}.${ln}@${domain}`, likelihood: 2 }, // 2% of companies
      { pattern: 'first.l@domain', email: `${fn}.${lastInitial}@${domain}`, likelihood: 1 }, // 1% of companies
    ]
  }

  /**
   * Verify email patterns using Snov.io email verifier
   * Costs 1 credit per verification
   * Stops at first valid email to minimize costs
   */
  async verifyPatterns(
    patterns: Array<{pattern: string, email: string, likelihood: number}>,
    maxVerifications: number = 3
  ): Promise<GeneratedEmail[]> {
    const verified: GeneratedEmail[] = []
    let verificationsUsed = 0

    console.log(`[Pattern Generator] Verifying up to ${maxVerifications} patterns...`)

    for (const {pattern, email, likelihood} of patterns) {
      if (verificationsUsed >= maxVerifications) {
        console.log(`[Pattern Generator] Reached max verifications (${maxVerifications})`)
        break
      }

      try {
        const result = await snovClient.verifyEmail(email)
        verificationsUsed++

        console.log(`[Pattern Generator] Verified ${email}: ${result.result}`)

        if (result.result === 'valid') {
          // Found a valid email - stop here!
          verified.push({
            email,
            pattern,
            confidence: likelihood > 20 ? 'high' : likelihood > 10 ? 'medium' : 'low',
            verified: true,
            status: 'valid'
          })
          console.log(`✅ Valid email found: ${email} (pattern: ${pattern})`)
          break // Stop after first valid email
        }

        if (result.result === 'catch-all') {
          // Catch-all - might work, keep as backup
          verified.push({
            email,
            pattern,
            confidence: 'medium',
            verified: true,
            status: 'catch-all'
          })
        }

        // If invalid, continue to next pattern
      } catch (error) {
        console.error(`[Pattern Generator] Verification failed for ${email}:`, error)
        // Continue to next pattern
      }
    }

    console.log(`[Pattern Generator] Verified ${verificationsUsed} patterns, found ${verified.length} usable emails`)
    return verified
  }

  /**
   * Main method: Generate + verify emails for LinkedIn contacts
   * Returns contacts with verified emails when possible
   */
  async generateVerifiedEmails(
    linkedInContacts: LinkedInContact[],
    domain: string,
    maxVerificationsPerContact: number = 3
  ): Promise<Array<LinkedInContact & {generatedEmail?: GeneratedEmail}>> {
    console.log(`[Pattern Generator] Generating emails for ${linkedInContacts.length} contacts at ${domain}`)

    const results = []
    let totalVerifications = 0

    for (const contact of linkedInContacts) {
      // Extract name parts
      const nameParts = contact.name.split(' ')
      if (nameParts.length < 2) {
        console.log(`[Pattern Generator] Skipping ${contact.name} - need first and last name`)
        results.push(contact)
        continue
      }

      const firstName = nameParts[0]
      const lastName = nameParts[nameParts.length - 1]

      // Generate patterns
      const patterns = this.generatePatterns(firstName, lastName, domain)
      console.log(`[Pattern Generator] Generated ${patterns.length} patterns for ${contact.name}`)

      // Verify patterns (stops at first valid)
      const verified = await this.verifyPatterns(patterns, maxVerificationsPerContact)
      totalVerifications += Math.min(verified.length + 1, maxVerificationsPerContact) // +1 for invalid attempts

      if (verified.length > 0 && verified[0].status === 'valid') {
        // Found valid email!
        results.push({
          ...contact,
          generatedEmail: verified[0]
        })
      } else if (verified.length > 0 && verified[0].status === 'catch-all') {
        // Found catch-all (might work)
        results.push({
          ...contact,
          generatedEmail: verified[0]
        })
      } else {
        // No valid email found
        results.push(contact)
      }
    }

    console.log(`[Pattern Generator] Complete: ${totalVerifications} verifications used`)
    console.log(`[Pattern Generator] Result: ${results.filter(r => r.generatedEmail?.status === 'valid').length} valid emails`)

    return results
  }

  /**
   * Estimate cost for pattern generation
   */
  estimateCost(contactCount: number, verificationsPerContact: number = 3): {
    creditsEstimated: number
    costUSD: number
  } {
    const SNOV_COST_PER_CREDIT = 0.029 // $29.25 / 1000
    const creditsEstimated = contactCount * verificationsPerContact

    return {
      creditsEstimated,
      costUSD: creditsEstimated * SNOV_COST_PER_CREDIT
    }
  }
}

export const emailPatternGenerator = new EmailPatternGenerator()
