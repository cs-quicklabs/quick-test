import EditTestCase from "../../../../../../components/TestCase/EditTestCase";


export default function Comp() {
  return (
    <>
      <meta
        name="description"
        content="Edit Test Cases for Quick Test. You can edit your existing test cases here, assign sections, change priorities, changing conditions and result etc."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Edit Test Cases, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/testcases/:id/edit-testcase`}
      />
      <EditTestCase />
    </>
  );
}
