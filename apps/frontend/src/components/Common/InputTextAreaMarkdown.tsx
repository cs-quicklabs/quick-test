import { FC, useState } from "react";

import { useFormikContext } from "formik";
import MoonLoader from "react-spinners/MoonLoader";
import TextareaAutosize from "react-textarea-autosize";

import axiosService from "../Utils/axios";
import { showError } from "../Toaster/ToasterFun";
import { ToastMessage } from "../Utils/constants/misc";

import PreviewMarkdown from "./PreviewMarkdown";

interface Iprops {
  error?: string;
  touched?: boolean | string;
  validation?: boolean;
  showPreview?: boolean;
  name: string;
  value?: string;
  manageHeight?: boolean;
}

type isImageValidType = (file: any) => [number, string];

const InputField: FC<Iprops> = ({ ...props }: Iprops) => {
  const {
    touched,
    error,
    validation,
    name,
    value,
    manageHeight,
    showPreview,
    ...rest
  } = {
    ...props,
  };
  const formik = useFormikContext();
  const { values, setFieldValue }: any = formik;

  const [loading, setLoading] = useState<boolean>(false);
  const [totalFiles, setTotalFiles] = useState<number>(1);
  const [fileOverElement, setFileOverElement] = useState<boolean>(false);

  const isImageValid: isImageValidType = (file) => {
    if (file?.type !== "image/jpeg" && file?.type !== "image/png") {
      return [0, ToastMessage.IMAGE_FILE_TYPE];
    }

    if (file?.size / (1024 * 1024) > 1) {
      return [0, ToastMessage.IMAGE_FILE_SIZE];
    }
    return [1, ""];
  };

  const onDrop = (e: any) => {
    const filesArray = e.dataTransfer.files;
    e.preventDefault();

    setTotalFiles(filesArray.length);
    let markdownSyntax = "";
    Array.from(filesArray).map(async (file: any) => {
      const [validImage, errorMessage] = isImageValid(file);

      if (!validImage) {
        showError(errorMessage);
        return;
      }

      const fileData = new FormData();
      fileData.append("file", file);
      try {
        setLoading(true);
        const fileName = file.name.split(".")[0];
        const response = await axiosService.post("/projects/image", fileData);
        const link = response.data.data;
        markdownSyntax += `![${fileName}](${link})\n`;
      } catch (error) {
        showError(error.response?.data?.message);
      }
      setFieldValue(name, values[name] + markdownSyntax);
      setTimeout(() => {
        setLoading(false);
        setTotalFiles(1);
      }, 2000);
    });
  };

  return (
    <>
      {showPreview ? (
        <div className="border px-3 py-2 rounded-md min-h-48 shadow-sm select-none border-gray-300">
          <PreviewMarkdown markdown={values[name]} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <TextareaAutosize
            id={name}
            value={value}
            disabled={loading}
            maxRows={4}
            name={name}
            className={`resize-y  w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none  focus:border-indigo-500 sm:text-sm 
            ${fileOverElement ? "ring-2 ring-indigo-500" : "ring-0"} 
            ${manageHeight ? "min-h-48" : "min-h-48"}
            ${(error && touched) || (validation && error)
                ? "border-red-300"
                : "border-gray-300"
              }`}
            {...rest}
            onDrop={(e) => {
              onDrop(e);
              setFileOverElement(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setFileOverElement(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setFileOverElement(false);
            }}
          />
          {loading ? (
            <div className="flex justify-between">
              <span className="text-xs font-medium tracking-wide text-gray-500">
                {`Uploading ${totalFiles} file(s) ...`}
              </span>
              <MoonLoader color="#4f46e5" loading size={13} />
            </div>
          ) : null}
        </div>
      )}
      {((error && touched) || (validation && error)) && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </>
  );
};

export default InputField;
