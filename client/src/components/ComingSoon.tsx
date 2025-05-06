import { Link } from 'react-router-dom';

interface ComingSoonProps {
  title: string;
  description?: string;
  linkText?: string;
  linkTo?: string;
}

export default function ComingSoon({
  title,
  description = 'This page is under construction. Please check back soon!',
  linkText = 'Go back to home',
  linkTo = '/',
}: ComingSoonProps) {
  return (
    <div className="min-h-[70vh] bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">{title}</h2>
        <div className="mt-4 flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-8 border-primary-200 border-t-primary-800" />
        </div>
        <p className="mt-6 text-lg leading-8 text-gray-600">{description}</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to={linkTo}
            className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            {linkText}
          </Link>
        </div>
      </div>
    </div>
  );
} 