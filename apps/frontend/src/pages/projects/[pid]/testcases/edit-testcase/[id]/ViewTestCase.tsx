import TestView from "../../../../../../components/TestCase/TestView";


export default function Comp() {
  return (
    <>

      <meta
        name="description"
        content="View already defined test cases for Quick Test."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Test Cases, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/testcases/:id/testcase`}
      />


      <TestView />
    </>
  );
}
