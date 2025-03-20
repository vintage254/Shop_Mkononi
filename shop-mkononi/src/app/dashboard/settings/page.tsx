"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "react-hot-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().min(10, "Phone must be at least 10 characters").optional(),
  currentPassword: z.string().min(1, "Current password is required").optional(),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  // Only validate passwords if user is trying to change password
  if (data.currentPassword || data.newPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load user data when session is available
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setPhone(session.user.phone || "");
    }
  }, [session]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Validate form data
      const formData = {
        name,
        phone,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        confirmPassword: confirmPassword || undefined,
      };

      const validationResult = profileSchema.safeParse(formData);
      
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || "Invalid form data";
        setMessage({ type: "error", text: errorMessage });
        setLoading(false);
        return;
      }

      // Prepare data for API
      const updateData: {
        name?: string;
        phone?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {};
      
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;

      // Only include password fields if user is changing password
      if (currentPassword && newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      // Send update request
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Update session with new user data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: name || session?.user?.name,
          phone: phone || session?.user?.phone,
        },
      });

      setMessage({ type: "success", text: "Profile updated successfully" });
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setMessage({ type: "error", text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
            <p className="mt-1 text-sm text-gray-500">
              Update your account information and password
            </p>
          </div>

          {message.text && (
            <div className={`px-4 py-3 ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="p-4 divide-y divide-gray-200">
            {/* Profile Section */}
            <div className="space-y-6 py-6">
              <h3 className="text-md font-medium text-gray-900">Profile Information</h3>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    disabled
                    value={session?.user?.email || ""}
                    className="bg-gray-100 shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800"
                    placeholder="+254 712 345 678"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-6 py-6">
              <h3 className="text-md font-medium text-gray-900">Change Password</h3>
              
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Account Type Section */}
            <div className="space-y-6 py-6">
              <h3 className="text-md font-medium text-gray-900">Account Type</h3>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-800 mb-2 font-medium">
                  <span className="font-bold">Current Role:</span> {session?.user?.role}
                </p>
                
                {session?.user?.role === "BUYER" && !session?.user?.requestedRole && (
                  <div>
                    <p className="text-sm text-gray-800 mb-4">
                      Want to sell products? Apply to become a seller today!
                    </p>
                    <a 
                      href="/auth/verify"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Apply to Become a Seller
                    </a>
                  </div>
                )}
                
                {session?.user?.requestedRole === "SELLER" && session?.user?.verificationStatus === "PENDING" && (
                  <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <p className="text-sm text-yellow-800 font-medium">
                      Your seller application is under review. We'll notify you when it's approved.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
