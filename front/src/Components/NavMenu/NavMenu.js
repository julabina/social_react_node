import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';

const NavMenu = () => {
    return (
        <>
            <FontAwesomeIcon icon={faBars} className="header__menu__hamburger" />
            <nav>
                
            </nav>
        </>
    );
};

export default NavMenu;