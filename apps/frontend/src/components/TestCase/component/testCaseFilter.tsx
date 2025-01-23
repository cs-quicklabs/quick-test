import React, { useState, useEffect } from "react";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { Trans, useTranslation } from "react-i18next";

const FilterComponent = React.memo(({
  option,
  row,
  filterState,
  setFilterState,
  memberList,
  hideInnerOpen,
  setInnerOpen,
  updatedCustomDate,
  createdCustomDate,
  setUpdatedCustomDate,
  setCreatedCustomDate,
}: any) => {
  const { t } = useTranslation(["common"]);
  const [filterMenu, setFilterMenu] = useState(false);
  const [isCustomCreated, setIsCustomCreated] = useState(false);
  const [isCustomUpdated, setIsCustomUpdated] = useState(false);
  useEffect(() => {
    if (hideInnerOpen === true) {
      setFilterMenu(false);
      setInnerOpen(false);
    }
  }, [hideInnerOpen, setInnerOpen]);
  const timePeriod = [
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 14 days",
    "Last 30 days",
    "Last 60 days",
    "Custom",
  ];
  const priority = ["Critical", "High", "Medium", "Low"];
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "created_on" && value === "Custom") {
      setIsCustomCreated(true);
      setCreatedCustomDate({ to: "", from: "" });
      return;
    } else if (name === "created_on_to" || name === "created_on_from") {
      setIsCustomCreated(true);
      if (name === "created_on_from") {
        setCreatedCustomDate({ ...createdCustomDate, from: value });
        return;
      }
      if (name === "created_on_to") {
        setCreatedCustomDate({ ...createdCustomDate, to: value });
        return;
      }
    } else {
      setIsCustomCreated(false);
    }

    if (name === "updated_on" && value === "Custom") {
      setIsCustomUpdated(true);
      setUpdatedCustomDate({ to: "", from: "" });
      return;
    } else if (name === "updated_on_to" || name === "updated_on_from") {
      setIsCustomUpdated(true);
      if (name === "updated_on_from") {
        setUpdatedCustomDate({ ...updatedCustomDate, from: value });
        return;
      }
      if (name === "updated_on_to") {
        setUpdatedCustomDate({ ...updatedCustomDate, to: value });
        return;
      }
    } else {
      setIsCustomUpdated(false);
    }

    const values = Array.from(
      e.target.selectedOptions,
      (option: any) => option?.value
    );
    setFilterState({ ...filterState, [name]: values });
  };

  const renderDisabled = () => {
    let enabled = "";
    Object.keys(filterState).forEach((key) => {
      if (!Array.isArray(filterState[key])) {
        enabled = key;
      } else if (filterState[key].length > 0) {
        enabled = key;
      }
    });
    return enabled;
  };
  return (
    <>
      <div
        onClick={() => {
          if (renderDisabled() !== option.value && renderDisabled() !== "") {
            return;
          }

          setFilterMenu(!filterMenu);
        }}
        className="flex flex-row items-center"
      >
        <div
          className={`px-2 py-1 hover:underline ${renderDisabled() !== option.value && renderDisabled() !== ""
            ? "cursor-not-allowed bg-indigo-600/50 hover:bg-indigo-600/50 text-gray-300"
            : ""
            }`}
          key={option.value}
        >
          {option.label}
        </div>
        <div>
          {filterMenu ? (
            <ChevronDownIcon className="text-gray-600 h-5 w-4 cursor-pointer" />
          ) : (
            <ChevronRightIcon className="text-gray-600 h-5 w-4 cursor-pointer" />
          )}
        </div>
      </div>
      {filterMenu && (
        <div className="px-2 py-1">
          {option.value === "created_by" && (
            <select
              className="text-sm py-1 px-1 min-w-full"
              name="created_by"
              onChange={handleChange}
              value={filterState.created_by}
              disabled={
                renderDisabled() !== "created_by" && renderDisabled() !== ""
              }
              multiple
            >
              {memberList.createdBy.map((creator: any, index: number) => {
                const fullName = creator.firstName + " " + creator.lastName;
                return (
                  <option key={index} value={fullName}>
                    {fullName}
                  </option>
                );
              })}
            </select>
          )}
          {option.value === "updated_by" && (
            <select
              className="text-sm py-1 px-1 min-w-full"
              name="updated_by"
              onChange={handleChange}
              value={filterState.updated_by}
              disabled={
                renderDisabled() !== "updated_by" && renderDisabled() !== ""
              }
              multiple
            >
              {memberList.updatedBy.map((name: any, index: number) => {
                const fullName = name.firstName + " " + name.lastName;
                return (
                  <option key={index} value={fullName}>
                    {fullName}
                  </option>
                );
              })}
            </select>
          )}
          {option.value === "sections" && (
            <select
              className="text-sm py-1 px-1 min-w-full"
              name="sections"
              onChange={handleChange}
              value={filterState.sections}
              disabled={
                renderDisabled() !== "sections" && renderDisabled() !== ""
              }
              multiple
            >
              {row.map((section: any, index: number) => {
                return (
                  <option key={index} value={section.name}>
                    <Trans>{section.name}</Trans>
                  </option>
                );
              })}
            </select>
          )}
          {option.value === "priority" && (
            <select
              className={`text-sm py-1 px-1 min-w-full`}
              name={option.value}
              onChange={handleChange}
              value={filterState.priority}
              disabled={
                renderDisabled() !== "priority" && renderDisabled() !== ""
              }
              multiple
            >
              {priority.map((type, index) => {
                return (
                  <option key={index} value={type}>
                    <Trans>{type}</Trans>
                  </option>
                );
              })}
            </select>
          )}
          {option.value === "created_on" && (
            <select
              className="text-sm py-1 px-1 min-w-full"
              name={option.value}
              value={isCustomCreated ? "Custom" : filterState.created_on[0]}
              disabled={
                renderDisabled() !== "created_on" && renderDisabled() !== ""
              }
              onChange={handleChange}
            >
              {timePeriod.map((period, index) => {
                return (
                  <option key={index} value={period}>
                    <Trans>{period}</Trans>
                  </option>
                );
              })}
            </select>
          )}
          {isCustomCreated && (
            <div>
              <label htmlFor="Custom">{t("From:")}</label>
              <input
                className="text-sm py-1 px-1 min-w-full"
                type="date"
                name="created_on_from"
                value={filterState.created_on?.from}
                onChange={handleChange}
                required
              />
              <label htmlFor="Custom">{t("To:")}</label>
              <input
                className="text-sm py-1 px-1 min-w-full"
                type="date"
                name="created_on_to"
                value={filterState.created_on?.to}
                onChange={handleChange}
                required
              />
            </div>
          )}
          {option.value === "updated_on" && (
            <select
              className="text-sm py-1 px-1 min-w-full"
              name={option.value}
              value={isCustomUpdated ? "Custom" : filterState.updated_on[0]}
              disabled={
                renderDisabled() !== "updated_on" && renderDisabled() !== ""
              }
              onChange={handleChange}
            >
              {timePeriod.map((period, index) => {
                return (
                  <option key={index} value={period}>
                    <Trans>{period}</Trans>
                  </option>
                );
              })}
            </select>
          )}
          {isCustomUpdated && (
            <div>
              <label htmlFor="Custom">{t("From:")}</label>
              <input
                className="text-sm py-1 px-1 min-w-full"
                type="date"
                name="updated_on_from"
                value={filterState.updated_on?.from}
                onChange={handleChange}
                required
              />
              <label htmlFor="Custom">{t("To:")}</label>
              <input
                className="text-sm py-1 px-1 min-w-full"
                type="date"
                name="updated_on_to"
                value={filterState.updated_on?.to}
                onChange={handleChange}
                required
              />
            </div>
          )}
        </div>
      )}
    </>
  );
});
export default FilterComponent;
