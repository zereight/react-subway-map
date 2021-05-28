import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { ROUTE } from '../../../constants';
import { useChangeEvent, useServerAPI } from '../../../hooks';
import { ResultMessage } from '../../../hooks/useServerAPI';
import { RootState } from '../../../store';
import { ISignUpReq } from '../../../type';
import { isValidAge, isValidEmail, isValidPassword } from '../../../utils';
import { Header } from '../../atoms';
import { SignUpForm } from '../../molecules';
import { Container } from './SignUp.styles';

const signUpApiResponseMessage: ResultMessage = {
  ['POST_DATA_RESPONSE']: {
    fail: '회원 가입에 실패하셨습니다.',
    success: '회원가입에 성공하셨습니다.',
  },
};

const SignUp = () => {
  const history = useHistory();
  const {
    hostState: { host },
  } = useSelector((state: RootState) => {
    return { hostState: state.hostReducer };
  });
  const { postData: signUpRequest, postDataResponse: signUpResponse } = useServerAPI(
    `${host}/members`,
    signUpApiResponseMessage,
  );

  const { value: age, onChange: onChangeAge } = useChangeEvent('');
  const { value: email, onChange: onChangeEmail } = useChangeEvent('');
  const { value: password, onChange: onChangePassword } = useChangeEvent('');
  const { value: passwordCheck, onChange: onChangePasswordCheck } = useChangeEvent('');

  const onSubmitSignUp: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    const body: ISignUpReq = {
      age: Number(age),
      email,
      password,
    };

    signUpRequest(body);
  };

  useEffect(() => {
    if (signUpResponse?.isError === false) {
      history.replace({ pathname: ROUTE.LOGIN });
    }
  }, [signUpResponse]);

  return (
    <Container>
      <Header>
        <h3>회원가입</h3>
      </Header>

      <SignUpForm
        age={Number(age)}
        onChangeAge={onChangeAge}
        email={email}
        onChangeEmail={onChangeEmail}
        password={password}
        onChangePassword={onChangePassword}
        passwordCheck={passwordCheck}
        onChangePasswordCheck={onChangePasswordCheck}
        isValidAge={isValidAge(age)}
        isValidEmail={isValidEmail(email)}
        isValidPassword={isValidPassword(password)}
        isValidPasswordCheck={passwordCheck === password}
        onSubmitSignUp={onSubmitSignUp}
      />
    </Container>
  );
};

export default SignUp;
