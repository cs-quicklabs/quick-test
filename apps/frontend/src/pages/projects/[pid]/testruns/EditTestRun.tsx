import EditTestRun from "../../../../components/TestRun/EditTestRun";


export default function Comp() {
  return (
    <>

      <meta
        name="description"
        content="Edit already existing testruns for Quick Test. Assign them to different person, add milestones, description etc."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Milestones, Test Run, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/testruns/:id/edit-testrun`}
      />


      <EditTestRun />
    </>
  );
}
