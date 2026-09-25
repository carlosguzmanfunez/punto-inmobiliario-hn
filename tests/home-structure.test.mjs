import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');

test('la portada consume la fuente canónica de proyectos y beneficios', () => {
  const page = read('src/app/page.tsx');
  assert.ok(page.includes(`from '@/lib/home-content'`), 'page.tsx debe importar home-content');
  assert.ok(page.includes(`homeProjects.map`), 'la sección de proyectos usa homeProjects');
  assert.ok(page.includes(`homeBenefits.map`), 'la sección de beneficios usa homeBenefits');
});

test('la portada no reintroduce las matrices inline de proyectos ni beneficios', () => {
  const page = read('src/app/page.tsx');
  assert.ok(!page.includes(`[['Residencial Vista Verde'`), 'no debe repetir la matriz de proyectos');
  assert.ok(!page.includes(`[['Asesoría personalizada'`), 'no debe repetir la matriz de beneficios');
});

test('la fuente canónica declara datos tipados y legibles', () => {
  const source = read('src/lib/home-content.ts');
  assert.ok(source.includes(`export interface HomeProject`), 'falta la interfaz de proyecto');
  assert.ok(source.includes(`export interface HomeBenefit`), 'falta la interfaz de beneficio');
  assert.ok(source.includes(`export const homeProjects: readonly HomeProject[]`), 'homeProjects no está tipada');
  assert.ok(source.includes(`export const homeBenefits: readonly HomeBenefit[]`), 'homeBenefits no está tipada');
  for (const value of [
    `Residencial Vista Verde`,
    `Torre Nova`,
    `Las Palmas Beach Residences`,
    `Asesoría personalizada`,
    `Cobertura nacional`,
  ]) {
    assert.ok(source.includes(value), `la fuente debe contener ${value}`);
  }
});

test('las secciones principales de la portada tienen nombres accesibles estables', () => {
  const page = read('src/app/page.tsx');
  const sections = [...page.matchAll(/<section[^>]*>/g)].map((m) => m[0]);
  assert.ok(sections.length >= 3, 'la portada debe conservar sus 3 secciones principales');
  const needed = [
    `id='propiedades-destacadas'`,
    `aria-labelledby='propiedades-destacadas-titulo'`,
    `id='propiedades-destacadas-titulo'`,
    `id='proyectos'`,
    `aria-labelledby='proyectos-titulo'`,
    `id='proyectos-titulo'`,
    `id='nosotros'`,
    `aria-labelledby='nosotros-titulo'`,
    `id='nosotros-titulo'`,
  ];
  for (const token of needed) {
    assert.ok(page.includes(token), `falta ${token}`);
  }
  for (const section of sections) {
    assert.ok(/aria-labelledby\s*=/.test(section), `la sección no puede quedar anónima: ${section}`);
  }
});
