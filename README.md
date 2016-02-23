<a href= "http://tib.me/mytibs9YhLYtrVhQkmTdbDS51H54WyrxTx" target="_blank" ><img src=https://tibit.com/wordpress/wp-content/themes/x-child/img/BasicPNGButton.png></a>


# Tibbee Integration

Libraries for tib button integration

> To find out more information about who tibbees are and more information about tibbing visit [tibit.com](http://tibit.com/)

#### Basic vocab:
  - **btc** - Your bitcoin address (eg.: mytibs9YhLYtrVhQkmTdbDS51H54WyrxTx)
  - **subref** - Your tib subrefrence 
  - **url** - URL of the content you want tibbed

### HTML LINKS

The simplest form of a tib initiator is ```tib.me/btc```

To have two different tib links on the same with the same bitcoin address, add a subrefrence: ```tib.me/btc/subref```

Tibbing specific content urls, with a tib subrefrence: ```tib.me?PAD=btc&SUB=&TIB=url```

URL shorteners like bit.ly also work with tibit, feel free to pretty up and shorten your tib initiators :)

Why not embed your initiator as a HTML link?
```html
<a href="https://tib.me?PAD=mytibs9YhLYtrVhQkmTdbDS51H54WyrxTx&SUB=MyTib&TIB=http://jsbin.com/rararo">Tib Me!</a>
```
### Using an embedded button

Import the javascript magics from us and set your initiator parameters

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/script.js/2.5.8/script.min.js"></script>
    <script>$script('http://widget.tibdit.com/assets/js/tib.js', function() { tibInit( { 
        'PAD': 'myisWNp7MH4dHtSSy9Wk6JK9QP3YkiGZVz', // Your bitcoin address
        'DUR': '3', // Duration in days of the tibbing cookie which will be set when a tib is confirmed (optional)
        'TIB': 'http://www.website.com/', // Content you wish to be tibbed for (optional)
        'BTN': 'bubble', // Button styles which can be set site-wide (optional)
        'CBK' : 'http://www.website.com/thanks', // Site which the tib windo will redirect after a tib is confirmed (optional)
    });});</script>
```
And then place your tib button anywhere you wish on your web page: 
```html
<button class='bd-tib-btn'></button>
```
Button styles and other parameters can be set individually on each button using the ```data-bd-PARAM=''``` attribute.
For example:
```html 
<button class='bd-tib-btn' data-bd-BTN='coin' data-bd-SUB='hello' data-bd-TIB="http://www.hello.com/" data-bd-CBK="http://www.hello.com/thank-you"></button>
```
You can change the colour of the buttons by overwrting the css like this:
``` css
.bd-tib-btn .bd-btn-backdrop { fill: pink;}
```

[All button styles are listed here](http://sep15.staging.tibdit.com/wordpress/collect-tibs/#tibdetection)

### Detecting tibs 

A tib token will be passed to the CBK url which you can processed by URL decoding followed by base64 decoding.

Each tib token has a unique ```tibsig``` param, which you can verify by following these instructions:

1. Copy token, url decode it, base64 decode it, and save it to a file. ```$ openssl base64 -A -d <<< 'eCDwCudAeytoGZLq4p12nucQIOYtw=' > tibtoken.txt ```

2. Generate a SHA-1 hash with the token file as the input. ```$ openssl dgst -sha1 -binary -out digest token.txt```	

3. Copy signature, url decode it, base64 decode it, and save it to a file. ```$ openssl base64 -A -d <<< 'MCECDwCudAeytoGZLq4p12nucQIOYtw=' > sig```

4. Get the public key from [our website](http://widget.tibdit.com/pub.key).

5. Verify the signature, using the public key and the digest: ```$ openssl pkeyutl -verify -in digest -sigfile sig -pubin -inkey pub.key```	
