import React from 'react';
import NavMenu from '../NavMenu/NavMenu';
import SearchModul from '../SearchModul/SearchModul';
import logo from '../../assets/icon-left-font.png';

const Header = () => {
    return (
        <header class="header">
            <div className="header__menu">
                <NavMenu />
                <img class="header__menu__logo" src={logo} alt="logo de groupomania" />
            </div>
            <SearchModul />
            <div className="header__btns">
                <div className="header__btns__btn"></div>
                <div className="header__btns__btn"></div>
            </div>
        </header>
    );
};

export default Header;