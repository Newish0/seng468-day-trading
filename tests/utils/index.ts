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

const users: any[] = [];
export function uniqueUser() {
  const user = {
    user_name: `test_user_${Date.now() + users.length}`, // append timestamp for uniqueness
    name: "Test User",
    password: "password",
  };
  users.push(user);
  return user;
}

export function withAuth(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}
