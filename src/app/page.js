"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://api.api-store.workers.dev/api/bazardor/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("পণ্যের তথ্য লোড করা যায়নি");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Products:", data);
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Products fetch error:", error);
        setError("পণ্যের তথ্য লোড করা যায়নি। আবার চেষ্টা করো।");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="flex items-center justify-between bg-green-700 px-6 py-4 text-white">
        <h1 className="text-2xl font-bold">Bazar Dor</h1>

        <div className="flex gap-5">
          <a href="/">Home</a>
          <a href="/login">Login</a>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-3xl font-bold">নিত্যপ্রয়োজনীয় পণ্যের বাজারদর</h2>

        <p className="mt-3 text-gray-600">
          আপনার নিত্যপ্রয়োজনীয় পণ্যের দাম জানুন এক জায়গায়।
        </p>

        <h3 className="mt-8 text-2xl font-semibold">পণ্যের তালিকা</h3>

        {loading ? (
          <p className="mt-4">পণ্যের তথ্য লোড হচ্ছে...</p>
        ) : error ? (
          <p className="mt-4 text-red-600">{error}</p>
        ) : products.length === 0 ? (
          <p className="mt-4">কোনো পণ্যের তথ্য পাওয়া যায়নি।</p>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-4xl">
                  {product.image || product.categoryIcon || "🛒"}
                </div>

                <h4 className="mt-3 text-lg font-bold">
                  {product.nameBn || product.name || "পণ্যের নাম"}
                </h4>

                <p className="mt-2 text-sm text-gray-500">
                  ক্যাটাগরি: {product.categoryNameBn || product.category || ""}
                </p>

                <p className="mt-3 font-semibold text-green-700">
                  দাম: ৳{product.today} / {product.unit}
                </p>

                {product.change && (
                  <p
                    className={`mt-2 text-sm font-medium ${
                      product.change.dir === "up"
                        ? "text-red-600"
                        : product.change.dir === "down"
                          ? "text-green-600"
                          : "text-gray-500"
                    }`}
                  >
                    {product.change.dir === "up"
                      ? "▲ দাম বেড়েছে"
                      : product.change.dir === "down"
                        ? "▼ দাম কমেছে"
                        : "● দাম অপরিবর্তিত"}{" "}
                    ({product.change.pct}%)
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
