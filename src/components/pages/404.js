import ErrorMessage from "../errorMessage/ErrorMessage";
import { Link } from "react-router-dom";

const Page404 = () => {
    return (
        <div style={{textAlign: "center"}}>
            <ErrorMessage/>
            <p style={{'textAlign': 'center', 'fontWeight': 'bold', 'fontSize': '24px'}}>Page doesn't exist</p>
            <Link style={{'display': 'inline-block', 'border': '2px solid black', 'border-radius': '5px', 'width': '200px', 'color': '#9f0013', 'textAlign': 'center', 'fontWeight': 'bold', 'fontSize': '20px', 'marginTop': '30px'}} to="/">Back to previous page</Link>
        </div>
    )
}

export default Page404;