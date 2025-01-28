import EditMilestone from "../../../../components/Milestones/AddEditMilestone";


const UpdateMilestone = () => {
  return (
    <>
      <meta
        name="description"
        content="Edit Milestones page for Quick Test. You can edit your existing test cases here, add or remove description etc."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Milestones, Edit Milestones, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/milestones/:id/edit-milestone`}
      />
      <EditMilestone editMilestone={true} />
    </>
  );
};

export default UpdateMilestone;
