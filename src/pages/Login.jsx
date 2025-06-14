import { Fragment, useEffect, useState } from 'react';
import Logo from '../assets/sirajin.png';

export default function Login() {
  const [isEmailInput, setIsEmailInput] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [disabledBtn, setDisabledBtn] = useState(true);

  const developersMail = [
    'tomxwork@gmail.com',
    // 'tanyatommi@gmail.com',
    // 'noobologi@gmail.com',
  ];

  const validEmailDomain = [
    'bpjsketenagakerjaan.go.id',
  ];

  const handleEmailInput = (e) => {
    const email = e.target.value;
    setEmailInput(email || '');

    if (email) {
      const isValidDevEmail = developersMail.includes(email);
      const isValidEmail = validEmailDomain.includes(email.split('@')[1]);

      if (isValidDevEmail || isValidEmail) {
        localStorage.setItem('email', email);
        setAlertMsg('');
        setDisabledBtn(false);
      } else {
        setAlertMsg('Email Not Valid! Please Use Email From @bpjsketenagakerjaan.go.id')
        setDisabledBtn(true);
      }
    } else {
      e.target.focus();
    }
  }

  const changeEmail = () => {
    setIsEmailInput(false);
    setEmailInput('');
    localStorage.removeItem('email');
  }
  
  const handleLogin = async () => {
    setDisabledBtn(true);
    const email = localStorage.getItem('email');
    if (!email) {
      alert('Please insert your email first');
      return;
    }
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    fetch(`${supabaseUrl}/functions/v1/check-user-login`, {
      method: "POST",
      redirect: "follow",
      body: JSON.stringify({ email }),
    }).then((response) => response.json())
      .then((registered_user) => {    
          if (!registered_user.status || registered_user.status !== 200) {
            alert('Account not registered, please contact your admin');
            setDisabledBtn(false);
            return;
          }
          else {
            if (registered_user.url && registered_user.url !== '') {
              window.location.href = registered_user.url;  
              setTimeout(() => {
                setDisabledBtn(false);
              }, 1000);
            }
          }
      }).catch(() => {
          alert('Account not registered, please contact your admin');
          setDisabledBtn(false);
          return;
      });
  }

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    setEmailInput(storedEmail || '');
    setIsEmailInput(storedEmail ? true : false);
  }, []);

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col-md-5 col-lg-5 col-sm-6 col-xs-12">
          <div className="card shadow" style={{ marginTop: '20%' }}>
            <div className="card-body">
              <div className="text-center p-4">
                <img
                  src={Logo}
                  alt="Logo"
                  width={300}
                  className="logo"/>
                <h6 className="mb-4 mt-4">Sistem Informasi RencAna kerJa INdividu</h6>
                {isEmailInput ? (
                  <Fragment>
                    {localStorage.getItem('email') && (
                      <p style={{ textAlign: 'center' }}>Email : <b>{localStorage.getItem('email')}</b></p>
                    )}
                    <button type="button" className="login-with-google-btn" onClick={handleLogin}>
                      Sign in with Google
                    </button>
                    <div style={{ textAlign: 'center', cursor: 'pointer', fontSize: '14px', color: 'blue' }} className="mt-4" onClick={changeEmail}><i>Click Here to Change Email</i></div>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div className='d-flex justify-content-center'>
                      <input type="email" name='email' onChange={handleEmailInput} value={emailInput} style={{ textAlign: 'center', width: '70%' }} className='form-control mb-3' placeholder='Insert Email User' />
                    </div>
                    {alertMsg && (<p className="mb-3" style={{ color: 'red', textAlign: 'center', fontSize: '11px' }}><b><i>{alertMsg}</i></b></p>)}
                    <button type="button" className="login-with-google-btn" onClick={handleLogin} disabled={disabledBtn}>Sign in with Google</button>
                  </Fragment>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}