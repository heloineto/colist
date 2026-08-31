import { useListEvents } from '@/entities/list';
import { FeedbackModal, FeedbackProvider } from '@/features/feedback';
import { HistoryDrawer, HistoryProvider } from '@/features/history';
import { ItemForm, ItemFormProvider } from '@/features/items';
import { ListForm, ListFormProvider } from '@/features/lists';
import { ListUiProvider } from '@/shared/lib/list-ui-state';
import { AppShell } from '@/widgets/app-shell';
import { Lists } from '@/pages/app/ui/lists';

export function AppPage() {
  useListEvents();
  return (
    <ListUiProvider>
      <ListFormProvider>
        <ItemFormProvider>
          <FeedbackProvider>
            <HistoryProvider>
              <AppShell>
                <Lists />
              </AppShell>
              <ListForm />
              <ItemForm />
              <FeedbackModal />
              <HistoryDrawer />
            </HistoryProvider>
          </FeedbackProvider>
        </ItemFormProvider>
      </ListFormProvider>
    </ListUiProvider>
  );
}
