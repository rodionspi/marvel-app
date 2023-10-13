import Spinner_svg from './Spinner_svg.svg'

const centeredImageStyles = {
    display: 'flex',
    justifyContent: 'center'
};

const Spinner = () => {
    return (
        <div className="centered-image-container" style={centeredImageStyles}>
            <img src={Spinner_svg} alt="Spinner"/>
        </div>
    )
}

export default Spinner;