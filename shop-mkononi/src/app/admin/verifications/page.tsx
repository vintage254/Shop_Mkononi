"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

interface VerificationRequest {
  id: string;
  email: string;
  role: string;
  idNumber: string;
  idFrontImage: string;
  idBackImage: string;
  selfieImage: string;
  image: string;
  verificationStatus: string;
  verificationNotes: string | null;
  createdAt: string;
}

export default function VerificationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchVerifications();
  }, [status, session, router]);

  const fetchVerifications = async () => {
    try {
      const response = await fetch("/api/admin/verifications");
      if (!response.ok) throw new Error("Failed to fetch verifications");
      const data = await response.json();
      setVerifications(data);
    } catch (error) {
      setError("Failed to load verification requests");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (userId: string, status: "VERIFIED" | "REJECTED", notes: string = "") => {
    try {
      const response = await fetch(`/api/admin/verifications/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) throw new Error("Failed to update verification status");

      // Refresh the list
      fetchVerifications();
    } catch (error) {
      setError("Failed to update verification status");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0F766E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          Verification Requests
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {verifications.map((verification) => (
              <li key={verification.id} className="p-6">
                <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
                  <div className="w-full sm:w-auto mb-4 sm:mb-0">
                    <h3 className="text-lg font-medium text-gray-900">
                      {verification.email}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>Role: {verification.role}</p>
                      <p>ID Number: {verification.idNumber}</p>
                      <p>Status: {verification.verificationStatus}</p>
                      <p>Submitted: {new Date(verification.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
                    {verification.verificationStatus === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleVerification(verification.id, "VERIFIED")}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerification(verification.id, "REJECTED")}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">ID Front Image</h4>
                    <div className="relative h-48 w-full border rounded-lg overflow-hidden">
                      <Image
                        src={verification.idFrontImage}
                        alt="ID Front"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">ID Back Image</h4>
                    <div className="relative h-48 w-full border rounded-lg overflow-hidden">
                      <Image
                        src={verification.idBackImage}
                        alt="ID Back"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Selfie Image</h4>
                    <div className="relative h-48 w-full border rounded-lg overflow-hidden">
                      <Image
                        src={verification.selfieImage}
                        alt="Selfie"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                {verification.image && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Google Profile Photo</h4>
                    <div className="flex items-center">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden border border-gray-300">
                        <Image
                          src={verification.image}
                          alt="Google Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">
                          Compare this Google profile photo with the selfie for additional verification.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {verification.verificationNotes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                    <p className="mt-1 text-sm text-gray-500">{verification.verificationNotes}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}