import { useTranslation } from "react-i18next";
import ScaleLoader from "react-spinners/ScaleLoader";

const ProfileImageMobile = ({
  profileImage,
  handleImageUpload,
  showProgressBar,
}: any) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grow lg:mt-0 lg:ml-6 lg:grow-0 lg:shrink-0">
        <p className="text-sm font-medium text-gray-700" aria-hidden="true">
          {t("Photo")}
        </p>
        <div className="mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="shrink-0 relative inline-block rounded-full overflow-hidden h-12 w-12"
                aria-hidden="true"
              >
                <img
                  className="rounded-full h-full w-full"
                  src={profileImage}
                  alt="Profile Pic"
                  height={48}
                  width={48}
                  title={t("Profile Picture Change")}
                  loading="eager"
                />
              </div>
              <div className="ml-5 rounded-md shadow-xs">
                <label
                  htmlFor="mobile-user-photo"
                  className="border-gray-300 relative text-gray-700 bg-white hover:bg-gray-50 mt-1 py-1.5 px-2.5 text-xs inline-flex items-center border border-transparent rounded-md shadow-xs  font-medium focus:outline-hidden cursor-pointer"
                >
                  {t("Change")}
                  <input
                    id="mobile-user-photo"
                    name="user-photo"
                    onChange={handleImageUpload}
                    type="file"
                    className="text-xs absolute w-full opacity-0 inset-0 border-gray-300 rounded-md"
                  />
                </label>
              </div>
            </div>
            {showProgressBar ? (
              <div className="space-x-3 flex items-center">
                <span className="text-xs font-medium text-gray-500">
                  {t("Uploading")}
                </span>{" "}
                <ScaleLoader
                  color="#4f46e5"
                  loading={true}
                  width={2}
                  radius={2}
                  margin={2}
                  height={10}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileImageMobile;
