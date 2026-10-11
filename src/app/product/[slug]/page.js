"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_URL =
"https://api.api-store.workers.dev/api/bazardor/products";

function toBengaliNumber(value) {
if (value === null || value === undefined || value === "") return "—";

const number = Number(value);

if (!Number.isFinite(number)) return String(value);

return new Intl.NumberFormat("bn-BD", {
maximumFractionDigits: 2,
}).format(number);
}

export default function ProductDetails() {
const { slug } = useParams();
const [product, setProduct] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const controller = new AbortController();

async function loadProduct() {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(API_URL, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("পণ্যের তথ্য পাওয়া যায়নি");
    }

    const data = await response.json();

    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];

    const found = list.find(
      (item) => String(item.slug) === String(slug)
    );

    if (!found) {
      throw new Error("এই পণ্যটি পাওয়া যায়নি");
    }

    setProduct(found);
  } catch (err) {
    if (err.name === "AbortError") return;

    setError(err.message || "পণ্যের তথ্য লোড করা যায়নি");
  } finally {
    if (!controller.signal.aborted) {
      setLoading(false);
    }
  }
}

if (slug) loadProduct();

return () => controller.abort();

}, [slug]);

if (loading) {
return ( <main className="min-h-screen bg-gray-50 p-6">
পণ্যের তথ্য লোড হচ্ছে... </main>
);
}

if (error || !product) {
return ( <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center"> <h1 className="text-2xl font-bold">পণ্য পাওয়া যায়নি</h1> <p>{error}</p> <Link
       href="/"
       className="rounded-lg bg-green-700 px-5 py-3 text-white"
     >
হোম পেজে ফিরে যাও </Link> </main>
);
}

const markets = Array.isArray(product.markets)
? product.markets
: [];

const prices = markets
.flatMap((market) => [Number(market.min), Number(market.max)])
.filter(Number.isFinite);

const minPrice = prices.length ? Math.min(...prices) : null;
const maxPrice = prices.length ? Math.max(...prices) : null;

const averagePrice = markets.length
? markets.reduce((sum, market) => {
const min = Number(market.min);
const max = Number(market.max);

    if (Number.isFinite(min) && Number.isFinite(max)) {
      return sum + (min + max) / 2;
    }

    return sum;
  }, 0) /
  (markets.filter(
    (market) =>
      Number.isFinite(Number(market.min)) &&
      Number.isFinite(Number(market.max))
  ).length || 1)
: null;

return ( <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-6"> <div className="mx-auto max-w-5xl"> <Link href="/" className="mb-6 inline-block text-green-700">
← সব পণ্যে ফিরে যাও </Link>

    <section className="rounded-3xl bg-green-800 p-6 text-white sm:p-10">
      <p>পণ্যের বিস্তারিত</p>

      <h1 className="mt-3 text-3xl font-bold sm:text-5xl">
        {product.name}
      </h1>

      <p className="mt-3">একক: {product.unit || "প্রযোজ্য নয়"}</p>

      <p className="mt-6 text-3xl font-bold">
        ৳{toBengaliNumber(product.price)}
      </p>

      <p className="mt-1">বর্তমান দাম</p>

      {product.change && (
        <p className="mt-4">
          {product.change.dir === "up"
            ? "▲ দাম বেড়েছে"
            : product.change.dir === "down"
              ? "▼ দাম কমেছে"
              : "● দামে পরিবর্তন নেই"}{" "}
          {toBengaliNumber(product.change.pct)}%
        </p>
      )}
    </section>

    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "সর্বনিম্ন দাম", value: minPrice },
        { label: "সর্বোচ্চ দাম", value: maxPrice },
        { label: "গড় দাম", value: averagePrice },
        { label: "গতকালের দাম", value: product.yesterday },
      ].map((item) => (
        <div key={item.label} className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className="mt-2 text-2xl font-bold">
            {item.value == null
              ? "—"
              : `৳${toBengaliNumber(item.value)}`}
          </p>
        </div>
      ))}
    </section>

    <section className="mt-6 rounded-2xl border bg-white p-5">
      <h2 className="text-xl font-bold">দামের ইতিহাস</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <p>
          গত সপ্তাহের দাম:{" "}
          {product.lastWeek == null
            ? "—"
            : `৳${toBengaliNumber(product.lastWeek)}`}
        </p>

        <p>
          গত মাসের দাম:{" "}
          {product.lastMonth == null
            ? "—"
            : `৳${toBengaliNumber(product.lastMonth)}`}
        </p>
      </div>
    </section>

    <section className="mt-6 rounded-2xl border bg-white p-5">
      <h2 className="text-xl font-bold">বাজারভিত্তিক দাম</h2>

      {markets.length === 0 ? (
        <p className="mt-4">বাজারভিত্তিক দামের তথ্য পাওয়া যায়নি।</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">বাজার</th>
                <th className="p-3">এলাকা</th>
                <th className="p-3">সর্বনিম্ন</th>
                <th className="p-3">সর্বোচ্চ</th>
              </tr>
            </thead>

            <tbody>
              {markets.map((market, index) => (
                <tr
                  key={`${market.name || "market"}-${index}`}
                  className="border-t"
                >
                  <td className="p-3">{market.name || "—"}</td>
                  <td className="p-3">{market.division || "—"}</td>
                  <td className="p-3">
                    ৳{toBengaliNumber(market.min)}
                  </td>
                  <td className="p-3">
                    ৳{toBengaliNumber(market.max)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>

    <p className="mt-6 text-center text-sm text-gray-500">
      সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
    </p>
  </div>
</main>

);
}
