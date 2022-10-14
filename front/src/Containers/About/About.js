import React, { useEffect, useState } from 'react';
import Header from '../../Components/Header/Header';
import { decodeToken, isExpired } from 'react-jwt';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const About = () => {

    const navigate = useNavigate();

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
                setUser(newUserObj);
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

    return (
        <>
        <Helmet>
            <title>Groupomania - A propos</title>
            <meta name="title" content="Groupomania - A propos" />
            <meta
            name="description"
            content="Toutes les informations concernant Groupomania ce trouvent sur cette page."
            />
        </Helmet>
         <Header user={user} />
        <main className='about'>
            <section>
                <h1>A propos</h1>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis maxime explicabo dicta iure reprehenderit totam quam repellat autem expedita, optio tenetur provident id animi nesciunt officiis placeat, quos, libero possimus harum nam similique corporis quas molestiae illo! Molestias quos rerum, quidem, non aspernatur eligendi nobis mollitia, odio quia quod aliquid.</p>
            </section>
        </main>
        </>
    );
};

export default About;