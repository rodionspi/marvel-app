<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>

<div class="container">
    <h1 style="font-weight: bold; color: #CD5C5C">Marvel App</h1>
    <img src="./public/WebsiteFoto.png" alt="Website Image">
    <h2>Steps to Start the Program</h2>
    <ul>
        <li><p>Prior to commencing use of this application, it is necessary to install all the requisite packages.</p></li>
        <li><p style="margin-bottom: 0px">A new folder must be created in the <code>src/resources</code> directory and named <code>apiKey.js</code> This folder should contain the API key and API base.</p></li>
        <ul>
            <li style="list-style-type: circle; "><p style="font-size: 12px">API key is your own key for request</p></li>
            <li style="list-style-type: circle; "><p style="font-size: 12px">The API base represents the fundamental root of a request, which remains unaltered as the server processes subsequent requests. To illustrate, consider the following URL: "https://gateway.marvel.com:.../public/characters?limit=9&offset=210&apikey=" (your Api Key );</p>
            <p style="font-size: 12px">The offset and limit values can be specified on the <a href="https://developer.marvel.com/docs">Marvel API website</a>(Please be advised that registration is required.)</p></li>
        </ul>
    </ul>
  <p>In the project directory, you can run:</p>
  <h3><code>yarn/npm start</code></h3>
  <p>Runs the app in the development mode.<br>
      Open <a href="http://localhost:3000" target="_blank">http://localhost:3000</a> to view it in the browser.</p>
  <p>The page will reload automatically if you make changes.<br>
      You will also see any lint errors in the console.</p>

  <h3><code>yarn/npm test</code></h3>
  <p>Launches the test runner in the interactive watch mode.<br>
      See the section about <a href="https://facebook.github.io/create-react-app/docs/running-tests" target="_blank">running tests</a> for more information.</p>

  <h3><code>yarn/npm build</code></h3>
  <p>Builds the app for production to the <code>build</code> folder.<br>
      It correctly bundles React in production mode and optimizes the build for the best performance.</p>
  <p>The build is minified and the filenames include the hashes.<br>
      Your app is ready to be deployed!</p>
  <p>See the section about <a href="https://facebook.github.io/create-react-app/docs/deployment" target="_blank">deployment</a> for more information.</p>

  <h3><code>yarn/npm eject</code></h3>
  <p><strong>Note: this is a one-way operation. Once you <code>eject</code>, you can’t go back!</strong></p>
  <p>If you aren’t satisfied with the build tool and configuration choices, you can <code>eject</code> at any time. This command will remove the single build dependency from your project.</p>
  <p>Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc.) right into your project so you have full control over them. All of the commands except <code>eject</code> will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.</p>
  <p>You don’t have to ever use <code>eject</code>. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However, we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.</p>

  <h2>Author</h2>
  <a href="https://github.com/rodionspi">rodionspi</a>
</div>

</body>
</html>
