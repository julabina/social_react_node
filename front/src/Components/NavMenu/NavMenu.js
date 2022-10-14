import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faHome, faRightFromBracket, faMessage, faScaleBalanced, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const NavMenu = (props) => {

    const navigate = useNavigate();

    const [toggleMenu, setToggleMenu] = useState(false);

    /**
     * toggle display menu
     */
    const handleMenu = () => {
        setToggleMenu(!toggleMenu);
    };

    /**
     * logout the user
     */
    const logout = () => {
        localStorage.removeItem('token');
        handleMenu();
        navigate('/connexion', { replace: true });
    };

    return (
        <>
            <FontAwesomeIcon onClick={handleMenu} icon={faBars} className="header__menu__hamburger" />
            {
                toggleMenu &&
                <nav className='header__menu__nav'>
                    <ul>
                        <a href="/"><li><FontAwesomeIcon class='header__menu__nav__icon header__menu__nav__icon--home' icon={faHome} /></li></a>
                        <a href="/messagerie"><li><FontAwesomeIcon class='header__menu__nav__icon header__menu__nav__icon--message' icon={faMessage} /></li></a>
                        <a href="/mentions-legales"><li><FontAwesomeIcon class='header__menu__nav__icon header__menu__nav__icon--legals' icon={faScaleBalanced} /></li></a>
                        <a href="/a-propos"><li><FontAwesomeIcon class='header__menu__nav__icon header__menu__nav__icon--about' icon={faCircleInfo} /></li></a>
                        <li onClick={logout}><FontAwesomeIcon class='header__menu__nav__icon header__menu__nav__icon--logout' icon={faRightFromBracket} /></li>
                    </ul>
                </nav>
            }
        </>
    );
};

export default NavMenu;