import { Fragment } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import Button from "../Button";
import { useTranslation } from "react-i18next";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const ReferenceMenu = ({
  setShowAddReferencePopup,
  setShowMapReferencePopup,
}: any) => {
  const { t } = useTranslation(["common"]);

  return (
    <Menu as="span" className="relative block">
      <MenuButton as="div">
        <span className="sr-only">Open options</span>
        <Button data-cy="defect-btn" className="sm:order-1 ">
          {t("Defects")}
        </Button>
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="origin-top-right absolute right-0 mt-2 -ml-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <MenuItem>
              {({ focus }) => (
                <span
                  data-cy="add-reference-btn"
                  onClick={() => setShowAddReferencePopup(true)}
                  className={classNames(
                    focus
                      ? "bg-gray-100 text-gray-900 cursor-pointer"
                      : "text-gray-700",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  {t("Add Reference")}
                </span>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <span
                  data-cy="map-reference-btn"
                  onClick={() => setShowMapReferencePopup(true)}
                  className={classNames(
                    focus
                      ? "bg-gray-100 text-gray-900 cursor-pointer"
                      : "text-gray-700",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  {t("Map Reference")}
                </span>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
};

export default ReferenceMenu;
