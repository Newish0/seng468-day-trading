export const BASE_URL = "http://localhost:8080";

// Helper function to make API requests
export async function apiRequest(
  method: string,
  endpoint: string,
  body?: object,
  extraOptions: RequestInit = {},
  showFail: boolean = false // note: this position based parameter sucks but it'll do for now
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

  const json = await response.json();
  if (showFail && !json.success) {
    console.error("API request failed at: ", endpoint);
    console.error(json);
  }

  return json;
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
  return { headers: { token: token } };
}

export async function createUniqueUser() {
  // Create a unique user object
  const user = uniqueUser();

  // Register the user
  const registerResponse = await apiRequest("POST", "/authentication/register", user);

  if (!registerResponse.success) console.error("Failed to register a new unique user");

  // Log the user in to get a token
  const loginResponse = await apiRequest("POST", "/authentication/login", {
    user_name: user.user_name,
    password: user.password,
  });

  if (!loginResponse.success) console.error("Failed to login a new unique user");

  // Return both the token and the user data
  return { token: loginResponse.data.token, user };
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
