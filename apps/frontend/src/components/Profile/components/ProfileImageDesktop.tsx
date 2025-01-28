import { useState } from "react";
import { useTranslation } from "react-i18next";
import ScaleLoader from "react-spinners/ScaleLoader";

const ProfileImage = ({
  profileImage,
  handleImageUpload,
  showProgressBar,
}: any) => {
  const { t } = useTranslation(["common"]);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      <div>
        <p className="hidden text-sm font-medium text-gray-900 lg:block">
          {t("Photo")}
        </p>
        <div
          className="hidden w-40 h-40 relative rounded-full overflow-hidden lg:block"
          data-cy="profile-picture"
        >
          {!imageLoaded ? (
            <span className="flex items-center justify-center absolute inset-0">
              <ScaleLoader
                color="#130A88"
                loading={true}
                width={3}
                radius={3}
                margin={2}
                height={20}
              />
            </span>
          ) : null}
          <img
            className={`h-full w-full ${!imageLoaded ? "opacity-0" : "opacity-100"}`}
            src={profileImage}
            alt="Profile Pic"
            height={160}
            width={160}
            title="Profile Picture Change"
            loading="eager"
            onLoad={() => setImageLoaded(true)}
          />
          <label
            htmlFor="desktop-user-photo"
            className={`absolute inset-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center text-sm font-medium text-white opacity-0 hover:opacity-100 ${showProgressBar ? "bg-white opacity-95" : null
              }`}
          >
            {showProgressBar ? (
              <ScaleLoader
                color="#130A88"
                loading={true}
                width={3}
                radius={3}
                margin={2}
                height={20}
              />
            ) : (
              <>
                <span>{t("Change")}</span>
                <span className="sr-only"> {t("user photo")}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  id="desktop-user-photo"
                  onChange={handleImageUpload}
                  name="user-photo"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-gray-300 rounded-md"
                />
              </>
            )}
          </label>
        </div>
      </div>
    </>
  );
};

export default ProfileImage;
