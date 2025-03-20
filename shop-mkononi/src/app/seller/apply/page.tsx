"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Camera, Upload, CreditCard, User, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function SellerApplicationPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    idNumber: "",
    idFrontImage: null as File | null,
    idBackImage: null as File | null,
    selfieImage: null as File | null,
    phone: "",
  });
  const [preview, setPreview] = useState({
    idFrontImage: "",
    idBackImage: "",
    selfieImage: "",
  });

  // Update form data when session is loaded
  useEffect(() => {
    if (session?.user) {
      // Populate form data with existing user info if available
      setFormData((prev) => ({
        ...prev,
        phone: session.user.phone || "",
      }));
      
      // If user is already a seller, redirect to dashboard
      if (session.user.role === "SELLER") {
        router.push("/seller/dashboard");
      }
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0F766E]"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/seller/apply");
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

    // Validate required fields
    if (!formData.idNumber || !formData.idFrontImage || !formData.idBackImage || !formData.selfieImage) {
      setError("Please provide all required information");
      setLoading(false);
      return;
    }

    if (!formData.phone || formData.phone === "") {
      setError("Please provide a phone number");
      setLoading(false);
      return;
    }

    try {
      // Update the user profile to request seller role
      const userUpdateResponse = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestedRole: "SELLER",
          phone: formData.phone,
        }),
      });

      if (!userUpdateResponse.ok) {
        const errorData = await userUpdateResponse.json();
        throw new Error(errorData.error || "Failed to update user profile");
      }

      // Create FormData for file upload
      const data = new FormData();
      data.append("idNumber", formData.idNumber);
      data.append("idFrontImage", formData.idFrontImage);
      data.append("idBackImage", formData.idBackImage);
      data.append("selfieImage", formData.selfieImage);
      data.append("applicationType", "SELLER");

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Verification failed");
      }

      // Redirect to pending approval page
      router.push("/seller/pending");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ShoppingBag className="h-12 w-12 text-[#0F766E]" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Become a Seller
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Complete your verification to start selling on Shop Mkononi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Your application will be reviewed by our team. This process usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0F766E] focus:border-[#0F766E] sm:text-sm"
                  placeholder="+254 7XX XXX XXX"
                />
              </div>
            </div>

            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
                ID Number
              </label>
              <div className="mt-1">
                <input
                  id="idNumber"
                  name="idNumber"
                  type="text"
                  required
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0F766E] focus:border-[#0F766E] sm:text-sm"
                  placeholder="Enter your ID number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID Front Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {preview.idFrontImage ? (
                  <div className="space-y-1 text-center">
                    <div className="relative h-40 w-full">
                      <Image
                        src={preview.idFrontImage}
                        alt="ID Front Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="idFrontImage"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#0F766E] hover:text-[#0F766E]/80 focus-within:outline-none"
                      >
                        <span>Change file</span>
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
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="idFrontImage"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#0F766E] hover:text-[#0F766E]/80 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="idFrontImage"
                          name="idFrontImage"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, "idFrontImage")}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <div className="flex justify-center">
                      <CreditCard className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID Back Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {preview.idBackImage ? (
                  <div className="space-y-1 text-center">
                    <div className="relative h-40 w-full">
                      <Image
                        src={preview.idBackImage}
                        alt="ID Back Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="idBackImage"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#0F766E] hover:text-[#0F766E]/80 focus-within:outline-none"
                      >
                        <span>Change file</span>
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
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="idBackImage"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#0F766E] hover:text-[#0F766E]/80 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="idBackImage"
                          name="idBackImage"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, "idBackImage")}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <div className="flex justify-center">
                      <CreditCard className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Selfie Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {preview.selfieImage ? (
                  <div className="space-y-1 text-center">
                    <div className="relative h-40 w-full">
                      <Image
                        src={preview.selfieImage}
                        alt="Selfie Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="selfieImage"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#0F766E] hover:text-[#0F766E]/80 focus-within:outline-none"
                      >
                        <span>Change file</span>
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
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="selfieImage"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#0F766E] hover:text-[#0F766E]/80 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="selfieImage"
                          name="selfieImage"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, "selfieImage")}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <div className="flex justify-center">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0F766E] hover:bg-[#0F766E]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Submit Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Not ready yet?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E]"
              >
                Continue as Buyer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
