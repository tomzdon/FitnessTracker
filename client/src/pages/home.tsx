import { Link } from "wouter";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Welcome to CGX</h1>
        <p className="mb-4">This is the home page.</p>
        <Link href="/discover">
          <a className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
            Go to Discover
          </a>
        </Link>
      </div>
    </div>
  );
}
