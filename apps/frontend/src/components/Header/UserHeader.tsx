import { useState, useEffect, useContext, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import SearchBox from "../Search/SearchBox";
import {
  appRoutes,
  archivedRoutes,
  settingsRoutes,
} from "../Utils/constants/page-routes";
import { AppContext } from "../Context/mainContext";
import DefaultProfileIcon from "../../assets/images/profile.png";
import { useTranslation } from "react-i18next";
import bugplotLogo from "../../assets/images/bugplot-logo.svg";
import AccessControl from "../AccessControl";
import { ArchivePermissions } from "../Utils/constants/roles-permission";

export default function UserHeader() {
  const { t } = useTranslation(["common"]);
  const [showUserSetting, setShowUserSetting] = useState(false);
  const location = useLocation();
  const [selectedButton, setSelectedButton] = useState(location.pathname === '/dashboard' ? 'Dashboard' : 'Projects');
  const [imageURL, setImageURL] = useState<string>("");
  const { state, dispatch } = useContext(AppContext);

  const handleButtonClick = (button: any) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedButton(button);
  };

  const getProfileData = useCallback(() => {
    try {
      const response = state.userDetails;
      setImageURL(response.profileImage);
    } catch (error) {
      // console.log("Failed fetching profile picture")
    }
  }, [state.userDetails]);

  const toggleSetting = () => {
    setShowUserSetting(!showUserSetting);
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    dispatch({ type: "UPDATE_LOGIN_STATE", data: false });
  };

  const handleClick = (e: any) => {
    if (e.target?.id !== "OpenProfile") setShowUserSetting(false);
  };

  useEffect(() => {
    if (state.profilePicUpdated === true) {
      getProfileData();
    }
  }, [state.profilePicUpdated, getProfileData]);

  useEffect(() => {
    document.body.addEventListener("click", handleClick);
    getProfileData();
    return () => {
      document.body.removeEventListener("click", handleClick);
    };
  }, [getProfileData]);

  return (
    <>
      <nav className="bg-gray-800 sticky top-0 z-10">
        <div className="px-8">
          <div className="relative flex items-center justify-between h-12 2xl:mx-44">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">{t("Open main menu")}</span>
                <svg
                  className="hidden h-6 w-6"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 flex items-center justify-between sm:items-stretch sm:justify-start">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="block lg:hidden h-6 w-auto"
                  src={bugplotLogo}
                  alt="QuickTest"
                  height={24}
                  width={24}
                  title="Quick Test"
                  loading="eager"
                />
                <img
                  className="hidden lg:block h-6 w-auto"
                  src={bugplotLogo}
                  alt="Quick Test"
                  height={24}
                  width={24}
                  title="Quick Test"
                  loading="eager"
                />
                <Link to={`${appRoutes.DASHBOARD}`}>
                  <span
                    data-cy="bugplot-label"
                    className="text-white font-extrabold font-mono text-base px-3 hidden lg:block tracking-wider"
                  >
                    {t("QUICK TEST")}
                  </span>
                  <span className="text-white font-medium px-3 block lg:hidden">
                    {""}
                  </span>
                </Link>
              </div>
              <div className="block sm:ml-6">
                <div className="flex space-x-4 mr-4 sm:mr-0">
                  <Link
                    to={`${appRoutes.DASHBOARD}`}
                    className={`rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white ${selectedButton === "Dashboard"
                      ? "bg-gray-900 text-white"
                      : "bg-transparent text-gray-300"
                      }`}
                    aria-current="page"
                    data-cy="dashboard"
                    onClick={() => handleButtonClick("Dashboard")}
                  >
                    {t("Dashboard")}
                  </Link>
                  <Link
                    to={`${appRoutes.PROJECTS}`}
                    className={`rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white ${selectedButton === "Projects"
                      ? "bg-gray-900 text-white"
                      : "bg-inherit text-gray-300"
                      }`}
                    aria-current="page"
                    data-cy="projects"
                    onClick={() => handleButtonClick("Projects")}
                  >
                    {t("Projects")}
                  </Link>
                </div>
              </div>
              <div className="m-auto hidden sm:mr-0 grow sm:grow-0 sm:block">
                <SearchBox inputFieldId={'search-for-desktop-id'} />
              </div>
            </div>
            <div className="inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto ml-2 lg:ml-4 sm:pr-0">
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="flex rounded-full bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">{t("Open user menu")}</span>
                    <img
                      width={32}
                      height={32}
                      id="OpenProfile"
                      data-cy="profile-menu"
                      alt="Profile Pic"
                      title="Open Profile"
                      loading="eager"
                      className="h-8 w-8 rounded-full"
                      src={imageURL || DefaultProfileIcon}
                      onClick={() => toggleSetting()}
                    />
                  </button>
                </div>

                {showUserSetting && (
                  <div
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-labelledby="user-menu"
                  >
                    <div className="px-3 py-3">
                      <p className="text-xs w-[210px] whitespace-nowrap overflow-hidden text-ellipsis">
                        {t(state?.userDetails?.email)}
                      </p>
                      <p className="text-xs text-gray-700">
                        {t(state?.userDetails?.organization)}
                      </p>
                    </div>
                    <div className="py-1" role="none">
                      <Link
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                        data-cy="settings"
                        to={`${appRoutes.SETTINGS}/${settingsRoutes.USERS}`}
                      >
                        {t("Account Settings")}
                      </Link>
                      <Link
                        onClick={toggleSetting}
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                        data-cy="profile"
                        to={`${appRoutes.PROFILE_UPDATE}`}
                      >
                        {t("My Profile")}
                      </Link>
                      <AccessControl
                        permission={
                          ArchivePermissions.LIST_ARCHIVE_PROJECT &&
                          ArchivePermissions.GET_ARCHIVED_USER
                        }
                      >
                        <Link
                          className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                          data-cy="archived"
                          to={`${appRoutes.ARCHIVED}/${archivedRoutes.PROJECTS}`}
                        >
                          {t("Archive")}
                        </Link>
                      </AccessControl>
                    </div>
                    <div className="py-1">
                      <Link
                        onClick={logout}
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50"
                        data-cy="sign-out"
                        to={`${appRoutes.SIGNIN_PAGE}`}
                      >
                        {t("Sign out")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="mx-8 sm:hidden sm:mr-0 flex grow mb-3 mt-2"
          id="mobile-menu"
        >
          <SearchBox inputFieldId={'search-for-mobile-id'} />
        </div>
      </nav>
    </>
  );
}
