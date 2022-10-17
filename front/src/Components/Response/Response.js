import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';

const Response = (props) => {

    const [toggleResponseMenu, setToggleResponseMenu] = useState(false);
    const [toggleDeleteResponseModal, setToggleDeleteResponseModal] = useState(false);
    const [toggleModifyResponse, setToggleModifyResponse] = useState(false);
    const [response, setResponse] = useState(props.content);
    const [isLiked, setIsLiked] = useState(props.isLiked);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if(props.isAdmin && (typeof props.isAdmin === "boolean")) {
            setIsAdmin(props.isAdmin);
        }
    },[]);

    /**
     * toggle menu display for one response
     * 
     * @param {*} close 
     * @returns 
     */
    const responseMenuToggle = (close = false) => {
        if (close === true) {
            return setToggleResponseMenu(false);
        }
        setToggleResponseMenu(!toggleResponseMenu);
    };

    /**
     * toggle delete modal display
     */
    const deleteResponseModalToggle = () => {
        responseMenuToggle(true);
        setToggleDeleteResponseModal(!toggleDeleteResponseModal);
    };

    /**
     * delete one response
     */
    const tryToDeleteResponse = () => {
        
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
    };

    /**
    * toggle textarea for modify one response
    */
    const modifyResponseToggle = () => {
        const textarea = document.querySelector('.response__top__content--ctrl');
        responseMenuToggle(true);
        setToggleModifyResponse(!toggleModifyResponse);
    };

    /**
     * control textarea for modifying response
     * 
     * @param {*} value 
     */
     const ctrlModifyResponse = (value) => {
        setResponse(value);
    };

    /**
     * modify one response
     */
    const tryToModifyResponse = () => {

        if (response !== "" && response.length < 300) {
            const responseWithoutTag = response.replace(/<\/?[^>]+>/g,'');

            fetch('http://localhost:3000/api/comments/edit/' + props.id, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + props.user.token
                },
                method: 'PUT', 
                body: JSON.stringify({content: responseWithoutTag})
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success === true) {
                        modifyResponseToggle();
                        props.getAllRespFunc();
                    }
                })
        }
    };

    /**
     * handle response likes
     */
    const handleLike = () => {

        fetch('http://localhost:3000/api/comments/addLike/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    setIsLiked(!isLiked);
                    props.getAllRespFunc();
                }
            })

    };

    /**
     * simulate with alert event a response report
     */
     const reportResponse = () => {
        setToggleResponseMenu(false);
        alert('Commentaire signalé.');
    };

    return (
        <>
        <article className='response'>
            <div className="response__top">
                <a href={"profil_=" + props.userId}><div className="response__top__profilCont">
                    { props.profilImg !== null ? <img src={props.profilImg} alt={"Photo de profil"} /> : <FontAwesomeIcon icon={faUser} className="response__top__profilCont__user" />}
                </div></a>
                <div className={props.userId === props.user.id ? "response__top__bubble response__top__bubble--me" : "response__top__bubble"}></div>
                {
                    toggleModifyResponse ?
                    <div className={props.userId === props.user.id ? "response__top__content response__top__content--me response__top__content--ctrl" : "response__top__content response__top__content--ctrl"}>
                        <textarea autoFocus onInput={(e) => ctrlModifyResponse(e.target.value)} value={response}  ></textarea>
                        <div className="response__top__modifyBtn">
                            <button onClick={tryToModifyResponse}>Modifier</button>
                            <button onClick={modifyResponseToggle}>Annuler</button>
                        </div>
                    </div>
                    :
                    <p className={props.userId === props.user.id ? "response__top__content response__top__content--me" : "response__top__content"}>{props.content}</p>
                }
                <div className="response__top__menuCont">
                    <FontAwesomeIcon onClick={responseMenuToggle} icon={faEllipsis} className="response__top__menuCont__menuBtn" />
                    {
                        toggleResponseMenu &&
                        <div className="response__top__menuCont__menu">
                            <ul>
                                {
                                    (isAdmin === true || props.userId === props.user.id) 
                                    &&
                                    <>
                                        <li onClick={modifyResponseToggle} className='response__top__menuCont__menu__link'>Modifier le commentaire</li>
                                        <li onClick={deleteResponseModalToggle} className='response__top__menuCont__menu__link'>Supprimer le commentaire</li>
                                        <li className="response__top__menuCont__menu__separator"></li>
                                    </>
                                }
                                <li onClick={reportResponse} className='response__top__menuCont__menu__link'>Signaler le commentaire</li>
                            </ul>
                        </div>
                    }
                </div>
            </div>
            <div className="response__bot">
                <p onClick={handleLike} className={isLiked === true ? "response__bot__link--liked" : 'response__bot__link'}>Like {props.likes !== 0 && "(" + props.likes + ")"}</p>
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