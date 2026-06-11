import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-5 text-center">
      <div><p className="font-display text-8xl font-bold text-civic-100">404</p><h1 className="mt-2 font-display text-3xl font-bold text-civic-950">Page not found</h1><Link to="/" className="mt-6 inline-block text-sm font-bold text-civic-700 hover:underline">Return home</Link></div>
    </div>
  );
}
