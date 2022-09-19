import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';


const SearchModul = () => {
    return (
        <div>
            <input type="text" name="" id="" />
            <button>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="header__section__hambMenu" />
            </button>
        </div>
    );
};

export default SearchModul;