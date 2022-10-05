import React from 'react';
import logo from "../../assets/notFound.svg";

const NotFound = () => {
    return (
        <main className='notFound'>
            <div className='notFound__container'>
                <img src={logo} alt="groupomania logo" />
                <h1>404</h1>
                <h2>page non trouvée</h2>
                <a href="/"><button>Revenir à l'accueil</button></a>
            </div>
        </main>
    );
};

export default NotFound;