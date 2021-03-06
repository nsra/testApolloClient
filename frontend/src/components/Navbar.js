import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/auth-context';

export default function MainNavigation() {
  const value = useContext(AuthContext);
  return (
    <header className='main-navigation'>
      <div className='main-navigation__logo'>
        <h1>Easy Event</h1>
      </div>
      <div className='main-navigation__items'>
        <ul>
          {!value.token && (
            <li>
              <NavLink to='/auth'>Authenticate</NavLink>
            </li>
          )}
          <li>
            <NavLink to='/events'>Events</NavLink>
          </li>
          {value.token && (
            <>
              <li>
                <NavLink to='/bookings'>My Bookings</NavLink>
              </li>
              <li>
                <button onClick={value.logout}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}
