import React, { useEffect, useState } from 'react';
import NavMenu from '../NavMenu/NavMenu';
import logo from '../../assets/icon-left-font.png';
import { decodeToken } from 'react-jwt';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-regular-svg-icons';


const Header = (props) => {

    const [userData, setUserData] = useState({ userId: "", firstname: "", lastname: "", profilImg: "" });
    const [reload, setReload] = useState(false);
    
    useEffect(() => {
        console.log(props.user);
        setReload(!reload);
        console.log(props.user);
        getUserInfos();
    },[props.user]);

    
    const getUserInfos = () => {
        if(props.user.id !== "" && props.user.id !== undefined) {
            const url = 'http://localhost:3000/api/users/getUserInfos/' + props.user.id;
            fetch(url)
            .then(res => res.json())
            .then(data => {
                console.log(data);

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

    return (
        <header className="header">
            <div className="header__menu">
                <NavMenu userId={props.user.id} />
                <a href="/"><img className="header__menu__logo" src={logo} alt="logo de groupomania" /></a>
            </div>
            <div className="header__btns">
                <div className="header__btns__btn"></div>
                    <a href={"/profil_=" + props.user.id}><div className="header__btns__btn header__btns__btn--profil">
                    {
                        userData.profilImg !== null ? <img src={userData.profilImg} alt="" /> : <FontAwesomeIcon icon={faUser} className="header__btns__btn__user" /> 
                    }
                </div></a>
            </div>
        </header>
    );
};

export default Header;