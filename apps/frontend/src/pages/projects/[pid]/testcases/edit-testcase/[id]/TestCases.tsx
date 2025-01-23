import TestCaseList from "../../../../../../components/TestCase/TestCaseList";


export default function TestCasePage(props: any) {
  return (
    <>
      <meta
        name="description"
        content="View already defined Test Cases. You can view Test Cases, their expected result with preconditions and all other necessary details associated with them."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Runs, ToDo, Test Case Reports, Jira, Test Cases, Edit Test Cases, Delete Test Cases, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/testcases`}
      />
      <TestCaseList
        projectName={props?.projectName}
        selectedData={props?.selectedData}
      />
    </>
  );
}
