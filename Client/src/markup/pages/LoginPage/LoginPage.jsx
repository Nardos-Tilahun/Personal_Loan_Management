import LoginForm from '../../components/LoginForm/LoginForm';

function LoginPage({ reset, confirm }) {
    return <LoginForm reset={reset} confirm={confirm} />;
}

export default LoginPage;