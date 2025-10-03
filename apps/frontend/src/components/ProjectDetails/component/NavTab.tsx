import { useLocation, Link } from "react-router-dom";

interface NavTabProps {
  navData: {
    redirect: string;
    text: string;
    dataAttr: string;
  }[];
}

export default function NavTab({ navData }: NavTabProps) {
  const location = useLocation();

  return (
    <div className={`sm:block`}>
      <div className="border-b border-gray-200">
        <nav
          className="-mb-px flex space-x-8 sm:px-6 lg:px-7 bg-gray-50 2xl:px-12"
          aria-label="Tabs"
        >
          {navData.map((val, i) => (
            <Link
              key={i}
              className={`cursor-pointer whitespace-nowrap pb-4 border-b-2 font-medium text-sm px-1 ${location?.pathname === val?.redirect
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              aria-current="page"
              data-cy={val.dataAttr}
              to={val.redirect}
            >
              {val.text}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
