import { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

export default function Example(toastDetails: any) {
  const { t } = useTranslation();
  const [show, setShow] = useState(true);

  return (
    <>
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
        <div className="flex items-center">
          <div className="w-0 flex-1 flex justify-between">
            <p className="w-0 flex-1 text-sm font-medium text-white">
              {toastDetails?.message}
            </p>
          </div>
          <div className="ml-4 shrink-0 flex">
            <button
              className="bg-transparent rounded-md inline-flex text-gray-200 hover:text-white focus:outline-hidden"
              onClick={() => {
                setShow(false);
              }}
            >
              <span className="sr-only">{t("Close")}</span>
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Transition>
    </>
  );
}
