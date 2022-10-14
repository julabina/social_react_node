import React from 'react';

const Message = (props) => {

    return (
        <article className={props.isLoggedUser ? 'messenger__container__messages__msg messenger__container__messages__msg--logged' : 'messenger__container__messages__msg'}>
            <div className={props.isLoggedUser ? 'messenger__container__messages__msg__cont messenger__container__messages__msg__cont--logged' : 'messenger__container__messages__msg__cont'}>
                <h2>{props.username}</h2>
                <p className='messenger__container__messages__msg__cont__content'>{props.content}</p>
                <p className={props.isLoggedUser ? 'messenger__container__messages__msg__cont__date messenger__container__messages__msg__cont__date--logged' : 'messenger__container__messages__msg__cont__date'}>Le {new Date(props.date * 1000).toLocaleDateString("fr-FR")} à {new Date(props.date * 1000).toLocaleTimeString("fr-FR")}</p>
            </div>
        </article>
    );
};

export default Message;