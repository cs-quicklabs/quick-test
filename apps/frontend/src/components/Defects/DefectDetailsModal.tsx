import { useCallback, useEffect, useState } from "react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import Loader from "../Loader/Loader";
import axiosService from "../Utils/axios";
import { showError } from "../Toaster/ToasterFun";
import { IssueType } from "../Utils/constants/misc";
import { useTranslation } from "react-i18next";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function DefectDetailsModal({ pluginKey }: any) {
  const { t } = useTranslation(["common"]);
  const [apiLoading, setApiLoading] = useState(true);
  const [defectData, setDefectData] = useState<any>({});
  const [showPopup, setShowPopup] = useState(false);

  const fetchDefectDetails = useCallback(async () => {
    setApiLoading(true);
    try {
      const response = await axiosService.get(`/defects/${pluginKey}`);
      setDefectData(response.data.data);
    } catch (error) {
      // showError(error.response.data.message);
    } finally {
      setApiLoading(false);
    }
  }, [pluginKey]);

  useEffect(() => {
    fetchDefectDetails();
    return () => {
      setDefectData({});
      setShowPopup(false);
    };
  }, [fetchDefectDetails]);

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <PopoverButton
            as="button"
            onMouseDown={() => {
              setShowPopup(() => {
                if (typeof defectData.summary !== "undefined") return true;
                showError(t("Reference was not found"));
                return false;
              });
            }}
            className={classNames(
              open ? "text-gray-900" : "text-gray-500",
              "inline-flex items-center"
            )}
          >
            <span className="text-sm text-gray-500 cursor-pointer">
              {pluginKey}
            </span>
            <ChevronDownIcon
              className={classNames(
                open ? "text-gray-600" : "text-gray-400",
                "ml-2 h-5 w-5 group-hover:text-gray-500"
              )}
              aria-hidden="true"
            />
          </PopoverButton>

          {showPopup && (
            <Transition
              as="div"
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <PopoverPanel
                static
                className="absolute z-10 md:inset-auto md:right-1/4 lg:right-1/3 transform sm:mt-3 md:px-2 w-screen max-w-xs sm:max-w-md sm:px-0"
              >
                <div className="bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 min-h-48 overflow-hidden flex flex-col">
                  {apiLoading ? (
                    <div className="flex flex-grow justify-center items-center">
                      <Loader />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-gray-50 p-4 ">
                        <div className="flex space-x-4 items-center">
                          <span className="inline-flex flex-shrink-0 items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
                            {defectData.issueKey}
                          </span>
                          <div className="inline text-sm leading-6 font-medium text-gray-900">
                            {defectData?.summary}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 p-4 pt-0">
                        <div>
                          <span className="block text-sm font-medium text-gray-700">
                            {t("Issue Type")}
                          </span>
                          <span className="block text-sm text-gray-500">
                            {defectData?.issueType.name}
                          </span>
                        </div>
                        {defectData?.issueType.name === IssueType.SUBTASK &&
                          defectData?.parent ? (
                          <div>
                            <span className="block text-sm font-medium text-gray-700">
                              {t("Parent")}
                            </span>
                            <a
                              href={defectData?.parent.self}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-sm text-indigo-500 hover:text-indigo-700 hover:underline"
                            >
                              {defectData?.parent?.key}
                            </a>
                          </div>
                        ) : null}
                        <div>
                          <span className="block text-sm font-medium text-gray-700">
                            {t("Project")}
                          </span>
                          <span className="block text-sm text-gray-500">
                            {defectData?.project.name}
                          </span>
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-gray-700">
                            {t("Priority")}
                          </span>
                          <span className="block text-sm text-gray-500">
                            {defectData?.priority.name}
                          </span>
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-gray-700">
                            {t("Assignee")}
                          </span>
                          <span className="block text-sm text-gray-500">
                            {defectData?.assignee?.displayName || t("None")}
                          </span>
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-gray-700">
                            {t("Sprint")}
                          </span>
                          {defectData?.sprint &&
                            defectData?.sprint?.length !== 0 ? (
                            <span className="block text-sm text-gray-500">
                              {defectData?.sprint?.map(
                                (item: any) => item.name
                              )}
                            </span>
                          ) : (
                            <span className="block text-sm text-gray-500">
                              {t("None")}
                            </span>
                          )}
                        </div>
                        <div className="col-span-2">
                          <span className="block text-sm font-medium text-gray-700">
                            {t("Description")}
                          </span>
                          {defectData?.description ? (
                            <p className="block text-xs text-gray-500">
                              {defectData?.description}
                            </p>
                          ) : (
                            <p className="block text-sm text-gray-500">
                              {t("None")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </PopoverPanel>
            </Transition>
          )}
        </>
      )}
    </Popover>
  );
}
