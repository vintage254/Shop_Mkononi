"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, XCircle, AlertCircle, ShoppingBag, User } from "lucide-react";

type SellerApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  idFrontImage: string;
  idBackImage: string;
  selfieImage: string;
  verificationStatus: string;
  verificationNotes: string;
  createdAt: string;
};

export default function SellerApplicationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [notes, setNotes] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/");
        return;
      }
      fetchApplications();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/seller-applications");
    }
  }, [status, session, router]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/seller-applications");
      
      if (!response.ok) {
        throw new Error("Failed to fetch seller applications");
      }
      
      const data = await response.json();
      setApplications(data.applications);
    } catch (error) {
      setError("Failed to load seller applications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      const response = await fetch(`/api/admin/seller-applications/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to approve seller application");
      }
      
      // Refresh the list
      fetchApplications();
      setSelectedApplication(null);
      setNotes("");
    } catch (error) {
      setError("Failed to approve seller application");
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setProcessingId(id);
      const response = await fetch(`/api/admin/seller-applications/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to reject seller application");
      }
      
      // Refresh the list
      fetchApplications();
      setSelectedApplication(null);
      setNotes("");
    } catch (error) {
      setError("Failed to reject seller application");
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0F766E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Applications</h1>
            <p className="text-sm text-gray-500 mt-1">
              Review and manage seller applications
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0F766E] hover:bg-[#0F766E]/90"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {selectedApplication ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Application Details
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Review the seller application information
                </p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to List
              </button>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Personal Information</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedApplication.name || "Not provided"}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedApplication.email}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedApplication.phone}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">ID Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedApplication.idNumber}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Application Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(selectedApplication.createdAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Verification Documents</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">ID Front</p>
                      <div className="relative h-40 w-full border border-gray-200 rounded-md overflow-hidden">
                        {selectedApplication.idFrontImage ? (
                          <Image
                            src={selectedApplication.idFrontImage}
                            alt="ID Front"
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-100">
                            <p className="text-sm text-gray-500">No image</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">ID Back</p>
                      <div className="relative h-40 w-full border border-gray-200 rounded-md overflow-hidden">
                        {selectedApplication.idBackImage ? (
                          <Image
                            src={selectedApplication.idBackImage}
                            alt="ID Back"
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-100">
                            <p className="text-sm text-gray-500">No image</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-gray-500 mb-2">Selfie</p>
                      <div className="relative h-40 w-full border border-gray-200 rounded-md overflow-hidden">
                        {selectedApplication.selfieImage ? (
                          <Image
                            src={selectedApplication.selfieImage}
                            alt="Selfie"
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-100">
                            <p className="text-sm text-gray-500">No image</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="shadow-sm focus:ring-[#0F766E] focus:border-[#0F766E] block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add notes about this application (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleReject(selectedApplication.id)}
                  disabled={processingId === selectedApplication.id}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {processingId === selectedApplication.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleApprove(selectedApplication.id)}
                  disabled={processingId === selectedApplication.id}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {processingId === selectedApplication.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {applications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no pending seller applications to review.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <li key={application.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedApplication(application)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {application.selfieImage ? (
                              <div className="h-10 w-10 rounded-full overflow-hidden relative">
                                <Image
                                  src={application.selfieImage}
                                  alt={application.name || "Applicant"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[#0F766E]">
                              {application.name || "Unnamed Applicant"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-4 flex flex-col items-end">
                            <div className="text-sm text-gray-900">
                              ID: {application.idNumber || "Not provided"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(application.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
