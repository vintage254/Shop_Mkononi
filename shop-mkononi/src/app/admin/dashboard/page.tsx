"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, Package, ShoppingBag, Settings, LogOut, ChevronRight } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/");
      } else {
        setLoading(false);
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/dashboard");
    }
  }, [status, session, router]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0F766E]"></div>
      </div>
    );
  }

  const adminMenuItems = [
    {
      name: "Seller Applications",
      description: "Review and manage seller verification requests",
      icon: <Users className="h-6 w-6 text-[#0F766E]" />,
      path: "/admin/seller-applications",
      count: 0,
    },
    {
      name: "Products",
      description: "Manage all products in the marketplace",
      icon: <Package className="h-6 w-6 text-[#0F766E]" />,
      path: "/admin/products",
      count: 0,
    },
    {
      name: "Settings",
      description: "Configure system settings and preferences",
      icon: <Settings className="h-6 w-6 text-[#0F766E]" />,
      path: "/admin/settings",
      count: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-[#0F766E]" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div>
              <button
                onClick={() => {
                  // Handle sign out logic
                  router.push("/auth/signout");
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {adminMenuItems.map((item) => (
              <li key={item.name}>
                <Link href={item.path} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">{item.icon}</div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#0F766E]">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {item.count > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                            {item.count}
                          </span>
                        )}
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
