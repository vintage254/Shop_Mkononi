"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  shopId: string;
  shopName: string;
  deliveryMethod?: {
    name: string;
    price: number;
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load cart items from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoading(false);
  }, []);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (itemId: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateDelivery = () => {
    return cartItems.reduce((total, item) => {
      if (item.deliveryMethod) {
        return total + item.deliveryMethod.price;
      }
      return total;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDelivery();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add some products to your cart to see them here
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-white py-2 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex gap-4"
            >
              {/* Product Image */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <Link
                  href={`/shops/${item.shopId}/products/${item.id}`}
                  className="font-medium hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.shopName}
                </p>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="font-medium">
                  KES {(item.price * item.quantity).toLocaleString()}
                </p>
                {item.deliveryMethod && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Delivery: KES {item.deliveryMethod.price.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>KES {calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>KES {calculateDelivery().toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>KES {calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
            <button className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors mt-6">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 