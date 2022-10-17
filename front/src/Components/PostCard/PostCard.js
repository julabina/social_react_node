import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faThumbsUp, faComments, faShare } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import ImageUploading from 'react-images-uploading';
import CommentForm from '../CommentForm/CommentForm';
import Comment from '../Comment/Comment';

const PostCard = (props) => {

    const [timeBetween, setTimeBetween] = useState("");
    const [currentImage, setCurrentImage] = useState(props.picture);
    const [textArticle, setTextArticle] = useState(props.content);
    const [toggleMenu, setToggleMenu] = useState(false);
    const [toggleDeleteModal, setToggleDeleteModal] = useState(false);
    const [toggleModify, setToggleModify] = useState(false);
    const [image, setImage] = React.useState([]);
    const [commentShowToggle, setCommentShowToggle] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentCount, setCommentCount] = useState(0);
    const [isLiked, setIsLiked] = useState(props.likedByUser);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const timeBetween = calculTimeBetween(props.created);

        setTimeBetween(timeBetween);
        getAllComments();

        if(props.isAdmin && (typeof props.isAdmin === "boolean")) {
            setIsAdmin(props.isAdmin);
        }
    },[]);

    /**
     * calcul time between created date and current date
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
     * toggle the post menu
     */
    const menuToggle = () => {
        setToggleMenu(!toggleMenu);
    };
    
    /**
     * toggle content and modify form for modify one post
     */
    const modifyToggle = () => {
        if(toggleMenu) {
            menuToggle();
        }

        setToggleModify(!toggleModify);
    };

    /**
     * toggle delete modal
     */
    const toggleDelete = () => {
        if(toggleMenu) {
            menuToggle();
        }
        setToggleDeleteModal(!toggleDeleteModal);
    };

    /**
     * try to delete one post
     */
    const tryToDeletePost = () => {

        fetch('http://localhost:3000/api/posts/delete/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'DELETE'
        })
            .then(res => {
                if (res.status === 200) {
                    console.log(props.user.id, props.user.token);
                    props.loadAfterFunc(props.user.id, props.user.token);
                }
            })
    };

    /**
     * control adding content form input for creating post
     * 
     * @param {*} value 
     */
    const ctrlText = (value) => {
        setTextArticle(value);
    };

    /**
     * adding image to image state
     * 
     * @param {*} imageList 
     * @param {*} addUpdateIndex 
     */
    const imgChange = (imageList, addUpdateIndex) => {
        setImage(imageList);
    };

    /**
     * check if form is ok
     * 
     * @returns 
     */
    const checkModifiedPost = () => {
        const errorCont = document.querySelector('.postArticle__content__errorEdit');
        errorCont.innerHTML = "";
        let errorP = document.createElement('p');
        errorP.textContent = "";

        if (textArticle === "" && (image.length === 0 && !currentImage)) {
            errorP.textContent = '- Impossible de modifier ce post, aucun contenu ajouté.'; 
            return errorCont.append(errorP);
        }
        
        if (textArticle !== "") {   
            if (textArticle.length > 500) {
                errorP.textContent = '- La longueur du contenu ne doit pas dépasser 500 caractères.'; 
                return errorCont.append(errorP);
            }
        }
        
        errorCont.append(errorP);

        const textWithoutTag = textArticle.replace(/<\/?[^>]+>/g,'');

        tryToModifyPost(textWithoutTag);
    };

    /**
     * try to modify one post
     * 
     * @param {*} text 
     */
    const tryToModifyPost = (text) => {

        let formData = new FormData();
        
        formData.append('text', JSON.stringify(text));
        formData.append('userId', JSON.stringify(props.userId));
        
        if (image.length !== 0) {
            const img = image[0].file;
            formData.append('image', img, img.name);
        }

        fetch('http://localhost:3000/api/posts/modify/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'PUT',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                modifyToggle();
                setImage([]);
                getCurrentImg();
                props.loadAfterFunc(props.user.id, props.user.token);
            })
    };
    
    /**
     * delete current post image
     */
    const deleteCurrentImg = () => {
            
        fetch('http://localhost:3000/api/posts/deleteImg/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'PUT'
        })
        .then(res => res.json())
        .then(data => {
            setImage([]);
            getCurrentImg();
        })
    };

    /**
     * get current image
     */
    const getCurrentImg = () => {
        fetch('http://localhost:3000/api/posts/picture/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                setCurrentImage(data.data);
            })
    };

    /**
     * get all comments for one post
     */
    const getAllComments = () => {
        fetch('http://localhost:3000/api/comments/findAll/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                if (data.data) {  
                    let newArr = [];
                    if (data.data && data.data !== undefined) {
                        for (let i = 0; i < data.data.length; i++) {
                            let liked = false;

                            if(data.data[i].usersLiked.includes(props.user.id)) {
                                liked = true;
                            }

                            if (data.data[i].commentId === null) {
                                let item = {
                                    id: data.data[i].id,
                                    content: data.data[i].content,
                                    postId: data.data[i].postId,
                                    userId: data.data[i].userId,
                                    likedByUser: liked,
                                    likes: data.data[i].likes,
                                    firstname: data.data[i].User.User_info.firstname,
                                    lastname: data.data[i].User.User_info.lastname,
                                    profilImg: data.data[i].User.User_info.profilImg,
                                    time: calculTimeBetween(data.data[i].createdAt),
                                    created: data.data[i].createdAt,
                                    updated: data.data[i].updatedAt,
                                };
                                newArr.push(item);
                            }
                        }
                        newArr.sort((a, b) => new Date(b.updated) - new Date(a.updated));
                        
                        setComments(newArr);
                        setCommentCount(data.count);
                    }
                }
            })
    };

    /**
     * toggle display comments
     * 
     * @param {*} isNews 
     * @returns 
     */
    const toggleCommentShow = (isNews) => {

        if (isNews) {
            return setCommentShowToggle(true);
        }

        if (comments.length === 0) {
            getAllComments();
        }
        setCommentShowToggle(!commentShowToggle);
    };
    
    /**
     * handle post likes
     */
    const handleLike = () => {

        fetch('http://localhost:3000/api/posts/addLike/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    setIsLiked(!isLiked);
                    props.loadAfterFunc(props.user.id, props.user.token);
                }
            })

    };

    return (
        <>
        <article className="postArticle">
            <div className="postArticle__top">
                <div className='postArticle__top__infos'>
                    <div className="postArticle__top__infos__imgCont">
                        { props.profilImg !== null ? <img src={props.profilImg} alt={"Photo de profil de " + props.firstname + props.lastname} /> : <FontAwesomeIcon icon={faUser} className="postArticle__top__infos__imgCont__user" />}
                    </div>
                    <div className='postArticle__top__infos__nameCont'>
                        <a href={"/profil_=" + props.userId}><p className='postArticle__top__infos__nameCont__name'>{props.firstname} {props.lastname}</p></a>
                        <p className='postArticle__top__infos__nameCont__time'>{timeBetween}</p>
                    </div>
                </div>
                <FontAwesomeIcon onClick={menuToggle} icon={faEllipsis} className="postArticle__top__menu" />
                {
                    toggleMenu &&
                    <div className="postArticle__top__menu__cont">
                        <ul>
                            {
                                (isAdmin === true || props.userId === props.user.id)
                                &&
                                <>
                                    <li onClick={modifyToggle}>Modifier la publication</li>
                                    <li onClick={toggleDelete}>Supprimer la publication</li>
                                    <li className="postArticle__top__menu__cont__separator"></li>
                                </>
                            }
                            <li>Signaler la publication</li>
                        </ul>
                    </div>
                }
            </div>
            <div className="postArticle__content">
                {
                    toggleModify ?
                    <>
                        <div className="postArticle__content__errorEdit"></div>
                        <textarea autoFocus className='postArticle__content__textarea' onInput={(e) => ctrlText(e.target.value)} value={textArticle} placeholder="Exprimez-vous !"></textarea>
                        {   currentImage ?
                            <div className="postArticle__content__editImg">
                                <img src={currentImage} alt="" />
                                <button onClick={deleteCurrentImg}>Supprimer</button>
                            </div>
                            :
                            <ImageUploading
                                value={image}
                                onChange={imgChange}
                            >
                                {({
                                    imageList,
                                    onImageUpload,
                                    onImageRemove,
                                    isDragging,
                                    dragProps,
                                }) => (
                                    <div className="upload__image-wrapper postArticle__content__edit__addImg">
                                        <button
                                        className='postArticle__content__edit__addImg__topBtn'
                                        style={isDragging ? { color: '#fd2d01' } : undefined}
                                        onClick={onImageUpload}
                                        {...dragProps}
                                        >
                                        Cliquer ou Glisser une image ici
                                        </button>
                                        &nbsp;
                                        {imageList.map((image, index) => (
                                            <div key={index} className="image-item postArticle__content__edit__addImg__overview">
                                                <img src={image.dataURL} alt="" width="100" />
                                                <div className="image-item__btn-wrapper postArticle__content__edit__addImg__overview__btnCont">
                                                    <button className='postArticle__content__edit__addImg__overview__btnCont__deleteBtn' onClick={() => onImageRemove(index)}>Supprimer l'image</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ImageUploading>
                        }
                        <div className="postArticle__content__btnCont">
                            <button onClick={checkModifiedPost}>Modifier</button>
                            <button onClick={modifyToggle}>Annuler</button>
                        </div>
                    </>
                    :
                    <>
                        <p>{textArticle}</p>
                        { currentImage !== null && 
                            <div className="postArticle__content__imgCont">
                            <img src={currentImage} alt="photo du post" className="postArticle__content__imgCont__img" />
                            </div>
                        }
                    </>
                }
                <div className="postArticle__separator"></div>
            </div>
            <div className="postArticle__btns">
                <div onClick={handleLike} className={ isLiked === true ? "postArticle__btns__cont postArticle__btns__cont--liked" : "postArticle__btns__cont"}>
                    <div className="postArticle__btns__cont__iconCont">
                        <FontAwesomeIcon icon={faThumbsUp} className="postArticle__btns__cont__iconCont__icon" />
                    </div>
                    <p>Like { props.likes !== 0 && "(" + props.likes + ")" }</p>
                </div>
                <div className="postArticle__btns__cont">
                    <div className="postArticle__btns__cont__icon">
                        <FontAwesomeIcon icon={faComments} className="postArticle__btns__cont__iconCont__icon" />
                    </div>
                    <p onClick={() => toggleCommentShow(false)}>{commentCount} commentaires</p>
                </div>
                <div className="postArticle__btns__cont">
                    <div className="postArticle__btns__cont__icon">
                        <FontAwesomeIcon icon={faShare} className="postArticle__btns__cont__iconCont__icon" />
                    </div>
                    <p>Partager</p>
                </div>
            </div>
            <div className="postArticle__likes"></div>
            <div className="postArticle__comments">
                {
                    commentShowToggle &&
                    <div className="postArticle__comments__commentsContainer">
                        {
                            comments.length !== 0 ?
                            comments.map(el => {
                                return <Comment id={el.id} key={el.id} content={el.content} postId={el.postId} user={props.user} isAdmin={isAdmin} userId={el.userId} commentId={el.commentId} firstname={el.firstname} lastname={el.lastname} profilImg={el.profilImg} timeBetween={el.time} created={el.created} updated={el.updated} getCommentsFunc={getAllComments} toggleCommentFunc={toggleCommentShow} likes={el.likes} isLiked={el.likedByUser} />;
                            })
                            :
                            <p className="postArticle__comments__commentsContainer__nothing">Aucun commentaires</p>
                        }
                    </div>
                }
                {
                    comments.length !== 0 &&
                    
                    commentShowToggle &&
                        <p onClick={() => toggleCommentShow(false)} className='postArticle__comments__loadAll'>Masquer les Commentaires.</p>
                    
                }
                <CommentForm postId={props.id} user={props.user} getCommentsFunc={getAllComments} toggleCommentFunc={toggleCommentShow} />
            </div>
        </article>
        {
            toggleDeleteModal &&
            <div className="postArticle__deleteModal">
                <div className="postArticle__deleteModal__modal">
                    <h3>Voulez vous vraiment supprimer ce post</h3>
                    <p className='postArticle__deleteModal__modal__alert'>Cette action est définitive !</p>
                    <div className="postArticle__deleteModal__modal__btnCont">
                        <button onClick={tryToDeletePost}>Supprimer</button>
                        <button onClick={toggleDelete}>Annuler</button>
                    </div>
                </div>
            </div>
        }
        </>
    );
};

export default PostCard;