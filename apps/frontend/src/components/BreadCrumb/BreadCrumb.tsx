import { Link } from "react-router-dom";

interface BreadCrumbProps {
  pages: {
    name: string;
    href: string;
    current: boolean;
    style?: string;
    dividerStyle?: string;
  }[];
}
export default function BreadCrumb({ pages }: BreadCrumbProps) {
  return (
    <nav
      className="flex pt-4 px-4 bg-gray-50 pl-4 2xl:pl-48"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-4">
        {pages.map((page, index) => (
          <li key={index}>
            <div className="flex items-center">
              <svg
                className={`${page.dividerStyle}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <Link
                to={page.href}
                className={`ml-4 text-sm font-medium text-gray-500 ${page.style}`}
                aria-current={page.current ? "page" : undefined}
              >
                {page.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
