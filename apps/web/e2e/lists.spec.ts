import { createList, expect, test, uniqueName } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/app');
});

test('creates and renames a list', async ({ page, toolbar }) => {
  const name = uniqueName('Mercado');
  const renamed = uniqueName('Feira');
  await createList(page, name);

  await toolbar.getByRole('button', { name: 'Mais opções' }).click();
  await page.getByRole('button', { name: 'Modificar lista' }).click();
  const dialog = page.getByRole('dialog', { name: 'Editar lista' });
  await dialog.getByLabel('Nome').fill(renamed);
  await dialog.getByRole('button', { name: 'Salvar' }).click();

  await expect(page.getByRole('tab', { name: renamed })).toBeVisible();
  await expect(page.getByRole('tab', { name })).toBeHidden();
});

test('switches between list tabs', async ({ page }) => {
  const firstName = uniqueName('Mercado');
  const secondName = uniqueName('Farmácia');
  await createList(page, firstName);
  await createList(page, secondName);
  const firstTab = page.getByRole('tab', { name: firstName });
  const secondTab = page.getByRole('tab', { name: secondName });

  await firstTab.click();
  await expect(firstTab).toHaveAttribute('aria-selected', 'true');
  await expect(secondTab).toHaveAttribute('aria-selected', 'false');

  await secondTab.click();
  await expect(secondTab).toHaveAttribute('aria-selected', 'true');
  await expect(firstTab).toHaveAttribute('aria-selected', 'false');
});
