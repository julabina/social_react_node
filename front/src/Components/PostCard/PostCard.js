import React from 'react';

const PostCard = (props) => {
    return (
        <article className="postArticle">
            <h2>{props.title}</h2>
            <p>{props.content}</p>
            { props.picture !== null}
        </article>
    );
};

export default PostCard;