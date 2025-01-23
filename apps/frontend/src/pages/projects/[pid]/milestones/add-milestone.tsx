import AddMilestone from "../../../../components/Milestones/AddEditMilestone";


const CreateMilestone = () => {
  return (
    <>

      <meta
        name="description"
        content="Create a Milestone for Quick Test Project."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Milestones, Create New Milestone, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/create-milestone`}
      />


      <AddMilestone />
    </>
  );
};

export default CreateMilestone;
