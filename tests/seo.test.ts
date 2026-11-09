import { describe, expect, it } from 'vitest';
import { pageTitle, personJsonLd } from '../src/lib/seo';

describe('pageTitle', () => {
  it('is the site name alone for the home page', () => {
    expect(pageTitle('Filip Rokita')).toBe('Filip Rokita');
  });

  it('puts the page before the site name', () => {
    expect(pageTitle('Filip Rokita', 'Tapisode')).toBe(
      'Tapisode · Filip Rokita',
    );
  });
});

describe('personJsonLd', () => {
  const person = personJsonLd({
    name: 'Filip Rokita',
    url: 'https://www.filiprokita.com',
    email: 'contact@filiprokita.com',
    jobTitle: 'Software engineer',
    sameAs: ['https://github.com/FilipRokita'],
  });

  it('is a schema.org Person', () => {
    expect(person['@context']).toBe('https://schema.org');
    expect(person['@type']).toBe('Person');
  });

  it('carries the details it was given', () => {
    expect(person.name).toBe('Filip Rokita');
    expect(person.sameAs).toEqual(['https://github.com/FilipRokita']);
  });

  it('serializes to valid JSON', () => {
    expect(JSON.parse(JSON.stringify(person))).toEqual(person);
  });
});
