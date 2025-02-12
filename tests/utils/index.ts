export const BASE_URL = "http://localhost:8080";

// Helper function to make API requests
export async function apiRequest(
  method: string,
  endpoint: string,
  body?: object,
  extraOptions: RequestInit = {}
) {
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers: {
      ...defaultHeaders,
      ...(extraOptions.headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return response.json();
}

export function uniqueUser() {
  return {
    user_name: `test_user_${Date.now()}`, // append timestamp for uniqueness
    name: "Test User",
    password: "password",
  };
}
