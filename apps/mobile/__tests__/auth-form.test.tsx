import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { AuthForm } from '../components/AuthForm';
import { loginSchema } from '../lib/validation/auth';

describe('authentication form', () => {
  it('shows validation messages for an empty sign-in', async () => {
    const view = await render(
      <PaperProvider>
        <AuthForm
          schema={loginSchema}
          defaults={{ email: '', password: '' }}
          submitLabel="Sign in"
          onSubmit={async () => undefined}
          fields={[
            { name: 'email', label: 'Email', keyboard: 'email-address' },
            { name: 'password', label: 'Password', secure: true },
          ]}
        />
      </PaperProvider>,
    );

    fireEvent.press(view.getByText('Sign in'));
    expect(await view.findByText('Enter a valid email')).toBeTruthy();
    expect(await view.findByText('Password must be at least 8 characters')).toBeTruthy();
  });
});
