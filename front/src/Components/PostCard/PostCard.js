import React from 'react';

const PostCard = (props) => {
    return (
        <article class="postArticle">
            <h2>{props.title}</h2>
            <p>{props.content}</p>
            { props.picture !== null}
        </article>
    );
};

export default PostCard;