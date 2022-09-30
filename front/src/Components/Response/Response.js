import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';

const Response = (props) => {

    const [toggleResponseMenu, setToggleResponseMenu] = useState(false);
    const [toggleDeleteResponseModal, setToggleDeleteResponseModal] = useState(false);

    const responseMenuToggle = (close = false) => {
        if (close === true) {
            return setToggleResponseMenu(false);
        }
        setToggleResponseMenu(!toggleResponseMenu);
    }

    const deleteResponseModalToggle = () => {
        responseMenuToggle(true);
        setToggleDeleteResponseModal(!toggleDeleteResponseModal);
    }

    const tryToDeleteResponse = () => {
        console.log(props);
        fetch('http://localhost:3000/api/comments/delete/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                props.getAllRespFunc();
            })
    }

    return (
        <>
        <article className='response'>
            <div className="response__top">
                <div className="response__top__profilCont">
                    { props.profilImg !== null ? <img src="" alt="" /> : <FontAwesomeIcon icon={faUser} className="response__top__profilCont__user" />}
                </div>
                <div className={props.userId === props.user.id ? "response__top__bubble response__top__bubble--me" : "response__top__bubble"}></div>
                <p className={props.userId === props.user.id ? "response__top__content response__top__content--me" : "response__top__content"}>{props.content}</p>
                <div className="response__top__menuCont">
                    <FontAwesomeIcon onClick={responseMenuToggle} icon={faEllipsis} className="response__top__menuCont__menuBtn" />
                    {
                        toggleResponseMenu &&
                        <div className="response__top__menuCont__menu">
                            <ul>
                                {
                                    props.userId === props.user.id &&
                                    <>
                                        <li className='response__top__menuCont__menu__link'>Modifier le commentaire</li>
                                        <li onClick={deleteResponseModalToggle} className='response__top__menuCont__menu__link'>Supprimer le commentaire</li>
                                        <li className="response__top__menuCont__menu__separator"></li>
                                    </>
                                }
                                <li className='response__top__menuCont__menu__link'>Signaler le commentaire</li>
                            </ul>
                        </div>
                    }
                </div>
            </div>
            <div className="response__bot">
                <p className='response__bot__link'>Like</p>
                <p className='response__bot__time'>{props.time}</p>
            </div>
        </article>
        {
            toggleDeleteResponseModal &&
            <div className="response__deleteModal">
                <div className="response__deleteModal__modal">
                    <h2>Voulez vous supprimer ce commentaire ?</h2>
                    <div className="response__deleteModal__modal__btnCont">
                        <button onClick={tryToDeleteResponse}>Supprimer</button>
                        <button onClick={deleteResponseModalToggle}>Annuler</button>
                    </div>
                </div>
            </div>
        }
        </>
    );
};

export default Response;