import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

import useSuperHeroService from '../../services/SuperHeroService';
import ErrorMessage from '../errorMessage/ErrorMessage';
import Spinner from '../spinner/Spinner';

import './charList.scss';

const CharList = (props) => {

    const [charList, setCharList] = useState([]);
    const [newItemLoading, setNewItemLoading] = useState(false);
    const [offset, setOffset] = useState(1);
    const [charEnded, setCharEnded] = useState(false);
    const requestedOffsets = useRef(new Set());
    
    const {loading, error, getAllCharacters} = useSuperHeroService();

    const onCharListLoaded = useCallback((newCharList, currentOffset) => {

        let ended = false;
        if(newCharList.length < 9) {
            ended = true;
        }

        setCharList(charList => {
            const loadedIds = new Set(charList.map(char => char.id));
            const uniqueCharacters = newCharList.filter(char => !loadedIds.has(char.id));

            return [...charList, ...uniqueCharacters];
        });
        setNewItemLoading(false);
        setOffset(currentOffset + 9);
        setCharEnded(ended);
    }, []);

    const onRequest = useCallback((currentOffset, initial) => {
        if (requestedOffsets.current.has(currentOffset)) {
            return;
        }

        requestedOffsets.current.add(currentOffset);
        initial ? setNewItemLoading(false) : setNewItemLoading(true);
        getAllCharacters(currentOffset)
            .then(newCharList => onCharListLoaded(newCharList, currentOffset))
            .catch(() => {
                requestedOffsets.current.delete(currentOffset);
                setNewItemLoading(false);
            });
    }, [getAllCharacters, onCharListLoaded]);

    useEffect(() => {
        onRequest(1, true);
    }, [onRequest]);

    const itemRefs = useRef([]);

    const focusOnItem = (id) => {
        itemRefs.current.forEach(item => item.classList.remove('char__item_selected'));
        itemRefs.current[id].classList.add('char__item_selected');
        itemRefs.current[id].focus();
    }

    function renderItems(arr) {
        const items =  arr.map((item, i) => {
            let imgStyle = {'objectFit' : 'cover'};
            if (item.thumbnail.includes('image_not_available.jpg')) {
                imgStyle = {'objectFit' : 'unset'};
            }
            
            return (
                <li 
                    tabIndex={0}
                    ref={el => itemRefs.current[i] = el}
                    className="char__item"
                    key={item.id}
                    onClick={() => {
                        props.onCharSelected(item.id);
                        focusOnItem(i);
                    }}
                    onKeyDown={e => {
                        if (e.key === ' ' || e.key === "Enter") {
                            props.onCharSelected(item.id);
                            focusOnItem(i);
                    }}}>
                        <img src={item.thumbnail} alt={item.name} style={imgStyle}/>
                        <div className="char__name">{item.name}</div>
                </li>
            )
        });
        return (
            <ul className="char__grid">
                {items}
            </ul>
        )
    }
    
    const items = renderItems(charList);

    const errorMessage = error ? <ErrorMessage/> : null;
    const spinner = loading  && !newItemLoading ? <Spinner/> : null;

    return (
        <div className="char__list">
            {errorMessage}
            {spinner}
            {items}
            <button 
                className="button button__main button__long"
                disabled={newItemLoading}
                style={{'display': charEnded ? 'none': 'block'}}
                onClick={() => onRequest(offset)}>
                <div className="inner">load more</div>
            </button>
        </div>
    )
}

CharList.propTypes = {
    onCharSelected: PropTypes.func.isRequired
}

export default CharList;
