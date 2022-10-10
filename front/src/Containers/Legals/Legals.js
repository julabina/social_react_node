import React from 'react';
import Header from '../../Components/Header/Header';

const Legals = () => {
    return (
        <>
        <Header />
        <main className='legals'>
            <section className="legals__content">
                <h1>Mentions légales</h1>

                <h2>Hébergement</h2>
                <p>Groupomania est hébergé par Digital Ocean</p>
                <p>Siège social: </p>
                <p className='legals__content__p2'>Cet hébergeur détient à ce jour les informations personnelles concernant l'auteur de ce site.</p>
            </section>
        </main>
        </>
    );
};

export default Legals;