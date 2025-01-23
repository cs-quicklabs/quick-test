import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  appRoutes,
  milestoneRoutes,
  projectRoutes,
} from "../Utils/constants/page-routes";
import Button from "../Button";
import Loader from "../Loader/Loader";
import { showError } from "../Toaster/ToasterFun";
import Table from "./Component/Table";
import { ToastMessage } from "../Utils/constants/misc";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import AccessControl from "../AccessControl";
import { MilestonePermissions } from "../Utils/constants/roles-permission";
import { useQuery } from "@tanstack/react-query";
import { getMilestoneDataDetails } from "../../services/milestoneServices";

export default function TestRunList() {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const params = useParams();
  const pid = params?.pid;

  const [buttonLoader, setButtonLoader] = useState(false);

  const editMilestone = (id: string) => {
    navigate(
      `${appRoutes.PROJECTS}/${params?.pid}/${projectRoutes.MILESTONES}/${id}/${milestoneRoutes.EDIT_MILESTONE}`
    );
  };

  const {
    data: milestoneData,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["milestone-data", pid], // Using an array for queryKey
    queryFn: () => getMilestoneDataDetails({ pid }),
  });

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
            <h1 className="sr-only">{t("Page title")}</h1>

            <div className="grid items-start grid-cols-2 lg:grid-cols-3">
              <div className="grid grid-cols-1 gap-4 lg:col-span-2  ">
                <section aria-labelledby="participants_section">
                  <div className="overflow-hidden bg-white">
                    <div className="px-2 2xl:pl-48">
                      {milestoneData?.data && milestoneData?.data.length > 0 ? (
                        <Table
                          RowData={milestoneData?.data}
                          getMilestones={refetch}
                          editMilestone={editMilestone}
                        />
                      ) : (
                        <div className="flex justify-center items-center content-center my-2 text-gray-500 text-xs font-normal">
                          {t("No open milestone yet.")}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 gap-3 h-screen lg:border-l lg:border-gray-200 xl:w-full">
                <section aria-labelledby="add-participant-section">
                  <div className="overflow-hidden bg-white">
                    <div>
                      <div className="bg-white">
                        <div className="px-2 md:px-4 py-5 sm:p-6 2xl:pr-52">
                          <h3 className="text-base font-semibold leading-6 text-gray-900">
                            {t("Manage Milestones")}
                          </h3>
                          <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>
                              {t(
                                "Milestones are important deadlines or piece of work you want to deliver, like releasing a production build on a set date."
                              )}
                            </p>
                          </div>
                          <div className="mt-5">
                            <AccessControl
                              permission={MilestonePermissions.CREATE_MILESTONE}
                            >
                              <Button
                                id="new-test-run"
                                onClick={() => {
                                  setButtonLoader(true);
                                  navigate(
                                    `${appRoutes.PROJECTS}/${params?.pid}/${projectRoutes.CREATE_MILESTONE}`
                                  );
                                }}
                                loading={buttonLoader}
                                type="button"
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 "
                              >
                                {t("Add Milestone")}
                              </Button>
                            </AccessControl>
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
