import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "~/shared/ui/button";
import { Card, CardDescription } from "~/shared/ui/card";
import { atom, useAtom } from "jotai";

const registeredSWAtom = atom<ServiceWorkerRegistration | undefined>(undefined);

export function ServiceWorkerReloadPrompt() {
  const [, setRegisteredSW] = useAtom(registeredSWAtom);
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      r?.update();
      setRegisteredSW(r);
      console.debug("✅ SW Registered");
    },
    onRegisterError(error) {
      console.error("❌ SW registration error: ", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  let message;
  if (offlineReady) {
    message = "App ready to work offline";
  } else {
    message = "New content available, click on reload button to update.";
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card>
        <CardDescription>{message}</CardDescription>
        {needRefresh && (
          <Button onClick={() => updateServiceWorker(true)}>Reload</Button>
        )}
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
      </Card>
    </div>
  );
}

export function useRegisteredSW() {
  const [registeredSW] = useAtom(registeredSWAtom);
  return { registeredSW };
}
