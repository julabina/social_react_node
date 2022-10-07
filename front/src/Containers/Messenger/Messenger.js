import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeToken, isExpired } from 'react-jwt';
import Header from '../../Components/Header/Header';
import Message from '../../Components/Message/Message';
import socket from "../../socket";

const Messenger = () => {

    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [user, setUser] = useState({ id: '', token: '' });
    const [selectedUser, setSelectedUser] = useState({ userId: "", socketId: "" });
    const [users, setUsers] = useState([]);
    const [friends, setFriends] = useState([]);
    const [userInfos, setUserInfos] = useState({ firstname: '', lastname: '' });
    const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);
    const [logged, setLogged] = useState(false);

    useEffect(() => {
        
        if (logged !== true) {
            console.log('111111111111111');
            checkIfLogged();
        }

        socket.on('SERVER_MSG', ({content, from}) => {
            console.log(from);
            console.log(selectedUser.socketId);
            if(selectedUser.socketId === from) {
   
                let newArr = [
                    ...messages,
                    content
                ];
                
                setMessages(newArr);
                console.log('OK');
            } else {
                console.log('NOP');
            }
        });

        socket.on('server_newUser_response', data => {
            setUsers(data);
        });

    },[socket, users]);

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
                getUserInfos(newUserObj.id);
                getAllFriends(newUserObj.id, newUserObj.token);
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

    const getUserInfos = (id) => {
        if(id !== "" && id !== undefined) {
            const url = 'http://localhost:3000/api/users/getUserInfos/' + id;
            fetch(url)
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
                            id: data.data[i].friendTwo
                        }
                        newArr.push(item);
                    }
                    setFriends(newArr);
                }
                console.log(data);
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
        if (inputMsg !== "") {
            sendMessage(inputMsg);
        }
    }

    const sendMessage = (msg) => {
console.log(selectedUser.socketId);
        socket.emit('CLIENT_MSG', {
            content: {
                username: userInfos.firstname + " " + userInfos.lastname,
                content: msg,
                date: Math.floor((new Date()).getTime() / 1000),
                socketID: socket.id
            },
            to: selectedUser.socketId
        });
        setInputMsg("");
        
        const newArr = [
            ...messages,
            {
                username: userInfos.firstname + " " + userInfos.lastname,
                content: msg,
                date: Math.floor((new Date()).getTime() / 1000),
            }
        ];
        setMessages(newArr);
    }

    const ctrlInputMsg = (value) => {
        setInputMsg(value);
    }

    const changeSelectedUser = (userId, socketId) => {

        const newObj = {
            userId: userId,
            socketId: socketId
        };

        setSelectedUser(newObj);
    }
    
    return (
        <>
        <Header />
        <main className='messenger'>
            <div className="messenger__friendsList">
                {
                    friends.map(el => {
                        let status = "Hors ligne";
                        let socketId = ""

                        users.forEach(ele => {
                            if(ele.userId === el.id) {
                                status = "En ligne";
                                socketId = ele.socketID;
                            }
                        });

                        let color = "blue";
                        if (el.id === selectedUser.userId) {
                            color = "green";
                        }

                        return  <p onClick={() => changeSelectedUser(el.id, socketId)} style={{color: color}} key={el.id}>{status} :{el.id}</p>
                        {/* <a key={el.socketID} href="#">{el.username} {el.socketID}</a> */}
                    })
            }
            </div>
            {
                selectedUser.userId !== "" &&
                <section className='messenger__container'>
                    <div className='messenger__container__messages'>
                    {
                        messages.map(el => {
                            return <Message key={(el.date).toString() + Math.random(1,10000)} content={el.content} date={el.date} username={el.username} />
                        })
                    }
                    </div>
                    <div className="messenger__container__form">
                        <input onInput={(e) => ctrlInputMsg(e.target.value)} value={inputMsg} type="text" />
                        <button onClick={() => checkMessage()}>ok</button>
                    </div>
                </section>
            }
        </main>
        </>
    );
};

export default Messenger;