import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { decodeToken, isExpired } from 'react-jwt';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-regular-svg-icons';
import Header from '../../Components/Header/Header';
import Message from '../../Components/Message/Message';
import socket from "../../socket";
import { Helmet } from 'react-helmet';

const Messenger = () => {

    const params = useParams();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [user, setUser] = useState({ id: '', token: '' });
    const [justReceived, setJustReceived] = useState([]);
    const [selectedUser, setSelectedUser] = useState({ userId: "", socketid: "", chatId : "" });
    const [users, setUsers] = useState([]);
    const [friends, setFriends] = useState([]);
    const [userInfos, setUserInfos] = useState({ firstname: '', lastname: '' });
    const [logged, setLogged] = useState(false);
    const [reload, setReload] = useState(false);
    const [paramsLoad, setParamsLoad] = useState(false);
    const [friendInfos, setFriendInfos] = useState({});
    const [friendListBtn, setFriendListBtn] = useState('Afficher amis');

    /**
     * listen socket
     */
    useEffect(() => {
        
        if (logged !== true) {
            checkIfLogged();
        }

        socket.on('SERVER_MSG', ({content, from}) => {
            let newArr = [];
            newArr.push(content);
            newArr.push(from);
            setJustReceived(newArr);
        });
        
        socket.on('server_newUser_response', data => {
            setUsers(data);
        });
        
    },[socket]);

     /**
      *  listen users change
      */   
    useEffect(() => {
        
        if (paramsLoad === false) {
            if(params.id) {

                if (friends.length > 0 && users.length > 0) {
                    let selected = false;
                    const paramFriend = friends.find(el => el.id === params.id);  

                    for (let i = 0; i < users.length; i++) {
                        if (users[i].userId === params.id) { 
                            setParamsLoad(true);
                            changeSelectedUser(params.id, users[i].socketID, paramFriend.chatId );
                            selected = true;
                            break;
                        } 
                    }
                    if (selected === false) {
                        setParamsLoad(true);
                        changeSelectedUser(params.id, "", paramFriend.chatId );
                    }
                }
            } else {
                setParamsLoad(true);
            }
        }
        
    },[friends, users]);
    
    /**
     * handle new received message
     */
    useEffect(() => {

        if(justReceived.length > 0) {
            
            let newArr = [
                ...messages,
                justReceived[0]
            ];
            
            if(selectedUser.socketid === justReceived[1]) {
                setMessages(newArr);
                
            } else if ((justReceived[0].userId === selectedUser.userId) && selectedUser.userId !== "") {
                const item = {
                    ...selectedUser,
                    socketid: justReceived[1]
                }
                setSelectedUser(item);
                
                setMessages(newArr);
                
            } else {
                
                if ((justReceived[0].userId !== selectedUser.userId)) {
                    const userIndex = users.findIndex(el => el.userId === justReceived[0].userId);
                    
                    let arrUsers = users;
                    arrUsers[userIndex] = {
                        ...arrUsers[userIndex],
                        newMessage: true
                    }
                    
                    setUsers(arrUsers);
                    reloading();
                }
            }
        }
        
    },[justReceived]);

    /**
     * handle auto-scroll
     */
    useEffect(() => {
        let messagesContainer = document.querySelector('.messenger__container');

        if (messagesContainer !== null) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, [messages])

    /**
     * simple state reloader
     */
    const reloading = () => {
        setReload(!reload);
    }

    /**
     * check if user is logged
     * 
     * @returns 
     */
    const checkIfLogged = () => {
        if (localStorage.getItem('token') !== null) {
            let getToken = localStorage.getItem('token');
            let token = JSON.parse(getToken);
            if (token !== null) {
                let decodedToken = decodeToken(token.version);
                let isTokenExpired = isExpired(token.version);
                if (decodedToken.userId !== token.content || isTokenExpired === true) {
                    // DISCONNECT
                    localStorage.removeItem('token');
                    return navigate('/connexion', { replace: true });
                };
                const newUserObj = {
                    token: token.version,
                    id: decodedToken.userId,
                };
                setUser(newUserObj);
                setLogged(true);
                getUserInfos(newUserObj.id, newUserObj.token);
                getAllFriends(newUserObj.id, newUserObj.token);

            } else {
                // DISCONNECT
                localStorage.removeItem('token');
                navigate('/connexion', { replace: true });
            };
        } else {
            // DISCONNECT
            navigate('/connexion', { replace: true });
        }; 
    };

    /**
     * get user infos
     * 
     * @param {*} id 
     * @param {*} token 
     */
    const getUserInfos = (id, token) => {

        if(id !== "" && id !== undefined) {
            fetch('http://localhost:3000/api/users/getUserInfos/' + id, {
                headers: {
                    "Authorization": "Bearer " + token
                },
                method: 'GET'
            })
                .then(res => res.json())
                .then(data => {
                    let item = {
                        userId: data.data.userId,
                        firstname: data.data.firstname,
                        lastname: data.data.lastname,
                        profilImg: data.data.profilImg,
                    };
                    
                    const username = item.firstname + " " + item.lastname;
                    socket.emit('newUser', { username, userId: id, socketID: socket.id });

                    setUserInfos(item);
                });
        }
    };

    /**
     * get friend infos
     * 
     * @param {*} id 
     * @param {*} token 
     */
    const getFriendInfos = (id, token) => {

        if(id !== "" && id !== undefined) {
            fetch('http://localhost:3000/api/users/getUserInfos/' + id, {
                headers: {
                    "Authorization": "Bearer " + token
                },
                method: 'GET'
            })
                .then(res => res.json())
                .then(data => {
                    let item = {
                        userId: data.data.userId,
                        firstname: data.data.firstname,
                        lastname: data.data.lastname,
                        profilImg: data.data.profilImg,
                    }
                    
                    const username = item.firstname + " " + item.lastname;

                    setFriendInfos(item);
                });
        }
    };

    /**
     * get all friends
     * 
     * @param {*} userId 
     * @param {*} token 
     */
    const getAllFriends = (userId, token) => {

        fetch('http://localhost:3000/api/friends/getFriends/' + userId, {
            headers: {
                "Authorization": "Bearer " + token
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                if (data.data !== undefined && data.data) {
                    let newArr = [];
                    for (let i = 0; i < data.data.length; i++) {
                        let item = {
                            id: data.data[i].userId,
                            chatId: data.data[i].chatId,
                            fullname: data.data[i].User.User_info.firstname + " " + data.data[i].User.User_info.lastname,
                            profilImg: data.data[i].User.User_info.profilImg
                        }
                        newArr.push(item);
                    }
                    setFriends(newArr);
                }
            })
    };

    /**
     * replace tag if exist and send message
     */
    const checkMessage = () => {
        if (inputMsg !== "" && inputMsg.length < 501) {
            const textWithoutTag = inputMsg.replace(/<\/?[^>]+>/g,'');

            sendMessage(textWithoutTag);
        }
    };

    /**
     * send message to server socket
     * 
     * @param {*} msg 
     */
    const sendMessage = (msg) => {

        const fullname = userInfos.firstname + " " + userInfos.lastname;
        const newDate = Math.floor((new Date()).getTime() / 1000);

        socket.emit('CLIENT_MSG', {
            content: {
                username: fullname,
                content: msg,
                userId: user.id,
                date: newDate,
                socketID: socket.id
            },
            to: selectedUser.socketid
        });
        setInputMsg("");
        
        const newArr = [
            ...messages,
            {
                username: fullname,
                content: msg,
                date: newDate,
            }
        ];
        saveMessage(msg, fullname);
        setMessages(newArr);
    };

    /**
     * save message to database
     * 
     * @param {*} content 
     * @param {*} fullname 
     */
    const saveMessage = (content, fullname) => {

        fetch('http://localhost:3000/api/messages/create/' + selectedUser.chatId, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + user.token
            },
            method: 'POST', 
            body: JSON.stringify({ content: content, userId: user.id, username: fullname })
        })
            .then(res => res.json())
            .then(data => {
                
            })
    };

    /**
     * control input message
     * 
     * @param {*} value 
     */
    const ctrlInputMsg = (value) => {
        setInputMsg(value);
    };

    /**
     * change selected user
     * 
     * @param {*} userId 
     * @param {*} socketId 
     * @param {*} chatId 
     */
    const changeSelectedUser = (userId, socketId, chatId) => {

        setMessages([]);

        const newObj = {
            userId: userId,
            socketid: socketId,
            chatId: chatId
        };
        
        setSelectedUser(newObj);
        
        const userIndex = users.findIndex(el => el.userId === userId);
    
        const arrUsers = users;
        arrUsers[userIndex] = {
            ...arrUsers[userIndex],
            newMessage: false
        };

        getMessages(chatId);
        getFriendInfos(userId, user.token);
    };

    /**
     * get all messages for one friend
     * 
     * @param {*} chatId 
     */
    const getMessages = (chatId) => {
       
        fetch('http://localhost:3000/api/messages/getMessages/' + chatId, {
            headers: {
                "Authorization": "Bearer " + user.token
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                let newArr = [];
                
                if(data.data) {
                   
                    for (let i = 0; i < data.data.length; i++) {
                        const item = {
                            date: Math.floor((new Date(data.data[i].createdAt)).getTime() / 1000),
                            content: data.data[i].content,
                            username: data.data[i].username
                        }
                        newArr.push(item);
                    }
                    newArr.sort((a, b) => new Date(a.date) - new Date(b.date));
                }
                setMessages(newArr);
            })
    };

    /**
     * toggle the friends list for tablet and low version
     */
    const toggleFriendList = () => {
        const friendList = document.querySelector('.messenger__friendsList');

        if (friendList.classList.contains('messenger__friendsList--hide')) {
            friendList.classList.remove('messenger__friendsList--hide');
            setFriendListBtn('Cacher amis');
        } else {
            friendList.classList.add('messenger__friendsList--hide');
            setFriendListBtn('Afficher amis');
        }
    };
    
    return (
        <>
        <Helmet>
            <title>Groupomania - Messagerie</title>
            <meta name="title" content="Groupomania - Messagerie" />
            <meta
            name="description"
            content="Restez en contact avec vos amis grace à la messagerie de Groupomania."
            />
        </Helmet>
        <Header user={user} />
        <main className='messenger'>
            <button className='messenger__friendToggleBtn' onClick={toggleFriendList}>{friendListBtn}</button>
            <section className="messenger__friendsList messenger__friendsList--hide">
                {
                    friends.length === 0 ?
                    <p className='messenger__friendsList__noFriend'>Pas encore d'amis</p>
                    :
                    friends.map(el => {
                        let status = "Hors ligne";
                        let socketId = "";
                        let newMsg = "";

                        users.forEach(ele => {
                            if(ele.userId === el.id) {
                                status = "En ligne";
                                socketId = ele.socketID;
                                if (ele.newMessage && ele.newMessage === true) {
                                    newMsg = "Nouveau message"
                                }
                            }
                        });

                        let color = "#4e5166";
                        if (el.id === selectedUser.userId) {
                            color = "#fd2d01";
                        }

                        return <div key={el.id} onClick={() => changeSelectedUser(el.id, socketId, el.chatId)} className="messenger__friendsList__friend">
                            <div className='messenger__friendsList__friend__profil'>
                                <div className="messenger__friendsList__friend__profil__imgCont">
                                {
                                    el.profilImg !== null ? <img src={el.profilImg} alt="" /> : <FontAwesomeIcon icon={faUser} className="header__btns__btn__user" />
                                }
                                </div>
                                <p className='messenger__friendsList__friend__profil__fullname' style={{color: color}}>{el.fullname}</p>
                            </div>
                            {
                                status === "En ligne" ?
                                <div className='messenger__friendsList__friend__statusCont'>
                                    <div className='messenger__friendsList__friend__statusCont__status'></div><p>{status}</p>
                                </div>
                                :
                                <div className='messenger__friendsList__friend__statusCont'>
                                    <div className='messenger__friendsList__friend__statusCont__status messenger__friendsList__friend__statusCont__status--off'></div><p>{status}</p>
                                </div>
                            }
                            <div className='messenger__friendsList__friend__statusCont'>
                                <p>{newMsg}</p>
                            </div>
                        </div>  
                        
                    })
            }
            </section>
            <section className="messenger__userSelected">
                {
                    selectedUser.userId !== "" &&
                        <a href={"/profil_=" + friendInfos.userId}><div className='messenger__userSelected__user'>
                            <div className="messenger__userSelected__user__imgCont">
                            {
                                friendInfos.profilImg !== null ? <img src={friendInfos.profilImg} alt="" /> : <FontAwesomeIcon icon={faUser} className="header__btns__btn__user" />
                            }
                            </div>
                            <p>{friendInfos.firstname} {friendInfos.lastname}</p>
                        </div></a>
                    
                }
            </section>
                <section className='messenger__container'>
                    <div className='messenger__container__messages'>
                    {
                        (friends.length > 0 && selectedUser.userId !== "") &&
                        messages.map(el => {
                            let msgUsername = el.username;
                            let loggedUser = false;
                            const loggedUserUsername = userInfos.firstname + " " + userInfos.lastname;

                            if (el.username === loggedUserUsername) {
                                msgUsername = "Moi";
                                loggedUser = true;
                            }

                            return <Message key={(el.date).toString() + Math.random(1,10000)} content={el.content} date={el.date} username={msgUsername} isLoggedUser={loggedUser} />
                        })
                    }
                    </div>
                    <div className="messenger__container__form">
                        <input onInput={(e) => ctrlInputMsg(e.target.value)} value={inputMsg} type="text" placeholder='Votre message ...' />
                        <button onClick={() => checkMessage()}>Envoyer</button>
                    </div>
                </section>
        </main>
        </>
    );
};

export default Messenger;