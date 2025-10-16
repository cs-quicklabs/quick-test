import UpdateProfile from "./UpdateProfile";
import ChangePassword from "./ChangePassword";
import { useParams, useLocation, Link } from "react-router-dom";
import { appRoutes } from "../Utils/constants/page-routes";
import { useTranslation } from "react-i18next";

const TapNavData = [
  {
    text: "Profile",
    link: appRoutes.PROFILE_UPDATE,
    dataAttr: "update-profile",
    d: "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    text: "Change Password",
    dataAttr: "change-password",
    link: appRoutes.PROFILE_CHANGE_PASSWORD,
    d: "M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33",
  },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar Navigation - 25% width on left */}
          <aside className="lg:w-[25%] flex-shrink-0">
            <nav className="space-y-1">
              {TapNavData.map((val, i) => (
                <Link
                  key={i}
                  to={val.link}
                  data-cy={val.dataAttr}
                  className={`${
                    location?.pathname === val.link
                      ? "selected-sidebar-nav"
                      : "sidebar-nav"
                  }`}
                  aria-current="page"
                >
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
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
                  <span className="truncate ml-2">{t(val.text)}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content Area - 75% width on right */}
          <main className="lg:w-[75%]">
            {params?.subURL === "update-profile" && <UpdateProfile />}
            {params?.subURL === "change-password" && <ChangePassword />}
          </main>
          
        </div>
      </div>
    </div>
  );
}
