const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function publicHeaders(extra?: HeadersInit) {
  return new Headers({
    apikey: supabasePublishableKey ?? "",
    Authorization: `Bearer ${supabasePublishableKey ?? ""}`,
    ...Object.fromEntries(new Headers(extra).entries()),
  });
}

export async function publicRestGet<T>(query: string): Promise<T | null> {
  if (!supabaseUrl || !supabasePublishableKey) return null;
  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, { headers: publicHeaders() });
  if (!response.ok) return null;
  return response.json() as Promise<T>;
}

export async function invokePublicFunction<T>(name: string, body: unknown): Promise<{ data: T | null; error: Error | null }> {
  if (!supabaseUrl || !supabasePublishableKey) return { data: null, error: new Error("Supabase is not configured.") };

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
      method: "POST",
      headers: publicHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null) as T | null;
    return response.ok ? { data, error: null } : { data, error: new Error("The request could not be completed.") };
  } catch {
    return { data: null, error: new Error("The request could not be completed.") };
  }
}
