import { AppSell } from './_components/app-sell/app-sell';
import { ListForm } from './_components/list-form';
import { Lists } from './_components/lists';

export default function Page() {
  return (
    <AppSell>
      <Lists />
      <ListForm />
    </AppSell>
  );
}
