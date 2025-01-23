import AddUser from "../../../../components/Users/addUser";

const UserEdit = () => {
  return (
    <div>
      <meta
        name="description"
        content="Edit the details of an already added member/user here"
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Users, Edit Users, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/settings/users/:id/edit`}
      />

      <AddUser />
    </div>
  );
};

export default UserEdit;
