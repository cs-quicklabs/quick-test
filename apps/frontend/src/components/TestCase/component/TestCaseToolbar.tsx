import React, { useState, useEffect, useCallback } from "react";
import {
  DocumentArrowDownIcon,
  PencilIcon,
  PrinterIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import dayjs from "dayjs";
import { Tooltip } from "react-tooltip";
import { CSVLink } from "react-csv";
import Button from "../../Button";
import CancelButton from "../../Button/cancelButton";
import { DateFormat } from "../../Utils/constants/date-format";

import FilterComponent from "./testCaseFilter";
import { Trans, useTranslation } from "react-i18next";
import { showError } from "../../Toaster/ToasterFun";

const TestCaseToolbar = ({
  Row,
  setRowData,
  setShowDragIcon,
  initialRowData,
  memberList,
  selectedData,
  csvData,
  ColorEnable,
  handlePrinterClick,
  HandleEditClick,
  HandleDeleteClick,
  projectName,
}: any) => {
  const { t } = useTranslation(["common"]);
  const initialSortValue = {
    label: t("Section"),
    key: "section",
  };
  // For csv file header
  const csvHeaders = [
    { label: t("ID"), key: "testcaseId" },
    { label: t("Section"), key: "SectionName" },
    { label: t("Title"), key: "title" },
    { label: t("Priority"), key: "executionPriority" },
    { label: t("Preconditions"), key: "preconditions" },
    { label: t("Steps"), key: "steps" },
    { label: t("Expected Result"), key: "expectedResults" },
    { label: t("Created On"), key: "createdAt" },
  ];

  const initialFilterState = {
    created_by: [],
    created_on: [],
    sections: [],
    updated_by: [],
    updated_on: [],
    priority: [],
  };

  const initialCustomDate = {
    to: "",
    from: "",
  };

  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortValue, setSortValue] = useState(initialSortValue);
  const [isSortAscending, setIsSortAscending] = useState(true);
  const [filterState, setFilterState] = useState<any>(initialFilterState);
  const [showFilters, setShowFilters] = useState(false);
  const [filterValue, setFilterValue] = useState("None");
  const [hideInnerOpen, setInnerOpen] = useState(false);
  const [createdCustomDate, setCreatedCustomDate] = useState(initialCustomDate);
  const [updatedCustomDate, setUpdatedCustomDate] = useState(initialCustomDate);

  useCallback(() => {
    setFilterState({ ...filterState, created_on: createdCustomDate });
  }, [createdCustomDate, filterState]);

  useCallback(() => {
    setFilterState({ ...filterState, updated_on: updatedCustomDate });
  }, [filterState, updatedCustomDate]);

  // For Compatibility
  const [filteredRowData, setFilteredRowData] = useState<any>([]);

  // Sort options
  const sortOptions = [
    { label: t("Created By"), key: "created_by" },
    { label: t("Created On"), key: "created_on" },
    { label: t("Title"), key: "title" },
    { label: t("Updated By"), key: "updated_by" },
    { label: t("Updated On"), key: "updated_on" },
    { label: t("Priority"), key: "priority" },
    { label: t("Reset to Sections"), key: "section" },
  ];

  // Filter options
  const filterOptions = [
    { label: t("Created By"), value: "created_by" },
    { label: t("Created On"), value: "created_on" },
    { label: t("Section"), value: "sections" },
    { label: t("Updated By"), value: "updated_by" },
    { label: t("Updated On"), value: "updated_on" },
    { label: t("Priority"), value: "priority" },
  ];

  const extractAllTestcases = (Rowdata: any): any => {
    const emptyArray = [];
    for (let i = 0; i < Rowdata.length; i++) {
      for (let j = 0; j < Rowdata[i].testcases.length; j++) {
        emptyArray.push(Rowdata[i].testcases[j]);
      }
    }
    return emptyArray;
  };

  const getPriorityTestcases = useCallback((priority: string, Rowdata: any) => {
    const emptyArray = extractAllTestcases(Rowdata);
    return emptyArray.filter(
      (item: any) => item.executionPriority === priority
    );
  }, []);

  const selectedSortValue = (option: any) => {
    setIsSortAscending(true);
    if (option.key === "section" && filteredRowData.length === 0) {
      setSortValue(initialSortValue);
      setShowDragIcon(true);
      return;
    } else if (option.key === "section" && filteredRowData.length !== 0) {
      setSortValue(initialSortValue);
      setShowDragIcon(true);
      return;
    }
    setSortValue(option);
    setShowDragIcon(false);
  };

  function compareName(a: any, b: any) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  const compareTitle = (a: any, b: any) =>
    a.title.localeCompare(b.title, "en", { numeric: true });

  const compareCreatedDate = (a: any, b: any) => {
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  };
  const compareUpdatedDate = (a: any, b: any) => {
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  };

  const removeEmptySections = (output: any) => {
    const newRowData = output.filter((item: any) => {
      if (item.testcases && item.testcases.length > 0) {
        return item;
      }
      return false;
    });

    return newRowData;
  };

  useEffect(() => {
    const updateRowData = (sortValue: any, Rowdata = initialRowData) => {
      if (Rowdata.length === 0) {
        return;
      }
      switch (sortValue.key) {
        case "created_on": {
          const emptyArray = extractAllTestcases(Rowdata);
          emptyArray.sort(compareCreatedDate);

          const createdOnTestcases = [
            {
              name: `Test Cases (${emptyArray.length})`,
              testcases: emptyArray,
            },
          ];

          const newRowData = removeEmptySections(createdOnTestcases);

          setRowData(newRowData);
          break;
        }
        case "updated_on": {
          const emptyArray = extractAllTestcases(Rowdata);
          emptyArray.sort(compareUpdatedDate);

          const updatedOnTestcases = [
            {
              name: `Test Cases (${emptyArray.length})`,
              testcases: emptyArray,
            },
          ];

          const newRowData = removeEmptySections(updatedOnTestcases);

          setRowData(newRowData);
          break;
        }
        case "created_by": {
          const allTestcases = extractAllTestcases(Rowdata);
          const createdByTestcases: { name: string; testcases: any }[] = [];

          memberList.createdBy.forEach((item: any) => {
            const { firstName, lastName, id } = item;
            const filteredTestcases = allTestcases.filter(
              (cases: any) => cases.createdBy?.id === id
            );
            createdByTestcases.push({
              name: `${firstName} ${lastName} (${filteredTestcases.length})`,
              testcases: filteredTestcases,
            });
          });

          const newRowData = removeEmptySections(createdByTestcases);

          newRowData.sort(compareName);
          setRowData(newRowData);
          break;
        }
        case "updated_by": {
          const allTestcases = extractAllTestcases(Rowdata);
          const updatedByTestcases: { name: string; testcases: any }[] = [];

          memberList.updatedBy?.forEach((item: any) => {
            const { firstName, lastName, id } = item;
            const filteredTestcases = allTestcases.filter(
              (cases: any) => cases.updatedBy?.id === id
            );
            updatedByTestcases.push({
              name: `${firstName} ${lastName} (${filteredTestcases.length})`,
              testcases: filteredTestcases,
            });
          });

          const newRowData = removeEmptySections(updatedByTestcases);

          newRowData.sort(compareName);
          setRowData(newRowData);
          break;
        }
        case "priority": {
          const lowTestcases = getPriorityTestcases("LOW", Rowdata);
          const mediumTestcases = getPriorityTestcases("MEDIUM", Rowdata);
          const highTestcases = getPriorityTestcases("HIGH", Rowdata);
          const criticalTestcases = getPriorityTestcases("CRITICAL", Rowdata);

          const allPriorities = [
            { name: `Low (${lowTestcases.length})`, testcases: lowTestcases },
            {
              name: `Medium (${mediumTestcases.length})`,
              testcases: mediumTestcases,
            },
            {
              name: `High (${highTestcases.length})`,
              testcases: highTestcases,
            },
            {
              name: `Critical (${criticalTestcases.length})`,
              testcases: criticalTestcases,
            },
          ];

          const newRowData = removeEmptySections(allPriorities);

          setRowData(newRowData);
          break;
        }
        case "title": {
          const emptyArray = extractAllTestcases(Rowdata);
          emptyArray.sort(compareTitle);

          const allTestcasesByTitle = [
            {
              name: `Test Cases (${emptyArray.length})`,
              testcases: emptyArray,
            },
          ];

          const newRowData = removeEmptySections(allTestcasesByTitle);

          setRowData(newRowData);
          break;
        }

        case "section": {
          setRowData(Rowdata);
          setShowDragIcon(true);
          break;
        }

        default:
          // console.log(sortValue.label);
          break;
      }
    };
    if (filteredRowData.length === 0 && filterValue === "None") {
      updateRowData(sortValue);
    } else {
      updateRowData(sortValue, filteredRowData);
    }
  }, [
    sortValue,
    filteredRowData,
    filterValue,
    initialRowData,
    setRowData,
    memberList.createdBy,
    memberList.updatedBy,
    getPriorityTestcases,
    setShowDragIcon,
  ]);

  const toggleSort = () => {
    if (["title", "created_on", "updated_on"].includes(sortValue.key)) {
      const reverseTestcases = [...Row[0].testcases];
      const newRowData = [{ ...Row[0], testcases: reverseTestcases.reverse() }];
      setRowData(newRowData);
    } else if (
      ["priority", "created_by", "updated_by"].includes(sortValue.key)
    ) {
      const reverseData = [...Row];
      const newRowData = reverseData.reverse();
      setRowData(newRowData);
    }
    setIsSortAscending((prevState) => !prevState);
  };
  const getFilterLabels = () => {
    const newArray = [];
    if (filterState.created_by.length !== 0) {
      newArray.push(t("Created By: ") + t(filterState.created_by.join(", ")));
    }
    if (filterState.sections.length !== 0) {
      newArray.push(t("Sections: ") + t(filterState.sections.join(", ")));
    }
    if (
      Array.isArray(filterState.created_on) &&
      filterState.created_on.length !== 0
    ) {
      newArray.push(t("Created On: ") + t(filterState.created_on.join(", ")));
    } else if (
      !Array.isArray(filterState.created_on) &&
      typeof filterState.created_on === "object" &&
      filterState.created_on?.to &&
      filterState.created_on?.from
    ) {
      newArray.push(`${t("Created On: ")}${dateConverter(filterState.created_on.from)}-${dateConverter(filterState.created_on.to)}`);
    }
    if (filterState.updated_by.length !== 0) {
      newArray.push(t("Updated By: ") + t(filterState.updated_by.join(", ")));
    }
    if (
      Array.isArray(filterState.updated_on) &&
      filterState.updated_on.length !== 0
    ) {
      newArray.push(t("Updated On: ") + t(filterState.updated_on.join(", ")));
    } else if (
      !Array.isArray(filterState.updated_on) &&
      typeof filterState.updated_on === "object" &&
      filterState.updated_on?.to &&
      filterState.updated_on?.from
    ) {
      newArray.push(`${t("Updated On: ")}${dateConverter(filterState.updated_on.from)}-${dateConverter(filterState.updated_on.to)}`);
    }
    if (filterState.priority.length !== 0) {
      newArray.push(t("Priority: ") + t(filterState.priority.join(", ")));
    }
    const selectedFilters = newArray.join(", ");
    if (selectedFilters.length !== 0) {
      setFilterValue(selectedFilters);
    }
  };

  const removeDuplicateTestcases = (filteredRow: any) => {
    const arr = filteredRow.flat();
    const output: any[] = [];
    arr.forEach(function (item: any) {
      const existing = output.filter(function (v: any) {
        return v.name === item.name;
      });
      if (existing.length) {
        const existingIndex = output.indexOf(existing[0]);
        output[existingIndex].testcases = output[
          existingIndex
        ].testcases.concat(item.testcases);
      } else {
        if (typeof item.testcases == "string")
          item.testcases = [item.testcases];
        output.push(item);
      }
    });
    return output;
  };

  const handleFilterSubmit = (e: any) => {
    e.preventDefault();
    let value = 0;
    Object.keys(filterState).forEach((key) => {
      if (
        filterState[key].length > 0 ||
        Object.keys(filterState[key]).length > 0
      ) {
        ++value;
      }
    });
    if (value === 0) {
      return;
    }
    const filteredRow = [];

    // section filter
    if (filterState.sections.length !== 0) {
      for (let i = 0; i < filterState.sections.length; i++) {
        filteredRow.push(
          initialRowData.filter(
            (item: any) => item.name === filterState.sections[i]
          )[0]
        );
      }
      setRowData(filteredRow);
      setFilteredRowData(filteredRow);
    }

    // priority filter
    else if (filterState.priority.length !== 0) {
      for (let i = 0; i < filterState.priority.length; i++) {
        filteredRow.push(
          initialRowData.map((item: any) => {
            return {
              ...item,
              testcases: item.testcases.filter(
                (test: any) =>
                  test.executionPriority ===
                  filterState.priority[i].toUpperCase()
              ),
            };
          })
        );
      }

      const output: any = removeDuplicateTestcases(filteredRow);
      const newRowData = removeEmptySections(output);
      setRowData(newRowData);
      setFilteredRowData(newRowData);
    }

    // created by filter
    else if (filterState.created_by.length !== 0) {
      for (let i = 0; i < filterState.created_by.length; i++) {
        filteredRow.push(
          initialRowData.map((item: any) => {
            return {
              ...item,
              testcases: item.testcases.filter(
                (test: any) =>
                  test.createdBy?.firstName + " " + test.createdBy?.lastName ===
                  filterState.created_by[i]
              ),
            };
          })
        );
      }

      const output: any = removeDuplicateTestcases(filteredRow);
      const newRowData = removeEmptySections(output);
      setRowData(newRowData);
      setFilteredRowData(newRowData);
    }

    //updated by filter
    else if (filterState.updated_by.length !== 0) {
      for (let i = 0; i < filterState.updated_by.length; i++) {
        filteredRow.push(
          initialRowData.map((item: any) => {
            return {
              ...item,
              testcases: item.testcases.filter(
                (test: any) =>
                  test.updatedBy?.firstName + " " + test.updatedBy?.lastName ===
                  filterState.updated_by[i]
              ),
            };
          })
        );
      }

      const output: any = removeDuplicateTestcases(filteredRow);
      const newRowData = removeEmptySections(output);
      setRowData(newRowData);
      setFilteredRowData(newRowData);
    }

    // created on by Range Filter
    else if (
      filterState.created_on.length !== 0 &&
      filterState.created_on[0] !== "Today" &&
      filterState.created_on[0] !== "Yesterday"
    ) {
      let startDate = 0;
      let endDate = Date.parse(dayjs().format("MM/DD/YYYY"));
      if (filterState.created_on[0] === "Last 7 days") {
        const prevDate = dayjs().subtract(7, "days");
        startDate = Date.parse(prevDate.format("MM/DD/YYYY"));
      } else if (filterState.created_on[0] === "Last 14 days") {
        const prevDate = dayjs().subtract(14, "days");
        startDate = Date.parse(prevDate.format("MM/DD/YYYY"));
      } else if (filterState.created_on[0] === "Last 30 days") {
        const prevDate = dayjs().subtract(30, "days");
        startDate = Date.parse(prevDate.format("MM/DD/YYYY"));
      } else if (filterState.created_on[0] === "Last 60 days") {
        const prevDate = dayjs().subtract(60, "days");
        startDate = Date.parse(prevDate.format("MM/DD/YYYY"));
      } else if (
        typeof filterState.created_on === "object" &&
        filterState.created_on.to !== "" &&
        filterState.created_on.from !== ""
      ) {
        const miliSeconds_In_A_Day = 86400000;
        startDate = Date.parse(filterState.created_on.from);
        endDate = Date.parse(filterState.created_on.to) + miliSeconds_In_A_Day;
      }

      filteredRow.push(
        initialRowData.map((item: any) => {
          return {
            ...item,
            testcases: item.testcases.filter(
              (test: any) =>
                Date.parse(test.createdAt) <= endDate &&
                Date.parse(test.createdAt) > startDate
            ),
          };
        })
      );

      const output: any = removeDuplicateTestcases(filteredRow);
      const newRowData = removeEmptySections(output);
      setRowData(newRowData);
      setFilteredRowData(newRowData);
    }

    // created on Today and Yesterday filter
    else if (filterState.created_on.length !== 0) {
      let date = "";
      if (filterState.created_on[0] === "Today") {
        date = dayjs().format("YYYY-MM-DD");
      }
      if (filterState.created_on[0] === "Yesterday") {
        date = dayjs().subtract(1, "days").format("YYYY-MM-DD");
      }
      filteredRow.push(
        initialRowData.map((item: any) => {
          return {
            ...item,
            testcases: item.testcases.filter((test: any) =>
              test.createdAt.includes(date)
            ),
          };
        })
      );

      const output: any = removeDuplicateTestcases(filteredRow);
      const newRowData = removeEmptySections(output);
      setRowData(newRowData);
      setFilteredRowData(newRowData);
    }

    // updated on by Range Filter
    else if (
      filterState.updated_on.length !== 0 &&
      filterState.updated_on[0] !== "Today" &&
      filterState.updated_on[0] !== "Yesterday"
    ) {
      let startDate = 0;
      let endDate = Date.parse(dayjs().format("MM/DD/YYYY"));
      if (filterState.updated_on[0] === "Last 7 days") {
        const prevDate = dayjs().subtract(7, "days");
        startDate = Date.parse(prevDate.format("MM/DD/YYYY"));
      } else if (filterState.updated_on[0] === "Last 14 days") {
        const prevDate = dayjs().subtract(14, "days");
        startDate = Date.parse(prevDate.format("MM/DD/YYYY"));
      } else if (filterState.updated_on[0] === "Last 30 days") {
        const prevDate = dayjs().subtract(30, "days");
        startDate = Date.parse(prevDate.format("MM/DD/YYYY"));
      } else if (filterState.updated_on[0] === "Last 60 days") {
        const prevDate = dayjs().subtract(60, "days");
        startDate = Date.parse(prevDate.format("MM/DD/YYYY"));
      } else if (
        typeof filterState.updated_on === "object" &&
        filterState.updated_on.to !== "" &&
        filterState.updated_on.from !== ""
      ) {
        const miliSeconds_In_A_Day = 86400000;
        startDate = Date.parse(filterState.updated_on.from);
        endDate = Date.parse(filterState.updated_on.to) + miliSeconds_In_A_Day;
      }

      filteredRow.push(
        initialRowData.map((item: any) => {
          return {
            ...item,
            testcases: item.testcases.filter(
              (test: any) =>
                Date.parse(test.updatedAt) <= endDate &&
                Date.parse(test.updatedAt) > startDate
            ),
          };
        })
      );

      const output: any = removeDuplicateTestcases(filteredRow);
      const newRowData = removeEmptySections(output);
      setRowData(newRowData);
      setFilteredRowData(newRowData);
    }

    // updated on Today and Yesterday filter
    else if (filterState.updated_on.length !== 0) {
      let date = "";
      if (filterState.updated_on[0] === "Today") {
        date = dayjs().format("YYYY-MM-DD");
      }
      if (filterState.updated_on[0] === "Yesterday") {
        date = dayjs().subtract(1, "days").format("YYYY-MM-DD");
      }
      filteredRow.push(
        initialRowData.map((item: any) => {
          return {
            ...item,
            testcases: item.testcases.filter((test: any) =>
              test.updatedAt.includes(date)
            ),
          };
        })
      );

      const output: any = removeDuplicateTestcases(filteredRow);
      const newRowData = removeEmptySections(output);
      setRowData(newRowData);
      setFilteredRowData(newRowData);
    }

    getFilterLabels();
    setShowFilters(false);
  };

  const dateConverter = (date: string) => {
    if (date) {
      return dayjs(date).format(DateFormat.SHORT);
    }
  };

  const newCSVData = csvData;
  newCSVData?.forEach((item: any) => {
    item.createdAt = dayjs(item?.createdAt).format(DateFormat.LONG);
    item.executionPriority =
      item?.executionPriority?.slice(0, 1) +
      item?.executionPriority?.slice(1).toLowerCase();
  });

  return (
    <>
      <div className="bg-gray-200 py-2 px-4 rounded lg:rounded flex justify-between items-center">
        {/* Sort component */}
        <div className="flex flex-row items-center divide-x divide-gray-400 space-x-2">
          <div className="flex flex-row items-center relative space-x-1">
            <div
              className="cursor-pointer text-sm"
              tabIndex={0}
              onBlur={() => setShowSortOptions(false)}
              onClick={() => setShowSortOptions(!showSortOptions)}
            >
              {t("Sort:")}&nbsp;
              <span
                className={`${sortValue.label !== "Section"
                  ? "bg-yellow-100 px-1 hover:bg-yellow-200"
                  : "border-b border-black border-dotted"
                  } `}
              >
                <Trans>{sortValue.label}</Trans>
              </span>
              {showSortOptions && (
                <div className="flex flex-col bg-white z-10 border rounded py-1 text-sm absolute top-6 shadow-md cursor-pointer w-32">
                  {sortOptions.map((option) => (
                    <div
                      className={`px-2 py-1 hover:bg-blue-500 hover:text-white ${option.key === "section" ? "border-t-2" : ""
                        }`}
                      key={option.key}
                      onMouseDown={() => selectedSortValue(option)}
                    >
                      <Trans>{option.label}</Trans>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {sortValue.key !== "section" && (
              <div
                data-tooltip-id="testcase-toolbar-tooltip-id"
                data-tooltip-content={"Reset grouping to sections"}
                data-tooltip-delay-show={750}
                data-tooltip-place="bottom-start"
                onClick={() => selectedSortValue(initialSortValue)}
                className="cursor-pointer self-center"
              >
                <XMarkIcon className="h-4 w-4 text-red-500 hover:text-red-600" />
              </div>
            )}

            <div
              className="cursor-pointer justify-self-center"
              onClick={toggleSort}
            >
              {isSortAscending ? (
                <BarsArrowUpIcon className="h-4 w-4 text-gray-600" />
              ) : (
                <BarsArrowDownIcon className="h-4 w-4 text-gray-600" />
              )}
            </div>
          </div>

          {/* Filter component */}
          <div className="flex flex-row space-x-2 relative">
            <div
              className="cursor-pointer pl-2 text-sm"
              onClick={() => {
                setShowFilters(!showFilters);
                setFilterState(initialFilterState);
              }}
            >
              {t("Filter:")}&nbsp;
              <span
                className={`${filterValue !== "None"
                  ? "bg-yellow-100 px-1 hover:bg-yellow-200"
                  : "border-b border-black border-dotted"
                  } `}
              >
                <Trans>{filterValue}</Trans>
              </span>
            </div>
            {showFilters && (
              <div className="flex flex-col bg-white z-20 border rounded py-1 text-sm absolute top-6 shadow-md cursor-pointer w-60">
                <form onSubmit={handleFilterSubmit}>
                  <div className="overflow-y-auto h-44">
                    {filterOptions.map((option) => (
                      <FilterComponent
                        key={option.value}
                        filterState={filterState}
                        setFilterState={setFilterState}
                        option={option}
                        row={initialRowData}
                        memberList={memberList}
                        hideInnerOpen={hideInnerOpen}
                        setInnerOpen={setInnerOpen}
                        updatedCustomDate={updatedCustomDate}
                        createdCustomDate={createdCustomDate}
                        setUpdatedCustomDate={setUpdatedCustomDate}
                        setCreatedCustomDate={setCreatedCustomDate}
                      />
                    ))}
                  </div>
                  <div className="py-2 flex flex-row justify-end border-t-2">
                    <CancelButton
                      onClick={() => {
                        setInnerOpen(true);
                        setShowFilters(false);
                      }}
                    >
                      {t("Cancel")}
                    </CancelButton>
                    <Button
                      type="reset"
                      value="Reset"
                      onClick={() => {
                        setFilterValue(t("None"));
                        setFilterState(initialFilterState);
                        setInnerOpen(true);
                        setFilteredRowData([]);
                        setIsSortAscending(true);
                      }}
                      className=" ml-2"
                    >
                      {t("Reset")}
                    </Button>
                    <Button type="submit" className="mr-2 ml-2">
                      {t("Apply")}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {filterValue !== "None" && (
              <div
                onClick={() => {
                  setFilterValue(t("None"));
                  setFilterState(initialFilterState);
                  setRowData(initialRowData);
                  setFilteredRowData([]);
                  setIsSortAscending(true);
                }}
                className="cursor-pointer self-center"
              >
                <XMarkIcon className="h-4 w-4 text-red-500 hover:text-red-600" />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-row items-center">
          <div
            data-tooltip-id="testcase-toolbar-tooltip-id"
            data-tooltip-content={t("Export test cases to csv")}
          >
            <CSVLink
              onClick={() => {
                if (csvData?.length > 0) return true;
                showError(
                  t(
                    "Please select test cases or individual section to export test cases."
                  )
                );
                return false;
              }}
              filename={t(`${projectName}_testCases.csv`)}
              data={newCSVData}
              headers={csvHeaders}
            >
              <DocumentArrowDownIcon
                className={`h-4 w-4 cursor-pointer ${ColorEnable ? "text-indigo-600" : "text-gray-400"
                  }`}
              />
            </CSVLink>
          </div>

          <div
            data-tooltip-id="testcase-toolbar-tooltip-id"
            data-tooltip-content={t("Export test cases to pdf")}
            className="mx-3"
          >
            <PrinterIcon
              className={`h-4 w-4  cursor-pointer ${ColorEnable ? "text-indigo-600" : "text-gray-400"
                }`}
              onClick={handlePrinterClick}
            />
          </div>

          <div
            data-tooltip-id="testcase-toolbar-tooltip-id"
            data-tooltip-content={t("Edit multiple test cases")}
            className=""
          >
            <PencilIcon
              className={`h-4 w-4  cursor-pointer ${ColorEnable ? "text-indigo-600" : "text-gray-400"
                }`}
              onClick={HandleEditClick}
            />
          </div>

          <div
            data-tooltip-id="testcase-toolbar-tooltip-id"
            data-tooltip-content={t("Delete multiple test cases")}
            className="mx-2">
            <TrashIcon
              data-cy={"delete-multiple-test-case"}
              className={`h-4 w-4 cursor-pointer ${ColorEnable ? "text-indigo-600" : "text-gray-400"
                }`}
              onClick={HandleDeleteClick}
            />
          </div>
        </div>
        <Tooltip id="testcase-toolbar-tooltip-id" />
      </div >
    </>
  );
};

export default TestCaseToolbar;
