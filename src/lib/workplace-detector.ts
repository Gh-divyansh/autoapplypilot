/**
 * AutoApplyPilot - Workplace Type Detection Engine
 * Accurately classifies opportunities into 'REMOTE', 'ON_SITE', or 'HYBRID'
 * based on structured tags, location strings, job titles, and job descriptions.
 */

export type WorkplaceType = 'REMOTE' | 'ON_SITE' | 'HYBRID';

export interface WorkplaceDetectionInput {
  title?: string | null;
  location?: string | null;
  description?: string | null;
  workplaceTag?: string | null;
}

// Phrases that explicitly negate remote status
const REMOTE_NEGATION_REGEX = /\b(?:not\s+remote|no\s+remote|non-remote|non\s+remote|remote[:\s]+no|remote[:\s]+false|cannot\s+(?:be\s+worked\s+)?remotely|remote\s+work\s+is\s+not\s+(?:permitted|allowed|available)|not\s+open\s+to\s+remote|not\s+a\s+remote\s+(?:job|role|position)|on-site\s+only|onsite\s+only|in-person\s+only|work\s+from\s+office\s+only|must\s+work\s+(?:from|in)\s+(?:the\s+)?office)\b/i;

// Hybrid keywords and patterns
const HYBRID_REGEX = /\b(?:hybrid|part[- ]remote|partially\s+remote|part[- ]time\s+remote|flexible\s*\(?hybrid\)?|hybrid[- ]remote|remote\s*\/\s*(?:office|on-site|onsite)|(?:office|on-site|onsite)\s*\/\s*remote|hybrid\s+work\s+model|hybrid\s+model|hybrid\s+schedule|hybrid\s+environment|(?:[1-4]|one|two|three|four)\s*days?\s*(?:a\s*week\s*)?(?:in|from|at)\s*(?:the\s*)?office|(?:[1-4]|one|two|three|four)\s*days?\s*(?:a\s*week\s*)?(?:remote|wfh|from\s*home))\b/i;

// Explicit On-Site keywords
const EXPLICIT_ONSITE_REGEX = /\b(?:on-site|onsite|in-office|in\s+office|office-based|office\s+based|work\s+from\s+office|wfo|in-person|in\s+person|100%\s+on-site|strictly\s+on-site)\b/i;

// Explicit Remote keywords in title or location
const EXPLICIT_REMOTE_TITLE_LOC_REGEX = /\b(?:remote|wfh|work\s+from\s+home|telecommute|virtual|work\s+from\s+anywhere|worldwide\s+remote|remote[- ]first)\b/i;

// Strong Remote keywords in description (avoiding false positives like "remote team", "remote access")
const STRONG_REMOTE_DESC_REGEX = /\b(?:100%\s+remote|fully\s+remote|permanent(?:ly)?\s+remote|entirely\s+remote|completely\s+remote|strictly\s+remote|remote-first|remote\s+first|work\s+from\s+home|wfh|work\s+remotely|remote\s+position|remote\s+role|remote\s+job|remote\s+opportunity|remote\s+employee|remote\s+candidate|remote\s+friendly|remote\s+eligible|open\s+to\s+remote)\b/i;

// Common physical cities and indicators for on-site default
const PHYSICAL_LOCATION_INDICATORS = /\b(?:bengaluru|bangalore|hyderabad|pune|mumbai|delhi|new\s+delhi|noida|gurgaon|gurugram|chennai|kanpur|kolkata|ahmedabad|jaipur|indore|chandigarh|kochi|coimbatore|nagpur|vadodara|medak|maddur|mandya|thane|surat|lucknow|bhopal|visakhapatnam|london|san\s+francisco|new\s+york|seattle|austin|chicago|berlin|singapore|dubai|tokyo|toronto)\b/i;

/**
 * Detects whether a job is REMOTE, HYBRID, or ON_SITE.
 */
export function detectWorkplaceType(input: WorkplaceDetectionInput): WorkplaceType {
  const title = (input.title || '').trim();
  const location = (input.location || '').trim();
  const description = (input.description || '').trim();
  const tag = (input.workplaceTag || '').trim().toLowerCase();

  const combinedText = `${title} ${location} ${description}`;

  // 1. Check for explicit remote negation first
  const hasRemoteNegation = REMOTE_NEGATION_REGEX.test(combinedText) || REMOTE_NEGATION_REGEX.test(tag);

  // 2. Check structured workplace tag if provided
  if (tag) {
    if (tag.includes('hybrid')) return 'HYBRID';
    if (tag.includes('on-site') || tag.includes('onsite') || tag.includes('office')) return 'ON_SITE';
    if ((tag.includes('remote') || tag.includes('virtual')) && !hasRemoteNegation) return 'REMOTE';
  }

  // 3. Check for Hybrid in location or title
  if (HYBRID_REGEX.test(location) || HYBRID_REGEX.test(title)) {
    return 'HYBRID';
  }

  // 4. Check for Hybrid in description
  if (HYBRID_REGEX.test(description)) {
    return 'HYBRID';
  }

  // 5. If remote is negated, it must be ON_SITE
  if (hasRemoteNegation) {
    return 'ON_SITE';
  }

  // 6. Check for explicit On-Site in title or location
  if (EXPLICIT_ONSITE_REGEX.test(location) || EXPLICIT_ONSITE_REGEX.test(title)) {
    return 'ON_SITE';
  }

  // 7. Check for Remote in title
  if (EXPLICIT_REMOTE_TITLE_LOC_REGEX.test(title)) {
    return 'REMOTE';
  }

  // 8. Check for Remote in location
  if (EXPLICIT_REMOTE_TITLE_LOC_REGEX.test(location)) {
    // If location says e.g. "Bengaluru, Karnataka" and also has "Remote", e.g. "Bengaluru / Remote"
    if (PHYSICAL_LOCATION_INDICATORS.test(location)) {
      // "Bengaluru / Remote" or "Remote / Seattle" without hybrid mention is REMOTE
      return 'REMOTE';
    }
    return 'REMOTE';
  }

  // 9. Purely remote location tokens (e.g. "Anywhere", "Worldwide")
  if (/^(?:anywhere|worldwide|everywhere)$/i.test(location.toLowerCase())) {
    return 'REMOTE';
  }

  // 10. Check for strong remote phrasing in description
  if (STRONG_REMOTE_DESC_REGEX.test(description)) {
    return 'REMOTE';
  }

  // 11. Check for explicit On-Site phrasing in description
  if (EXPLICIT_ONSITE_REGEX.test(description)) {
    return 'ON_SITE';
  }

  // 12. If location specifies a concrete physical city/region and no remote indicator matched, it is ON_SITE
  if (PHYSICAL_LOCATION_INDICATORS.test(location)) {
    return 'ON_SITE';
  }

  // 13. If location is a comma-separated address or city/state (e.g., "Medak, Telangana" or "Thane, Maharashtra")
  if (location.includes(',') && !location.toLowerCase().includes('remote')) {
    return 'ON_SITE';
  }

  // 14. If location is empty or absent
  if (!location) {
    return 'REMOTE';
  }

  // 15. Default for generic country (e.g. "India") with no remote mention
  // Standard Indian job boards (Adzuna, Naukri) listing just "India" with physical company are On-Site
  return 'ON_SITE';
}

