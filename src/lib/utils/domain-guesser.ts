/**
 * Utility to guess company domains from company names
 * Used when job listing doesn't provide a direct company URL
 */

export function guessCompanyDomain(companyName: string): string {
  if (!companyName) return ''

  // Clean the company name
  let domain = companyName.toLowerCase()

  // Remove common suffixes
  const suffixes = [
    ', llc', ' llc', ', inc', ' inc', ', inc.', ' inc.',
    ', ltd', ' ltd', ', ltd.', ' ltd.',
    ', corp', ' corp', ', corporation', ' corporation',
    ', co', ' co', ', co.', ' co.',
    ' company', ' companies',
    ' & co', ' and co',
    ' group', ' international', ' intl',
  ]

  for (const suffix of suffixes) {
    if (domain.endsWith(suffix)) {
      domain = domain.substring(0, domain.length - suffix.length)
    }
  }

  // Remove special characters and spaces
  domain = domain
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/-+/g, '') // Remove hyphens
    .trim()

  // Add .com (most common TLD)
  return domain ? `${domain}.com` : ''
}

/**
 * Extract domain from URL, or guess from company name if URL is from a job board
 */
export function getCompanyDomain(url: string | null, companyName: string): string {
  // If no URL, guess from company name
  if (!url) {
    return guessCompanyDomain(companyName)
  }

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const hostname = urlObj.hostname.replace('www.', '')

    // Check if it's a job board URL (not the actual company)
    const jobBoards = [
      'adzuna.com',
      'indeed.com',
      'linkedin.com',
      'glassdoor.com',
      'monster.com',
      'careerbuilder.com',
      'ziprecruiter.com',
      'simplyhired.com',
    ]

    const isJobBoard = jobBoards.some(board => hostname.includes(board))

    // If it's a job board, guess from company name instead
    if (isJobBoard) {
      return guessCompanyDomain(companyName)
    }

    return hostname
  } catch (error) {
    // If URL parsing fails, guess from company name
    return guessCompanyDomain(companyName)
  }
}
