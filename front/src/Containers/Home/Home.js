import React, { useEffect, useState } from 'react';
import Header from "../../Components/Header/Header";
import PostCard from '../../Components/PostCard/PostCard';
import ImageUploading from 'react-images-uploading';
import { decodeToken, isExpired } from 'react-jwt';
import { useNavigate } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';


const Home = () => {

    const navigate = useNavigate();

    const [newPost, setNewPost] = useState({text:""});
    const [postData, setPostData] = useState([]);
    const [toDisplayPostData, setToDisplayPostData] = useState([]);
    const [image, setImage] = React.useState([]);
    const [user, setUser] = useState({token : "", id : ""})
    const [isAdmin, setIsAdmin] = useState(false);
    const [reload, setReload] = useState(false);
    const [logStatus, setLogStatus] = useState(false);

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
                getAllPosts(newUserObj.id);
                setLogStatus(true);
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

    /* const handleObserver = useCallback((entries) => {
        
        const target = entries[0];
        if (target.isIntersecting) {
            console.log(toDisplayPostData);
            console.log('TTTTTEST');

            loadPosts();
        }
        console.log(target);
    }, [toDisplayPostData]); */
    
    /* useEffect(() => {
        console.log('handle');
        const option = {
            root: null,
            rootMargin: "20px",
            threshold: 0
          };
          const watcher = new IntersectionObserver(handleObserver, option);
          if (ref.current) watcher.observe(ref.current);
          console.log("handleBot");
          
    },[handleObserver]) */

    /**
     * check if current user is an admin
     */
    const getRole = (id, token) => {
        fetch('http://localhost:3000/api/users/isAdmin/' + id ,{
            headers: {
                "Authorization": "Bearer " + token
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if(data.isAdmin === true) {
                    setIsAdmin(true);
                }
            })
    }

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
        const formData = new FormData();

        formData.append('text', JSON.stringify(text));
        formData.append('userId', JSON.stringify(user.id));
        if (image.length !== 0) {
            const img = image[0].file;
            formData.append('image', img, img.name);
        }

        fetch('http://localhost:3000/api/posts/new', {
            headers: {
                "Authorization": "Bearer " + user.token
            },
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    getAllPosts(user.id);
                    setNewPost({text: ''});
                    setImage([]);
                    window.scrollTo(0, 0);
                }
            })
    };

    /**
     * get all posts
     */
    const getAllPosts = (id) => {
        fetch('http://localhost:3000/api/posts/findAll')
            .then(res => res.json())
            .then(data => {
                const usersData = data.users;
                let newArr = [];
                if(data.data !== undefined) {
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
                    for (let l = 0; l < 10; l++) {
                        displayArr.push(newArr[l]);        
                    }
                    
                    setToDisplayPostData(displayArr);
                }
                setPostData(newArr);
            })
    };

    const imgChange = (imageList, addUpdateIndex) => {
        setImage(imageList);
    }

    const loadPosts = () => {
        
        console.log('------------------------------------------------------');
        console.log(postData);
        console.log(toDisplayPostData);
        console.log('------------------------------------------------------');

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

        console.log("newArr", newArr);
        setToDisplayPostData(newArr);
        
        reloading();
    }

    const reloading = () => {
        console.log('reload');
        setReload(!reload);
    }

    return (
        <>
        <Header logged={logStatus} />
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
                <InfiniteScroll
                    dataLength={toDisplayPostData.length}
                    next={loadPosts}
                    scrollThreshold={0.9}
                    hasMore={true}
                >
                {
                    toDisplayPostData.map(el => {
                        return <PostCard content={el.content} id={el.id} key={el.id} picture={el.picture} created={el.created} updated={el.updated} userId={el.userId} firstname={el.firstname} lastname={el.lastname} profilImg={el.profilImg} user={user} loadAfterFunc={() => getAllPosts()} isAdmin={isAdmin} likedByUser={el.likedByUser} likes={el.likes} />
                    })
                }
                </InfiniteScroll>
            </section>
        </main>
        </>
    );
};

export default Home;