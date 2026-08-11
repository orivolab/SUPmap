import { supabase } from "../lib/supabase";

function urlBase64ToUint8Array(base64String) {
  const padding =
    "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (
    base64String + padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) =>
      char.charCodeAt(0)
    )
  );
}

export async function enablePushNotifications(
  publicVapidKey
) {
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    throw new Error(
      "To urządzenie lub przeglądarka nie obsługuje powiadomień push."
    );
  }

  const permission =
    await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error(
      "Nie udzielono zgody na powiadomienia."
    );
  }

  const registration =
    await navigator.serviceWorker.ready;

  let subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          urlBase64ToUint8Array(
            publicVapidKey
          ),
      });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      "Użytkownik nie jest zalogowany."
    );
  }

  const json = subscription.toJSON();

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict: "endpoint",
      }
    );

  if (error) {
    throw error;
  }

  return subscription;
}

export async function disablePushNotifications() {
  if (
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  const registration =
    await navigator.serviceWorker.ready;

  const subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  const endpoint =
    subscription.endpoint;

  await subscription.unsubscribe();

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    throw error;
  }
}