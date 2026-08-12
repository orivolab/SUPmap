import { supabase } from "../lib/supabase";

export async function getCurrentUserForMessages() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Musisz się zalogować.");
  }

  return user;
}

export async function sendMessage(
  receiverId,
  content
) {
  const user =
    await getCurrentUserForMessages();

  const cleanContent = String(
    content ?? ""
  ).trim();

  if (!receiverId) {
    throw new Error(
      "Nie wybrano odbiorcy wiadomości."
    );
  }

  if (!cleanContent) {
    throw new Error(
      "Wiadomość nie może być pusta."
    );
  }

  if (cleanContent.length > 2000) {
    throw new Error(
      "Wiadomość może mieć maksymalnie 2000 znaków."
    );
  }

  // Zapisujemy wiadomość w Supabase
  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: cleanContent,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Wysyłamy powiadomienie push do odbiorcy
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!session?.access_token) {
      console.warn(
        "Brak sesji — pomijam wysyłanie powiadomienia push."
      );

      return data;
    }

    const pushReceiverId =
      data.receiver_id;

    console.log(
      "Push do user_id:",
      pushReceiverId
    );

    const response = await fetch(
      "/api/send-push",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: pushReceiverId,
          title: "Nowa wiadomość 💬",
          body:
            cleanContent.length > 100
              ? `${cleanContent.slice(
                  0,
                  100
                )}…`
              : cleanContent,
          url: "/",
        }),
      }
    );

    const result = await response
      .json()
      .catch(() => null);

    console.log(
      "Wynik wysyłania push:",
      result
    );

    if (!response.ok) {
      throw new Error(
        result?.error ||
          `Błąd API push: ${response.status}`
      );
    }
  } catch (pushError) {
    console.error(
      "Nie udało się wysłać powiadomienia push:",
      pushError
    );
  }

  return data;
}

export async function getConversation(
  otherUserId
) {
  const user =
    await getCurrentUserForMessages();

  if (!otherUserId) {
    return [];
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function markConversationAsRead(
  otherUserId
) {
  const user =
    await getCurrentUserForMessages();

  if (!otherUserId) {
    return;
  }

  const { error } = await supabase
    .from("messages")
    .update({
      is_read: true,
    })
    .eq("sender_id", otherUserId)
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw error;
  }
}

export async function getUnreadMessagesCount() {
  const user =
    await getCurrentUserForMessages();

  const { count, error } = await supabase
    .from("messages")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getConversationList() {
  const user =
    await getCurrentUserForMessages();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const messages = data ?? [];
  const conversations = new Map();

  for (const message of messages) {
    const otherUserId =
      message.sender_id === user.id
        ? message.receiver_id
        : message.sender_id;

    if (!conversations.has(otherUserId)) {
      conversations.set(
        otherUserId,
        message
      );
    }
  }

  return Array.from(
    conversations.entries()
  ).map(
    ([otherUserId, lastMessage]) => ({
      otherUserId,
      lastMessage,
    })
  );
}