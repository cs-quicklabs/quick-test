import { Fragment } from "react";

import { Menu, Transition, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

interface IMenuButton {
  statusData: any;
  setStatusData: (val: any) => void;
  setOpenPopUp: (val: boolean) => void;
  value: any;
  index?: number;
  RowData?: any;
  setDefectStatus: (val: any) => void;
}

const DropDownMenuButton = ({
  statusData,
  setStatusData,
  setOpenPopUp,
  value,
  index,
  RowData,
  setDefectStatus,
}: IMenuButton) => {
  const { t } = useTranslation(["common"]);
  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <>
      <Menu
        as="div"
        data-cy={Number.isFinite(index) ? "three-dots-menu-" + index : null}
        className="relative flex justify-end items-center"
      >
        {({ open }) => (
          <>
            <MenuButton
              className={`w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full hover:text-gray-500 focus:outline-none ${open && "ring-2 ring-offset-2 ring-purple-500"
                }`}
            >
              <span className="sr-only">{t("Open options")}</span>
              <EllipsisVerticalIcon className="w-5 h-5" aria-hidden="true" />
            </MenuButton>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems
                static
                style={
                  (RowData?.length - 1 === index ||
                    RowData?.length - 2 === index) &&
                    RowData?.length !== 1
                    ? {
                      transform: "translate(-15%,-90%)",
                    }
                    : {}
                }
                className="mx-3 cursor-pointer origin-top-right absolute right-0 top-8 w-48 mt-1 rounded-md shadow-lg z-10 bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none"
              >
                <div className="py-1">
                  <MenuItem>
                    {({ focus }) => (
                      <span
                        onClick={() => {
                          setStatusData({
                            ...statusData,
                            status: "FAILED",
                            id: value.id,
                          });
                          setOpenPopUp(true);
                          setDefectStatus(value.defect);
                        }}
                        className={classNames(
                          focus
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "group flex items-center px-4 py-2 text-xs"
                        )}
                      >
                        {t("Failed")}
                      </span>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <span
                        onClick={() => {
                          setStatusData({
                            ...statusData,
                            status: "PASSED",
                            id: value.id,
                          });
                          setOpenPopUp(true);
                          setDefectStatus(value.defect);
                        }}
                        className={classNames(
                          focus
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "group flex items-center px-4 py-2 text-xs"
                        )}
                      >
                        {t("Passed")}
                      </span>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <span
                        onClick={() => {
                          setStatusData({
                            ...statusData,
                            status: "UNTESTED",
                            id: value.id,
                          });
                          setOpenPopUp(true);
                          setDefectStatus(value.defect);
                        }}
                        className={classNames(
                          focus
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "group flex items-center px-4 py-2 text-xs"
                        )}
                      >
                        {t("Untested")}
                      </span>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <span
                        onClick={() => {
                          setStatusData({
                            ...statusData,
                            status: "BLOCKED",
                            id: value.id,
                          });
                          setOpenPopUp(true);
                          setDefectStatus(value.defect);
                        }}
                        className={classNames(
                          focus
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "group flex items-center px-4 py-2 text-xs"
                        )}
                      >
                        {t("Blocked")}
                      </span>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Transition>
          </>
        )}
      </Menu>
    </>
  );
};

export default DropDownMenuButton;
