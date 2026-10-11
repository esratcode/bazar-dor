"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সব");

  useEffect(() => {
    let isMounted = true;

    fetch("https://api.api-store.workers.dev/api/bazardor/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("পণ্যের তথ্য লোড করা যায়নি");
        }

        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      })
      .catch((error) => {
        console.error("Products fetch error:", error);

        if (isMounted) {
          setError("পণ্যের তথ্য লোড করা যায়নি। আবার চেষ্টা করো।");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    "সব",
    ...new Set(
      products
        .map((product) => product.categoryNameBn || product.category)
        .filter(Boolean),
    ),
  ];

  const filteredProducts =
    selectedCategory === "সব"
      ? products
      : products.filter(
          (product) =>
            (product.categoryNameBn || product.category) === selectedCategory,
        );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}{" "}
      <nav className="flex items-center justify-between bg-green-700 px-6 py-4 text-white">
        {" "}
        <Link href="/" className="text-2xl font-bold">
          Bazar Dor{" "}
        </Link>
        <div className="flex gap-5">
          <Link href="/" className="transition hover:text-green-200">
            Home
          </Link>

          <Link href="/login" className="transition hover:text-green-200">
            Login
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero Section */}
        <section className="rounded-2xl bg-green-100 px-6 py-10 sm:px-10">
          <p className="font-semibold text-green-800">
            প্রতিদিনের বাজারদর জানুন
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            নিত্যপ্রয়োজনীয় পণ্যের বাজারদর
          </h1>

          <p className="mt-4 max-w-2xl text-gray-600">
            আপনার নিত্যপ্রয়োজনীয় পণ্যের দাম জানুন এক জায়গায়। বাজার করার আগে
            দাম দেখে নিন, সচেতনভাবে কেনাকাটা করুন।
          </p>
        </section>

        {/* Product Section */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">পণ্যের তালিকা</h2>

            {!loading && !error && (
              <p className="text-sm text-gray-500">
                মোট পণ্য: {filteredProducts.length}টি
              </p>
            )}
          </div>

          {/* Category Filter */}
          {!loading && !error && products.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                    selectedCategory === category
                      ? "bg-green-700 text-white shadow-sm"
                      : "border border-gray-300 bg-white hover:border-green-600 hover:bg-green-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Loading, Error and Empty State */}
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-600">পণ্যের তথ্য লোড হচ্ছে...</p>
            </div>
          ) : error ? (
            <div className="mt-6 rounded-xl bg-red-50 p-5 text-red-600">
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="mt-6 rounded-xl border bg-white p-8 text-center text-gray-500">
              কোনো পণ্যের তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            /* Product Cards */
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <Link
                  href={`/products/${product.id}`}
                  key={product.id}
                  className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-green-500 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-4xl">
                      {product.image || product.categoryIcon || "🛒"}
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
                      {product.categoryNameBn || product.category || "অন্যান্য"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold">
                    {product.nameBn || product.name || "পণ্যের নাম"}
                  </h3>

                  <p className="mt-3 text-sm text-gray-500">
                    একক: {product.unit || "প্রযোজ্য নয়"}
                  </p>

                  <p className="mt-2 text-xl font-bold text-green-700">
                    ৳{product.today ?? "—"}
                    <span className="ml-1 text-sm font-normal text-gray-500">
                      / {product.unit || "একক"}
                    </span>
                  </p>

                  {product.change && (
                    <p
                      className={`mt-3 text-sm font-medium ${
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

                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400">
                      গতকালের দাম: ৳{product.yesterday ?? "—"}
                    </p>

                    <p className="mt-3 text-sm font-semibold text-green-700">
                      বিস্তারিত দেখুন →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      {/* Footer */}
      <footer className="mt-12 border-t bg-white px-6 py-6 text-center text-sm text-gray-500">
        © 2026 Bazar Dor — বাংলাদেশের বাজারদর এক জায়গায়।
      </footer>
    </div>
  );
}
