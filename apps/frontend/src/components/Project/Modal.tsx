import { Fragment, useRef, useState } from "react";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import Button from "../Button/index";
import CancelButton from "../Button/cancelButton";
import { Trans, useTranslation } from "react-i18next";

export default function Modal(props: any) {
  const { t } = useTranslation();
  const selectInputRef = useRef(null);
  const [numberOfDays, setNumberOfDays] = useState(props.defaultVal);

  const handleChange = (e: any) => {
    props.setSearchParams({ [e.target.name]: e.target.value });
    setNumberOfDays(e.target.value);
  };

  const submitFilter = () => {
    props.setNumberOfDays(numberOfDays);
    props.toggleModal(false);
  };

  const daysSelectionOption = [
    { key: "7 Days", value: 7 },
    { key: "14 Days", value: 14 },
    { key: "30 Days", value: 30 },
    { key: "60 Days", value: 60 },
    { key: "90 Days", value: 90 },
  ];

  return (
    <Transition show={props.open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={selectInputRef}
        open={props.open}
        onClose={props.toggleModal}
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
            <div
              className={`inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${
                props.open || "hidden"
              }`}
            >
              <div className="flex justify-between  items-center font-semibold text-gray-500  ">
                <h1 className="text-gray-900 text-lg font-medium">
                  {t("Select Time Frame")}
                </h1>
              </div>
              <p className=" text-gray-900 text-sm">
                {t("Select a different time frame for the chart")}.
              </p>
              <div className=" py-2 flex flex-col space-y-2 text-sm ">
                <div className="flex flex-col justify-start">
                  <select
                    ref={selectInputRef}
                    onChange={handleChange}
                    className="relative w-full text-gray-600  bg-white border border-gray-300 rounded-md shadow-xs pl-3 pr-10 py-2 text-left cursor-default focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    defaultValue={props.defaultVal}
                    name="days"
                  >
                    {daysSelectionOption.map((days: any) => {
                      return (
                        <option
                          key={days.value}
                          value={days.value}
                          className="text-sm rounded-xl text-gray-600"
                        >
                          <Trans>{days.key}</Trans>
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-4">
                <Button onClick={() => submitFilter()}>{t("Confirm")}</Button>
                <CancelButton onClick={() => props.toggleModal(false)}>
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
