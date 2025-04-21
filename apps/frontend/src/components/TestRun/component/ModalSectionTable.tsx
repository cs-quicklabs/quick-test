import { useTranslation } from "react-i18next";

const ModalSectionTable = ({
  RowData,
  sectionData,
  selectedTestCaseIds,
  selectedSectionIds,
  setSelectedSectionIds,
  setSelectedTestCaseIds,
}: any) => {
  const { t } = useTranslation();

  const handleCheck = (event: any, item: any) => {
    if (event.target.checked && !selectedTestCaseIds.includes(item?.id)) {
      const newTestCaseIdsList = [...selectedTestCaseIds, item?.id];
      setSelectedTestCaseIds(newTestCaseIdsList);
      if (!selectedSectionIds.includes(sectionData?.id))
        setSelectedSectionIds([...selectedSectionIds, sectionData?.id]);
    } else if (
      !event.target.checked &&
      selectedTestCaseIds.includes(item?.id)
    ) {
      const newTestCaseIdsList = [...selectedTestCaseIds];
      const index = newTestCaseIdsList.indexOf(item?.id);
      if (index > -1 && sectionData?.testcases?.length <= 1)
        newTestCaseIdsList.splice(index, 1);
      sectionData?.testcases.forEach((x: any) => {
        if (!newTestCaseIdsList.includes(x.id)) {
          const newSectionIdsList = [...selectedSectionIds];
          const index = newSectionIdsList.indexOf(sectionData?.id);
          if (index > -1) newSectionIdsList.splice(index, 1);
          setSelectedSectionIds(newSectionIdsList);
        }
      });
      if (index > -1 && sectionData?.testcases?.length > 1)
        newTestCaseIdsList.splice(index, 1);
      setSelectedTestCaseIds(newTestCaseIdsList);
    }
  };

  return (
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <div className=" ml-4 flex flex-row whitespace-nowrap space-x-2 items-center">
            <th
              scope="col"
              className="px-10 py-2 text-left text-xs text-gray-500 uppercase tracking-wider w-2/12"
            >
              {t("ID")}
            </th>
            <th
              scope="col"
              className="px-6 py-2 text-left text-xs text-gray-500 uppercase tracking-wider w-10/12"
            >
              {t("Title")}
            </th>
          </div>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sectionData?.testcases?.map((item: any, index: number) => (
            <div
              className=" ml-4 flex flex-row whitespace-nowrap space-x-2 items-center"
              key={index}
            >
              <input
                className="h-4 w-4 text-indigo-600 focus:outline-none border-gray-300 rounded focus:ring-0 focus:ring-transparent focus:ring-offset-0"
                type="checkbox"
                checked={selectedTestCaseIds.includes(item?.id)}
                onChange={(e) => handleCheck(e, item)}
              />
              <tr key={index} className="bg-white">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 w-8 ">
                  {index + 1}
                </td>
                <td className="px-20 py-2 whitespace-nowrap text-sm font-medium text-gray-500">
                  {item.title}
                </td>
              </tr>
            </div>
          ))}
        </tbody>
      </table>
  );
};

export default ModalSectionTable;
