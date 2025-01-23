import AddProject from "../../../components/Project/AddProject";
 

const EditProject = () => {
  return (
    <div>
        
        <meta
          name="description"
          content="Edit existing projects for Quick Test. Here you can change title and description for an ongoing project."
        />
        <meta
          name="keywords"
          content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Dashboard, Projects"
        />
        <link
          rel="canonical"
          href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/edit-project`}
        />
        

      <AddProject />
    </div>
  );
};

export default EditProject;
