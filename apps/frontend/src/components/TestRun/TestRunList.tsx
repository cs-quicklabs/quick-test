import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../Button";
import Loader from "../Loader/Loader";
import { ToastMessage } from "../Utils/constants/misc";
import {
  appRoutes,
  projectRoutes,
  testRunRoutes,
} from "../Utils/constants/page-routes";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getTestRunDetails } from "../../services/testRunServices";
import { showError } from "../Toaster/ToasterFun";
import Table from "./component/Table";

export default function TestRunList({ projectName }: any) {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const params = useParams();
  const pid = params.pid as string;

  const [buttonLoader, setButtonLoader] = useState(false);

  const editTestRun = (id: string) => {
    navigate(
      `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}/${id}/${testRunRoutes.EDIT_TESTRUN}`
    );
  };

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
      getTestRunDetails({
        pid,
        pageNum: pageParam ?? 1,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.prevOffSet > lastPage.data.meta.pageCount
        ? undefined : lastPage.prevOffSet
    }
  });

  const testRunData = data?.pages.reduce((acc, page) => {
    return [...acc, ...page.data.data];
  }, []);

  if (error instanceof Error) {
    const errorMessage =
      error.message || i18next.t(ToastMessage.SOMETHING_WENT_WRONG);
    showError(errorMessage);
  }

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center content-center my-32">
          <Loader />
        </div>
      ) : (
        <>
          <main>
            <h1 className="sr-only">Page title</h1>
            <div className="grid items-start grid-cols-1 gap-2 lg:grid-cols-3 lg:gap-2">
              <div className="grid grid-cols-1 gap-4 lg:col-span-2">
                <section aria-labelledby="participants_section">
                  <div className="overflow-hidden bg-white">
                    <div className="pb-4 pl-7 pr-4 min-h-screen lg:border-r lg:border-gray-200 2xl:pl-52">
                      <Table
                        RowData={testRunData}
                        editTestRun={editTestRun}
                        projectName={projectName}
                        getTestRun={refetch}
                        fetchNextPage={fetchNextPage}
                        hasNextPage={hasNextPage as boolean}
                        isFetchingNextPage={isFetchingNextPage as boolean}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 gap-4 h-screen xl:w-full">
                <section aria-labelledby="add-participant-section">
                  <div className="overflow-hidden bg-white">
                    <div>
                      <div className="bg-white">
                        <div className="px-2 py-4 2xl:pr-52">
                          <h3 className="text-base leading-6 font-medium text-gray-900">
                            {t("Test Runs")}
                          </h3>
                          <div className="mt-2 max-w-xl text-sm text-gray-500 font-normal">
                            <p>
                              {t(
                                "Test run is a collection of test cases which are tested to create a report about passing and failing tests."
                              )}
                            </p>
                          </div>
                          <div className="mt-5">
                            <Button
                              id="new-test-run"
                              data-cy="add-test-run"
                              onClick={() => {
                                setButtonLoader(true);
                                navigate(
                                  `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.CREATE_TESTRUN}`
                                );
                              }}
                              loading={buttonLoader}
                              type="button"
                            >
                              {t("Start Another Test Run")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
