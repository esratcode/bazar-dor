export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {" "}
      <nav className="flex items-center justify-between bg-green-700 px-6 py-4 text-white">
        {" "}
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

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">পণ্যের তালিকা</h3>

          <p className="mt-2 text-gray-500">
            খুব শীঘ্রই এখানে পণ্যের নাম ও বাজারদর দেখা যাবে।
          </p>
        </div>
      </main>
    </div>
  );
}
