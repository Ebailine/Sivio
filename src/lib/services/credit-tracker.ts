/**
 * Credit Usage Tracker
 * Tracks Snov.io API credit usage to minimize costs and maximize ROI
 */

import { createAdminClient } from '@/lib/supabase/admin'

export interface CreditUsage {
  userId: string
  action: 'domain_search' | 'email_finder' | 'email_verification' | 'prospect_search'
  creditsUsed: number
  creditsEstimated: number // What we expected to spend
  creditsActual: number // What we actually spent
  results: number // How many contacts found
  costPerContact: number // Credits / contacts
  efficiency: number // (results / credits) * 100
  metadata: {
    company?: string
    domain?: string
    searchType?: string
    contactsFound?: number
    hrContactsFound?: number
    teamContactsFound?: number
  }
}

class CreditTracker {
  /**
   * Log credit usage to database
   */
  async logUsage(usage: CreditUsage): Promise<void> {
    const supabase = createAdminClient()

    try {
      await supabase.from('credit_usage_logs').insert({
        user_id: usage.userId,
        action: usage.action,
        credits_used: usage.creditsUsed,
        credits_estimated: usage.creditsEstimated,
        credits_actual: usage.creditsActual,
        results_count: usage.results,
        cost_per_contact: usage.costPerContact,
        efficiency_score: usage.efficiency,
        metadata: usage.metadata,
        created_at: new Date().toISOString(),
      })

      console.log(`[CreditTracker] Logged: ${usage.action} - ${usage.creditsUsed} credits, ${usage.results} results, ${usage.costPerContact.toFixed(2)} per contact`)
    } catch (error) {
      console.error('[CreditTracker] Failed to log usage:', error)
    }
  }

  /**
   * Get usage statistics for a user
   */
  async getStats(userId: string, days: number = 30): Promise<{
    totalCreditsUsed: number
    totalContacts: number
    averageCostPerContact: number
    efficiency: number
    mostEfficientAction: string
  }> {
    const supabase = createAdminClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: logs } = await supabase
      .from('credit_usage_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())

    if (!logs || logs.length === 0) {
      return {
        totalCreditsUsed: 0,
        totalContacts: 0,
        averageCostPerContact: 0,
        efficiency: 0,
        mostEfficientAction: 'none',
      }
    }

    const totalCreditsUsed = logs.reduce((sum, log) => sum + log.credits_used, 0)
    const totalContacts = logs.reduce((sum, log) => sum + log.results_count, 0)
    const averageCostPerContact = totalContacts > 0 ? totalCreditsUsed / totalContacts : 0

    // Find most efficient action type
    const actionStats: Record<string, { credits: number; contacts: number }> = {}
    logs.forEach(log => {
      if (!actionStats[log.action]) {
        actionStats[log.action] = { credits: 0, contacts: 0 }
      }
      actionStats[log.action].credits += log.credits_used
      actionStats[log.action].contacts += log.results_count
    })

    let mostEfficientAction = 'none'
    let bestEfficiency = 0

    Object.entries(actionStats).forEach(([action, stats]) => {
      const efficiency = stats.contacts > 0 ? stats.contacts / stats.credits : 0
      if (efficiency > bestEfficiency) {
        bestEfficiency = efficiency
        mostEfficientAction = action
      }
    })

    return {
      totalCreditsUsed,
      totalContacts,
      averageCostPerContact,
      efficiency: totalContacts > 0 ? (totalContacts / totalCreditsUsed) * 100 : 0,
      mostEfficientAction,
    }
  }

  /**
   * Estimate credits needed for an operation
   */
  estimateCredits(operation: 'domain_search' | 'email_finder' | 'prospect_search', count: number = 1): number {
    const rates = {
      domain_search: 1, // 1 credit gives 50 emails (most efficient!)
      email_finder: 1, // 1 credit per email found
      prospect_search: 1, // 1 credit per prospect with email
    }

    return rates[operation] * count
  }

  /**
   * Recommend most cost-effective approach
   */
  recommendApproach(companySize: 'small' | 'medium' | 'large'): {
    method: string
    estimatedCredits: number
    expectedContacts: number
    reasoning: string
  } {
    // Domain Search is almost always most efficient
    // 1 credit = up to 50 emails vs 1 credit per email in prospect search

    return {
      method: 'domain_search',
      estimatedCredits: 1,
      expectedContacts: 4,
      reasoning: 'Domain Search: 1 credit for up to 50 emails. Most cost-effective for all company sizes. AI filters to top 4 after retrieval.',
    }
  }
}

export const creditTracker = new CreditTracker()
