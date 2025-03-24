import { Fragment, useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

export default function Notification(props: any) {
  const [show, setShow] = useState(true);
  const { t } = useTranslation();
  useEffect(() => {
    setTimeout(() => {
      setShow(false);
      props.cancelFunction();
    }, 5000);
  }, [props]);
  return (
    <>
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end px-4 py-16 sm:items-start z-50"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <p className="h-10 w-10 rounded-full bg-indigo-600 text-white flex justify-center items-center">
                      {props.imgToShow}
                    </p>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {props.heading}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {props.subheading}
                    </p>
                    <div className="mt-4 flex">
                      <button
                        onClick={() => {
                          setShow(false);
                          props.primaryButtonFunction();
                        }}
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                      >
                        {props.primaryButtonText}
                      </button>
                      <button
                        onClick={() => props.secondaryButtonFunction()}
                        type="button"
                        className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none "
                      >
                        {props.secondaryButtonText}
                      </button>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => {
                        setShow(false);
                        props.cancelFunction();
                      }}
                    >
                      <span className="sr-only">{t("Close")}</span>
                      <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}
