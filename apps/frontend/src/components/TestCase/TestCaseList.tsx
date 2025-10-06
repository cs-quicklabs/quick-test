/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  appRoutes,
  projectRoutes,
  testCaseRoutes,
} from "../Utils/constants/page-routes";
import { AppContext } from "../Context/mainContext";
import axiosService from "../Utils/axios";
import DeleteConfirmationModal from "../Common/DeleteModal";
import { ToastMessage } from "../Utils/constants/misc";
import Loader from "../Loader/Loader";
import SectionMain from "../Sections/SectionMain";
import { showError, showSuccess } from "../Toaster/Toast";
import TestCaseListTable from "./component/TestCaseListTable";
import TestCaseToolbar from "./component/TestCaseToolbar";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { SerialisedTestCaseType } from "../../types/testCaseTypes";
import SidePanelData from "./component/SidePanelTestCaseData";
import SidePanel from "./component/SidePanel";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getTestCasesData } from "../../reducers/testCaseSlice";
import { SectionType } from "../../types/sectionTypes";
import Modal from "../Common/Modal";
import TestForm from "./TestForm";
import { createTestCases } from "../../services/testCasesServices";
import { downloadFile } from "../Utils/helpers";

export default function TestCaseList({ projectName }: any) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pid } = useParams();

  const appDispatch = useAppDispatch();
  const { isLoading, testCases: testCasesList } = useAppSelector(
    (state) => state.testCases
  );
  const sections = useAppSelector((state) => state.sections.sections);

  const { state, dispatch } = useContext(AppContext);

  const [initialRowData, setInitialRowData] = useState<any[]>([]);
  const [Row, setRowData] = useState<any[]>([]);

  const [memberList, setMemberList] = useState<any[]>([]);
  const [memberListFetched, setMemberListFetched] = useState<boolean>(false);
  const [DocumentData, setDocumentData] = useState<any[]>([]);
  const [modalMsg, setMsg] = useState(<></>);
  const [selectedId, setSelectedId] = useState("");
  const [selectedTestCase, setSelectedTestCase] =
    useState<SerialisedTestCaseType | null>(null);

  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAddNewTestCaseModalVisible, setIsAddNewTestCaseModalVisible] =
    useState<boolean>(false);
  const [showDragIcon, setShowDragIcon] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

  // Combined data fetching function to avoid duplicate calls
  const fetchInitialData = useCallback(async () => {
    if (!dataFetched) {
      // Fetch test cases data
      appDispatch(getTestCasesData(pid as string));

      // Fetch member data only if not fetched yet
      if (!memberListFetched) {
        try {
          const memberListResponse = await axiosService.get(
            `/projects/${pid}/filter-users`
          );
          const memberListData = memberListResponse.data.data;
          setMemberList(memberListData);
          setMemberListFetched(true);
        } catch (err) {
          if (err.response && err.response.data) {
            showError(err.response.data.message);
          } else showError(t(ToastMessage.SOMETHING_WENT_WRONG));
        }
      }

      setDataFetched(true);
    }
  }, [appDispatch, memberListFetched, pid, dataFetched, t]);

  // Separate function for refreshing test case data only (for actions that modify test cases)
  const refreshTestCasesData = useCallback(() => {
    appDispatch(getTestCasesData(pid as string));
  }, [appDispatch, pid]);

  const openDeleteModal = (value: any) => {
    const msg = (
      <>
        {t("Are you sure want to delete the test case")}{" "}
        <span className="font-semibold text-red-500">{`"${value?.serialNumber}"`}</span>
        ?
      </>
    );
    setMsg(msg);
    setSelectedId(value.id);
    setShowDeleteModal(true);
  };

  const deleteTestCase = async () => {
    setShowDeleteModal(false);
    try {
      const response = await axiosService.delete(
        `/test-cases/${selectedId}`,
        {}
      );
      if (response?.data?.success) {
        showSuccess(response.data.message);
      }
      refreshTestCasesData();
    } catch (err) {
      if (err?.response?.data) {
        showError(err.response.data.message);
      }
    }
  };

  const getSerialNumber = (list: SectionType[]) => {
    let serializedRowData: any = [];
    let serailizedTestCases: any;
    let serialNo = 0;
    if (list.length !== 0) {
      serializedRowData = list.map((ele: any, idx: number) => {
        serailizedTestCases = ele.testcases.map((testCase: any) => {
          testCase = Object.assign({}, testCase, { serialNumber: ++serialNo });
          return { ...testCase };
        });
        ele = Object.assign({}, ele, { testcases: serailizedTestCases });
        return { ...ele };
      });
      return serializedRowData;
    }
  };

  const printDocument = async () => {
    const data = DocumentData.map((val) => val.id);
    if (DocumentData.length > 0) {
      const payload = { testCaseIds: data };
      const response = await axiosService.post(
        `projects/${pid}/test-cases/pdf`,
        payload
      );
      downloadFile(response?.data?.data);
    } else {
      showError(i18next.t(ToastMessage.EXPORT_TEST_CASE_PDF));
    }
  };

  const HandleEditClick = useCallback(() => {
    const data = DocumentData.map((val) => val.id);

    if (DocumentData.length > 0) {
      localStorage.setItem("testCaseIds", JSON.stringify(data));
      navigate(
        `${appRoutes.PROJECTS}/${pid}/${projectRoutes.EDIT_MULTIPLE_TESTCASES}`
      );
      return;
    } else showError(i18next.t(ToastMessage.NO_TEST_CASE_SELECTED));
  }, [DocumentData, navigate, pid]);

  const HandleDeleteClick = useCallback(() => {
    DocumentData.length === 0
      ? showError(i18next.t(ToastMessage.NO_TEST_CASE_SELECTED))
      : setOpenDeleteModal(true);
  }, [DocumentData]);

  const deleteTestCases = async () => {
    setOpenDeleteModal(false);
    setDocumentData([]);
    try {
      const data = {
        testCaseIds: DocumentData.map((val) => val.id),
      };
      const response = await axiosService.delete(`/test-cases`, data);
      if (response?.data?.success) {
        showSuccess(response.data.message);
        refreshTestCasesData();
      }
    } catch (err) {
      if (err?.response?.data) {
        showError(err.response.data.message);
      }
    }
  };

  const selectedData = useCallback(
    (newData: any[], sectionName: string) => {
      const freshData = DocumentData.filter(
        (val) => val.SectionName !== sectionName
      );
      setDocumentData([...freshData, ...newData]);
    },
    [DocumentData]
  );

  const submitFormAddTestCase = (values: any, { resetForm }: any) => {
    createTestCases({
      testcase: values,
      projectId: pid,
      sectionId: values.sectionId || "f5dfcf07-cda2-49ec-a1f7-a70a1ecdb1ae",
    })
      .then((res) => {
        showSuccess(res.message);
        if (values.next) {
          resetForm();
          values.callBack();
        } else {
          setIsAddNewTestCaseModalVisible(false);
        }
      })
      .catch((error) => showError(error.error))
      .finally(() => {
        refreshTestCasesData();
      });
  };

  // Initial data fetch on component mount - only once
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Process test case data when it changes
  useEffect(() => {
    if (testCasesList.length) {
      const serialisedTestCasesList = getSerialNumber(testCasesList);
      setRowData(serialisedTestCasesList);
      setInitialRowData(serialisedTestCasesList);
    }
  }, [testCasesList]);

  // Handle section creation - only refresh when actually needed
  useEffect(() => {
    if (state.sectionCreated === true) {
      refreshTestCasesData();
      dispatch({
        type: "UPDATE_SECTION_RESET",
        data: false,
      });
    }
  }, [state.sectionCreated, dispatch, refreshTestCasesData]);

  return (
    <div>
      {showDeleteModal && (
        <DeleteConfirmationModal
          msg={modalMsg}
          open={showDeleteModal}
          toggleModal={setShowDeleteModal}
          delete={deleteTestCase}
        />
      )}
      {isAddNewTestCaseModalVisible && (
        <Modal
          title={t("Add New Test Case")}
          onCancel={() => setIsAddNewTestCaseModalVisible(false)}
        >
          <TestForm
            onSubmit={submitFormAddTestCase}
            onCancel={() => setIsAddNewTestCaseModalVisible(false)}
            initialValues={{
              title: "",
              preconditions: "",
              steps: "",
              expectedResults: "",
              sectionId: selectedId,
              executionPriority: "MEDIUM",
            }}
            optionsForSelect={sections}
            onSubmitNext
          />
        </Modal>
      )}
      <DeleteConfirmationModal
        msg={t("Are you sure you want to delete selected test cases ?")}
        open={OpenDeleteModal}
        toggleModal={setOpenDeleteModal}
        delete={deleteTestCases}
      />

      <SidePanel
        isOpen={Boolean(selectedTestCase)}
        setIsOpen={setSelectedTestCase}
        expandRedirectTo={
          selectedTestCase
            ? `${appRoutes.PROJECTS}/${pid}/${projectRoutes.TESTCASES}/${selectedTestCase.id}/${testCaseRoutes.TESTCASE}?number=${selectedTestCase.serialNumber}`
            : ""
        }
      >
        {selectedTestCase && <SidePanelData testCase={selectedTestCase} />}
      </SidePanel>

      <div className="w-full">
        {isLoading ? (
          <div className="flex justify-center items-center content-center my-32">
            <Loader />
          </div>
        ) : (
          <div className="grid items-start grid-cols-1 gap-2 lg:grid-cols-3 lg:gap-2 overflow-hidden">
            <div className=" overflow-x-auto mx-6 sm:mx-0  col-span-1 lg:col-span-2 height-threshold">
              <div className="py-4 align-middle inline-block min-w-full px-7 2xl:pl-12">
                <TestCaseToolbar
                  Row={Row}
                  setRowData={setRowData}
                  setShowDragIcon={setShowDragIcon}
                  initialRowData={initialRowData}
                  memberList={memberList}
                  selectedData={selectedData}
                  csvData={DocumentData}
                  projectName={projectName}
                  ColorEnable={Boolean(DocumentData.length)}
                  handlePrinterClick={printDocument}
                  HandleDeleteClick={HandleDeleteClick}
                  HandleEditClick={HandleEditClick}
                />
                <div
                  className="overflow-hidden border-gray-200 sm:rounded-lg"
                  id="test-case-report"
                >
                  <div
                    id="pdf-header"
                    className="flex item-center justify-center font-medium text-gray-900 py-3 hidden"
                  >
                    {projectName}&nbsp;{t("Project Test Case Report")}
                  </div>
                  {Row?.map(
                    (
                      section: {
                        name: string;
                        id: string;
                        testcases: any[];
                      },
                      index
                    ) => (
                      <React.Fragment key={index}>
                        <div
                          className="pl-6 py-4 whitespace-nowrap border-t flex flex-col items-start"
                          data-cy={"section-" + index}
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {section?.name}
                          </span>{" "}
                          {showDragIcon && (
                            <span
                              onClick={() => {
                                setIsAddNewTestCaseModalVisible(true);
                                setSelectedId(section.id);
                              }}
                              className="text-indigo-600 underline cursor-pointer  text-xs font-medium"
                              data-cy={"section-" + index + "-add-case"}
                            >
                              {t("Add Case")}
                            </span>
                          )}
                        </div>

                        {section?.testcases?.length > 0 && (
                          <TestCaseListTable
                            dataAttr={"section-" + index + "-case-"}
                            testcases={section?.testcases}
                            SectionName={section?.name}
                            openDeleteModal={openDeleteModal}
                            selectedData={selectedData}
                            sectionId={section?.id}
                            showDragIcon={showDragIcon}
                            selectedTestCase={selectedTestCase}
                            setSelectedTestCase={setSelectedTestCase}
                          />
                        )}
                      </React.Fragment>
                    )
                  )}
                </div>
              </div>
              {Row?.length === 0 && (
                <div className="flex justify-center items-center content-center text-gray-500 text-xs font-normal my-2">
                  {t("No test cases found")}
                </div>
              )}
            </div>
            <SectionMain
              getTestCases={refreshTestCasesData}
              addTestCase={() => setIsAddNewTestCaseModalVisible(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
