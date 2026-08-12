import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

webpush.setVapidDetails(
  "mailto:orivolab@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { userId, title, body, url = "/" } = req.body ?? {};

    if (!userId || !title || !body) {
      return res.status(400).json({
        error: "Brakuje userId, title lub body.",
      });
    }

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    if (!subscriptions?.length) {
      return res.status(200).json({
        sent: 0,
        message: "Użytkownik nie ma aktywnych urządzeń push.",
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
    });

    let sent = 0;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload
        );

        sent += 1;
      } catch (pushError) {
        console.error("Błąd wysyłania push:", pushError);

        if (
          pushError.statusCode === 404 ||
          pushError.statusCode === 410
        ) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", subscription.id);
        }
      }
    }

    return res.status(200).json({
      success: true,
      sent,
    });
  } catch (error) {
    console.error("Błąd API send-push:", error);

    return res.status(500).json({
      error: "Nie udało się wysłać powiadomienia.",
    });
  }
}