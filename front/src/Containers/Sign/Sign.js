import React from 'react';

const Sign = () => {
    return (
        <main>
            <form action="">
                <div className="">
                    <div className="">
                        <label htmlFor="">Email</label>
                        <input type="email" />
                    </div>
                    <div className="">
                        <label htmlFor="">Mot de passe</label>
                        <input type="password" />
                    </div>
                </div>
                <div className="">
                    <div className="">
                        <label htmlFor="">Prenom</label>
                        <input type="text" />
                    </div>
                    <div className="">
                        <label htmlFor="">Nom</label>
                        <input type="text" />
                    </div>
                </div>
                <div className=''>
                    <div className="">
                        <input type="checkbox" name="" id="" />
                        <label htmlFor="">En cochant cette case blablabla</label>
                    </div>
                </div>
                <div className="">
                    <button>OK</button>
                </div>
            </form>
        </main>
    );
};

export default Sign;