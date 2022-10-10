import React, { useEffect, useState } from 'react';
import NavMenu from '../NavMenu/NavMenu';
import logo from '../../assets/icon-left-font.png';
import { decodeToken } from 'react-jwt';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-regular-svg-icons';


const Header = () => {

    const [user, setUser] = useState({ token: "", id: "" });
    const [hideHeader, setHideHeader] = useState(true);
    const [userData, setUserData] = useState({ userId: "", firstname: "", lastname: "", profilImg: "" });

    useEffect(() => {
        
        getUserInfos();
    },[]);
    
    const getUserId = () => {

        if(user.id === "") {
            if (localStorage.getItem('token') !== null) {
                let getToken = localStorage.getItem('token');
                let token = JSON.parse(getToken);
                if (token !== null) {
                    let decodedToken = decodeToken(token.version);
                    const newUserObj = {
                        token: token.version,
                        id: decodedToken.userId,
                    };
                    setUser(newUserObj);
                }
            } else {
                setHideHeader(false);
            }
        }
    };
    
    const getUserInfos = () => {
        console.log('2');
        
        if(user.id !== "" && user.id !== undefined) {
            const url = 'http://localhost:3000/api/users/getUserInfos/' + user.id;
            fetch(url)
            .then(res => res.json())
            .then(data => {
                let item = {
                    userId: data.data.userId,
                    firstname: data.data.firstname,
                    lastname: data.data.lastname,
                    profilImg: data.data.profilImg,
                }
                
                setUserData(item);
            });
        }
    };
    
    getUserId();

    return (
        <header className="header">
            <div className="header__menu">
                <NavMenu userId={user.id} />
                <a href="/"><img className="header__menu__logo" src={logo} alt="logo de groupomania" /></a>
            </div>
            <div className="header__btns">
                <div className="header__btns__btn"></div>
                    <a href={"/profil_=" + user.id}><div className="header__btns__btn header__btns__btn--profil">
                    {
                        userData.profilImg !== null ? <img src={userData.profilImg} alt="" /> : <FontAwesomeIcon icon={faUser} className="header__btns__btn__user" /> 
                    }
                </div></a>
            </div>
        </header>
    );
};

export default Header;