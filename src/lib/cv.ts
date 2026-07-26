// İçerik JustJSON tarafından content/ altına yazılır; burada build anında okunur.

export interface Home {
  name: string
  title: string
  photo: string
  location: string
  summary: string
}

export interface Url {
  slug: string
  label: string
  url: string
}

export interface Experience {
  slug: string
  title: string
  date: string
  position: string
  content: string
}

export interface Project {
  slug: string
  title: string
  url?: string
  technologies?: string
  content?: string
  date?: string
}

export interface Skill {
  slug: string
  skill: string
}

export interface Certificate {
  slug: string
  title: string
  image?: string
  url?: string
}

import homeJson from '../../content/home.json'

const load = <T>(mods: Record<string, unknown>): T[] => Object.values(mods) as T[]

// JustJSON yüklenen görselleri content/media/ altına yazar. Astro yalnızca
// public/'i servis ettiği için o yollar tarayıcıda kırık gelir; Vite'a import
// ettirip gerçek (hash'li, kopyalanmış) URL'lerine çeviriyoruz.
const media = import.meta.glob('../../content/media/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const mediaByName = new Map(
  Object.entries(media).map(([path, url]) => [path.split('/').pop() as string, url]),
)

export function resolveMedia(path?: string): string {
  if (!path) return ''
  if (/^(?:https?:)?\/\//.test(path) || path.startsWith('data:')) return path
  return mediaByName.get(path.split('/').pop() as string) ?? path
}

export const home = {
  ...(homeJson as Home),
  photo: resolveMedia((homeJson as Home).photo),
} as Home

export const urls = load<Url>(
  import.meta.glob('../../content/urls/*.json', { eager: true, import: 'default' }),
)

// "2023 - Present" → 2023; süregelen işler en üstte
function startYear(date?: string): number {
  const m = date?.match(/\d{4}/)
  return m ? Number(m[0]) : 0
}
function ongoing(date?: string): boolean {
  return /present|devam/i.test(date ?? '')
}
function byRecency<T extends { date?: string }>(a: T, b: T): number {
  if (ongoing(a.date) !== ongoing(b.date)) return ongoing(a.date) ? -1 : 1
  return startYear(b.date) - startYear(a.date)
}

export const experience = load<Experience>(
  import.meta.glob('../../content/experience/*.json', { eager: true, import: 'default' }),
).sort(byRecency)

export const projects = load<Project>(
  import.meta.glob('../../content/projects/*.json', { eager: true, import: 'default' }),
).sort(byRecency)

export const skills = load<Skill>(
  import.meta.glob('../../content/skills/*.json', { eager: true, import: 'default' }),
)

export const certificates = load<Certificate>(
  import.meta.glob('../../content/certificates/*.json', { eager: true, import: 'default' }),
).map((c) => ({ ...c, image: resolveMedia(c.image) }))
