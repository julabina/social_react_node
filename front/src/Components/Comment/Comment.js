import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import Response from '../Response/Response';

const Comment = (props) => {

    const [toggleResponse, setToggleResponse] = useState(false);
    const [toggleResponses, setToggleResponses] = useState(false);
    const [toggleCommentMenu, setToggleCommentMenu] = useState(false);
    const [toggleDeleteCommentModal, setToggleDeleteCommentModal] = useState(false);
    const [toggleModifyComment, setToggleModifyComment] = useState(false);
    const [responseText, setResponseText] = useState("");
    const [responseCount, setResponseCount] = useState(0);
    const [responses, setResponses] = useState([]);
    const [comment, setComment] = useState(props.content);
    const [isLiked, setIsLiked] = useState(props.isLiked);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        getAllResponse();
        if(props.isAdmin && (typeof props.isAdmin === "boolean")) {
            setIsAdmin(props.isAdmin);
        }

    },[]);

    /**
     * toggle display form for adding new response
     */
    const responseToggle = () => {
        setToggleResponse(!toggleResponse);
    };

    /**
     * calcul time between created and current time
     * 
     * @param {*} date 
     * @returns 
     */
    const calculTimeBetween = (date) => {
        const currentDate = new Date();
        const createdDate = new Date(date);
        
        const diff = currentDate.getTime() - createdDate.getTime();

        const second = Math.floor(diff/1000);
        const minute = Math.floor(diff/1000/60);
        const day = Math.floor(diff/1000/60/60/24);
        
        let diffDisplay = "";

        if(minute > 525600) {
            const years = Math.floor(day/365);
            if (years < 2) {   
                diffDisplay = "1 an";
            } else {
                diffDisplay = years + " ans";
            }
        }else if(day > 30) {
            const month = Math.floor(day/30);
            diffDisplay = month + ' mois';
        } else if(day >= 1) {
            if (day < 2) {
                diffDisplay = '1 jour';
            } else {
                diffDisplay = day + ' jours';
            }
        } else if(minute >= 60) {
            const hours = Math.floor(minute/60);
            if (hours < 2) {
                diffDisplay = '1 h';
            } else {
                diffDisplay = hours + ' h';
            }
        } else if(minute >= 1) {
            if(minute < 2) {
                diffDisplay = '1 min';
            } else {
                diffDisplay = minute + ' min';
            }
        } else {
            diffDisplay = second + ' sec';
        }

        return diffDisplay;
    };

    /**
     * get all response for one comment
     */
    const getAllResponse = () => {

        fetch(process.env.REACT_APP_API_URL + '/api/comments/findResponse/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                if(data.data) {
                    let newArr = [];

                    for (let i = 0; i < data.data.length; i++) {
                        let liked = false;

                        if(data.data[i].usersLiked.includes(props.user.id)) {
                            liked = true;
                        }

                        let item = {
                            id: data.data[i].id,
                            content: data.data[i].content,
                            userId: data.data[i].userId,
                            likedByUser: liked,
                            likes: data.data[i].likes,
                            firstname: data.data[i].User.User_info.firstname,
                            lastname: data.data[i].User.User_info.lastname,
                            profilImg: data.data[i].User.User_info.profilImg,
                            commentId: data.data[i].commentId,
                            time: calculTimeBetween(data.data[i].createdAt),
                            created: data.data[i].createdAt,
                            updated: data.data[i].updatedAt,
                        };
                        newArr.push(item);
                    }

                    newArr.sort((a, b) => new Date(a.updated) - new Date(b.updated));

                    setResponses(newArr);
                    setResponseCount(data.count);
                }
            })
    };

    /**
     * control add comment input
     * 
     * @param {*} value 
     */
    const ctrlResponse = (value) => {
        setResponseText(value);
    };

    /**
     * try to add new response to one comment
     */
    const sendResponse = () => {

        if (responseText !== "" && responseText.length < 300) {
            const responseWithoutTag = responseText.replace(/<\/?[^>]+>/g,'');

            fetch(process.env.REACT_APP_API_URL + '/api/comments/new', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + props.user.token
                },
                method: 'POST', 
                body: JSON.stringify({content: responseWithoutTag, postId: props.postId, commentId: props.id})
            })
                .then(res => res.json())
                .then(data => {
                    
                    if (data.success === true) {
                        getAllResponse();
                        respToggle(true);
                        responseToggle();
                        setResponseText('');
                    }
                })
        }
    };

    /**
     * toggle display all responses for one comment
     * 
     * @param {*} isNew 
     * @returns 
     */
    const respToggle = (isNew = false) => {
        if (isNew === true) {
            return setToggleResponses(true);
        }
        setToggleResponses(!toggleResponses);
    };

    /**
     * toggle the comment menu
     * 
     * @param {*} close 
     * @returns 
     */
    const commentMenuToggle = (close = false) => {
        if(close === true) {
            return setToggleCommentMenu(false);
        }
        setToggleCommentMenu(!toggleCommentMenu);
    };

    /**
     * toggle the confirmation modal for deleting comment
     */
    const deleteCommentModalToggle = () => {
        commentMenuToggle(true);
        setToggleDeleteCommentModal(!toggleDeleteCommentModal);
    };

    /**
     * try to delete one comment and responses
     */
    const tryToDeleteComment = () => {
        
        fetch(process.env.REACT_APP_API_URL + '/api/comments/delete/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                props.getCommentsFunc();
            })
    };

    /**
     * toggle textarea for modify one comment
     */
    const modifyCommentToggle = () => {
        const textarea = document.querySelector('.comment__top__content--ctrl');
        commentMenuToggle(true);
        setToggleModifyComment(!toggleModifyComment);
    };

    /**
     * control textarea for modifying comment
     * 
     * @param {*} value 
     */
    const ctrlModifyComment = (value) => {
        setComment(value);
    };

    /**
     * modify one comment
     */
    const tryToModifyComment = () => {

        if (comment !== "" && comment.length < 300) {
            const commentWithoutTag = comment.replace(/<\/?[^>]+>/g,'');

            fetch(process.env.REACT_APP_API_URL + '/api/comments/edit/' + props.id, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + props.user.token
                },
                method: 'PUT', 
                body: JSON.stringify({content: commentWithoutTag})
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success === true) {
                        modifyCommentToggle();
                        props.getCommentsFunc();
                    }
                })
        }
    };

    /**
     * handle likes for comments
     */
    const handleLike = () => {

        fetch(process.env.REACT_APP_API_URL + '/api/comments/addLike/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    setIsLiked(!isLiked);
                    props.getCommentsFunc();
                }
            })
    };
    
    /**
     * simulate with alert event a comment report
     */
     const reportComment = () => {
        setToggleCommentMenu(false);
        alert('Commentaire signal??.');
    };

    return (
        <>
        <article className='comment'>
            <div className="comment__top">
                <a href={"/profil_=" + props.userId}><div className="comment__top__profilCont">
                    { props.profilImg !== null ? <img src={props.profilImg} alt={"Photo de profil"} /> : <FontAwesomeIcon icon={faUser} className="comment__top__profilCont__user" />}
                </div></a>
                <div className={props.userId === props.user.id ? "comment__top__bubble comment__top__bubble--me" : "comment__top__bubble"}></div>
                {
                    toggleModifyComment ?
                    <div className={props.userId === props.user.id ? "comment__top__content comment__top__content--me comment__top__content--ctrl" : "comment__top__content comment__top__content--ctrl"}>
                        <textarea autoFocus onInput={(e) => ctrlModifyComment(e.target.value)} value={comment}  ></textarea>
                        <div className="comment__top__modifyBtn">
                            <button onClick={tryToModifyComment}>Modifier</button>
                            <button onClick={modifyCommentToggle}>Annuler</button>
                        </div>
                    </div>
                    :
                    <p className={props.userId === props.user.id ? "comment__top__content comment__top__content--me" : "comment__top__content"}>{props.content}</p>
                }
                <div className="comment__top__menuCont">
                    <FontAwesomeIcon onClick={commentMenuToggle} icon={faEllipsis} className="comment__top__menuCont__menuBtn" />
                    {
                        toggleCommentMenu &&
                        <div className="comment__top__menuCont__menu">
                            <ul>
                                {
                                    (isAdmin === true || props.userId === props.user.id) 
                                    &&
                                    <>
                                        <li onClick={modifyCommentToggle} className='comment__top__menuCont__menu__link'>Modifier le commentaire</li>
                                        <li onClick={deleteCommentModalToggle} className='comment__top__menuCont__menu__link'>Supprimer le commentaire</li>
                                        <li className="comment__top__menuCont__menu__separator"></li>
                                    </>
                                }
                                <li onClick={reportComment} className='comment__top__menuCont__menu__link'>Signaler le commentaire</li>
                            </ul>
                        </div>
                    }
                </div>
            </div>
            <div className="comment__bot">
                <p onClick={handleLike} className={isLiked === true ? "comment__bot__link comment__bot__link--liked" : 'comment__bot__link'}>Like {props.likes !== 0 && "(" + props.likes + ")"}</p>
                <p onClick={responseToggle} className='comment__bot__link'>Repondre</p>
                <p className='comment__bot__time'>{props.timeBetween}</p>
            </div>
            {
                toggleResponse &&
                <div className="comment__form">
                    <input onInput={(e) => ctrlResponse(e.target.value)} value={responseText} placeholder="Ajouter une reponse" type="text" />
                    <button onClick={sendResponse}>Envoyer</button>
                </div>
            }
            {
                responseCount !== 0 &&
                <>
                <p className='comment__responseCount' onClick={respToggle}>{responseCount} commentaires</p>
                    {
                        toggleResponses && 
                            responses.map(el => {
                                return <Response id={el.id} key={el.id} content={el.content} user={props.user} isAdmin={isAdmin} userId={el.userId} time={el.time} commentId={el.commentId} firstname={el.firstname} lastname={el.lastname} profilImg={el.profilImg} created={el.created} updated={el.updated} getAllRespFunc={getAllResponse} likes={el.likes} isLiked={el.likedByUser} />
                            })
                    }
                    {
                        toggleResponses && 
                        <p className='comment__backBtn' onClick={respToggle}>Voir moins</p>                            
                    }
                </>
            }
        </article>
        {
            toggleDeleteCommentModal &&
            <div className="comment__deleteModal">
                <div className="comment__deleteModal__modal">
                    <h3>Voulez vous supprimer ce commentaire ?</h3>
                    <div className="comment__deleteModal__modal__btnCont">
                        <button onClick={tryToDeleteComment}>Supprimer</button>
                        <button onClick={deleteCommentModalToggle}>Annuler</button>
                    </div>
                </div>
            </div>
        }
        </>
    );
};

export default Comment;