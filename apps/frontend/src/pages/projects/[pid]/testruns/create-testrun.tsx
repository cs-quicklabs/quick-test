import AddTestRun from "../../../../components/TestRun/AddTestRun";


const CreateTestRun = () => {
  return (
    <>
      <meta
        name="description"
        content="Create a Test Run on Quick Test. Assign them to different Milestones, and different people."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Milestones, Create New Milestones, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/create-testrun`}
      />
      <AddTestRun />
    </>
  );
};

export default CreateTestRun;
