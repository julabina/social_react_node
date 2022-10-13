import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Log = () => {

    const navigate = useNavigate();

    const [logInputs, setLogInputs] = useState({email: "", password: ""});

    const controlInputs = (action, value) => {
        if(action === "email") {
            const newObj = {
                ...logInputs,
                email: value
            };
            setLogInputs(newObj);
        } else if (action === "password") {
            const newObj = {
                ...logInputs,
                password: value
            };
            setLogInputs(newObj);
        }
    }

    const checkInputs = (e) => {
        e.preventDefault();

        const errorCont = document.querySelector(".login__section__form__errorCont");
        let error = "";
        errorCont.innerHTML = "";

        if(logInputs.email === "" || logInputs.password === "") {
            return errorCont.innerHTML = "<p>- Tous les champs sont requis.</p>";
        }

        if(!logInputs.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i)) {
            error = `<p>- L'email n'a pas un format valide.</p>`;
        }

        if(!logInputs.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)) {
            error += `<p>- Le mot de passe doit contenir minimun 1 lettre 1 chiffre 1 lettre majuscule et 8 caractères.</p>`;
        }

        if(error !== "") {
            errorCont.innerHTML = error;
        } else {
            tryToLog(logInputs.email, logInputs.password);
        }
    }

    const tryToLog = (email, pwd) => {
        const errorCont = document.querySelector(".login__section__form__errorCont");

        fetch('http://localhost:3000/api/users/login', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ email: email, password: pwd })
        })
            .then(res => res.json())
            .then(data => {
                if(data.message) {
                    errorCont.innerHTML = "<p>- " + data.message + "</p>"
                } else if(data.token) {
                    let newObj = {
                        version: data.token,
                        content: data.userId
                    };
                    localStorage.setItem('token', JSON.stringify(newObj)); 
                    navigate('/', { replace: true });
                }
            })
    }

    return (
        <>
        <Helmet>
            <title>Groupomania - Connexion</title>
            <meta name="title" content="Groupomania - Connexion" />
            <meta
            name="description"
            content="Connecter vous à votre compte Groupomania."
            />
        </Helmet>
        <main className='login'>
            <section className='login__section'>
                <form className="login__section__form">
                    <h1>Se connecter</h1>
                    <div className="login__section__form__errorCont">
                        
                    </div>
                    <div className="login__section__form__cont">
                        <div className="login__section__form__cont__inputCont">
                            <input onInput={(e) => controlInputs('email', e.target.value)} value={logInputs.email} type="email" placeholder='Email'/>
                        </div>
                        <div className="login__section__form__cont__inputCont">
                            <input onInput={(e) => controlInputs('password', e.target.value)} value={logInputs.password} type="password" placeholder='Mot de passe'/>
                        </div>
                    </div>
                    <div className="login__section__form__btnCont">
                        <button onClick={checkInputs}>Se connecter</button>
                    </div>
                </form>
                <a className='login__section__link' href="/inscription">Vous n'avez pas encore de compte ?</a>
            </section>
        </main>
        </>
    );
};

export default Log;