import { supabase } from "../lib/supabase";

export async function signUp({
  email,
  password,
  username,
}) {
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanUsername = String(username).trim();

  if (cleanUsername.length < 2) {
    throw new Error(
      "Nazwa użytkownika musi mieć co najmniej 2 znaki."
    );
  }

  if (String(password).length < 6) {
    throw new Error(
      "Hasło musi mieć co najmniej 6 znaków."
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        username: cleanUsername,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signIn(email, password) {
  const cleanEmail = String(email).trim().toLowerCase();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session ?? null;
}

export function listenToAuthChanges(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}