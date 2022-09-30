import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';

const Response = (props) => {
    return (
        <article className='response'>
            <div className="response__top">
                <div className="response__top__profilCont">
                    { props.profilImg !== null ? <img src="" alt="" /> : <FontAwesomeIcon icon={faUser} className="response__top__profilCont__user" />}
                </div>
                <div className={props.userId === props.user.id ? "response__top__bubble response__top__bubble--me" : "response__top__bubble"}></div>
                <p className={props.userId === props.user.id ? "response__top__content response__top__content--me" : "response__top__content"}>{props.content}</p>
            </div>
            <div className="response__bot">
                <p className='response__bot__link'>Like</p>
                <p className='response__bot__time'>{props.time}</p>
            </div>
        </article>
    );
};

export default Response;