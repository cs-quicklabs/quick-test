import Todo from "../../../../components/Todo";


export default function TodoPage() {
  return (
    <>

      <meta
        name="description"
        content="Here you can view Todos and the Test Runs and Test Cases associated with them."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Todos, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/projects/:pid/todo`}
      />


      <Todo />
    </>
  );
}
