"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag, Package, Settings, BarChart4, Users } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Determine which dashboard modules to show based on user role
  const isBuyer = session?.user?.role === "BUYER";
  const isSeller = session?.user?.role === "SELLER";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Dashboard Content */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* All users see these modules */}
            <DashboardCard 
              title="My Orders" 
              description="View your order history" 
              icon={<Package className="h-8 w-8 text-gray-500" />} 
              href="/orders" 
            />
            <DashboardCard 
              title="Account Settings" 
              description="Update your profile information" 
              icon={<Settings className="h-8 w-8 text-gray-500" />} 
              href="/dashboard/settings" 
            />
            
            {/* Seller-specific modules */}
            {isSeller && (
              <>
                <DashboardCard 
                  title="My Shops" 
                  description="Manage your shops" 
                  icon={<ShoppingBag className="h-8 w-8 text-teal-600" />} 
                  href="/seller/shops" 
                />
                
                <DashboardCard 
                  title="Analytics" 
                  description="View your sales performance" 
                  icon={<BarChart4 className="h-8 w-8 text-teal-600" />} 
                  href="/seller/analytics" 
                />
              </>
            )}
            
            {/* Buyer-only modules */}
            {isBuyer && !isSeller && (
              <DashboardCard 
                title="Become a Seller" 
                description="Start selling on Shop Mkononi" 
                icon={<ShoppingBag className="h-8 w-8 text-teal-600" />} 
                href="/auth/verify" 
                highlight={true}
              />
            )}
            
            {/* Admin-specific modules */}
            {isAdmin && (
              <>
                <DashboardCard 
                  title="User Management" 
                  description="Manage users and permissions" 
                  icon={<Users className="h-8 w-8 text-teal-600" />} 
                  href="/admin/users" 
                />
                
                <DashboardCard 
                  title="Seller Verifications" 
                  description="Review seller applications" 
                  icon={<ShoppingBag className="h-8 w-8 text-teal-600" />} 
                  href="/admin/verifications" 
                />
              </>
            )}
          </div>
          
          {/* Status Information */}
          {isBuyer && session?.user?.requestedRole === "SELLER" && (
            <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h2 className="text-lg font-medium text-yellow-800">Seller Application Status</h2>
              <p className="text-sm text-yellow-700 mt-1">
                Your application to become a seller is currently being reviewed. We&apos;ll notify you once it&apos;s approved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Dashboard card component
interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  highlight?: boolean;
}

function DashboardCard({ title, description, icon, href, highlight = false }: DashboardCardProps) {
  return (
    <Link 
      href={href}
      className={`block p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        highlight ? 'bg-teal-50 border border-teal-200' : 'bg-white'
      }`}
    >
      <div className="flex items-start">
        <div className="shrink-0">{icon}</div>
        <div className="ml-4">
          <h3 className={`text-lg font-medium ${highlight ? 'text-teal-800' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`mt-1 text-sm ${highlight ? 'text-teal-600' : 'text-gray-500'}`}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
