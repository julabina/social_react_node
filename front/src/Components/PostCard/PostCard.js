import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faThumbsUp, faComments, faShare } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import ImageUploading from 'react-images-uploading';

const PostCard = (props) => {

    const [timeBetween, setTimeBetween] = useState("");
    const [currentImage, setCurrentImage] = useState(props.picture);
    const [textArticle, setTextArticle] = useState(props.content);
    const [toggleMenu, setToggleMenu] = useState(false);
    const [toggleDeleteModal, setToggleDeleteModal] = useState(false);
    const [toggleModify, setToggleModify] = useState(false);
    const [image, setImage] = React.useState([]);

    useEffect(() => {
        const currentDate = new Date();
        const createdDate = new Date(props.created);
        
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

        setTimeBetween(diffDisplay);
    },[])

    const menuToggle = () => {
        setToggleMenu(!toggleMenu);
    }
    
    const modifyToggle = () => {
        if(toggleMenu) {
            menuToggle();
        }

        setToggleModify(!toggleModify);
    }

    const toggleDelete = () => {
        if(toggleMenu) {
            menuToggle();
        }
        setToggleDeleteModal(!toggleDeleteModal);
    }

    const tryToDeletePost = () => {
        fetch('http://localhost:3000/api/posts/delete/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'DELETE'
        })
            .then(res => {
                if (res.status === 200) {
                    props.loadAfterFunc();
                }
            })
    
    }

    const ctrlText = (value) => {
        setTextArticle(value);
    }

    const imgChange = (imageList, addUpdateIndex) => {
        setImage(imageList);
    }

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
            if (textArticle.length < 10 || textArticle.length > 500) {
                errorP.textContent = '- La longueur du contenu doit être compris entre 10 et 500 caractères.'; 
                return errorCont.append(errorP);
            }
        }
        
        errorCont.append(errorP);

        const textWithoutTag = textArticle.replace(/<\/?[^>]+>/g,'');

        tryToModifyPost(textWithoutTag);
    }

    const tryToModifyPost = (text) => {

        let formData = new FormData();
        
        formData.append('text', JSON.stringify(text));
        formData.append('userId', JSON.stringify(props.userId));
        
        if (image.length !== 0) {
            const img = image[0].file;
            formData.append('image', img, img.name);
        }
        console.log(formData);

        fetch('http://localhost:3000/api/posts/modify/' + props.id, {
            headers: {
                "Authorization": "Bearer " + props.user.token
            },
            method: 'PUT',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            modifyToggle();
            setImage([]);
            getCurrentImg();
        })
    }
    
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
    }

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
    }
    
    return (
        <>
        <article className="postArticle">
            <div className="postArticle__top">
                <div className='postArticle__top__infos'>
                    <div className="postArticle__top__infos__imgCont">
                        { props.profilImg !== null ? <img src="" alt="" /> : <FontAwesomeIcon icon={faUser} className="postArticle__top__infos__imgCont__user" />}
                    </div>
                    <div className='postArticle__top__infos__nameCont'>
                        <p className='postArticle__top__infos__nameCont__name'>{props.firstname} {props.lastname}</p>
                        <p className='postArticle__top__infos__nameCont__time'>{timeBetween}</p>
                    </div>
                </div>
                <FontAwesomeIcon onClick={menuToggle} icon={faEllipsis} className="postArticle__top__menu" />
                {
                    toggleMenu &&
                    <div className="postArticle__top__menu__cont">
                        <ul>
                            {
                                props.userId === props.user.id
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
                <div className="postArticle__btns__cont">
                    <div className="postArticle__btns__cont__iconCont">
                        <FontAwesomeIcon icon={faThumbsUp} className="postArticle__btns__cont__iconCont__icon" />
                    </div>
                    <p>Like</p>
                </div>
                <div className="postArticle__btns__cont">
                    <div className="postArticle__btns__cont__icon">
                        <FontAwesomeIcon icon={faComments} className="postArticle__btns__cont__iconCont__icon" />
                    </div>
                    <p>Commentaires</p>
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
                <div className="postArticle__comments__commentsContainer">

                </div>
                <p className='postArticle__comments__loadAll'></p>
                <div className="postArticl__comments__createForm">
                    <input type="text" placeholder="Ajouter un commentaire" />
                </div>
            </div>
        </article>
        {
            toggleDeleteModal &&
            <div className="postArticle__deleteModal">
                <div className="postArticle__deleteModal__modal">
                    <h2>Voulez vous vraiment supprimer ce post</h2>
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