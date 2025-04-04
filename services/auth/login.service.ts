import { axiosServer } from "@/utils/axios";
import { storeToken, storeTokenRemember } from "@/utils/local-storage/token";

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export async function loginUserService(credentials: LoginCredentials) {
  try {
    const response = await axiosServer.post("/v1/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });

    const token = response.data.data.accessToken;
    if (credentials.rememberMe) {
      storeTokenRemember(token);
    } else {
      storeToken(token);
    }
    return { success: true, message: "Login successful" };
  } catch {
    return { success: false, message: "Login failed. Please try again." };
  }
}
