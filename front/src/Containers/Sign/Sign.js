import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sign = () => {
    
    const navigate = useNavigate();

    const [signForm, setSignForm] = useState({ email: "", pwd: "", firstname: "", lastname: "", check : false });

    const controlInputs = (action, value) => {

        if(action === 'email') {
            const newObj = {
                ...signForm,
                email : value
            };
            setSignForm(newObj);
        } else if(action === 'pwd') {
            const newObj = {
                ...signForm,
                pwd : value
            };
            setSignForm(newObj);
        } else if(action === 'firstname') {
            const newObj = {
                ...signForm,
                firstname : value
            };
            setSignForm(newObj);
        } else if(action === 'lastname') {
            const newObj = {
                ...signForm,
                lastname : value
            };
            setSignForm(newObj);
        } else if(action === 'check') {
            const newObj = {
                ...signForm,
                check : !signForm.check
            };
            setSignForm(newObj);
        }

    };

    const checkInputs = (e) => {
        e.preventDefault();
        const errorCont = document.querySelector('.sign__form__errorCont');
        errorCont.innerHTML = '';
        let error = '';

        // check for empty fields
        if (signForm.email === '' || signForm.pwd === '' || signForm.firstname === '' || signForm.lastname === '') {
           error = `<p>- Tous les champs sont requis.</p>`;
           return errorCont.innerHTML = error;
        } 

        // valid email
        if(!signForm.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i)) {
            error = `<p>- Le mail n'a pas un format valide.</p>`;
        }

        // valid fistname and lastname
        if(signForm.firstname.length < 2 || signForm.firstname.length > 26) {
            error += `<p>- Le prenom doit etre compris entre 2 et 25 caractères.</p>`;
        } else if(!signForm.firstname.match(/^[a-zA-Zé èà]*$/)) {
            error += `<p>- Le prenom ne doit comporter que des lettres.</p>`;
        }
        
        if(signForm.lastname.length < 2 || signForm.lastname.length > 26) {
            error += `<p>- Le nom doit etre compris entre 2 et 25 caractères.</p>`;
        } else if(!signForm.lastname.match(/^[a-zA-Zé èà]*$/)) {
            error += `<p>- Le nom ne doit comporter que des lettres.</p>`;
        }

        // valid password
        if(!signForm.pwd.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)) {
            error += `<p>- Le mot de passe doit contenir minimun 1 lettre 1 chiffre 1 lettre majuscule et 8 caractères.</p>`;
        }

        // check if cgu is accepted
        if (signForm.check === false) {
            error += `<p>- Veuillez accepter la CGU.</p>`
        }

        // if error is empty try to sign
        if(error === "") {
            tryToSign(signForm.email, signForm.pwd, signForm.firstname, signForm.lastname);
        } else {
            errorCont.innerHTML = error;
        }

    };

    const tryToSign = (email, pwd, firstname, lastname) => {
        const errorCont = document.querySelector('.sign__form__errorCont');

        fetch('http://localhost:3000/api/users/sign', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ email: email, password: pwd, firstname: firstname, lastname: lastname })
        })
                .then(res => res.json())
                .then(data => {
                    errorCont.innerHTML = '';
                    if(data.error) {
                        let err = "";
                        data.error.errors.forEach(el => {
                            err += "<p>- " + el.message + "</p>";
                        });
                        errorCont.innerHTML = err;
                    } else {
                        navigate('/connexion', { replace: true });
                    }
                })
    };

    return (
        <main className='sign'>
            <form className='sign__form'>
                <h1>Créer un compte</h1>
                <div className="sign__form__errorCont">
                    
                </div>
                <div className="sign__form__cont">
                    <div className="sign__form__cont__inputCont">
                        <input onInput={(e) => controlInputs('email', e.target.value)} value={signForm.email} type="email" id="signEmail" placeholder='Email'/>
                    </div>
                    <div className="sign__form__cont__inputCont">
                        <input onInput={(e) => controlInputs('pwd', e.target.value)} value={signForm.pwd} type="password" id="signPassword" placeholder='Mot de passe'/>
                    </div>
                </div>
                <div className="sign__form__cont">
                    <div className="sign__form__cont__inputCont">
                        <input onInput={(e) => controlInputs('firstname', e.target.value)} value={signForm.firstname} type="text" id="signFirstname" placeholder='Prénom'/>
                    </div>
                    <div className="sign__form__cont__inputCont">
                        <input onInput={(e) => controlInputs('lastname', e.target.value)} value={signForm.lastname} type="text" id="signLastname" placeholder='Nom'/>
                    </div>
                </div>
                <div className='sign__form__checkCont'>
                        <input  onInput={(e) => controlInputs('check', e.target.value)} value={signForm.check} type="checkbox" id="signCheck" />
                        <label htmlFor="signCheck">En cochant cette case blablabla</label>
                </div>
                <div className="sign__form__btnCont">
                    <button onClick={checkInputs}>Créer</button>
                </div>
            </form>
        </main>
    );
};

export default Sign;