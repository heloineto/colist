import { addItem, createList, expect, test, uniqueName } from './fixtures';

test('shares a list and syncs new items in realtime', async ({
  page,
  toolbar,
  secondUser,
}) => {
  const name = uniqueName('Churrasco');
  await page.goto('/app');
  await createList(page, name);

  await page.getByRole('button', { name: 'Convidar' }).click();
  await page
    .getByPlaceholder('Adicionar membro pelo e-mail')
    .fill(secondUser.email);
  await page.getByRole('button', { name: 'Adicionar membro' }).click();
  const preview = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('button', { name: 'Cancelar' }) });
  await preview.getByRole('button', { name: 'Adicionar membro' }).click();
  await expect(page.getByText(secondUser.email)).toBeVisible();
  await page.keyboard.press('Escape');

  const guest = secondUser.page;
  await guest.goto('/app');
  const tab = guest.getByRole('tab', { name });
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
  await expect(guest.getByText('Nada aqui')).toBeVisible();

  await addItem(page, toolbar, 'Carvão');
  await expect(guest.getByRole('checkbox', { name: 'Carvão' })).toBeVisible();
});
