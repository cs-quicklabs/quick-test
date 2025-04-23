import { useEffect } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ModalSectionList = ({
  RowData,
  setSectionData,
  selectedSectionIds,
  setSelectedSectionIds,
  addAllSections,
  selectedTestCaseIds,
  setSelectedTestCaseIds,
}: any) => {
  const { t } = useTranslation();
  const [active, setActive] = useState("");

  const onSectionClicked = (item: any) => {
    setSectionData(item);
    setActive(item?.id);
  };

  useEffect(() => {
    const firstEle = RowData[0];
    setSectionData(firstEle);
    setActive(firstEle?.id);
  }, [RowData, setSectionData]);

  const handleCheck = (event: any, item: any) => {
    var newTestCaseIdsList = item?.testcases.map((item: any) => item.id);
    if (event.target.checked && !selectedSectionIds.includes(item?.id)) {
      const newSectionIdsList = [...selectedSectionIds, item?.id];
      setSelectedSectionIds(newSectionIdsList);
      setSelectedTestCaseIds([...selectedTestCaseIds, ...newTestCaseIdsList]);
    } else if (!event.target.checked && selectedSectionIds.includes(item?.id)) {
      const newSectionIdsList = [...selectedSectionIds];
      const index = newSectionIdsList.indexOf(item?.id);
      if (index > -1) newSectionIdsList.splice(index, 1);
      setSelectedSectionIds(newSectionIdsList);
      var latestTestCaseIds = selectedTestCaseIds?.filter(
        (x: any) => !newTestCaseIdsList.includes(x)
      );
      setSelectedTestCaseIds(latestTestCaseIds);
    }
  };

  return (
    <>
      <div className="mb-2 px-4 py-1.5 border-b border-gray-300 text-sm text-gray-500 bg-gray-50 divide-x-2 font-medium divide-gray-400">
        {t("Select :")}&nbsp;
        <span
          onClick={addAllSections}
          className="hover:underline cursor-pointer pr-2"
        >
          {t("All")}
        </span>
        <span
          onClick={() => setSelectedSectionIds([])}
          className="hover:underline cursor-pointer pl-2"
        >
          {t("None")}
        </span>
      </div>
      {RowData.map((item: any, index: number) => {
        return (
          <div
            className="ml-4 flex flex-row whitespace-nowrap space-x-2 items-center"
            key={index}
          >
            <input
              className="h-4 w-4 text-indigo-600 focus:outline-none border-gray-300 rounded focus:ring-0 focus:ring-transparent focus:ring-offset-0"
              type="checkbox"
              checked={
                selectedSectionIds.includes(item?.id)
              }
              onChange={(e) => handleCheck(e, item)}
            />
            <span
              className={`px-2 py-1 cursor-pointer text-sm rounded-md ${
                active === item?.id
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-400"
              }`}
              onClick={() => onSectionClicked(item)}
            >
              {item?.name}
            </span>
          </div>
        );
      })}
    </>
  );
};

export default ModalSectionList;
