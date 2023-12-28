import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';

import Spinner from '../../spinner/Spinner';
import ErrorMessage from '../../errorMessage/ErrorMessage';
import useMarvelService from '../../../services/MarvelService';
import AppBanner from '../../appBanner/AppBanner';
import './singleCharPage.scss';

const SingleCharPage = () => {
    const {charId} = useParams();
    const [char, setChar] = useState(null);
    const {loading, error, getCharacter, clearError} = useMarvelService();

    useEffect(() => {
        updateChar()
    }, [charId]);

    const updateChar = () => {
        clearError();
        getCharacter(charId)
            .then(onCharLoaded)
    }

    const onCharLoaded = (char) => {
        setChar(char);
    }

    const errorMessage = error ? <ErrorMessage/> : null;
    const spinner = loading ? <Spinner/> : null;
    const content = !(loading || error || !char) ? <View char={char}/> : null;

    return (
        <>
            <AppBanner/>
            {errorMessage}
            {spinner}
            {content}
        </>
    )
}

const View = ({char}) => {
    const {name, description, thumbnail} = char;

    return (
        <div className="single-char">
            <Helmet>
                <meta
                    name="description"
                    content={`Information about ${name}`}/>
                <title>{name}</title>
            </Helmet>
            <img src={thumbnail} alt={name} className="single-char__img"/>
            <div className="single-char__info">
                <h2 className="single-char__name">{name}</h2>
                <p className="single-char__descr">{description}</p>
            </div>
        </div>
    )
}

export default SingleCharPage;