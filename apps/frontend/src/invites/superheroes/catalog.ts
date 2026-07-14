export const superheroThemeOptions = [
  { slug: 'aquaman', name: 'Aquaman' },
  { slug: 'aranhaverso', name: 'Aranhaverso' },
  { slug: 'batman', name: 'Batman' },
  { slug: 'capitao-america', name: 'Capitão América' },
  { slug: 'flash', name: 'Flash' },
  { slug: 'guardioes-da-galaxia', name: 'Guardiões da Galáxia' },
  { slug: 'homem-de-ferro', name: 'Homem de Ferro' },
  { slug: 'homem-aranha', name: 'Homem-Aranha' },
  { slug: 'hulk', name: 'Hulk' },
  { slug: 'jovens-titans', name: 'Jovens Titãs' },
  { slug: 'ladybug', name: 'Ladybug' },
  { slug: 'liga-da-justica', name: 'Liga da Justiça' },
  { slug: 'miles-morales', name: 'Miles Morales' },
  { slug: 'mulher-maravilha', name: 'Mulher-Maravilha' },
  { slug: 'os-incriveis', name: 'Os Incríveis' },
  { slug: 'pantera-negra', name: 'Pantera Negra' },
  { slug: 'pj-masks', name: 'PJ Masks' },
  { slug: 'superman', name: 'Superman' },
  { slug: 'thor', name: 'Thor' },
  { slug: 'vingadores', name: 'Vingadores' },
] as const;

export type SuperheroThemeSlug = (typeof superheroThemeOptions)[number]['slug'];

export const defaultSuperheroThemeSlug: SuperheroThemeSlug = 'homem-aranha';

export function isSuperheroThemeSlug(value?: string | null): value is SuperheroThemeSlug {
  return superheroThemeOptions.some((theme) => theme.slug === value);
}
