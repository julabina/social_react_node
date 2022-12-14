import React, { useEffect, useState } from 'react';
import NavMenu from '../NavMenu/NavMenu';
import logo from '../../assets/icon-left-font.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-regular-svg-icons';


const Header = (props) => {

    const [userData, setUserData] = useState({ userId: "", firstname: "", lastname: "", profilImg: "" });
    const [reload, setReload] = useState(false);
    
    useEffect(() => {
        setReload(!reload);
        getUserInfos();
    },[props.user]);

    /**
     * get user infos
     */
    const getUserInfos = () => {
        if(props.user.id !== "" && props.user.id !== undefined) {

            fetch(process.env.REACT_APP_API_URL + '/api/users/getUserInfos/' + props.user.id, {
                headers: {
                    "Authorization": "Bearer " + props.user.token
                },
                method: 'GET'
            })
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

    return (
        <header className="header">
            <div className="header__menu">
                <NavMenu userId={props.user.id} />
                <a href="/"><img className="header__menu__logo" src={logo} alt="logo de groupomania" /></a>
            </div>
            <div className="header__btns">
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