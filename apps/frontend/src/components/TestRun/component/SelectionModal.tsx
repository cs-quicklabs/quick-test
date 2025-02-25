import { Dialog, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { useCallback } from "react";
import { Fragment, useState, useEffect } from "react";
import SectionTable from "./ModalSectionTable";
import { useParams } from "react-router-dom";
import CancelButton from "../../Button/cancelButton";
import axiosService from "../../Utils/axios";
import Button from "../../Button";
import SectionList from "./ModalSectionList";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { showError } from "../../Toaster/ToasterFun";

const SelectionModal = ({
  showModal,
  setShowModal,
  setTotalTestcases,
}: any) => {
  const { t } = useTranslation(["common"]);
  const params = useParams();

  const formik = useFormikContext();

  const { setFieldValue } = formik;
  const [RowData, setRowData] = useState<any>([]);
  const [sectionData, setSectionData] = useState({});
  const [selectedSectionIds, setSelectedSectionIds] = useState<any[]>([]);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<any[]>([]);

  const { values }: any = formik;

  useEffect(() => {
    if (showModal) setSelectedSectionIds(values.sectionIds);
  }, [showModal, values.sectionIds]);

  const getTestcases = useCallback(async () => {
    try {
      const response = await axiosService.get(
        `/projects/${params.pid}/test-cases`
      );
      const data = response?.data?.data.filter(
        (item: any) => item.testcases.length
      );

      if (data[0]?.name === t("Unassigned")) {
        const [first, ...rest] = data;
        const newRowData = [...rest, first];
        setRowData(newRowData);
      } else setRowData(data);
    } catch (err) {
      showError(err?.message)
    }
  }, [params.pid, t]);

  useEffect(() => {
    if (params?.pid) getTestcases();
  }, [getTestcases, params?.pid]);

  const submitSections = () => {
    setFieldValue("sectionIds", selectedSectionIds);
    setFieldValue("testCaseIds", selectedTestCaseIds);
    const noOfTestcases = countAllTestcases();
    setTotalTestcases(noOfTestcases);
    setShowModal(false);
  };

  const addAllSections = () => {
    const newSectionIds: any[] = [];
    RowData.forEach((item: any) => {
      if (!selectedSectionIds.includes(item.id)) {
        newSectionIds.push(item.id);
      }
    });

    setSelectedSectionIds([...selectedSectionIds, ...newSectionIds]);
  };

  const countAllTestcases = () => {
    let count = 0;
    RowData.forEach((item: any) => {
      item?.testcases.forEach((item: any) => {
        if (selectedTestCaseIds.includes(item.id)) {
          count += 1;
        }
      });
    });
    return count;
  };

  return (
    <Transition appear show={showModal} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={() => setShowModal(false)}
      >
        <div className="h-full min-h-screen px-4 text-center">
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
            className="inline-block h-screen align-middle"
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
            <div className="inline-block h-[90%] w-full max-w-screen w-[94%] p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md">
              <div className="h-full flex flex-col gap-1 sm:gap-4">
                <div>
                  <DialogTitle
                    as="div"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {t("Select sections")}
                  </DialogTitle>
                  <p className="text-sm text-gray-900 mb-4">
                    {t("Please select sections to include in test run")}
                  </p>
                </div>
                <div className="h-[70%] flex-grow w-full border border-gray-400 flex sm:flex-row md:flex-row flex-col">
                  <div
                    className="sm:h-full md:h-full h-2/4 sm:w-2/5 md:w-2/5 w-full overflow-y-auto border-r-2 border-gray-400 bg-gray-200"
                    id="sectionList"
                  >
                    <SectionList
                      RowData={RowData}
                      sectionData={sectionData}
                      setSectionData={setSectionData}
                      selectedSectionIds={selectedSectionIds}
                      setSelectedSectionIds={setSelectedSectionIds}
                      selectedTestCaseIds={selectedTestCaseIds}
                      setSelectedTestCaseIds={setSelectedTestCaseIds}
                      addAllSections={addAllSections}
                    />
                  </div>
                  <div
                    className="sm:h-full md:h-full h-2/4 sm:w-3/5 md:w-3/5 w-full overflow-y-auto"
                    id="table"
                  >
                    <SectionTable
                      RowData={RowData}
                      sectionData={sectionData}
                      selectedTestCaseIds={selectedTestCaseIds}
                      setSelectedTestCaseIds={setSelectedTestCaseIds}
                      selectedSectionIds={selectedSectionIds}
                      setSelectedSectionIds={setSelectedSectionIds}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4" id="buttons">
                  <Button onClick={submitSections} className="order-last ">
                    {t("Confirm")}
                  </Button>
                  <CancelButton onClick={() => setShowModal(false)}>
                    {t("Cancel")}
                  </CancelButton>
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SelectionModal;
