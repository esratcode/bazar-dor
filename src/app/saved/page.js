"use client";

import Link from "next/link";
import { useSaved } from "../../context/SavedContext";

export default function SavedPage() {
  const { savedProducts, toggleSaved } = useSaved();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="flex items-center justify-between bg-green-700 px-6 py-4 text-white">
        <Link href="/" className="text-2xl font-bold">
          Bazar Dor
        </Link>

        <Link href="/" className="hover:text-green-200">
          ← Home
        </Link>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">❤️ Saved Products</h1>

        <p className="mt-2 text-gray-600">
          তোমার পছন্দের সেভ করা পণ্যগুলো এখানে দেখতে পারবে।
        </p>

        {savedProducts.length === 0 ? (
          <div className="mt-8 rounded-xl border bg-white p-8 text-center">
            <p className="text-lg text-gray-600">
              এখনো কোনো পণ্য Save করা হয়নি।
            </p>

            <Link
              href="/"
              className="mt-5 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              পণ্য দেখো
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-gray-500">
              মোট সেভ করা পণ্য: {savedProducts.length}টি
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {savedProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-4xl">
                      {product.image || product.categoryIcon || "🛒"}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleSaved(product)}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                      ❤️ Unsave
                    </button>
                  </div>

                  <h2 className="mt-4 text-lg font-bold">
                    {product.nameBn || product.name || "পণ্যের নাম"}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Category:{" "}
                    {product.categoryNameBn || product.category || "অন্যান্য"}
                  </p>

                  <p className="mt-3 text-xl font-bold text-green-700">
                    ৳{product.today ?? "—"}
                    <span className="ml-1 text-sm font-normal text-gray-500">
                      / {product.unit || "একক"}
                    </span>
                  </p>

                  <Link
                    href={`/products/${product.id}`}
                    className="mt-4 inline-block font-semibold text-green-700 hover:text-green-900"
                  >
                    বিস্তারিত দেখুন →
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t bg-white px-6 py-6 text-center text-sm text-gray-500">
        © 2026 Bazar Dor — বাংলাদেশের বাজারদর এক জায়গায়।
      </footer>
    </div>
  );
}
