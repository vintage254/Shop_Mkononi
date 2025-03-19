"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Camera, Upload, CreditCard, User } from "lucide-react";

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNewUser, setIsNewUser] = useState(false);
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    idNumber: "",
    idFrontImage: null as File | null,
    idBackImage: null as File | null,
    selfieImage: null as File | null,
    role: "BUYER",
    phone: "",
  });
  const [preview, setPreview] = useState({
    idFrontImage: "",
    idBackImage: "",
    selfieImage: "",
  });

  // Update form data when session is loaded
  useEffect(() => {
    const url = new URL(window.location.href);
    const newParam = url.searchParams.get("new");
    if (newParam === "true") {
      setIsNewUser(true);
    }
    
    if (session?.user) {
      // Populate form data with existing user info if available
      setFormData((prev) => ({
        ...prev,
        role: session.user.role || "BUYER",
        phone: session.user.phone || "",
      }));
      
      console.log("Verification page loaded with session:", {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        phone: session.user.phone,
        image: session.user.image ? "Yes" : "No",
        verificationStatus: session.user.verificationStatus
      });
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0F766E]"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "idFrontImage" | "idBackImage" | "selfieImage"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Image size should be less than 5MB");
      return;
    }

    setFormData((prev) => ({ ...prev, [type]: file }));
    setPreview((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Verification form submitted:", {
      idNumber: formData.idNumber ? "Provided" : "Missing",
      idFrontImage: formData.idFrontImage ? "Provided" : "Missing",
      idBackImage: formData.idBackImage ? "Provided" : "Missing",
      selfieImage: formData.selfieImage ? "Provided" : "Missing",
      role: formData.role,
      phone: formData.phone,
      isNewUser
    });

    // Validate required fields
    if (!formData.idNumber || !formData.idFrontImage || !formData.idBackImage || !formData.selfieImage) {
      setError("Please provide all required information");
      setLoading(false);
      return;
    }

    // For Google sign-in users who are new, we need to update their role and phone
    if ((!formData.phone || formData.phone === "")) {
      setError("Please provide a phone number");
      setLoading(false);
      return;
    }

    try {
      // If this is a new user or the phone number needs to be updated, update the profile first
      if (isNewUser || !session?.user?.phone) {
        console.log("Updating user profile with:", {
          role: formData.role,
          phone: formData.phone,
        });
        
        const userUpdateResponse = await fetch("/api/auth/update-profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: formData.role,
            phone: formData.phone,
          }),
        });

        if (!userUpdateResponse.ok) {
          const errorData = await userUpdateResponse.json();
          console.error("Profile update error:", errorData);
          throw new Error(errorData.error || "Failed to update user profile");
        }
        
        console.log("Profile updated successfully");
        
        // Update the session to reflect the new role
        await update({
          ...session,
          user: {
            ...session?.user,
            role: formData.role,
            phone: formData.phone,
          },
        });
      }

      // Create FormData for file upload
      const data = new FormData();
      data.append("idNumber", formData.idNumber);
      data.append("idFrontImage", formData.idFrontImage);
      data.append("idBackImage", formData.idBackImage);
      data.append("selfieImage", formData.selfieImage);

      console.log("Submitting verification data");
      
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Verification API error:", error);
        throw new Error(error.message || "Verification failed");
      }

      console.log("Verification submitted successfully");
      
      // Redirect based on role
      if (formData.role === "SELLER") {
        router.push("/seller/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Verification submission error:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your identity
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please provide your ID details and a selfie for verification
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {/* Show user info from Google if available */}
            {session?.user?.image && (
              <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                  <p className="text-sm text-gray-500">{session.user.email}</p>
                </div>
              </div>
            )}

            {/* Role selection for new Google users */}
            {isNewUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  I want to use Shop Mkononi as a:
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div
                    className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer ${
                      formData.role === "BUYER"
                        ? "border-[#0F766E] bg-[#0F766E]/10"
                        : "border-gray-300"
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, role: "BUYER" }))}
                  >
                    <div className="text-center">
                      <User className="mx-auto h-6 w-6 text-gray-700" />
                      <span className="mt-2 block text-sm font-medium">Buyer</span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer ${
                      formData.role === "SELLER"
                        ? "border-[#0F766E] bg-[#0F766E]/10"
                        : "border-gray-300"
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, role: "SELLER" }))}
                  >
                    <div className="text-center">
                      <svg
                        className="mx-auto h-6 w-6 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span className="mt-2 block text-sm font-medium">Seller</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phone number for Google users */}
            {isNewUser && (
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+254712345678"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0F766E] focus:border-[#0F766E]"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Format: +254712345678</p>
              </div>
            )}

            <div>
              <label
                htmlFor="idNumber"
                className="block text-sm font-medium text-gray-700"
              >
                ID Number
              </label>
              <div className="mt-1">
                <input
                  id="idNumber"
                  name="idNumber"
                  type="text"
                  required
                  value={formData.idNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, idNumber: e.target.value }))
                  }
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0F766E] focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="idFrontImage"
                className="block text-sm font-medium text-gray-700"
              >
                ID Front Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {preview.idFrontImage ? (
                    <div className="relative h-40 w-full">
                      <Image
                        src={preview.idFrontImage}
                        alt="ID front preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="idFrontImage"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#0F766E] hover:text-[#EA580C] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#0F766E]"
                    >
                      <span>Upload ID Front</span>
                      <input
                        id="idFrontImage"
                        name="idFrontImage"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleFileChange(e, "idFrontImage")}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="idBackImage"
                className="block text-sm font-medium text-gray-700"
              >
                ID Back Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {preview.idBackImage ? (
                    <div className="relative h-40 w-full">
                      <Image
                        src={preview.idBackImage}
                        alt="ID back preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="idBackImage"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#0F766E] hover:text-[#EA580C] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#0F766E]"
                    >
                      <span>Upload ID Back</span>
                      <input
                        id="idBackImage"
                        name="idBackImage"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleFileChange(e, "idBackImage")}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="selfieImage"
                className="block text-sm font-medium text-gray-700"
              >
                Selfie Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {preview.selfieImage ? (
                    <div className="relative h-40 w-full">
                      <Image
                        src={preview.selfieImage}
                        alt="Selfie preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="selfieImage"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#0F766E] hover:text-[#EA580C] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#0F766E]"
                    >
                      <span>Upload Selfie</span>
                      <input
                        id="selfieImage"
                        name="selfieImage"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleFileChange(e, "selfieImage")}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0F766E] hover:bg-[#EA580C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Uploading..." : "Submit for Verification"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}