// lib/supabaseClients.ts

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client with Clerk token injection
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const { getToken } = await auth(); // Clerk server helper
      const token = await getToken({ template: "supabase" });
  
      const headers = new Headers(init?.headers);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
  
      return fetch(input, {
        ...init,
        headers,
      });
    },
  },
})