import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { LayoutProvider } from '../contexts/LayoutContext'; // if also named export

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <LayoutProvider>
        <Component {...pageProps} />
      </LayoutProvider>
    </AuthProvider>
  );
}

export default MyApp;
