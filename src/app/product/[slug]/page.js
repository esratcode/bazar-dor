
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_URL =
  "https://api.api-store.workers.dev/api/bazardor/products";

// Format numbers in Bengali
function toBengaliNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 2,
  }).format(number);
}

// Handle common API response formats
function extractProduct(data) {
  let result = data;

  for (let i = 0; i < 3; i++) {
    if (Array.isArray(result)) {
      return null;
    }

    if (!result || typeof result !== "object") {
      return null;
    }

    if (
      result.id !== undefined ||
      result.slug !== undefined ||
      result.name !== undefined ||
      result.nameBn !== undefined
    ) {
      return result;
    }

    result =
      result.data ??
      result.product ??
      result.result ??
      null;
  }

  return null;
}

function getPrice(product) {
  return product?.price ?? product?.today ?? null;
}

function getProductName(product) {
  return product?.nameBn || product?.name || "পণ্যের নাম";
}

export default function ProductDetails() {
  const params = useParams();
  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        let found = null;

        // First, try the API endpoint for this specific product.
        const detailResponse = await fetch(
          `${API_URL}/${encodeURIComponent(String(slug))}`,
          { signal: controller.signal }
        );

        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          found = extractProduct(detailData);
        }

        // Fallback: search the complete product list by ID or slug.
        if (!found) {
          const listResponse = await fetch(API_URL, {
            signal: controller.signal,
          });

          if (!listResponse.ok) {
            throw new Error("পণ্যের তথ্য পাওয়া যায়নি।");
          }

          const listData = await listResponse.json();

          const list = Array.isArray(listData)
            ? listData
            : Array.isArray(listData?.data)
              ? listData.data
              : Array.isArray(listData?.products)
                ? listData.products
                : Array.isArray(listData?.data?.products)
                  ? listData.data.products
                  : [];

          found = list.find(
            (item) =>
              String(item.id) === String(slug) ||
              String(item.slug) === String(slug)
          );
        }

        if (!found) {
          throw new Error("এই পণ্যটি পাওয়া যায়নি।");
        }

        setProduct(found);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Product details error:", err);
        setError(
          err.message || "পণ্যের তথ্য লোড করা যায়নি। আবার চেষ্টা করো।"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-6 w-40 rounded bg-gray-200" />

          <div className="rounded-3xl bg-white p-8">
            <div className="h-8 w-2/3 rounded bg-gray-200" />
            <div className="mt-5 h-5 w-1/3 rounded bg-gray-200" />
            <div className="mt-6 h-10 w-1/4 rounded bg-gray-200" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="h-52 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <span className="text-5xl">🔎</span>

        <h1 className="text-2xl font-bold text-gray-900">
          পণ্য পাওয়া যায়নি
        </h1>

        <p className="max-w-md text-gray-600">
          {error || "পণ্যের তথ্য পাওয়া যায়নি।"}
        </p>

        <Link
          href="/"
          className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
        >
          হোম পেজে ফিরে যাও
        </Link>
      </main>
    );
  }

  const markets = Array.isArray(product.markets)
    ? product.markets
    : [];

  // Only use valid market minimum and maximum prices.
  const validMarkets = markets.filter((market) => {
    const min = Number(market.min);
    const max = Number(market.max);

    return (
      market.min !== null &&
      market.min !== undefined &&
      market.min !== "" &&
      market.max !== null &&
      market.max !== undefined &&
      market.max !== "" &&
      Number.isFinite(min) &&
      Number.isFinite(max)
    );
  });

  const minPrice = validMarkets.length
    ? Math.min(
        ...validMarkets.map((market) => Number(market.min))
      )
    : null;

  const maxPrice = validMarkets.length
    ? Math.max(
        ...validMarkets.map((market) => Number(market.max))
      )
    : null;

  const averagePrice = validMarkets.length
    ? validMarkets.reduce(
        (sum, market) =>
          sum +
          (Number(market.min) + Number(market.max)) / 2,
        0
      ) / validMarkets.length
    : null;

  const currentPrice = getPrice(product);
  const yesterdayPrice = product.yesterday;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-6 inline-block font-medium text-green-700 transition hover:text-green-900"
        >
          ← সব পণ্যে ফিরে যাও
        </Link>

        {/* Product summary */}
        <section className="rounded-3xl bg-gradient-to-br from-green-950 to-green-700 p-6 text-white shadow-lg sm:p-10">
          <p className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm">
            {product.categoryNameBn ||
              product.category ||
              "নিত্যপ্রয়োজনীয় পণ্য"}
          </p>

          <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">
            {getProductName(product)}
          </h1>

          <p className="mt-3 text-green-100">
            একক: {product.unit || "প্রযোজ্য নয়"}
          </p>

          <p className="mt-6 text-3xl font-extrabold sm:text-4xl">
            ৳{toBengaliNumber(currentPrice)}
            <span className="ml-2 text-base font-normal text-green-100">
              / {product.unit || "একক"}
            </span>
          </p>

          <p className="mt-2 text-sm text-green-100">
            বর্তমান দাম
          </p>

          {product.change && (
            <p
              className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                product.change.dir === "up"
                  ? "bg-red-100 text-red-700"
                  : product.change.dir === "down"
                    ? "bg-green-100 text-green-800"
                    : "bg-white/15 text-white"
              }`}
            >
              {product.change.dir === "up"
                ? "▲ দাম বেড়েছে"
                : product.change.dir === "down"
                  ? "▼ দাম কমেছে"
                  : "● দামে পরিবর্তন নেই"}

              {" "}({toBengaliNumber(product.change.pct)}%)
            </p>
          )}
        </section>

        {/* Price summary cards */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "সর্বনিম্ন দাম", value: minPrice },
            { label: "সর্বোচ্চ দাম", value: maxPrice },
            { label: "গড় দাম", value: averagePrice },
            { label: "গতকালের দাম", value: yesterdayPrice },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">
                {item.label}
              </p>

              <p className="mt-3 text-2xl font-bold text-green-800">
                {item.value === null ||
                item.value === undefined ||
                item.value === ""
                  ? "—"
                  : `৳${toBengaliNumber(item.value)}`}
              </p>
            </div>
          ))}
        </section>

        {/* Price history */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold">
            দামের ইতিহাস
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                গত সপ্তাহের দাম
              </p>

              <p className="mt-2 text-lg font-bold">
                {product.lastWeek == null
                  ? "—"
                  : `৳${toBengaliNumber(product.lastWeek)}`}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                গত মাসের দাম
              </p>

              <p className="mt-2 text-lg font-bold">
                {product.lastMonth == null
                  ? "—"
                  : `৳${toBengaliNumber(product.lastMonth)}`}
              </p>
            </div>
          </div>
        </section>

        {/* Market-by-market prices */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold">
            বাজারভিত্তিক দাম
          </h2>

          {markets.length === 0 ? (
            <p className="mt-4 rounded-xl bg-gray-50 p-4 text-gray-600">
              বাজারভিত্তিক দামের তথ্য পাওয়া যায়নি।
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-green-50 text-green-950">
                  <tr>
                    <th className="p-3 font-semibold">
                      বাজার
                    </th>
                    <th className="p-3 font-semibold">
                      এলাকা
                    </th>
                    <th className="p-3 font-semibold">
                      সর্বনিম্ন
                    </th>
                    <th className="p-3 font-semibold">
                      সর্বোচ্চ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {markets.map((market, index) => (
                    <tr
                      key={`${market.name || "market"}-${index}`}
                      className="border-t border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="p-3">
                        {market.name || "—"}
                      </td>

                      <td className="p-3">
                        {market.division ||
                          market.area ||
                          market.location ||
                          "—"}
                      </td>

                      <td className="p-3 font-medium">
                        {market.min == null
                          ? "—"
                          : `৳${toBengaliNumber(market.min)}`}
                      </td>

                      <td className="p-3 font-medium">
                        {market.max == null
                          ? "—"
                          : `৳${toBengaliNumber(market.max)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-sm text-gray-500">
          সকল দাম সম্ভাব্য; বাজারের অবস্থার ওপর নির্ভর করে
          পরিবর্তিত হতে পারে।
        </p>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex rounded-xl border border-green-700 px-5 py-3 font-semibold text-green-800 transition hover:bg-green-50"
          >
            আরও পণ্য দেখুন →
          </Link>
        </div>
      </div>
    </main>
  );
}

