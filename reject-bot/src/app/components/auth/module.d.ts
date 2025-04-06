declare module './SignupForm' {
  interface SignupFormProps {
    onSuccess: () => void;
    onLoginClick: () => void;
  }
  
  export default function SignupForm(props: SignupFormProps): JSX.Element;
} 