import { NextResponse, NextRequest } from "next/server";
import { RoleEnum } from "@/types/user";
import axiosInstance from "@/lib/axiosInstance";

// Define public paths that don't require authentication
const PUBLIC_PATHS = ["/login"];

// API endpoint to fetch user details
const fetchUser = async (token: string) => {
  try {
    const response = await axiosInstance.get("/api/me/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.user; // Expected: { id, username, email, phone, role, point_vente, is_active, last_login }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get("access_token")?.value;
  console.log("Middleware - Token:", token);
  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Fetch user data
  const user = await fetchUser(token);
  if (!user || !user.is_active) {
    // Redirect to login if user is invalid or inactive
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check for cashier accessing /pos with null point_vente
  // if (user.role === RoleEnum.CASHIER && pathname.startsWith("/pos")) {
  //   if (!user.point_vente) {
  //     // Redirect to an unauthorized page
  //     return NextResponse.redirect(new URL("/unauthorized", request.url));
  //   }
  // }

  // Allow access for valid users
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], // Apply to all paths except API, static, etc.
};