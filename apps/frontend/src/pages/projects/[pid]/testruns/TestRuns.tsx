import TestRunList from "../../../../components/TestRun/TestRunList";


export default function TestRunPage(props: any) {
  return (
    <>

      <meta
        name="description"
        content="Here on this page you can keep track of all the Test Runs that are pending or completed. Additionally you can create new test runs here."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Milestones, Create Test Runs, View Test Runs, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/testruns`}
      />


      <TestRunList projectName={props.projectDetail?.name} />
    </>
  );
}
