import { AppSell } from './components/app-sell/app-sell';
import { ListForm } from './components/list-form';
import { Lists } from './components/lists';

export default function Page() {
  return (
    <AppSell>
      <Lists />
      <ListForm />
    </AppSell>
  );
}
