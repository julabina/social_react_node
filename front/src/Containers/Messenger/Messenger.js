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
    const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);
    const [logged, setLogged] = useState(false);
    const [reload, setReload] = useState(false);
    const [paramsLoad, setParamsLoad] = useState(false);
    const [logStatus, setLogStatus] = useState(false);
    const [friendInfos, setFriendInfos] = useState({})

   /*  useEffect(() => {
        
        if (logged !== true) {
            checkIfLogged();
        }

        let TETEST = test();
        
        socket.on('SERVER_MSG', ({content, from}) => {

            for (let i = 0; i < friends.length; i++) {
                
                const friend = friends[i];

                console.log('//////////////////////////////////////');
                console.log(selectedUser);
                console.log(content);
                console.log(friend);
                console.log('//////////////////////////////////////');

                if (friend.id === content.userId) {
                    console.log('CESOKDECECOTE');
                    if(content.userId === selectedUser.userId) {

                        let newArr = [
                            ...messages,
                            content
                        ];
                        setMessages(newArr);
                        break;
                    }

                     if(friend.userId !== selectedUser.userId) {
                        console.log('OPTION2');
                    } 
                    break;
                }
                
            } 
            console.log(selectedUser);
            console.log(TETEST);
            console.log('------------------------------');

            console.log('TESTESTESTESTE', content);
  
            let goodSocket = "";
            if(selectedUser.userId === content.userId) {
                goodSocket = selectedUser.socketid;
            } else {
                goodSocket = "";
            }
            console.log('//////////////////////////////////////');
            console.log(selectedUser.userId);
            console.log(selectedUser.socketid);
            console.log(goodSocket);
            console.log(from);
            console.log('//////////////////////////////////////');
            console.log('----------------------------------------------');
            console.log(selectedUser.userId);
            console.log(content.userId);
            console.log('----------------------------------------------');

            console.log(messages);
            
            if(goodSocket === from) {
                let newArr = [
                    ...messages,
                    content
                ];
                console.log('1');
                setMessages(newArr);
                
            } else if ((content.userId === selectedUser.userId) && selectedUser.userId !== "") {
                console.log('2');
                const item = {
                    ...selectedUser,
                    socketid: from
                }
                setSelectedUser(item);
                let newArr = [
                    ...messages,
                    content
                ];
                
                setMessages(newArr);
                
            } else {

                console.log('3');
                if ((content.userId !== selectedUser.userId) && selectedUser.userId !== "") {
                    const userIndex = users.findIndex(el => el.userId === content.userId);
                    console.log('4');
                    
                    let arrUsers = users;
                    arrUsers[userIndex] = {
                        ...arrUsers[userIndex],
                        newMessage: true
                    }
                    
                    setUsers(arrUsers);
                    reload();
                }
                console.log('3.1');
            }
            console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'); 
        }); 
        
        socket.on('server_newUser_response', data => {
            setUsers(data);
        });

        console.log('7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777');
    },[socket, selectedUser]);, users, selectedUser, messages */
    
    useEffect(() => {
        
        if (logged !== true) {
            checkIfLogged();
        }

        socket.on('SERVER_MSG', ({content, from}) => {
            let newArr = [];
            newArr.push(content);
            newArr.push(from);
            setJustReceived(newArr);
        })
        
        socket.on('server_newUser_response', data => {
            setUsers(data);
        });
        
    },[socket])

        
    useEffect(() => {
        
        if (paramsLoad === false) {
            if(params.id) {
                console.log(users);
                console.log(friends);
                if (friends.length > 0 && users.length > 0) {
                    let selected = false;
                    const paramFriend = friends.find(el => el.id === params.id);  
                    for (let i = 0; i < users.length; i++) {
                        if (users[i].userId === params.id) { 
                            setParamsLoad(true);
                            console.log("1");
                            changeSelectedUser(params.id, users[i].socketID, paramFriend.chatId )
                            selected = true;
                            break;
                        } 
                    }
                    if (selected === false) {
                        setParamsLoad(true);
                        changeSelectedUser(params.id, "", paramFriend.chatId )
                    }
                }
            } else {
                setParamsLoad(true);
            }
        }
        
    },[friends, users])
    
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
                
                console.log('3');
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
        
    },[justReceived])

    useEffect(() => {
        let messagesContainer = document.querySelector('.messenger__container');

        if (messagesContainer !== null) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, [messages])

    const reloading = () => {
        setReload(!reload);
    }

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
                setLogStatus(true);
                /* getRole(newUserObj.id, newUserObj.token);
                getAllPosts(newUserObj.id);
                connectToSocket(newUserObj.id); */
            } else {
                // DISCONNECT
                localStorage.removeItem('token');
                navigate('/connexion', { replace: true });
            };
        } else {
            // DISCONNECT
            navigate('/connexion', { replace: true });
        }; 
    }

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
                    }
                    
                    const username = item.firstname + " " + item.lastname;
                    socket.emit('newUser', { username, userId: id, socketID: socket.id });

                    setUserInfos(item);
                });
        }
    }

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
    }

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
                        console.log(data.data[i]);
                    }
                    setFriends(newArr);
                }
            })
    }

    /* const connectToSocket = (username) => {
        setUsernameAlreadySelected(true);
        socket.auth = { username };
        socket.connect(); 

        socket.emit('newUser', { username, socketID: socket.id });

        socket.on("connect_error", (err) => {
            if (err.message === "invalid username") {
                setUsernameAlreadySelected(false);
                socket.off("connect_error");
                  
            }
            });
    } */

    /* socket.on('SERVER_MSG', msg => {
        setNewMessage(msg);
    }); */

    /* const setNewMessage = (msg) => {
        let newObj = [
          ...messages,
          msg
        ];
        console.log(newObj);
        setMessages(newObj);
    } */

    /* const sendMessage = () => {

        const msg = {
            username: "Luc",
            content: inputMsg,
            date: Math.floor((new Date()).getTime() / 1000)
        }

        setInputMsg('');

        socket.emit('CLIENT_MSG', msg);
        
    } */

    const checkMessage = () => {
        if (inputMsg !== "" && inputMsg.length < 501) {
            const textWithoutTag = inputMsg.replace(/<\/?[^>]+>/g,'');

            sendMessage(textWithoutTag);
        }
    }

    const sendMessage = (msg) => {

        const fullname = userInfos.firstname + " " + userInfos.lastname;
        const newDate = Math.floor((new Date()).getTime() / 1000);
        console.log(newDate);
        console.log(typeof newDate);
        console.log(new Date())

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
    }

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
                console.log(data);
            })
    }

    const ctrlInputMsg = (value) => {
        setInputMsg(value);
    }

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
        }

        getMessages(chatId);
        getFriendInfos(userId, user.token);
    }

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
                            date: Math.floor((new Date(data.data[i].createdAt)).getTime() / 1000) ,
                            content: data.data[i].content,
                            username: data.data[i].username
                        }
                        newArr.push(item);
                    }
                    newArr.sort((a, b) => new Date(a.date) - new Date(b.date));
                }
                setMessages(newArr);
            })
    }
    
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
            <section className="messenger__friendsList">
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
                        /* return  <p onClick={() => changeSelectedUser(el.id, socketId, el.chatId)} style={{color: color}} key={el.id}>{status} :{el.id}{newMsg}</p> */
                        {/* <a key={el.socketID} href="#">{el.username} {el.socketID}</a> */}
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
                        <button onClick={() => checkMessage()}>Envoyé</button>
                    </div>
                </section>
        </main>
        </>
    );
};

export default Messenger;