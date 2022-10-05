import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faHome, faRightFromBracket, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const NavMenu = (props) => {

    const navigate = useNavigate();

    const [toggleMenu, setToggleMenu] = useState(false);

    const handleMenu = () => {
        setToggleMenu(!toggleMenu);
    }

    const logout = () => {
        localStorage.removeItem('token');
        handleMenu();
        navigate('/connexion', { replace: true });
    }

    return (
        <>
            <FontAwesomeIcon onClick={handleMenu} icon={faBars} className="header__menu__hamburger" />
            {
                toggleMenu &&
                <nav className='header__menu__nav'>
                    <ul>
                        <a href="/"><li><FontAwesomeIcon class='header__menu__nav__icon header__menu__nav__icon--home' icon={faHome} /></li></a>
                        <a href={props.userId + "/amis"}><li><FontAwesomeIcon class='header__menu__nav__icon header__menu__nav__icon--users' icon={faUsers} /></li></a>
                        <li onClick={logout}><FontAwesomeIcon class='header__menu__nav__icon header__menu__nav__icon--logout' icon={faRightFromBracket} /></li>
                        {/* <li><FontAwesomeIcon icon={faRightFromBracket} /></li> */}
                    </ul>
                </nav>
            }
        </>
    );
};

export default NavMenu;