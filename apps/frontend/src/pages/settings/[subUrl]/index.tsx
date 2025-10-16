import { useNavigate, useLocation, useParams } from "react-router-dom";
import MemberList from "../../../components/Users/memberList";
import {
  appRoutes,
  settingsRoutes,
} from "../../../components/Utils/constants/page-routes";
import Integration from "../../../components/Integrations";
import { useTranslation } from "react-i18next";
import StripeCheckout from "../../../components/Payment/StripeCheckout";
import BillingAddress from "../../../components/Settings/Billing/BillingAddress";
import { useContext, useMemo } from "react";
import { AppContext } from "../../../components/Context/mainContext";
import { RoleId } from "../../../components/Utils/constants/roles-permission";

const TapNavData = [
  {
    text: "Users",
    link: `${appRoutes.SETTINGS}/${settingsRoutes.USERS}`,
    d: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    text: "Integrations",
    link: `${appRoutes.SETTINGS}/${settingsRoutes.INTEGRATIONS}`,
    d: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
  },
  {
    text: "Payments",
    link: `${appRoutes.SETTINGS}/${settingsRoutes.PAYMENTS}`,
    d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    text: "Billing Address",
    link: `${appRoutes.SETTINGS}/${settingsRoutes.BILLING}`,
    d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

const Members = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { state } = useContext(AppContext);

  const newTapNavData = useMemo(() => {
    if (state?.userDetails?.roleId === RoleId.OWNER) return TapNavData;
    return TapNavData.filter((val) => val.text !== "Billing Address");
  }, [state]);

  return (
    <>
      <meta
        name="description"
        content="This are the settings of Quick Test, here you can add, edit single/multiple users also Jira integrations are done here only."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Users, Edit Users, Integration Jira, Settings, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/users/edit/:id`}
      />

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Sidebar Navigation - 25% width on left */}
            <aside className="lg:w-[25%] flex-shrink-0">
              <nav className="space-y-1">
                {newTapNavData.map((val, i) => {
                  return (
                    <button
                      key={i}
                      onClick={() => navigate(val.link)}
                      className={`${
                        location?.pathname === val.link
                          ? "selected-sidebar-nav"
                          : "sidebar-nav"
                      } w-full`}
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
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Right Side Container - 75% width */}
            <div className="lg:w-[75%] flex flex-col lg:flex-row gap-6">
              
              {/* Middle Section - 45% of total screen (60% of this container) */}
              <main className="lg:w-[90%]">
                {params?.subURL === settingsRoutes.USERS && <MemberList />}
                {params?.subURL === settingsRoutes.INTEGRATIONS && <Integration />}
                {params?.subURL === settingsRoutes.PAYMENTS && <StripeCheckout />}
                {params?.subURL === settingsRoutes.BILLING &&
                  state?.userDetails?.roleId === RoleId.OWNER && <BillingAddress />}
              </main>

            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default Members;
