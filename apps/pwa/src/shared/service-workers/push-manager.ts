import { useMutation } from "@tanstack/react-query";

import { rpc } from "~/shared/rpc";

import { useRegisteredSW } from "./registration";

export function usePushManager() {
  const { registeredSW } = useRegisteredSW();

  async function getSubscription() {
    return await registeredSW?.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    });
  }

  async function syncSubscriptionToServer(subscription: PushSubscription) {
    await rpc.api.queue["save-web-push-subscription"].$post({
      json: { subscription: subscription.toJSON() },
    });
  }

  const requestPermissionAndSubscribeMutation = useMutation({
    mutationFn: async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Permission denied");
      }
      const subscription = (await getSubscription()) as PushSubscription;
      return subscription;
    },
    onSuccess: (subscription) => {
      syncSubscriptionToServer(subscription);
    },
    onError: (error) => {
      console.error({ error });
    },
  });

  return {
    pushManager: registeredSW?.pushManager,
    requestPermissionAndSubscribeMutation,
  };
}
