import Overview from "../../../../components/ProjectDetails/component/Overview";


export default function OverviewPage() {
  return (
    <>

      <meta
        name="description"
        content="This is the overview page for Quick Test. You can check your current milestons, test cases, test runs and todos here. Additionally you can how many test cases you've passed, fialed or are unchecked."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Milestones, Todos, Graph, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/overview`}
      />


      <Overview />
    </>
  );
}
