import React from 'react';
import NavMenu from '../NavMenu/NavMenu';
import SearchModul from '../SearchModul/SearchModul';
import logo from '../../assets/icon-left-font.png';

const Header = () => {
    return (
        <header className="header">
            <div className="header__menu">
                <NavMenu />
                <a href="/"><img className="header__menu__logo" src={logo} alt="logo de groupomania" /></a>
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