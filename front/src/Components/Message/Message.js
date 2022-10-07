import React, { useEffect } from 'react';

const Message = (props) => {
    return (
        <article className='messenger__container__messages__msg'>
            <h2>{props.username}</h2>
            <p className='messenger__container__messages__msg__content'>{props.content}</p>
            <p className="messenger__container__messages__msg__date">Le {new Date(props.date * 1000).toLocaleDateString("fr-FR")} à {new Date(props.date * 1000).toLocaleTimeString("fr-FR")}</p>
        </article>
    );
};

export default Message;