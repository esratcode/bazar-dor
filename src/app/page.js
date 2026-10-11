"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSaved } from "../context/SavedContext";

const API_URL = "https://api.api-store.workers.dev/api/bazardor/products";

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

function getChange(product) {
  const change = Number(product.change?.pct);
  return Number.isFinite(change) ? change : 0;
}

function PriceChange({ product }) {
  const direction = product.change?.dir;
  const percentage = getChange(product);

  const isUp = direction === "up";
  const isDown = direction === "down";

  return (
    <p
      className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${
        isUp
          ? "bg-red-50 text-red-600"
          : isDown
            ? "bg-green-50 text-green-700"
            : "bg-gray-100 text-gray-600"
      }`}
    >
      {isUp ? "▲ দাম বেড়েছে" : isDown ? "▼ দাম কমেছে" : "● অপরিবর্তিত"}
      <span>({toBengaliNumber(percentage)}%)</span>
    </p>
  );
}

function ProductCard({ product, toggleSaved, isSaved }) {
  const saved = isSaved(product.id);
  const productUrl = `/product/${product.slug ?? product.id}`;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-green-500 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-4xl">
          {product.image || product.categoryIcon || "🛒"}
        </div>

        <button
          type="button"
          onClick={() => toggleSaved(product)}
          aria-label={saved ? "সংরক্ষিত পণ্য সরান" : "পণ্য সংরক্ষণ করুন"}
          aria-pressed={saved}
          className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
            saved
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          }`}
        >
          {saved ? "♥ Saved" : "♡ Save"}
        </button>
      </div>

      <Link href={productUrl} className="mt-4 flex flex-1 flex-col">
        <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
          {product.categoryNameBn || product.category || "অন্যান্য"}
        </span>

        <h3 className="mt-3 text-lg font-bold text-gray-900 group-hover:text-green-700">
          {product.nameBn || product.name || "পণ্যের নাম"}
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          একক: {product.unit || "প্রযোজ্য নয়"}
        </p>

        <p className="mt-3 text-2xl font-bold text-green-700">
          ৳{toBengaliNumber(product.today)}
          <span className="ml-1 text-sm font-normal text-gray-500">
            / {product.unit || "একক"}
          </span>
        </p>

        <PriceChange product={product} />

        <div className="mt-auto border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            গতকালের দাম: ৳{toBengaliNumber(product.yesterday)}
          </p>
          <p className="mt-3 font-semibold text-green-700">বিস্তারিত দেখুন →</p>
        </div>
      </Link>
    </article>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  loading,
  toggleSaved,
  isSaved,
  id,
  emptyMessage,
}) {
  return (
    <section id={id} className="scroll-mt-24 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border bg-white p-5"
            >
              <div className="h-14 w-14 rounded-xl bg-gray-200" />
              <div className="mt-5 h-4 w-2/3 rounded bg-gray-200" />
              <div className="mt-4 h-7 w-1/2 rounded bg-gray-200" />
              <div className="mt-5 h-4 w-full rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="rounded-xl border bg-white p-6 text-gray-500">
          {emptyMessage || "এই মুহূর্তে কোনো পণ্য পাওয়া যায়নি।"}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              toggleSaved={toggleSaved}
              isSaved={isSaved}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সব");
  const [searchTerm, setSearchTerm] = useState("");

  const { toggleSaved, isSaved } = useSaved();

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য লোড করা যায়নি");
        }

        const data = await response.json();

        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.products)
              ? data.products
              : [];

        setProducts(productList);
        setError("");
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Products fetch error:", err);
        setError("পণ্যের তথ্য লোড করা যায়নি। আবার চেষ্টা করো।");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => [
      "সব",
      ...new Set(
        products
          .map((product) => product.categoryNameBn || product.category)
          .filter(Boolean),
      ),
    ],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();

    return products.filter((product) => {
      const category = product.categoryNameBn || product.category;

      const matchesCategory =
        selectedCategory === "সব" || category === selectedCategory;

      const searchableText = [
        product.nameBn,
        product.name,
        product.categoryNameBn,
        product.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      return matchesCategory && searchableText.includes(query);
    });
  }, [products, selectedCategory, searchTerm]);

  const { risers, fallers } = useMemo(() => {
    const changedProducts = products.filter((product) => {
      const direction = product.change?.dir;

      return (
        (direction === "up" || direction === "down") &&
        Number.isFinite(Number(product.change?.pct))
      );
    });

    return {
      risers: changedProducts
        .filter((product) => product.change.dir === "up")
        .sort((a, b) => getChange(b) - getChange(a))
        .slice(0, 6),

      fallers: changedProducts
        .filter((product) => product.change.dir === "down")
        .sort((a, b) => getChange(a) - getChange(b))
        .slice(0, 6),
    };
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b border-green-900/10 bg-white/95 shadow-sm backdrop-blur">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🛒</span>
            <span className="text-xl font-extrabold text-green-800 sm:text-2xl">
              বাজার দর
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm font-medium sm:gap-5">
            <Link href="/" className="text-green-700">
              হোম
            </Link>

            <Link href="/#সব-পণ্য" className="transition hover:text-green-700">
              সব পণ্য
            </Link>

            <Link href="/saved" className="transition hover:text-green-700">
              ♥ সংরক্ষিত
            </Link>

            <Link
              href="/signin"
              className="rounded-full bg-green-700 px-4 py-2 text-white transition hover:bg-green-800"
            >
              সাইন ইন
            </Link>

            <Link
              href="/signup"
              className="rounded-full border border-green-700 px-4 py-2 text-green-800 transition hover:bg-green-50"
            >
              সাইন আপ
            </Link>
          </div>
        </nav>

        <div className="overflow-hidden border-t border-gray-100 bg-green-950 py-2 text-white">
          <div className="flex w-max animate-[ticker_35s_linear_infinite] items-center gap-8 px-4 hover:[animation-play-state:paused]">
            {[...products, ...products].map((product, index) => (
              <span
                key={`${product.id}-${index}`}
                className="whitespace-nowrap text-sm"
              >
                {product.image || "🛒"} {product.nameBn || product.name}{" "}
                <strong>৳{toBengaliNumber(product.today)}</strong> /{" "}
                {product.unit || "একক"}{" "}
                <span
                  className={
                    product.change?.dir === "up"
                      ? "text-red-300"
                      : product.change?.dir === "down"
                        ? "text-green-300"
                        : "text-gray-300"
                  }
                >
                  {product.change?.dir === "up"
                    ? "▲"
                    : product.change?.dir === "down"
                      ? "▼"
                      : "●"}{" "}
                  {toBengaliNumber(getChange(product))}%
                </span>
              </span>
            ))}

            {products.length === 0 && (
              <span>🛒 প্রতিদিনের বাজারদর এক নজরে</span>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="overflow-hidden bg-gradient-to-br from-green-950 via-green-800 to-green-700 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:py-24">
            <div>
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-green-100">
                🌿 প্রতিদিনের বাজারদর, আপনার হাতেই
              </p>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                বাজারের দাম জানুন,
                <span className="mt-2 block text-lime-300">
                  সচেতনভাবে কিনুন
                </span>
              </h1>

              <p className="mt-5 max-w-xl leading-7 text-green-50/90">
                চাল, ডাল, তেলসহ নিত্যপ্রয়োজনীয় পণ্যের দাম এক জায়গায় দেখুন। দাম
                বাড়ছে নাকি কমছে জানুন বাজার করার আগেই।
              </p>

              <a
                href="#সব-পণ্য"
                className="mt-8 inline-flex rounded-xl bg-lime-300 px-6 py-3 font-bold text-green-950 shadow-lg transition hover:bg-lime-200"
              >
                সব পণ্য দেখুন →
              </a>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-green-100">
                <p>
                  <strong className="block text-2xl text-white">
                    {toBengaliNumber(products.length)}
                  </strong>
                  পণ্যের তথ্য
                </p>

                <p>
                  <strong className="block text-2xl text-white">📊</strong>
                  দামের পরিবর্তন
                </p>

                <p>
                  <strong className="block text-2xl text-white">♥</strong>
                  পছন্দের তালিকা
                </p>
              </div>
            </div>

            <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl">
              <div className="absolute inset-6 rounded-full border border-dashed border-lime-200/50" />

              <div className="relative text-center">
                <span className="block text-8xl sm:text-9xl">🧺</span>
                <p className="mt-5 text-xl font-bold text-lime-200">
                  আজকের বাজারদর
                </p>
                <p className="mt-2 text-sm text-green-100">
                  দাম জেনে বাজার করুন
                </p>
              </div>

              <span className="absolute left-4 top-10 rounded-2xl bg-white p-4 text-3xl shadow-xl sm:left-8">
                🥦
              </span>

              <span className="absolute bottom-10 right-4 rounded-2xl bg-white p-4 text-3xl shadow-xl sm:right-8">
                🍅
              </span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ProductSection
            id="দাম-বেড়েছে"
            title="📈 যেসব পণ্যের দাম বেড়েছে"
            subtitle="শতকরা দাম বৃদ্ধির ভিত্তিতে সর্বোচ্চ ৬টি পণ্য"
            products={risers}
            loading={loading}
            toggleSaved={toggleSaved}
            isSaved={isSaved}
            emptyMessage="এই মুহূর্তে দাম বেড়েছে এমন পণ্য পাওয়া যায়নি।"
          />

          <ProductSection
            id="দাম-কমেছে"
            title="📉 যেসব পণ্যের দাম কমেছে"
            subtitle="শতকরা দাম হ্রাসের ভিত্তিতে সর্বোচ্চ ৬টি পণ্য"
            products={fallers}
            loading={loading}
            toggleSaved={toggleSaved}
            isSaved={isSaved}
            emptyMessage="এই মুহূর্তে দাম কমেছে এমন পণ্য পাওয়া যায়নি।"
          />

          <section id="সব-পণ্য" className="scroll-mt-28 py-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-semibold text-green-700">
                  আপনার বাজারের সঙ্গী
                </p>

                <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                  সব পণ্যের বাজারদর
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  পণ্য খুঁজুন, দাম তুলনা করুন এবং পছন্দের পণ্য সংরক্ষণ করুন।
                </p>
              </div>

              {!loading && !error && (
                <p className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-800">
                  মোট {toBengaliNumber(filteredProducts.length)}টি পণ্য
                </p>
              )}
            </div>

            {!loading && !error && (
              <>
                <div className="mt-6">
                  <label htmlFor="product-search" className="sr-only">
                    পণ্য খুঁজুন
                  </label>

                  <input
                    id="product-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="🔍 পণ্যের নাম দিয়ে খুঁজুন..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      aria-pressed={selectedCategory === category}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selectedCategory === category
                          ? "bg-green-700 text-white shadow-sm"
                          : "border border-gray-200 bg-white text-gray-700 hover:border-green-600 hover:bg-green-50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </>
            )}

            {error ? (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
              >
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            ) : (
              <div className="mt-6">
                {loading ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse rounded-2xl border bg-white p-5"
                      >
                        <div className="h-14 w-14 rounded-xl bg-gray-200" />
                        <div className="mt-5 h-4 w-2/3 rounded bg-gray-200" />
                        <div className="mt-4 h-7 w-1/2 rounded bg-gray-200" />
                        <div className="mt-5 h-4 w-full rounded bg-gray-100" />
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                    <span className="text-5xl">🔎</span>

                    <h3 className="mt-4 text-xl font-bold">
                      কোনো পণ্য পাওয়া যায়নি
                    </h3>

                    <p className="mt-2 text-gray-500">
                      অন্য নাম দিয়ে খুঁজুন অথবা অন্য ক্যাটাগরি বেছে নিন।
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("সব");
                      }}
                      className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
                    >
                      সব পণ্য দেখুন
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        toggleSaved={toggleSaved}
                        isSaved={isSaved}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-gray-700">
            বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
          </p>

          <p>
            সকল দাম সম্ভাব্য; বাজারের অবস্থার ওপর নির্ভর করে পরিবর্তিত হতে পারে।
          </p>
        </div>
      </footer>
    </div>
  );
}
