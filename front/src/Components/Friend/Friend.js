import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

const Friend = (props) => {

    const [toggleMenu, setToggleMenu] = useState(false);
    const [toggleDeleteModal, setToggleDeleteModal] = useState(false);

    /**
     * handle friend menu
     */
    const handleMenu = () => {
        setToggleMenu(!toggleMenu);
    };
    
    /**
     * toggle modale for delete friend
     */
    const deleteModalToggle = () => {
        setToggleMenu(false);
        setToggleDeleteModal(!toggleDeleteModal);
    };
    
    /**
     * accepte friend deleting and launch delete user function
     */
    const acceptDelete = () => {
        props.cancelRelationFunc(props.id);
    };

    return (
        <>
        <div key={props.id} className='profil__friendsList__list__friend'>
            <a href={"/profil_=" + props.id}><div className="profil__friendsList__list__friend__left">
                <div className="profil__friendsList__list__friend__left__imgCont">
                    {
                        props.profilImg !== null ?
                        <img src={props.profilImg} alt={"photo de profil de " + props.fullname} />
                        :
                        <FontAwesomeIcon icon={faUser} className="profil__top__pictures__profilImg__icon" />
                    }
                </div>
                <p className='profil__friendsList__list__friend__left__name'>{props.fullname}</p>
            </div></a>
            <div className="profil__friendsList__list__friend__right">
                {
                    props.currentUserId === props.paramsId && props.friend === "friend" ? 
                    <div className='profil__friendsList__list__friend__right__menuCont'>
                        <FontAwesomeIcon onClick={handleMenu} className='profil__friendsList__list__friend__right__menuCont__icon' icon={faEllipsis} />
                        {
                            toggleMenu &&
                            <div className="profil__friendsList__list__friend__right__menuCont__menu">
                                <ul>
                                    <a href={"/messagerie/" + props.id}><li className="profil__friendsList__list__friend__right__menuCont__menu__link">Envoyer un message</li></a>
                                    <a href={"/profil_=" + props.id}><li className="profil__friendsList__list__friend__right__menuCont__menu__link">Voir le profil</li></a>
                                    <li className="profil__friendsList__list__friend__right__menuCont__menu__separator"></li>
                                    <li onClick={deleteModalToggle} className="profil__friendsList__list__friend__right__menuCont__menu__link">Retirer des amis</li>
                                </ul>
                            </div>
                        }
                    </div>
                    :   
                     
                        props.id === props.currentUserId && props.friend === 'pending' ?
                        <button onClick={() => props.cancelQueryFunc(props.id)} className='profil__friendsList__list__friend__right__addBtn'>Demande envoyé</button> :
                        props.id === props.currentUserId && props.friend === 'received' ?
                        <button onClick={() => props.acceptQueryFunc(props.id)} className='profil__friendsList__list__friend__right__addBtn'>Accepter demande</button> 
                    
                    
                    : 
                    <>
                    {
                        props.id !== props.currentUserId && props.friend === "friend" ?
                        <div className='profil__friendsList__list__friend__right__menuCont'>
                            <FontAwesomeIcon onClick={handleMenu} className='profil__friendsList__list__friend__right__menuCont__icon' icon={faEllipsis} />
                            {
                                toggleMenu &&

                                <div className="profil__friendsList__list__friend__right__menuCont__menu">
                                    <ul>
                                        <a href={"/messagerie/" + props.id}><li className="profil__friendsList__list__friend__right__menuCont__menu__link">Envoyer un message</li></a>
                                        <a href={"/profil_=" + props.id}><li className="profil__friendsList__list__friend__right__menuCont__menu__link">Voir le profil</li></a>
                                        <li className="profil__friendsList__list__friend__right__menuCont__menu__separator"></li>
                                        <li onClick={deleteModalToggle} className="profil__friendsList__list__friend__right__menuCont__menu__link">Retirer des amis</li>
                                    </ul>
                                </div>
                            }
                        </div>
                        :
                            props.id !== props.currentUserId && props.friend === 'pending' ?
                            <button onClick={() => props.cancelQueryFunc(props.id)} className='profil__friendsList__list__friend__right__addBtn'>Demande envoyé</button> :
                            props.id !== props.currentUserId && props.friend === 'received' ?
                            <button onClick={() => props.acceptQueryFunc(props.id)} className='profil__friendsList__list__friend__right__addBtn'>Accepter demande</button> :
                            props.id !== props.currentUserId && props.friend === '' &&
                            <button onClick={() => props.sendingQueryFunc(props.id)} className='profil__friendsList__list__friend__right__addBtn'>Ajouter</button>   
                    }
                    </>
                }
            </div>
        </div>
        {
            toggleDeleteModal &&
            <div className="profil__confirmCancelRelation">
                <div className="profil__confirmCancelRelation__modal">
                    <h2>Ne plus etre ami avec {props.fullname}</h2>
                    <div className="profil__confirmCancelRelation__modal__btnCont">
                        <button onClick={deleteModalToggle}>Annuler</button>
                        <button onClick={acceptDelete}>Ok</button>
                    </div>
                </div>
            </div>
        }
        </>
    );
};

export default Friend;