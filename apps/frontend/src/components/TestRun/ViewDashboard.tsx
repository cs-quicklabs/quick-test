import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import axiosService from "../Utils/axios";
import {
  appRoutes,
  projectRoutes,
  testRunRoutes,
} from "../Utils/constants/page-routes";
import { DateFormat } from "../Utils/constants/date-format";
import { ToastMessage } from "../Utils/constants/misc";
import { showError } from "../Toaster/ToasterFun";
import Heading from "../ProjectDetails/component/Header";
import TestRunResult from "./TestRunResult";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import BreadCrumb from "../BreadCrumb/BreadCrumb";
import { getProjectsDetails } from "../../services/headerServices";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const params = useParams();
  const pid = params.pid;
  const [testCaseNum, seTestCaseNum] = useState(0);
  const [userData, setuserData] = useState({
    title: "",
    description: "",
    status: "",
  });
  const [totalUserData, setTotalUserData] = useState([]);
  const getTestRunDetails = useCallback(async () => {
    try {
      const response = await axiosService.get(
        `/projects/${params.pid}/test-suite-detail/${params.id}`
      );
      setTotalUserData(response.data.data);

      // console.log("Response", response);
      if (response.data.data.user) {
        setuserData({
          title: response.data.data.name,

          status:
            response.data.data.status === "INPROGRESS"
              ? "In Progress"
              : response.data.data.status.toLowerCase(),

          description: `${t("Created by")} ${response.data.data.user.firstName +
            " " +
            response.data.data.user.lastName
            } ${t("on")} ${dayjs(new Date(response.data.data.createdAt)).format(
              DateFormat.LONG
            )}`,
        });
      } else {
        setuserData({
          title: response.data.data.name,

          status:
            response.data.data.status === "INPROGRESS"
              ? "In Progress"
              : response.data.data.status.toLowerCase(),

          description: ` Created ${t("on")} ${dayjs(
            new Date(response.data.data.createdAt)
          ).format(DateFormat.LONG)}`,
        });
      }
    } catch (err) {
      if (err.response && err.response.data) {
        showError(err.response.data.message);
        if (err.response.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/");
        }
      } else showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
    }
  }, [navigate, params.id, params.pid, t]);

  const { data: projectDetail } = useQuery({
    queryKey: ["projects-data", pid], queryFn: () =>
      getProjectsDetails({ pid })
  });

  useEffect(() => {
    if (params?.pid) {
      getTestRunDetails();
    }
  }, [getTestRunDetails, params]);

  const NavProps = [
    {
      redirect: `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}/${params.id}/${testRunRoutes.TEST_RESULTS}`,
      text: t("Test Results"),
    },
  ];

  const breadCrumbDetails = [
    {
      name: "Projects",
      href: `${appRoutes.PROJECTS}`,
      current: false,
      style: "hover:text-blue-600",
      dividerStyle: "hidden",
    },
    {
      name: projectDetail?.name,
      href: `${appRoutes.PROJECTS}/${params?.pid}/${projectRoutes.TESTRUNS}`,
      current: false,
      style: "hover:text-blue-600",
      dividerStyle: "h-5 w-5 flex-shrink-0 text-gray-300 hover:text-blue-600",
    },
    {
      name: "Test Runs",
      href: `#`,
      current: false,
      style: "text-gray-400",
      dividerStyle: "h-5 w-5 flex-shrink-0 text-gray-300 hover:text-blue-600",
    },
  ];

  return (
    <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
      <div className="bg-gray-50">
        <BreadCrumb pages={breadCrumbDetails} />
        <Heading
          {...userData}
          backtoList={true}
          seTestCaseNum={seTestCaseNum}
          title={userData.title}
          description={userData.description}
        />
      </div>

      <div>
        {params?.subURL === testRunRoutes.TEST_RESULTS && (
          <TestRunResult
            totalUserData={totalUserData}
            getTestRunDetais={getTestRunDetails}
            navProps={NavProps}
            testCaseNum={testCaseNum}
            seTestCaseNum={seTestCaseNum}
          />
        )}
      </div>
    </main>
  );
}
