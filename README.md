#Resources

##Ionic Commands
[Generator](https://github.com/diegonetto/generator-ionic)

to copy all files to www older `grunt cordova`

run `grunt emulate:android`



##Google Sign In For Cordova

[Article](http://phonegap-tips.com/articles/google-api-oauth-with-phonegaps-inappbrowser.html)

[Github](https://github.com/mdellanoce/google-api-oauth-phonegap)

![Create Client ID](/docs/GoogleSign_CreateClientID.png)

![Get This Error](/docs/GoogleSign_Error.png)

Q: How to solve?

A: Install the InAppBrowser plugin

[Get Log From Android Emulator](file:///D:/Mobile/Android/android-sdk/docs/tools/debugging/debugging-log.html)


Get log from device

`adb logcat CordovaLog:D *:S`

For development in local browser we need to have this origin: `http://127.0.0.1:9000/`

For Android emulator seem to work with `http://localhost:63342` or `http://127.0.0.1:9000/`
but maybe we need `http://localhost`

`cordova plugins`

To install the InAppBrowser plugin (if necessary)...

`cordova plugin add org.apache.cordova.inappbrowser`


