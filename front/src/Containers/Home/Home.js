import React, { useEffect, useState } from 'react';
import Header from "../../Components/Header/Header";
import PostCard from '../../Components/PostCard/PostCard';
import ImageUploading from 'react-images-uploading';
import { decodeToken, isExpired } from 'react-jwt';
import { useNavigate } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import ToTop from '../../Components/ToTop/ToTop';
import { Helmet } from 'react-helmet';


const Home = () => {

    const navigate = useNavigate();

    const [newPost, setNewPost] = useState({text:""});
    const [postData, setPostData] = useState([]);
    const [toDisplayPostData, setToDisplayPostData] = useState([]);
    const [image, setImage] = React.useState([]);
    const [user, setUser] = useState({token : "", id : ""})
    const [isAdmin, setIsAdmin] = useState(false);
    const [reload, setReload] = useState(false);

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
                getRole(newUserObj.id, newUserObj.token);
                getAllPosts(newUserObj.id, newUserObj.token);
            } else {
                // DISCONNECT
                localStorage.removeItem('token');
                navigate('/connexion', { replace: true });
            };
        } else {
            // DISCONNECT
            navigate('/connexion', { replace: true });
        }; 

    },[]);

    /**
     * check if current user is an admin
     * 
     * @param {*} id 
     * @param {*} token 
     */
    const getRole = (id, token) => {
        fetch(process.env.REACT_APP_API_URL + '/api/users/isAdmin/' + id ,{
            headers: {
                "Authorization": "Bearer " + token
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                if(data.isAdmin === true) {
                    setIsAdmin(true);
                }
            })
    };

    /**
     * controll newPost inputs
     * 
     * @param {*} action 
     * @param {*} value 
     */
    const handleNewPostInput = (action, value) => {

        if(action === 'content') {
            const newObj = {
                ...newPost,
                text : value 
            };
            setNewPost(newObj);
        }
    };

    /**
     * check input before create new post
     */
    const checkNewPost = () => {
        const errorCont = document.querySelector('.home__newContent__new__errorCont');
        errorCont.innerHTML = "";
        let errorP = document.createElement('p');
        errorP.textContent = "";

        if (newPost.text === "" && image.length === 0) {
            errorP.textContent = '- Impossible de créer un post, aucun contenu ajouté.'; 
            return errorCont.append(errorP);
        }
        
        if (newPost.text !== "") {   
            if (newPost.text.length > 500) {
                errorP.textContent = '- La longueur du contenu ne doit pas dépasser 500 caractères.'; 
                return errorCont.append(errorP);
            }
        }
        
        errorCont.append(errorP);

        const textWithoutTag = newPost.text.replace(/<\/?[^>]+>/g,'');

        tryToCreateNew(textWithoutTag);
    };

    /**
     * try to create new post
     * 
     * @param {*} text 
     */
    const tryToCreateNew = (text) => {
        const errorCont = document.querySelector('.home__newContent__new__errorCont');
        const formData = new FormData();

        formData.append('text', JSON.stringify(text));
        formData.append('userId', JSON.stringify(user.id));
        if (image.length !== 0) {
            const img = image[0].file;
            formData.append('image', img, img.name);
        }

        fetch(process.env.REACT_APP_API_URL + '/api/posts/new', {
            headers: {
                "Authorization": "Bearer " + user.token
            },
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                
                if (data.success) {
                    getAllPosts(user.id, user.token);
                    setNewPost({text: ''});
                    setImage([]);
                    window.scrollTo(0, 0);
                } else if(data.message) {
                    errorCont.innerHTML = `
                        <p>- ${data.message}</p>
                    `
                } else {
                    errorCont.innerHTML = `
                        <p>- Une erreur est survenue, veuillez réessayer plus tard.</p>
                    `
                }
            })
    };

    /**
     * get all posts
     * 
     * @param {*} id 
     * @param {*} token 
     */
    const getAllPosts = (id, token) => {

        fetch(process.env.REACT_APP_API_URL + '/api/posts/findAll', {
            headers: {
                "Authorization": "Bearer " + token
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                const usersData = data.users;
                let newArr = [];
                if(data.data !== undefined && data.data.length > 0) {
                    for (let i = 0; i < data.data.length; i++) {
                        const dataUser = usersData.find(el => el.userId === data.data[i].userId);
                        let liked = false;

                        if(data.data[i].usersLiked.includes(id)) {
                            liked = true;
                        }

                        if (data.data[i] !== undefined) {
                            let item = {
                                content: data.data[i].content,
                                picture: data.data[i].picture,
                                firstname: dataUser.firstname,
                                lastname: dataUser.lastname,
                                profilImg: dataUser.profilImg,
                                id: data.data[i].id,
                                userId: data.data[i].userId,
                                likedByUser: liked,
                                likes: data.data[i].likes,
                                created: data.data[i].createdAt,
                                updated: data.data[i].updatedAt,
                            };  
                            newArr.push(item); 
                        }
                    }
                    
                    newArr.sort((a, b) => new Date(b.updated) - new Date(a.updated));

                    let displayArr = [];
                    if (newArr.length > 10) {   
                        for (let l = 0; l < 10; l++) {
                            displayArr.push(newArr[l]);        
                        }
                    } else {
                        displayArr = newArr;
                    }
                    setToDisplayPostData(displayArr);
                }
                setPostData(newArr);
            })
    };

    /**
     * add selected image
     * 
     * @param {*} imageList 
     * @param {*} addUpdateIndex 
     */
    const imgChange = (imageList, addUpdateIndex) => {
        setImage(imageList);
    };

    /**
     * load post for infinite scroll
     * 
     * @returns 
     */
    const loadPosts = () => {

        const dispLength = toDisplayPostData.length;
        let toIndex = toDisplayPostData.length + 10;

        if (toDisplayPostData.length === postData.length) {
            return
        }
        
        if(postData.length < toIndex) {
            toIndex = postData.length;
        } 

        let newArr = toDisplayPostData;
        for (let i = dispLength; i < toIndex; i++) {
            toDisplayPostData.push(postData[i])
        }

        setToDisplayPostData(newArr);
        
        reloading();
    };

    /**
     * simple reload state
     */
    const reloading = () => {
        setReload(!reload);
    };

    return (
        <>
        <Helmet>
            <title>Groupomania</title>
            <meta name="title" content="Groupomania" />
            <meta
            name="description"
            content="La page principale de Groupomania, ou vous pouvez voir, commenter et creer des posts."
            />
        </Helmet>
        <Header user={user} />
        <ToTop />
        <main className="home">
            <section className="home__newContent">
                <div className="home__newContent__new">
                    <h1>Créer un nouveau sujet</h1>
                    <div className="home__newContent__new__errorCont"></div>
                    <textarea onInput={(e) => handleNewPostInput("content", e.target.value)} id="homeNewText" value={newPost.text} placeholder="Exprimez-vous !"></textarea>
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
                            <div className="upload__image-wrapper home__newContent__new__addImg">
                                <button
                                className='home__newContent__new__addImg__topBtn'
                                style={isDragging ? { color: '#fd2d01' } : undefined}
                                onClick={onImageUpload}
                                {...dragProps}
                                >
                                Cliquer ou Glisser une image ici
                                </button>
                                &nbsp;
                                {imageList.map((image, index) => (
                                    <div key={index} className="image-item home__newContent__new__addImg__overview">
                                        <img src={image.dataURL} alt="" width="100" />
                                        <div className="image-item__btn-wrapper home__newContent__new__addImg__overview__btnCont">
                                            <button className='home__newContent__new__addImg__overview__btnCont__deleteBtn' onClick={() => onImageRemove(index)}>Supprimer l'image</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ImageUploading>
                    <button className="home__newContent__new__addBtn" onClick={checkNewPost}>Créer</button>
                </div>
            </section>
            <section className="home__mainContent">
                {
                    toDisplayPostData.length > 0 ?
                    <InfiniteScroll
                        dataLength={toDisplayPostData.length}
                        next={loadPosts}
                        scrollThreshold={0.9}
                        hasMore={true}
                        style={{overflow: 'none'}}
                    >
                        {
                            toDisplayPostData.map(el => {
                                return <PostCard content={el.content} id={el.id} key={el.id} picture={el.picture} created={el.created} updated={el.updated} userId={el.userId} firstname={el.firstname} lastname={el.lastname} profilImg={el.profilImg} user={user} loadAfterFunc={getAllPosts} isAdmin={isAdmin} likedByUser={el.likedByUser} likes={el.likes} />
                            })
                        }
                    </InfiniteScroll>
                    :
                    <h2>Pas encore de posts.</h2>
                }
            </section>
        </main>
        </>
    );
};

export default Home;