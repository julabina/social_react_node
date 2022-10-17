import React, { useState } from 'react';

const CommentForm = (props) => {

    const [comment, setComment] = useState("");
    
    /**
     * control add comment form input
     * 
     * @param {*} value 
     */
    const ctrlInput = (value) => {
        setComment(value);
    };

    /**
     * add new comment for one post
     */
    const sendComment = () => {
        if (comment !== "" && comment.length < 300) {
            const commentWithoutTag = comment.replace(/<\/?[^>]+>/g,'');

            fetch('http://localhost:3000/api/comments/new', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + props.user.token
                },
                method: 'POST', 
                body: JSON.stringify({content: commentWithoutTag, postId: props.postId})
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success === true) {
                        props.getCommentsFunc();
                        props.toggleCommentFunc(true);
                        setComment('');
                    }
                })
        }
    };

    return (
        <div className="postArticle__comments__createForm">
            <input type="text" onInput={(e) => ctrlInput(e.target.value)} value={comment} placeholder="Ajouter un commentaire" />
            <button onClick={sendComment}>Envoyer</button>
        </div>
    );
};

export default CommentForm;