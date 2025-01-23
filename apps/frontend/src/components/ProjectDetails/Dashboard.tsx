import { useParams } from "react-router-dom";

import { appRoutes, projectRoutes } from "../Utils/constants/page-routes";
import Header from "./component/Header";
import NavTab from "./component/NavTab";

import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import MilestonesPage from "../../pages/projects/[pid]/milestones/MilestonesPage";
import OverviewPage from "../../pages/projects/[pid]/overview";
import TestCasePage from "../../pages/projects/[pid]/testcases/edit-testcase/[id]/TestCases";
import TestRunPage from "../../pages/projects/[pid]/testruns/TestRuns";
import TodoPage from "../../pages/projects/[pid]/todos";
import { getProjectsDetails } from "../../services/headerServices";
import ProjectMembers from "../../pages/projects/[pid]/users/Members";
import { RoleId } from "../Utils/constants/roles-permission";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [userRole, setUserRoleId] = useState("");
  const { t } = useTranslation(["common"]);
  const params = useParams();
  const pid = params.pid;

  const { data: projectDetail } = useQuery({ queryKey: ["projects-data", pid], queryFn: () => getProjectsDetails({ pid }) });

  const NavProps = [
    {
      redirect: `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.OVERVIEW}`,
      text: t("Overview"),
      dataAttr: "overview-tab",
    },
    {
      redirect: `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TODO}`,
      text: t("Todos"),
      dataAttr: "todo-tab",
    },
    {
      redirect: `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.MILESTONES}`,
      text: t("Milestones"),
      dataAttr: "milestones-tab",
    },
    {
      redirect: `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTCASES}`,
      text: t("Test Cases"),
      dataAttr: "test-cases-tab",
    },
    {
      redirect: `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}`,
      text: t("Test Runs"),
      dataAttr: "test-runs-tab",
    },
  ];

  if (String(userRole) !== String(RoleId.MEMBER)) {
    NavProps.push({
      redirect: `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.PROJECT_MEMBERS}`,
      text: t("Members"),
      dataAttr: "project-members",
    });
  }

  useEffect(() => {
    if (localStorage.getItem("roleId")) {
      setUserRoleId(JSON.parse(localStorage.getItem("roleId") || ""));
    }
  }, []);

  const returnHeader = (path: any) => {
    if (path !== projectRoutes.OVERVIEW) {
      return (
        <Header
          title={projectDetail?.name}
          description={projectDetail?.description}
          redirectToBack={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.OVERVIEW}`}
        />
      );
    } else {
      return (
        <Header
          title={projectDetail?.name}
          description={projectDetail?.description}
          redirectToBack={appRoutes.DASHBOARD}
        />
      );
    }
  };

  return (
    <>
      <main className="flex-1 flex flex-col relative z-0 focus:outline-none h-full">
        <div className="bg-gray-50  border-b border-gray-200">
          {returnHeader(params.subURL)}
          <NavTab navData={NavProps} />
        </div>

        <div className="relative flex-grow">
          {params.subURL === projectRoutes.OVERVIEW && (
            <div className="absolute h-full w-full">
              <OverviewPage />
            </div>
          )}
          {params.subURL === projectRoutes.TESTCASES && (
            <TestCasePage projectName={projectDetail?.name} />
          )}

          {params.subURL === projectRoutes.TESTRUNS && (
            <TestRunPage projectName={projectDetail?.name} />
          )}
          {params.subURL === projectRoutes.MILESTONES && <MilestonesPage />}
          {params.subURL === projectRoutes.TODO && <TodoPage />}
          {params.subURL === projectRoutes.PROJECT_MEMBERS && (
            <ProjectMembers
              pname={projectDetail?.name}
              pid={projectDetail?.id}
            />
          )}
        </div>
      </main>
    </>
  );
}
