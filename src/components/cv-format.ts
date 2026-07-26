// Presentation-only helpers. The data layer (src/lib/cv.ts) stays untouched.

import { marked } from 'marked'

const COMBINING = /[̀-ͯ]/g
const NBSP = / /g

const TR: Record<string, string> = {
  ı: 'i',
  İ: 'i',
  ğ: 'g',
  Ğ: 'g',
  ş: 's',
  Ş: 's',
  ç: 'c',
  Ç: 'c',
  ö: 'o',
  Ö: 'o',
  ü: 'u',
  Ü: 'u',
}

/**
 * Fold a title or slug down to a comparison key: Turkish letters mapped to
 * ASCII, diacritics dropped, everything non-alphanumeric removed.
 * "Doğuş Media Group" and "dogus-media-group" both become "dogusmediagroup".
 */
export function key(value = ''): string {
  return value
    .replace(/[ıİğĞşŞçÇöÖüÜ]/g, (c) => TR[c] ?? c)
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING, '')
    .replace(/[^a-z0-9]/g, '')
}

const LOOKS_LIKE_HTML = /<\/?[a-z][^>]*>/i

/**
 * Rich text arrives in two shapes and both have to render.
 *
 * The original import from JustFields carried raw HTML. Anything edited since
 * in JustJSON comes back as Markdown, because its editor stores Markdown on
 * disk — which is the point: it stays diffable. So: parse Markdown unless the
 * value is already HTML.
 */
export function cleanHtml(value = ''): string {
  const text = value.replace(/&nbsp;/gi, ' ').replace(NBSP, ' ').trim()
  if (!text) return ''

  if (LOOKS_LIKE_HTML.test(text)) {
    return text
      .replace(/[ \t]+(<\/(?:li|p|div|strong|em|b|i)>)/g, '$1')
      .replace(/[ \t]{2,}/g, ' ')
      .trim()
  }

  return marked.parse(text, { async: false, breaks: false, gfm: true }).trim()
}

/** Plain text for meta tags. Handles both shapes — HTML tags and Markdown marks
 *  — otherwise the description ships with literal `**` in it. */
export function stripHtml(value = ''): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*\*|\*\*|__|[*_`~])/g, '')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(NBSP, ' ')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncate(text: string, max = 158): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const stop = cut.lastIndexOf(' ')
  return `${(stop > 40 ? cut.slice(0, stop) : cut).replace(/[.,;:]$/, '')}…`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatEndpoint(raw: string): string {
  const value = raw.trim()
  if (!value) return ''
  if (/present|current|devam/i.test(value)) return 'Present'

  const yearMonth = value.match(/^(\d{4})[/.\-](\d{1,2})$/)
  if (yearMonth) {
    const month = Number(yearMonth[2])
    if (month >= 1 && month <= 12) return `${MONTHS[month - 1]} ${yearMonth[1]}`
  }

  const year = value.match(/\d{4}/)
  return year ? year[0] : value
}

/** "2009/11 - 2021/05" -> "Nov 2009 – May 2021"; "2023 - Present" is kept whole. */
export function formatSpan(date?: string): string {
  if (!date) return ''
  return date
    .split(/\s+[–—-]\s+/)
    .map(formatEndpoint)
    .filter(Boolean)
    .join(' – ')
}

/** The first four-digit year in a date string, or 0. */
export function startYear(date?: string): number {
  const match = date?.match(/\d{4}/)
  return match ? Number(match[0]) : 0
}

/** Remote asset filenames contain spaces; keep them valid in `src`. */
export function safeUrl(url?: string): string | undefined {
  return url ? url.replace(/ /g, '%20') : undefined
}
