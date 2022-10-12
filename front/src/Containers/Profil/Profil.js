import React, { useEffect, useState } from 'react';
import Header from "../../Components/Header/Header";
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import PostCard from '../../Components/PostCard/PostCard';
import { decodeToken, isExpired } from 'react-jwt';
import { useNavigate } from 'react-router-dom';
import ImageUploading from 'react-images-uploading';
import Friend from '../../Components/Friend/Friend';

const Profil = () => {

    const params = useParams();
    const navigate = useNavigate();

    const [toggleBaneerForm, setToggleBaneerForm] = useState(false);
    const [toggleEditprofil, setToggleEditProfil] = useState(false);
    const [toggleFriend, setToggleFriend] = useState(false);
    const [toggleProfilImgModal, setToggleProfilImgModal] = useState(false);
    const [toggleFriendDeleteModal, setToggleFriendDeleteModal] = useState(false);
    const [logStatus, setLogStatus] = useState(false);
    const [friendRelation, setFriendRelation] = useState("");
    const [friends, setFriends] = useState([]);
    const [currentUserFriends, setCurrentUserFriends] = useState([]);
    const [userInfos, setUserInfos] = useState({ firstname: "", lastname: "", profilImg : null, profilBaneer: null })
    const [postData, setPostData] = useState([]);
    const [user, setUser] = useState({token : "", id : ""});
    const [image, setImage] = React.useState([]);
    const [imageProfil, setImageProfil] = React.useState([]);
    const [editName, setEditName] = useState({ firstname: "", lastname: "" });
    const [editEmail, setEditEmail] = useState({ email: "", newEmail: "", password: "" });
    const [editPassword, setEditPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    useEffect(() => {

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
                getUserInfo(newUserObj);
                getAllFriends(params.id, newUserObj.token);
                setLogStatus(true);
            } else {
                // DISCONNECT
                localStorage.removeItem('token');
                navigate('/connexion', { replace: true });
            };
        }

    },[])

    const getUserInfo = (userObj) => {

        fetch('http://localhost:3000/api/users/getUserInfos/' + params.id)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                const newObj = {
                    firstname: data.data.firstname,
                    lastname: data.data.lastname,
                    profilImg: data.data.profilImg,
                    profilBaneer: data.data.profilBaneer,
                }
                const newEditObj = {
                    firstname: data.data.firstname,
                    lastname: data.data.lastname,
                }
                setUserInfos(newObj);
                setEditName(newEditObj);
                getUserPost();
                if (userObj.id !== params.id) {   
                    getIsFriend(userObj.token);
                }
            });
    }

    const getUserPost = () => {
        fetch('http://localhost:3000/api/posts/findAllForUser/' + params.id)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                let newArr = [];
                if(data.data !== undefined) {
                    for (let i = 0; i < data.data.length; i++) {
                        if (data.data[i] !== undefined) {
                            let item = {
                                content: data.data[i].content,
                                picture: data.data[i].picture,
                                id: data.data[i].id,
                                userId: data.data[i].userId,
                                created: data.data[i].createdAt,
                                updated: data.data[i].updatedAt,
                            };  
                            newArr.push(item); 
                        }
                    }
                    
                    newArr.sort((a, b) => new Date(b.updated) - new Date(a.updated));
                    
                }
                setPostData(newArr);
            })
    }

    const getIsFriend = (token) => {
        fetch('http://localhost:3000/api/friends/isFriend/' + params.id, {
            headers: {
                "Authorization": "Bearer " + token
            },
            method: 'GET',
        })
            .then(res => res.json())
            .then(data => {
                if (data.status) {
                    setFriendRelation(data.status);
                } 
            })
    }

    const baneerFormToggle = () => {
        setToggleBaneerForm(!toggleBaneerForm);
    }

    const imgChange = (imageList, addUpdateIndex) => {
        setImage(imageList);
    }

    const profilImgChange = (imageList, addUpdateIndex) => {
        setImageProfil(imageList);
    }

    const changeBaneer = () => {
        console.log(image);
        if (image.length !== 0) {
            let formData = new FormData();

            const img = image[0].file;
            formData.append('image', img, img.name);
            console.log(formData);
            
            fetch('http://localhost:3000/api/users/changeBaneer/' + user.id, {
                headers: {
                    "Authorization": "Bearer " + user.token
                },
                method: 'PUT',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if(data.success === true) {
                        baneerFormToggle();
                        getUserInfo(user);
                    }
                })
        }
    }

    const editProfilToggle = () => {
        setToggleEditProfil(!toggleEditprofil);
    }

    const changeTab = (ind) => {
        const tabsContainer = document.querySelectorAll('.profil__edit__form__container');
        const tabs = document.querySelectorAll('.profil__edit__form__tabsCon__tab');
        
        for (let i = 0; i < tabs.length; i++) {
            if(tabs[i].classList.contains('profil__edit__form__tabsCon__tab--active') && i !== ind) {
                tabs[i].classList.remove('profil__edit__form__tabsCon__tab--active');
            }
            if(!tabsContainer[i].classList.contains('profil__edit__form__container--hidden') && i !== ind)  {
                tabsContainer[i].classList.add('profil__edit__form__container--hidden');
            }    
            
            if(i === ind) {
                tabs[i].classList.add('profil__edit__form__tabsCon__tab--active');
                tabsContainer[i].classList.remove('profil__edit__form__container--hidden');
            }
        }

    }

    const ctrlEditInput = (action, value) => {
        if(action === "firstname") {
            const newObj = {
                ...editName,
                firstname: value   
            }
            setEditName(newObj);
        } else if(action === "lastname") {
            const newObj = {
                ...editName,
                lastname: value   
            }
            setEditName(newObj);
        } else if(action === "email") {
            const newObj = {
                ...editEmail,
                email: value   
            }
            setEditEmail(newObj);
        } else if(action === "newEmail") {    
            const newObj = {
                ...editEmail,
                newEmail: value   
            }
            setEditEmail(newObj);
        } else if(action === "emailPassword") {
            const newObj = {
                ...editEmail,
                password: value   
            }
            setEditEmail(newObj);
        } else if(action === "currentPassword") {
            const newObj = {
                ...editPassword,
                currentPassword: value   
            }
            setEditPassword(newObj);
        } else if(action === "newPassword") {
            const newObj = {
                ...editPassword,
                newPassword: value   
            }
            setEditPassword(newObj);
        } else if(action === "confirmPassword") {
            const newObj = {
                ...editPassword,
                confirmPassword: value   
            }
            setEditPassword(newObj);
        }
    }

    const checkNames = () => {
        const errorCont = document.querySelector('.profil__edit__errorCont ');
        errorCont.innerHTML = '';
        let error = "";
        
        if(editName.firstname === "" || editName.lastname === "") {
            return errorCont.innerHTML = `<p>- Tous les champs sont requis.</p>`;
        }

        if(editName.firstname.length < 2 || editName.firstname.length > 26) {
            error += `<p>- Le prenom doit etre compris entre 2 et 25 caractères.</p>`;
        } else if(!editName.firstname.match(/^[a-zA-Zé èà]*$/)) {
            error += `<p>- Le prenom ne doit comporter que des lettres.</p>`;
        }

        if(editName.lastname.length < 2 || editName.lastname.length > 26) {
            error += `<p>- Le prenom doit etre compris entre 2 et 25 caractères.</p>`;
        } else if(!editName.lastname.match(/^[a-zA-Zé èà]*$/)) {
            error += `<p>- Le prenom ne doit comporter que des lettres.</p>`;
        }

        if(error !== "") {
            return errorCont.innerHTML = error;
        }

        modifyNames();
    }

    const checkEditEmail = () => {
        const errorCont = document.querySelector('.profil__edit__errorCont ');
        errorCont.innerHTML = '';
        let error = "";
        
        if (editEmail.email === "" || editEmail.newEmail === "" || editEmail.password === "") {
            return errorCont.innerHTML = `<p>- Tous les champs sont requis.</p>`;
        }
        
        if(editEmail.email ===  editEmail.newEmail) {
            return errorCont.innerHTML = `<p>- Le nouveau email ne doit pas etre identique à l'ancien.</p>`;
        }

        if(!editEmail.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i) || !editEmail.newEmail.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i)) {
            error = `<p>- Un des emails n'a pas un format valide.</p>`;
        }

        if(!editEmail.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)) {
            error += `<p>- Le mot de passe doit contenir minimun 1 lettre 1 chiffre 1 lettre majuscule et 8 caractères.</p>`;
        }

        if(error !== "") {
            return errorCont.innerHTML = error;
        }

        modifyMail();
    }

    const modifyNames = () => {
        fetch('http://localhost:3000/api/users/edit/' + user.id, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + user.token
            },
            method: 'PUT', 
            body: JSON.stringify({firstname: editName.firstname, lastname: editName.lastname})
        })
            .then(res => res.json())
            .then(data => {
                if(data.success === true) {
                    /* message success */
                }
            })
        }
        
    const modifyMail = () => {
        const errorCont = document.querySelector('.profil__edit__errorCont ');
        errorCont.innerHTML = '';   

        fetch('http://localhost:3000/api/users/editEmail/' + user.id, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + user.token
            },
            method: 'PUT', 
            body: JSON.stringify({email: editEmail.email, new: editEmail.newEmail, password: editEmail.password})
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if(data.success === true) {
                    /* message success */
                } else if (data.error === "email" || data.error === "pwd") {
                    const error = "<p>- " + data.message + "</p>"
                    errorCont.innerHTML = error;
                }
            })
    }

    const handleProfilImgModal = () => {
        setToggleProfilImgModal(!toggleProfilImgModal);
    }

    const handleFriendDeleteModal = () => {

        setToggleFriendDeleteModal(!toggleFriendDeleteModal);
    }

    const changeProfilImg = () => {
        if (imageProfil.length !== 0) {
            let formData = new FormData();

            const img = imageProfil[0].file;
            formData.append('image', img, img.name);
            console.log(formData);
            
            fetch('http://localhost:3000/api/users/changeProfilImg/' + user.id, {
                headers: {
                    "Authorization": "Bearer " + user.token
                },
                method: 'PUT',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if(data.success === true) {
                        handleProfilImgModal();
                        getUserInfo(user);
                    }
                })
        }
    }

    const sendingFriendQuery = (id) => {
        fetch('http://localhost:3000/api/friends/query/' + id, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + user.token
            },
            method: 'POST'
        })
            .then(res => res.json())
            .then(data => {
                getIsFriend(user.token);
                if (id !== params.id) {
                    getAllRelations(user.id);
                }
            })
    }

    const cancelFriendQuery = (id) => {
        fetch('http://localhost:3000/api/friends/cancelQuery/' + id, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + user.token
            },
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                getIsFriend(user.token);
                if (id !== params.id) {
                    getAllRelations(user.id);
                }
            })
    }
    
    const cancelFriendRelation = (id) => {
        fetch('http://localhost:3000/api/friends/cancelRelation/' + id, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + user.token
            },
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                setToggleFriendDeleteModal(false);
                getIsFriend(user.token);
                if (id !== params.id) {
                    window.location.reload();                    
                }
            })
    }

    const acceptFriendQuery = (id) => {
        fetch('http://localhost:3000/api/friends/acceptQuery/' + id, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + user.token
            },
            method: 'PUT'
        })
            .then(res => res.json())
            .then(data => {
                getIsFriend(user.token);
                if (id !== params.id) {
                    getAllRelations(user.id);
                }
            })
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
                console.log(data);
                let newArr = [];
                if (data.data && data.data !== undefined) {
                    for (let i = 0; i < data.data.length; i++) {
                        
                        let item = {
                            id: data.data[i].userId,
                            fullname: data.data[i].User.User_info.firstname + " " + data.data[i].User.User_info.lastname,
                            profilImg: data.data[i].User.User_info.profilImg,
                            friend: "",
                            created: Math.floor((new Date(data.data[i].createdAt)).getTime() / 1000)
                        }
                        newArr.push(item);
                    }

                    setFriends(newArr);
                }
            })

    }

    const getAllRelations = (id) => {

        fetch('http://localhost:3000/api/friends/getRelations/' + id , {
            headers: {
                "Authorization": "Bearer " + user.token
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                let newArr = [];
                if (data.data && data.data !== undefined) {
                    for (let i = 0; i < data.data.length; i++) {
                        
                        let item = {
                            id: data.data[i].userId,
                            fullname: data.data[i].User.User_info.firstname + " " + data.data[i].User.User_info.lastname,
                            profilImg: data.data[i].User.User_info.profilImg,
                            friend: data.data[i].status,
                            created: Math.floor((new Date(data.data[i].createdAt)).getTime() / 1000)
                        }
                        newArr.push(item);
                    }

                    setCurrentUserFriends(newArr);

                    let friendArr = friends;
                    console.log(friendArr);
                    for (let l = 0; l < friendArr.length; l++) {

                        const friendFiltered = newArr.filter(el => {
                            return el.id === friendArr[l].id;
                        })    
                        console.log(friends); 
                        console.log(friendFiltered); 
                        console.log(friendArr[l]);
                        
                        if(friendFiltered.length > 0) {

                            friendArr[l] = {
                                ...friendArr[l],
                                friend: friendFiltered[0].friend
                            }
                                
                        } else if (friendArr[l].friend !== "") {
                                
                            friendArr[l] = {
                                ...friendArr[l],
                                friend: ""
                            }

                        }
                    }
                    console.log(friendArr);
                    setFriends(friendArr);
                }
            })
    }

    const handleLink = (link) => {
        setToggleEditProfil(false);

        if (link === "friends") {

            if (currentUserFriends.length === 0) {
                getAllRelations(user.id);
            }

            setToggleFriend(true);
        } else {
            setToggleFriend(false);
        }
    }

    return (
        <>
        <Header logged={logStatus} />
        <main className='profil'>

            <section className='profil__top'>
                <div className="profil__top__pictures">
                    <div className="profil__top__pictures__baneer">
                        {
                            toggleBaneerForm ?
                            <>
                                <ImageUploading
                                    value={image}
                                    onChange={imgChange}
                                >
                                    {({
                                        imageList,
                                        onImageUpload,
                                        onImageRemove,
                                        isDragging,
                                        dragProps,
                                    }) => (
                                        <div className="upload__image-wrapper profil__top__pictures__baneer__new">
                                            <button
                                            className='upload__image-wrapper profil__top__pictures__baneer__new__btn'
                                            style={isDragging ? { color: '#fd2d01' } : undefined}
                                            onClick={onImageUpload}
                                            {...dragProps}
                                            >
                                            Cliquer ou Glisser une image ici
                                            </button>
                                            &nbsp;
                                            {imageList.map((image, index) => (
                                                <div key={index} className="image-item profil__top__pictures__baneer__new__overview">
                                                    <img src={image.dataURL} alt="" />
                                                    <div className="image-item__btn-wrapper profil__top__pictures__baneer__new__overview__btnCont">
                                                        <button className='profil__top__pictures__baneer__new__overview__btnCont__deleteBtn' onClick={() => onImageRemove(index)}>Supprimer l'image</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ImageUploading>
                            </>
                            :
                            userInfos.profilBaneer !== null &&
                                <img src={userInfos.profilBaneer} alt="" />
                        }
                    </div>
                    {
                        user.id === params.id &&
                        <>
                            {
                                toggleBaneerForm ?
                                <>
                                <button onClick={baneerFormToggle} className='profil__top__pictures__changeBaneer'>Annuler</button>
                                <button onClick={changeBaneer} className='profil__top__pictures__changeBaneer profil__top__pictures__changeBaneer--valid'>Ok</button>
                                </>
                                :
                                <button onClick={baneerFormToggle} className='profil__top__pictures__changeBaneer'>Changer</button> 
                            }
                        </>
                    }
                    <div className="profil__top__pictures__profilImg">
                        {
                            userInfos.profilImg !== null ?
                            <img src={userInfos.profilImg} alt={"photo de profil de " + userInfos.firstname + userInfos.lastname} />
                            :
                            <FontAwesomeIcon icon={faUser} className="profil__top__pictures__profilImg__icon" />
                        }
                        {
                            user.id === params.id &&
                            <button onClick={handleProfilImgModal}>{userInfos.profilImg !== null ? "Modifier" : "Ajouter"}</button>
                        }
                    </div>
                </div>

                <div className="profil__top__infos">
                    <p>{userInfos.firstname} {userInfos.lastname}</p>
                    <div className="profil__top__infos__btnCont">
                        {
                            user.id === params.id ?
                            <button onClick={editProfilToggle}>Modifier le profil</button>
                            :
                            <>
                                {
                                    friendRelation === "friend" &&
                                    <a href={"/messagerie/" + params.id}><button>Message</button></a>
                                }
                                {
                                    friendRelation === "pending" ?
                                    <button onClick={() =>cancelFriendQuery(params.id)}>Demande envoyé</button>
                                    :
                                    friendRelation === "received" ?
                                    <button onClick={() => acceptFriendQuery(params.id)}>Accepter demande</button>
                                    :
                                    friendRelation === "friend" ?
                                    <button onClick={handleFriendDeleteModal}>Retirer des amis</button>
                                    :
                                    <button onClick={() => sendingFriendQuery(params.id)}>Ajouter</button>
                                }
                            </>
                        }
                    </div>
                </div>

                <div className="profil__top__menu">
                    <p onClick={() => handleLink("posts")}>Publications</p>
                    <p onClick={() => handleLink("friends")}>Amis</p>
                </div>
            </section>

            {
                toggleEditprofil ?
                <section className='profil__edit'>
                    <h2>Modifier votre profil</h2>

                    <div className="profil__edit__errorCont"></div>
                    <div className="profil__edit__form">
                        <div className="profil__edit__form__tabsCon">
                            <div onClick={() => changeTab(0)} className="profil__edit__form__tabsCon__tab profil__edit__form__tabsCon__tab--active">Informations</div>
                            <div onClick={() => changeTab(1)} className="profil__edit__form__tabsCon__tab">Email</div>
                            <div onClick={() => changeTab(2)} className="profil__edit__form__tabsCon__tab">Mot de passe</div>
                        </div>
                        <div className="profil__edit__form__container">
                            <input onInput={(e) => ctrlEditInput('firstname', e.target.value)} value={editName.firstname} type="text" placeholder='Prénom'/>
                            <input onInput={(e) => ctrlEditInput('lastname', e.target.value)} value={editName.lastname} type="text" placeholder='Nom'/>
                            <button onClick={checkNames}>Modifier</button>
                        </div>
                        <div className="profil__edit__form__container profil__edit__form__container--hidden">
                            <input onInput={(e) => ctrlEditInput('email', e.target.value)} value={editEmail.email} type="email" placeholder='Email actuel' />
                            <input onInput={(e) => ctrlEditInput('newEmail', e.target.value)} value={editEmail.newEmail} type="email" placeholder='Nouveau email' />
                            <input onInput={(e) => ctrlEditInput('emailPassword', e.target.value)} value={editEmail.password} type="password" placeholder='Mot de passe' />
                            <button onClick={checkEditEmail}>Modifier</button>
                        </div>
                        <div className="profil__edit__form__container profil__edit__form__container--hidden">
                            <input onInput={(e) => ctrlEditInput('currentPassword', e.target.value)} value={editPassword.currentPassword} type="password" placeholder='Mot de passe actuel' />
                            <input onInput={(e) => ctrlEditInput('newPassword', e.target.value)} value={editPassword.newPassword} type="password" placeholder='Nouveau mot de passe' />
                            <input onInput={(e) => ctrlEditInput('confirmPassword', e.target.value)} value={editPassword.confirmPassword} type="password" placeholder='Confirmer mot de passe' />
                            <button>Modifier</button>
                        </div>
                    </div>
                </section>
                :
                <>
                {
                    toggleFriend ?
                    <section className='profil__friendsList'>
                        <h2>{user.id === params.id ? "Mes amis" : "Amis de " + userInfos.firstname + " " + userInfos.lastname}</h2>

                        <div className="profil__friendsList__list">
                            {
                                friends.map(el => {
                                    return <Friend key={el.id} fullname={el.fullname} id={el.id} profilImg={el.profilImg} currentUserId={user.id} friend={el.friend} paramsId={params.id} sendingQueryFunc={sendingFriendQuery} cancelQueryFunc={cancelFriendQuery} acceptQueryFunc={acceptFriendQuery} cancelRelationFunc={cancelFriendRelation} />
                                })
                            }
                        </div>

                    </section>
                    :
                    <section className="profil__content">
                        <div className="profil__content__left">
                            {
                                friends.length > 0 ?
                                friends.map(el => {
                                    return <a key={el.id} href={"/profil_=" + el.id}><div className="profil__content__left__friend">
                                        <div className="profil__content__left__friend__infos">
                                            <div className="profil__content__left__friend__infos__imgCont">
                                                {
                                                    el.profilImg !== null ? <img src={el.profilImg} alt="" /> : <FontAwesomeIcon icon={faUser} className="header__btns__btn__user" />
                                                }
                                            </div>
                                            <h3>{el.fullname}</h3>
                                        </div>
                                        <p>Amis depuis le {new Date(el.created * 1000).toLocaleDateString("fr-FR")}</p>
                                    </div></a>
                                })
                                :
                                <p className="profil__content__left__alone">Aucun amis</p>
                            }
                        </div>
                        <div className="profil__content__articles">
                            {
                                postData.map(el => {
                                    return <PostCard content={el.content} id={el.id} key={el.id} picture={el.picture} created={el.created} updated={el.updated} userId={el.userId} firstname={userInfos.firstname} lastname={userInfos.lastname} profilImg={userInfos.profilImg} user={user} loadAfterFunc={() => getUserPost()} />
                                })
                            }
                        </div>
                    </section>
                }
                </>
            }
        </main>
        {
            toggleProfilImgModal &&
            <div className="profil__changeProfilImg">
                <div className="profil__changeProfilImg__modal">
                    <h2>Modifier votre photo de profil</h2>
                    <ImageUploading
                        value={imageProfil}
                        onChange={profilImgChange}
                    >
                        {({
                            imageList,
                            onImageUpload,
                            onImageRemove,
                            isDragging,
                            dragProps,
                        }) => (
                            <div className="upload__image-wrapper profil__top__pictures__baneer__new">
                                <button
                                className='upload__image-wrapper profil__top__pictures__baneer__new__btn'
                                style={isDragging ? { color: '#fd2d01' } : undefined}
                                onClick={onImageUpload}
                                {...dragProps}
                                >
                                Cliquer ou Glisser une image ici
                                </button>
                                &nbsp;
                                {imageList.map((image, index) => (
                                    <div key={index} className="image-item profil__top__pictures__baneer__new__overview">
                                        <img src={image.dataURL} alt="" />
                                        <div className="image-item__btn-wrapper profil__top__pictures__baneer__new__overview__btnCont">
                                            <button className='profil__top__pictures__baneer__new__overview__btnCont__deleteBtn' onClick={() => onImageRemove(index)}>Supprimer l'image</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ImageUploading>
                    <div className="profil__changeProfilImg__modal__btnCont">
                        <button onClick={handleProfilImgModal}>Annuler</button>
                        <button onClick={changeProfilImg}>{userInfos.profilImg !== null ? "Modifier" : "Ajouter"}</button>
                    </div>
                </div>
            </div>
        }
        {
            toggleFriendDeleteModal &&
            <div className="profil__confirmCancelRelation">
                <div className="profil__confirmCancelRelation__modal">
                    <h2>Ne plus etre ami avec {userInfos.firstname}</h2>
                    <div className="profil__confirmCancelRelation__modal__btnCont">
                        <button onClick={handleFriendDeleteModal}>Annuler</button>
                        <button onClick={() => cancelFriendRelation(params.id)}>Ok</button>
                    </div>
                </div>
            </div>
        }
        </>
    );
};

export default Profil;