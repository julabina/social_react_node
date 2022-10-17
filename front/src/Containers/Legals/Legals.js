import React, { useEffect, useState } from 'react';
import Header from '../../Components/Header/Header';
import { decodeToken, isExpired } from 'react-jwt';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Legals = () => {

    const navigate = useNavigate();

    const [logStatus, setLogStatus] = useState(false);
    const [user, setUser] = useState({token: "", id: ""});

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
                setLogStatus(true);
                setUser(newUserObj);
            } 
        }

    },[]);

    return (
        <>
        <Helmet>
            <title>Groupomania - Mentions légales</title>
            <meta name="title" content="Groupomania - Mentions légales" />
            <meta
            name="description"
            content="Vous trouverez les mentions légales du site Groupomania."
            />
        </Helmet>
        {
            logStatus === true &&
            <Header user={user} />
        }
        <main className='legals'>
            {
                logStatus === false &&
                <a className='legals__signLink' href="/inscription">Créer un compte</a>
            }
            <section className="legals__content">
                <h1>Mentions légales</h1>

                <h2>Hébergement</h2>
                <p>Groupomania est hébergé par Digital Ocean</p>
                <p>Siège social: Digitalocean LLC, 101 Avenue of the Americas 10th Floor New York, NY 10013 United States.</p>
                <p className='legals__content__p2'>Cet hébergeur détient à ce jour les informations personnelles concernant l'auteur de ce site.</p>
            </section>
        </main>
        </>
    );
};

export default Legals;