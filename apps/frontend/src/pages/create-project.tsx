import AddProject from "../components/Project/AddProject";

const CreateProject = () => {
  return (
    <div>
      <meta
        name="description"
        content="Create New Project for Quick Test. Here you can make new projects with or without description"
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Dashboard, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/create-project`}
      />

      <AddProject />
    </div>
  );
};

export default CreateProject;
