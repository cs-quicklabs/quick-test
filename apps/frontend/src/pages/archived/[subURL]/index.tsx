
import { useParams, useLocation, Link } from "react-router-dom";
import {
  appRoutes,
  archivedRoutes,
} from "../../../components/Utils/constants/page-routes";
import { useTranslation } from "react-i18next";
import ArchivedProjects from "../../../components/Archived/ArchivedProjects";
import ArchivedUsers from "../../../components/Archived/ArchivedUsers";

const TapNavData = [
  {
    text: "Projects",
    link: `${appRoutes.ARCHIVED}/${archivedRoutes.PROJECTS}`,
    dataAttr: "archived-projects",
    d: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z",
  },
  {
    text: "Users",
    link: `${appRoutes.ARCHIVED}/${archivedRoutes.USERS}`,
    dataAttr: "archived-users",
    d: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  },
];

export default function Archived() {
  const { t } = useTranslation(["common"]);
  const params = useParams();
  const location = useLocation();

  return (
    <>

      <meta
        name="description"
        content="Restore or completely delete your inactive projects and users in this section."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, User, Profile, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/archived`}
      />


      <div className="pb-10 lg:py-12 px-2 sm:px-7 2xl:px-52">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="py-6 px-2 lg:py-0 lg:px-0 lg:col-span-3">
            <nav className="sm:space-y-1 flex justify-between lg:block">
              {TapNavData.map((val, i) => (
                <Link
                  to={val.link}
                  key={i}
                  data-cy={val.dataAttr}
                  className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium cursor-pointer w-full ${location?.pathname === val.link
                    ? "bg-gray-50 text-indigo-600"
                    : "bg-white hover:bg-gray-50 hover:text-indigo-600"
                    }`}
                  aria-current="page"
                >
                  <svg
                    className={`text-gray-400 group-hover:text-indigo-600 flex-shrink-0 -ml-1 mr-3 h-6 w-6 ${location?.pathname === val.link
                      ? "text-indigo-600"
                      : "hover:text-indigo-600"
                      }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={val.d}
                    />
                  </svg>
                  <span className="truncate">{t(val.text)}</span>
                </Link>
              ))}
            </nav>
          </aside>
          <div className="pb-12 lg:col-span-9">
            {params?.subURL === archivedRoutes.PROJECTS && <ArchivedProjects />}
            {params?.subURL === archivedRoutes.USERS && <ArchivedUsers />}
          </div>
        </div>
      </div>
    </>
  );
}
