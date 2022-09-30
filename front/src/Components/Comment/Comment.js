import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import Response from '../Response/Response';

const Comment = (props) => {

    const [toggleResponse, setToggleResponse] = useState(false);
    const [toggleResponses, setToggleResponses] = useState(false);
    const [responseText, setResponseText] = useState("");
    const [responseCount, setResponseCount] = useState(0);
    const [responses, setResponses] = useState([]);

    useEffect(() => {
        getAllResponse();
    },[])

    const responseToggle = () => {
        setToggleResponse(!toggleResponse);
    }

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
    }

    const getAllResponse = () => {
        fetch('http://localhost:3000/api/comments/findResponse/' + props.id)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if(data.data) {
                    let newArr = [];

                    for (let i = 0; i < data.data.length; i++) {
                        let item = {
                            id: data.data[i].id,
                            content: data.data[i].content,
                            userId: data.data[i].userId,
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
    }

    const ctrlResponse = (value) => {
        setResponseText(value);
    }

    const sendResponse = () => {
        if (responseText !== "" && responseText.length < 300) {
            const responseWithoutTag = responseText.replace(/<\/?[^>]+>/g,'');

            fetch('http://localhost:3000/api/comments/new', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + props.user.token
                },
                method: 'POST', 
                body: JSON.stringify({content: responseWithoutTag, postId: props.id, commentId: props.id})
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    if (data.success === true) {
                        getAllResponse();
                        respToggle(true);
                        responseToggle();
                        setResponseText('');
                    }
                })
        }
    }

    const respToggle = (isNew = false) => {
        if (isNew === true) {
            return setToggleResponses(true);
        }
        setToggleResponses(!toggleResponses);
    }

    return (
        <article className='comment'>
            <div className="comment__top">
                <div className="comment__top__profilCont">
                    { props.profilImg !== null ? <img src="" alt="" /> : <FontAwesomeIcon icon={faUser} className="comment__top__profilCont__user" />}
                </div>
                <div className={props.userId === props.user.id ? "comment__top__bubble comment__top__bubble--me" : "comment__top__bubble"}></div>
                <p className={props.userId === props.user.id ? "comment__top__content comment__top__content--me" : "comment__top__content"}>{props.content}</p>
            </div>
            <div className="comment__bot">
                <p className='comment__bot__link'>Like</p>
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
                                return <Response id={el.id} key={el.id} content={el.content} user={props.user} userId={el.userId} time={el.time} commentId={el.commentId} firstname={el.firstname} lastname={el.lastname} profilImg={el.profilImg} created={el.created} updated={el.updated}/>
                            })
                    }
                    {
                        toggleResponses && 
                        <p onClick={respToggle}>Voir moins</p>                            
                    }
                </>
            }
        </article>
    );
};

export default Comment;