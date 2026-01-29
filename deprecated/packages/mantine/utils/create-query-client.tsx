import { Translate } from '@/deprecated/packages/translations';
import {
  hideNotification,
  showNotification,
  updateNotification,
} from '@mantine/notifications';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

const errorTitle = (
  <Translate
    pt="Ocorreu um erro"
    en="An error occurred"
    es="Ocurrió un error"
  />
);

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.showErrorNotification === false) {
          return;
        }

        showNotification({
          title: errorTitle,
          message: error.message,
          color: 'red',
        });
      },
    }),
    mutationCache: new MutationCache({
      onMutate: (variables, mutation) => {
        if (mutation.meta?.showLoadingNotification === false) {
          return;
        }

        const notificationId = showNotification({
          id: String(mutation.mutationId),
          title: (
            <Translate pt="Carregando..." en="Loading..." es="Cargando..." />
          ),
          message: (
            <Translate
              pt="Aguarde um momento"
              en="Please wait a moment"
              es="Espere un momento"
            />
          ),
          loading: true,
          autoClose: 5000,
        });

        return { notificationId };
      },
      onError: (error, variables, context, mutation) => {
        if (mutation.meta?.showErrorNotification === false) {
          return;
        }

        // FUTURE: Add error form (with a report button)
        updateNotification({
          id: String(mutation.mutationId),
          title: errorTitle,
          message: error.message,
          loading: false,
          color: 'red',
          autoClose: true,
        });
      },
      onSuccess: (data, variables, context, mutation) => {
        if (mutation.meta?.showSuccessNotification === false) {
          hideNotification(String(mutation.mutationId));
          return;
        }

        const notification = {
          title: <Translate pt="Sucesso" en="Success" es="Éxito" />,
          message: (
            <Translate
              pt="Operação realizada com sucesso"
              en="Operation completed successfully"
              es="Operación completada con éxito"
            />
          ),
          loading: false,
          color: 'green',
          autoClose: 1000,
        };

        if (mutation.meta?.showLoadingNotification === false) {
          showNotification(notification);
          return;
        }

        updateNotification({
          id: String(mutation.mutationId),
          ...notification,
        });
      },
    }),
  });
}
