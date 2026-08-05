import { supabase } from "../lib/supabase";

export async function searchUsers(
  currentUserId,
  searchText
) {
  const query = String(searchText).trim();

  if (query.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, points")
    .ilike("username", `%${query}%`)
    .neq("id", currentUserId)
    .limit(10);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getFriendships(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `sender_id.eq.${userId},receiver_id.eq.${userId}`
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getProfilesByIds(userIds) {
  const ids = [...new Set(userIds)].filter(Boolean);

  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, points")
    .in("id", ids);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getFriendsData(userId) {
  const friendships = await getFriendships(userId);

  const relatedIds = friendships.map((friendship) =>
    friendship.sender_id === userId
      ? friendship.receiver_id
      : friendship.sender_id
  );

  const profiles = await getProfilesByIds(relatedIds);

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ])
  );

  const incomingRequests = [];
  const outgoingRequests = [];
  const friends = [];

  friendships.forEach((friendship) => {
    const otherUserId =
      friendship.sender_id === userId
        ? friendship.receiver_id
        : friendship.sender_id;

    const otherProfile =
      profileMap.get(otherUserId) ?? null;

    const item = {
      ...friendship,
      profile: otherProfile,
    };

    if (friendship.status === "accepted") {
      friends.push(item);
      return;
    }

    if (
      friendship.status === "pending" &&
      friendship.receiver_id === userId
    ) {
      incomingRequests.push(item);
      return;
    }

    if (
      friendship.status === "pending" &&
      friendship.sender_id === userId
    ) {
      outgoingRequests.push(item);
    }
  });

  return {
    friends,
    incomingRequests,
    outgoingRequests,
  };
}

export async function sendFriendRequest(
  receiverId
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      "Musisz się zalogować."
    );
  }

  if (user.id === receiverId) {
    throw new Error(
      "Nie możesz dodać samej siebie do znajomych."
    );
  }

  const { data, error } = await supabase
    .from("friendships")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "Relacja z tym użytkownikiem już istnieje."
      );
    }

    throw error;
  }

  return data;
}

export async function acceptFriendRequest(
  friendshipId
) {
  const { data, error } = await supabase
    .from("friendships")
    .update({
      status: "accepted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", friendshipId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function rejectFriendRequest(
  friendshipId
) {
  const { data, error } = await supabase
    .from("friendships")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", friendshipId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeFriendship(
  friendshipId
) {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) {
    throw error;
  }
}