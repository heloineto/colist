import type { Page } from '@playwright/test';
import { addItem, createList, expect, test, uniqueName } from './fixtures';

/** The item name opens its edit form. */
function openItem(page: Page, name: string) {
  return page.getByRole('button', { name, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/app');
  await createList(page, uniqueName('Mercado'));
});

test('adds an item, checks and unchecks it', async ({ page, toolbar }) => {
  await addItem(page, toolbar, 'Leite');
  // (Un)checking moves the row between sections; the old row animates out meanwhile.
  const completed = page.getByRole('region', { name: /Completados/ });
  const checkbox = page.getByRole('checkbox', { name: 'Leite' });

  await checkbox.click();
  await expect(completed.getByRole('checkbox')).toBeChecked();
  await expect(completed.getByRole('paragraph')).toHaveCSS(
    'text-decoration-line',
    'line-through'
  );

  await completed.getByRole('checkbox').click();
  await expect(completed.getByRole('checkbox')).toHaveCount(0);
  await expect(checkbox).not.toBeChecked();
  await expect(page.getByRole('main').getByRole('paragraph')).toHaveCSS(
    'text-decoration-line',
    'none'
  );
});

test('changes the amount', async ({ page, toolbar }) => {
  await addItem(page, toolbar, 'Ovos');

  await page.getByRole('button', { name: '1', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: '+' }).click();
  await expect(dialog.getByRole('textbox')).toHaveValue('2');
  await page.keyboard.press('Escape');

  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('button', { name: '2', exact: true })
  ).toBeVisible();
});

test('assigns a new category', async ({ page, toolbar }) => {
  const category = uniqueName('Laticínios');
  await addItem(page, toolbar, 'Queijo');

  await openItem(page, 'Queijo');
  await page.getByRole('button', { name: 'Adicionar categoria' }).click();
  await page
    .getByPlaceholder('Pesquisar ou adicionar categoria')
    .fill(category);
  await page.getByRole('button', { name: `Adicionar "${category}"` }).click();
  await page.getByRole('button', { name: 'Salvar' }).click();

  await openItem(page, 'Queijo');
  await expect(
    page.getByRole('button', { name: 'Mudar categoria' })
  ).toContainText(category);
});

test('deletes an item', async ({ page, toolbar }) => {
  await addItem(page, toolbar, 'Pão');

  await openItem(page, 'Pão');
  await page.getByRole('button', { name: 'Remover' }).click();
  await page.getByRole('button', { name: 'Apagar', exact: true }).click();

  await expect(page.getByRole('checkbox', { name: 'Pão' })).toBeHidden();
  await expect(page.getByText('Nada aqui')).toBeVisible();
});

test('search filters items', async ({ page, toolbar }) => {
  await addItem(page, toolbar, 'Banana');
  await addItem(page, toolbar, 'Maçã');

  await toolbar.getByRole('button', { name: 'Pesquisar' }).click();
  await page.getByPlaceholder('Pesquisar').fill('Ban');

  await expect(page.getByRole('checkbox', { name: 'Banana' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Maçã' })).toBeHidden();
});
