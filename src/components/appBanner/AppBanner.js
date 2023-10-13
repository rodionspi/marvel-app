import './appBanner.scss';
import avengers from '../../resources/img/Avengers.png';
import avengersLogo from '../../resources/img/Avengers_logo.png';

const AppBanner = () => {
    return (
        <div className='app_banner'>
            <img src={avengers} alt='Avengers'/>
            <div className="app_banner-text">
                New comics every week!<br/>
                Stay turned!
            </div> 
            <img src={avengersLogo} alt='Avengers logo'/>
        </div>
    )
}

export default AppBanner;