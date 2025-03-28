import { useEffect, useState } from "react";

import axios from "axios";
import MoonLoader from "react-spinners/MoonLoader";
import { PaperClipIcon } from "@heroicons/react/24/solid";
import { useFormikContext } from "formik";

import { showError, showSuccess } from "../../Toaster/ToasterFun";
import { useTranslation } from "react-i18next";

const UploadImage = ({ name }: any) => {
  const { t } = useTranslation();
  const [fileMeta, setFileMeta] = useState({ name: "", size: 0 });
  const [imageURL, setImageURL] = useState("");
  const [progress, setProgress] = useState(1);
  const [showProgressBar, setShowProgressBar] = useState(false);

  const formik = useFormikContext();
  const { setFieldValue } = formik;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    imageURL ? setFieldValue(name, imageURL) : null;
  }, [imageURL, name, setFieldValue]);

  type isImageValidType = (file: any) => [number, string];
  const isImageValid: isImageValidType = (file) => {
    if (file?.type !== "image/jpeg" && file?.type !== "image/png") {
      return [0, t("File type must be either jpg, jpeg or png")];
    }

    if (file?.size / (1024 * 1024) > 1) {
      return [0, t("File size shouldn't exceed 1MB")];
    }
    return [1, ""];
  };

  const handleImageUpload = async (event: any) => {
    const file = event.target.files[0];
    const accessToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const options = {
      headers: {
        Authorization: `${t("Bearer")} ${accessToken}`,
      },
      onUploadProgress: (progressEvent: any) => {
        const { loaded, total } = progressEvent;
        const percentCompleted = Math.round((loaded * 100) / total);
        setProgress(percentCompleted);

        if (percentCompleted === 100)
          setTimeout(() => setShowProgressBar(false), 3000);
      },
    };

    const [validImage, errorMessage] = isImageValid(file);
    if (validImage) {
      setFileMeta({
        name: file.name,
        size: file.size,
      });
      const fileData = new FormData();
      fileData.append("file", file);
      try {
        setShowProgressBar(true);
        const response = await axios.post(
          process.env.REACT_APP_API_URL + "/projects/image",
          fileData,
          options
        );
        setImageURL(response?.data?.data);
        showSuccess(response?.data?.message);
      } catch (error) {
        setShowProgressBar(false);
        showError(error);
      }
    } else showError(errorMessage);
  };

  return (
    <>
      <div className="flex space-x-2 items-center">
        <span className="text-sm font-medium text-gray-700">
          {t("Attach Image")}
        </span>
        <label className="cursor-pointer">
          <input
            accept="image/png, image/jpeg"
            className="hidden"
            name={name}
            type="file"
            onChange={handleImageUpload}
          />
          <PaperClipIcon className="w-4 h-4 text-indigo-600" />
        </label>
      </div>
      <div className="block text-xs text-gray-500 font-normal">
        ({t("Supported image types are")}{" "}
        <b>
          <em>.jpg</em>
        </b>{" "}
        <b>
          <em>.jpeg</em>
        </b>
        , {t("and")}{" "}
        <b>
          <em>.png</em>
        </b>
        )
      </div>
      <div
        className={`flex items-center justify-between text-xs text-gray-700 space-x-2 pt-4 ${fileMeta.name ? null : "opacity-0"
          }`}
      >
        <span>{fileMeta?.name || "filename"}</span>
        {showProgressBar ? (
          <div className="space-x-3 flex items-center">
            <span className="font-medium tracking-wider">{progress}%</span>{" "}
            <MoonLoader color="#4f46e5" loading size={13} />
          </div>
        ) : null}
      </div>
    </>
  );
};

export default UploadImage;
