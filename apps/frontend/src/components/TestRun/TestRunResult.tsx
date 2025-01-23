import { useNavigate, useParams } from "react-router-dom";
import axiosService from "../Utils/axios";
import { ToastMessage } from "../Utils/constants/misc";
import { showError, showSuccess } from "../Toaster/ToasterFun";

import Loader from "../Loader/Loader";
import Table from "./component/TestResultTable";

import TestCaseDetail from "./TestCaseDetail";
import i18next from "i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getTestRunResults } from "../../services/testRunServices";

export default function TestRunResult({
  totalUserData,
  description,
  getTestRunDetais,
  setPrinterIcon,
  testCaseNum,
  seTestCaseNum,
}: any) {
  const navigate = useNavigate();
  const params = useParams();
  const pid = params.id as string;

  interface statusData {
    status: string;
    comment?: string;
    image?: string;
  }

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    refetch,
    error,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["testrun-data", pid],
    queryFn: ({ pageParam }) =>
      getTestRunResults({
        pid,
        pageNum: pageParam ?? 1,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.prevOffSet > lastPage.data.meta.pageCount
        ? undefined
        : lastPage.prevOffSet

  });

  const testRunResults = data?.pages.reduce((acc, page) => {
    return [...acc, ...page.data.data];
  }, []);

  const submitStatus = async (id: string, Data: statusData) => {
    try {
      const response = await axiosService.put(
        `/test-suites/test-results/${id}`,
        Data
      );
      showSuccess(response?.data?.message);
      refetch();
      getTestRunDetais();
      return true;
    } catch (err) {
      if (err.response && err.response.data) {
        showError(err.response.data.message);
        if (err.response.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
        }
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      return false;
    }
  };

  if (error instanceof Error) {
    const errorMessage =
      error.message || i18next.t(ToastMessage.SOMETHING_WENT_WRONG);
    showError(errorMessage);
  }

  return (
    <div>
      {isLoading && (
        <div className="flex justify-center items-center content-center lg:w-8/12">
          <Loader withoverlay={true} />
        </div>
      )}

      {testCaseNum > 0 ? (
        <>
          <TestCaseDetail
            page={testCaseNum}
            submitStatus={submitStatus}
            refetch={refetch}
          />
        </>
      ) : (
        <div className="flex flex-col">
          <Table
            RowData={testRunResults}
            submitStatus={submitStatus}
            setPrinterIcon={setPrinterIcon}
            seTestCaseNum={seTestCaseNum}
            getTestRunDetais={getTestRunDetais}
            getTestRunResults={getTestRunResults}
            totalUserData={totalUserData}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage as boolean}
            isFetchingNextPage={isFetchingNextPage}
            refetch={refetch}
          />
        </div>
      )}
    </div>
  );
}
