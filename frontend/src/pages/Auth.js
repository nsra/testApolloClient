import React, { useRef, useState, useContext } from 'react';
import AuthContext from '../context/auth-context';

const AuthPage = (props) => {
  const [isLogin, setIsLogin] = useState(true);
  const userNameEl = useRef(null);
  const emailEl = useRef(null);
  const passwordEl = useRef(null);
  const value = useContext(AuthContext);

  const submitHandler = event => {
    event.preventDefault();
    let username = '';
    if (!isLogin) { username = userNameEl.current.value; }
    const email = emailEl.current.value;
    const password = passwordEl.current.value;
    if ((!isLogin && username.trim().length === 0) || email.trim().length === 0 || password.trim().length === 0) {
      alert("error inputs");
      return;
    }

    let requestQuery = {
      query: `
            query Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
                    userId
                }
            }
        `,
      variables: {
        email,
        password,
      },
    };

    if (!isLogin) {
      requestQuery = {
        query: `
          mutation CreateUser($username: String!, $email: String!, $password: String!) {
            createUser(userInput: {username:$username, email: $email, password: $password}) {
              _id
              username
              email
            }
          }
        `,
        variables: {
          username,
          email,
          password,
        },
      };
    }
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestQuery),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed.');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData.errors[0].message);
        if (isLogin) {
          if (resData.data.login.token) {
            localStorage.setItem('token', resData.data.login.token);
            localStorage.setItem('userId', resData.data.login.userId);
            value.login(
              resData.data.login.userId,
              resData.data.login.token
            );
          }
        }
        if (!isLogin && resData.data.createUser) alert(resData.data.createUser.username + " added successfully!");
      })
      .catch(err => {
        console.log(err);
        alert(err.message);
      });
  };

  return (
    <form className='auth-form' onSubmit={submitHandler}>
      {!isLogin && (
        <div className='form-control'>
          <label htmlFor='username'>Username</label>
          <input type='text' id='username' ref={userNameEl} />
        </div>
      )}
      <div className='form-control'>
        <label htmlFor='email'>Email</label>
        <input type='email' id='email' ref={emailEl} />
      </div>
      <div className='form-control'>
        <label htmlFor='password'>Password</label>
        <input type='password' id='password' ref={passwordEl} />
      </div>
      <div className='form-actions'>
        <button type='submit'>Submit</button>
        <button type='button' onClick={() => { setIsLogin(!isLogin) }}>
          Switch to {isLogin ? 'Signup' : 'Login'}
        </button>
      </div>
    </form>
  );
}

export default AuthPage;