import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  appRoutes,
  milestoneRoutes,
  projectRoutes,
  testCaseRoutes,
  testRunRoutes,
} from "../../Utils/constants/page-routes";

interface ISearchResultProps {
  milestones: [];
  testCases: [];
  testSuites: [];
  projects: [];
}

const Section = ({ label, data, routeToPath, setInputValue }: any) => {
  return (
    <div className="mb-2">
      <em className="ml-2 font-semibold">{label}</em>
      <hr></hr>
      {data.map((item: any) => (
        <div
          onMouseDown={() => {
            setInputValue("");
            routeToPath(item);
          }}
          className="px-2 py-1 hover:bg-blue-500 hover:text-white text-sm cursor-pointer"
          key={item.id}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
};

const TestcaseSection = ({ label, data, routeToPath, setInputValue }: any) => {
  return (
    <div className="mb-2">
      <em className="ml-2 font-semibold">{label}</em>
      <hr></hr>
      {data.map((item: any) => (
        <div
          onMouseDown={() => {
            setInputValue("");
            routeToPath(item);
          }}
          className="px-2 py-1 hover:bg-blue-500 hover:text-white text-sm cursor-pointer whitespace-nowrap"
          key={item.id}
        >
          {item.title.length > 36
            ? `${item.title.substring(0, 36)}...`
            : item.title}
        </div>
      ))}
    </div>
  );
};

const SearchResult = (props: any) => {
  const { t } = useTranslation();
  const { projects, milestones, testCases, testSuites }: ISearchResultProps =
    props.matchedData;
  const navigate = useNavigate();

  const goToProject = (item: any) => {
    navigate(`${appRoutes.PROJECTS}/${item.id}/${projectRoutes.OVERVIEW}`);
  };
  const goToMilestone = (item: any) => {
    navigate(
      `${appRoutes.PROJECTS}/${item.project.id}/${projectRoutes.MILESTONES}/${item.id}/${milestoneRoutes.MILESTONE}`
    );
  };
  const goToTestcase = (item: any) => {
    navigate(
      `${appRoutes.PROJECTS}/${item.project.id}/${projectRoutes.TESTCASES}/${item.id}/${testCaseRoutes.TESTCASE}`
    );
  };
  const goToTestrun = (item: any) => {
    navigate(
      `${appRoutes.PROJECTS}/${item.project.id}/${projectRoutes.TESTRUNS}/${item.id}/${testRunRoutes.TEST_RESULTS}`
    );
  };

  return (
    <>
      {projects?.length ? (
        <Section
          label={t("Project")}
          data={projects}
          routeToPath={goToProject}
          setInputValue={props.setInputValue}
        />
      ) : null}
      {milestones?.length ? (
        <Section
          label={t("Milestone")}
          data={milestones}
          routeToPath={goToMilestone}
          setInputValue={props.setInputValue}
        />
      ) : null}
      {testCases?.length ? (
        <TestcaseSection
          label={t("Testcase")}
          data={testCases}
          routeToPath={goToTestcase}
          setInputValue={props.setInputValue}
        />
      ) : null}
      {testSuites?.length ? (
        <Section
          label={t("Testrun")}
          data={testSuites}
          routeToPath={goToTestrun}
          setInputValue={props.setInputValue}
        />
      ) : null}
    </>
  );
};

export default SearchResult;
