//racf
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div>
      <nav className='navbar bg-dark'>
        <h1>
          <Link to='/'>SMCHERAGHI</Link>
        </h1>
        <ul>
          <li>
            <Link to='/profiles'>Developers</Link>
          </li>
          <li>
            <Link to='/register'>Register</Link>
          </li>
          <li>
            <Link to='/login'>Login</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
