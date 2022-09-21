import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis, faThumbsUp, faComments, faShare } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';

const PostCard = (props) => {

    const [timeBetween, setTimeBetween] = useState("");

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

    return (
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
                <FontAwesomeIcon icon={faEllipsis} className="postArticle__top__menu" />
            </div>
            <div className="postArticle__content">
                <p>{props.content}</p>
                { props.picture !== null}
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
    );
};

export default PostCard;