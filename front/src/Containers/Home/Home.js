import React, { useEffect, useState } from 'react';
import PostCard from '../../Components/PostCard/PostCard';
import ImageUploading from 'react-images-uploading';
import { decodeToken, isExpired } from 'react-jwt';
import { useNavigate } from 'react-router-dom';


const Home = () => {

    const navigate = useNavigate();

    const [newPost, setNewPost] = useState({text:""});
    const [postData, setPostData] = useState([]);
    const [image, setImage] = React.useState([]);
    const [user, setUser] = useState({token : "", id : ""})

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
                getAllPosts();
            } else {
                // DISCONNECT
                localStorage.removeItem('token');
                navigate('/connexion', { replace: true });
            };
        } else {
            // DISCONNECT
            navigate('/connexion', { replace: true });
        }; 

    }, []);

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



        tryToCreateNew(newPost.title, newPost.text)
    };

    /**
     * try to create new post
     * 
     * @param {*} text 
     */
    const tryToCreateNew = (title, text) => {
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
                    getAllPosts();
                }
            })
    };

    /**
     * get all posts
     */
    const getAllPosts = () => {
        fetch('http://localhost:3000/api/posts/findAll')
            .then(res => res.json())
            .then(data => {
                const usersData = data.users;
                let newArr = [];
                if(data.data !== undefined) {
                    for (let i = 0; i < data.data.length; i++) {
                        const dataUser = usersData.find(el => el.userId === data.data[i].userId);

                        if (data.data[i] !== undefined) {
                            let item = {
                                content: data.data[i].content,
                                picture: data.data[i].picture,
                                firstname: dataUser.firstname,
                                lastname: dataUser.lastname,
                                profilImg: dataUser.profilImg,
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
    };

    const imgChange = (imageList, addUpdateIndex) => {
        setImage(imageList);
    }

    return (
        <main className="home">
            <h1>Bienvenue sur Groupomania</h1>
            <section className="home__newContent">
                <div className="home__newContent__new">
                    <h2>Créer un nouveau sujet</h2>
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
                    postData.map(el => {
                        return <PostCard content={el.content} key={el.id} picture={el.picture} created={el.created} updated={el.updated} userId={el.userId} firstname={el.firstname} lastname={el.lastname} profilImg={el.profilImg}/>
                    })
                }
            </section>
        </main>
    );
};

export default Home;