"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, AlertCircle, Info } from "lucide-react";

interface ShopSettings {
  id: string;
  name: string;
  buyerVerification: "NONE" | "ID" | "PHONE";
}

export default function SellerSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shop, setShop] = useState<ShopSettings | null>(null);
  const [settings, setSettings] = useState({
    buyerVerification: "NONE",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.role !== "SELLER") {
      router.push("/");
      return;
    }

    fetchShopSettings();
  }, [status, session, router]);

  const fetchShopSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/seller/shop");
      if (!response.ok) throw new Error("Failed to fetch shop settings");
      
      const shopData = await response.json();
      setShop(shopData);
      setSettings({
        buyerVerification: shopData.buyerVerification,
      });
    } catch (error) {
      setError("Failed to load shop settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({
      ...settings,
      buyerVerification: e.target.value as "NONE" | "ID" | "PHONE",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/seller/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerVerification: settings.buyerVerification,
        }),
      });

      if (!response.ok) throw new Error("Failed to update settings");
      
      setSuccess("Shop settings updated successfully");
    } catch (error) {
      setError("Failed to update settings");
      console.error(error);
    } finally {
      setSaving(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Shop Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure your shop settings and preferences
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Security Settings
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Configure security and verification options for your shop
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="buyerVerification" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-[#0F766E]" />
                    Customer Verification
                  </div>
                </label>
                <select
                  id="buyerVerification"
                  name="buyerVerification"
                  value={settings.buyerVerification}
                  onChange={handleVerificationChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#0F766E] focus:border-[#0F766E] sm:text-sm rounded-md"
                >
                  <option value="NONE">No verification (default)</option>
                  <option value="ID">ID verification (requires ID upload)</option>
                  <option value="PHONE">Phone verification (requires SMS code)</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  Choose how customers must verify themselves before accessing your shop
                </p>
                
                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Note:</strong> Requiring verification may reduce the number of customers who visit your shop.
                        Only enable this if your shop requires additional security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0F766E] hover:bg-[#0c6259] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E]"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                "Save Settings"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
