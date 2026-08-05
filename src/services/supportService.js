import { supabase } from "../lib/supabase";

const SUPPORT_BUCKET =
  "support-attachments";

const MAX_SCREENSHOT_SIZE =
  10 * 1024 * 1024;

function cleanText(value) {
  return String(value ?? "").trim();
}

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user ?? null;
}

function getFileExtension(file) {
  const extension =
    String(file?.name ?? "")
      .split(".")
      .pop()
      ?.toLowerCase();

  return (
    extension?.replace(
      /[^a-z0-9]/g,
      ""
    ) || "jpg"
  );
}

async function uploadSupportScreenshot(
  file
) {
  if (!file) {
    return null;
  }

  if (
    !file.type?.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      "Załącznik musi być zdjęciem."
    );
  }

  if (
    file.size >
    MAX_SCREENSHOT_SIZE
  ) {
    throw new Error(
      "Zrzut ekranu może mieć maksymalnie 10 MB."
    );
  }

  const extension =
    getFileExtension(file);

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } =
    await supabase.storage
      .from(SUPPORT_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType:
          file.type ||
          "image/jpeg",
      });

  if (error) {
    throw error;
  }

  const { data } =
    supabase.storage
      .from(SUPPORT_BUCKET)
      .getPublicUrl(fileName);

  return data?.publicUrl || null;
}

export async function submitSupportTicket({
  category,
  subject,
  message,
  email,
  screenshot = null,
}) {
  const cleanCategory =
    cleanText(category);

  const cleanSubject =
    cleanText(subject);

  const cleanMessage =
    cleanText(message);

  const cleanEmail =
    cleanText(email);

  if (!cleanCategory) {
    throw new Error(
      "Wybierz kategorię zgłoszenia."
    );
  }

  if (cleanSubject.length < 3) {
    throw new Error(
      "Temat musi mieć co najmniej 3 znaki."
    );
  }

  if (cleanMessage.length < 10) {
    throw new Error(
      "Opis musi mieć co najmniej 10 znaków."
    );
  }

  const user =
    await getCurrentUser();

  const screenshotUrl =
    await uploadSupportScreenshot(
      screenshot
    );

  const payload = {
    user_id:
      user?.id ?? null,

    email:
      cleanEmail ||
      user?.email ||
      null,

    category:
      cleanCategory,

    subject:
      cleanSubject,

    message:
      cleanMessage,

    status: "new",

    screenshot_url:
      screenshotUrl,

    page_url:
      window.location.href,

    user_agent:
      navigator.userAgent,

    app_version:
      import.meta.env
        .VITE_APP_VERSION ||
      "development",
  };

  const { data, error } =
    await supabase
      .from("support_tickets")
      .insert(payload)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}