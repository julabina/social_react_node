import React, { useEffect, useState } from 'react';
import PostCard from '../../Components/PostCard/PostCard';
import ImageUploading from 'react-images-uploading';

const Home = () => {

    const [newPost, setNewPost] = useState({title: "", text:"", file:""});
    const [postData, setPostData] = useState([]);
    const [image, setImage] = React.useState();

    useEffect(() => {
        getAllPosts();
    }, []);

    /**
     * controll newPost inputs
     * 
     * @param {*} action 
     * @param {*} value 
     */
    const handleNewPostInput = (action, value) => {
        if(action === 'title') {
            const newObj = {
                ...newPost,
                title : value 
            };
            setNewPost(newObj);
        } else if(action === 'content') {
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
     * @param {*} title 
     * @param {*} text 
     */
    const tryToCreateNew = (title, text) => {
        fetch('http://localhost:3000/api/posts/new', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({title: title, text: text})
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
            })
    };

    /**
     * get all posts
     */
    const getAllPosts = () => {
        fetch('http://localhost:3000/api/posts/findAll')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                let newArr = [];
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i] !== undefined) {
                        let item = {
                            title: data.data[i].title,
                            content: data.data[i].content,
                            picture: data.data[i].picture,
                            id: data.data[i].id,
                            created: data.data[i].createdAt,
                            updated: data.data[i].updatedAt,
                        };  
                        newArr.push(item); 
                    }
                }

                setPostData(newArr);
            })
    };

    const imgChange = (imageList, addUpdateIndex) => {
        console.log(imageList, addUpdateIndex);
        setImage(imageList);
    }

    return (
        <main className="home">
            <h1>Bienvenue sur Groupomania</h1>
            <section className="home__newContent">
                <div className="home__newContent__new">
                    <h2>Créer un nouveau sujet</h2>
                    <input className="home__newContent__new__title" onInput={(e) => handleNewPostInput("title", e.target.value)} value={newPost.title} type="text" id="homeNewTitle" placeholder='Titre' />
                    <textarea onInput={(e) => handleNewPostInput("content", e.target.value)} id="homeNewText" value={newPost.text} placeholder="Exprimez-vous !"></textarea>
                    <ImageUploading
                        value={image}
                        onChange={imgChange}
                    >
                        {({
                            imageList,
                            onImageUpload,
                            onImageRemoveAll,
                            onImageUpdate,
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
                        return <PostCard title={el.title} content={el.content} key={el.id} picture={el.picture} created={el.created} updated={el.updated} />
                    })
                }
            </section>
        </main>
    );
};

export default Home;