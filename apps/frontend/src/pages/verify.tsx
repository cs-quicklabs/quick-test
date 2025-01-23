import VerifyEmail from "../components/VerifyEmail/VerifyEmail";


const Verify = () => {
  return (
    <>
      <meta
        name="description"
        content="Verify your email, a verification link has been send to your email. After verification please try logging in again."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Verify, Log In, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/verify`}
      />
      <VerifyEmail />
    </>
  );
};

export default Verify;
