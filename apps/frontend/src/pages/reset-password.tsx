import ResetPasswordForm from "../components/ResetPassword/ResetPassword";


export default function ResetPassword() {
  return (
    <>
      <meta
        name="description"
        content="Password reset link sent to your email."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Reset Password, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/reset-password`}
      />
      <div>
        <ResetPasswordForm />
      </div>
    </>
  );
}
