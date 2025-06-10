import { supabase } from '../supabaseClient';
import Logo from '../assets/sirajin.png';
import { getUserInfo } from '../utils/auth';

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col-md-4 col-lg-4 col-sm-6 col-xs-12">
          <div className="card shadow" style={{ marginTop: '20%' }}>
            <div className="card-body">
              <div className="text-center p-4">
                <img
                  src={Logo}
                  alt="Logo"
                  width={300}
                  className="logo"/>
                <h6 className="mb-4 mt-4">Sistem Informasi RencAna kerJa INdividu</h6>
                <button type="button" className="login-with-google-btn" onClick={handleLogin}>
                  Sign in with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}