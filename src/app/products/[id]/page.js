"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://api.api-store.workers.dev/api/bazardor/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("পণ্যের তথ্য পাওয়া যায়নি");
        }

        return response.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];

        const found = list.find(
          (item) =>
            String(item.id) === String(id) || String(item.slug) === String(id),
        );

        if (!found) {
          throw new Error("এই পণ্যটি পাওয়া যায়নি");
        }

        setProduct(found);
      })
      .catch((err) => {
        setError(err.message || "পণ্যের তথ্য লোড করা যায়নি");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        পণ্যের তথ্য লোড হচ্ছে...
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p className="text-red-600">{error || "পণ্য পাওয়া যায়নি"}</p>

        <Link href="/" className="mt-4 inline-block text-green-700">
          ← হোমপেজে ফিরে যাও
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-medium text-green-700">
          ← সব পণ্যে ফিরে যাও
        </Link>

        <article className="mt-6 rounded-2xl border bg-white p-6 shadow-sm sm:p-10">
          <div className="text-6xl">
            {product.image || product.categoryIcon || "🛒"}
          </div>

          <p className="mt-5 text-sm text-green-700">
            {product.categoryNameBn || product.category}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {product.nameBn || product.name}
          </h1>

          <p className="mt-4 text-gray-500">
            একক: {product.unit || "প্রযোজ্য নয়"}
          </p>

          <p className="mt-4 text-3xl font-bold text-green-700">
            ৳{product.today ?? "—"}
            <span className="ml-2 text-base font-normal text-gray-500">
              / {product.unit || "একক"}
            </span>
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">গতকালের দাম</p>
              <p className="mt-2 font-bold">৳{product.yesterday ?? "—"}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">গত সপ্তাহের দাম</p>
              <p className="mt-2 font-bold">৳{product.lastWeek ?? "—"}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">গত মাসের দাম</p>
              <p className="mt-2 font-bold">৳{product.lastMonth ?? "—"}</p>
            </div>
          </div>

          {product.change && (
            <p
              className={`mt-5 font-semibold ${
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

          {Array.isArray(product.markets) && product.markets.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold">বাজারভিত্তিক দাম</h2>

              <div className="mt-4 space-y-3">
                {product.markets.map((market, index) => (
                  <div
                    key={`${market.market}-${index}`}
                    className="rounded-xl border p-4"
                  >
                    <h3 className="font-semibold">{market.market}</h3>

                    {market.division && (
                      <p className="mt-1 text-sm text-gray-500">
                        বিভাগ: {market.division}
                      </p>
                    )}

                    <p className="mt-2 text-green-700">
                      দাম: ৳{market.min ?? "—"} – ৳{market.max ?? "—"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </main>
  );
}
