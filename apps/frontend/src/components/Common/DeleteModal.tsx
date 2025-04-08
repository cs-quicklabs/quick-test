import { Fragment, useRef } from "react";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import CancelButton from "../Button/cancelButton";
import DeleteButton from "../Button/deleteButton";
import { useTranslation } from "react-i18next";

export default function DeleteConfirmationModal(props: any) {
  const cancelButtonRef = useRef(null);
  const { t } = useTranslation();

  return (
    <Transition show={props.open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        open={props.open}
        onClose={() => props.toggleModal(false)}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon
                    className="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{props?.msg}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-4">
                <DeleteButton
                  data-cy="delete-button"
                  type="button"
                  onClick={() => props.delete()}
                >
                  {props.title === t("Confirm") ? t("Confirm") : t("Delete")}
                </DeleteButton>
                <CancelButton
                  type="button"
                  onClick={() => props.toggleModal(false)}
                  innerref={cancelButtonRef}
                  className="inline-flex items-center rounded-sm border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:outline-hidden"
                >
                  {t("Cancel")}
                </CancelButton>
              </div>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
