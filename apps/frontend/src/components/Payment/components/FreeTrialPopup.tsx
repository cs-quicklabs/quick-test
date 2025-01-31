import { useState } from "react";
import { Fragment, useRef } from "react";
import { Dialog, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { Currency, freeTrial } from "../../Utils/constants/misc";
import { useTranslation } from "react-i18next";
import Button from "../../Button";

export default function FreeTrialPopup({
  apiLoading,
  daysLeft,
  paymentDuration,
  amount,
  currency,
}: any) {
  const { t } = useTranslation(["common"]);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const cancelButtonRef = useRef(null);

  const redirectToPayment = () => {
    setOpen(false);
    navigate(`/settings/payments`);
  };

  const redirectToDashboard = () => {
    setOpen(false);
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
        ref={cancelButtonRef}
      >
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

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex  items-center justify-center min-h-full p-4 text-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                data-cy="free-trial-popup"
                className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6"
              >
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <CheckIcon className="text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <DialogTitle
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      {t("Free Trial Period")}
                    </DialogTitle>
                    <div className="mt-2 text-sm text-gray-700">
                      <span>
                        {t("Welcome to Quick Test, there is a")}{" "}
                        {freeTrial.TRIAL_DAYS}{" "}
                      </span>
                      <span>
                        {t(" days free trial period for you. You have")}{" "}
                        {daysLeft}{" "}
                      </span>
                      {daysLeft === 1 ? (
                        <span>
                          {t(
                            "day left. Please pay further to continue our services."
                          )}
                        </span>
                      ) : (
                        <span>
                          {t(
                            "days left. Please pay further to continue our services."
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <Button
                    data-cy="free-trial-subscribe-btn"
                    type="button"
                    className="w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    onClick={redirectToPayment}
                    loading={apiLoading}
                  >
                    {t("Subscribe for")} {currency === Currency.USD && "$"}
                    {amount}/{paymentDuration}
                  </Button>
                  <button
                    type="button"
                    data-cy="cancel-trial-popup"
                    className="mt-3 capitalize w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={redirectToDashboard}
                    ref={cancelButtonRef}
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
