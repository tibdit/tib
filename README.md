# Tibbee Integration

Libraries for tib button integration

> To find out more information about who tibbees are and what they do visit tibit.com

#### Basic vocab:
  - **btc** - Your bitcoin address (eg.: mytibs9YhLYtrVhQkmTdbDS51H54WyrxTx)
  - **subref** - Your tib subrefrence 
  - **url** - URL of the content you want tibbed

### HTML LINKS

The simplest form of a tib initiator is ```tib.me/btc```

To have two different tib links on the same with the same bitcoin address, add a subrefrence: ```tib.me/btc/subref```

Tibbing specific content urls, with a tib subrefrence: ```tib.me?PAD=btc&SUB=&TIB=url```

URL shorteners like bit.ly also work with tibit, feel free to pretty up and shorten your tib initiators :)

Why not embed your initiator as a html link?
```html
<a href="https://tib.me?PAD=mytibs9YhLYtrVhQkmTdbDS51H54WyrxTx&SUB=MyTib&TIB=http://jsbin.com/rararo">Tib Me!</a>
```
### Using an embeded button

Import the javascript magics from us and set your initiaor parameters

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/script.js/2.5.8/script.min.js"></script>
    <script>$script('http://widget.tibdit.com/assets/js/tib.js', function() { tibInit( { 
        'PAD': 'myisWNp7MH4dHtSSy9Wk6JK9QP3YkiGZVz', // Your bitcoin address
        'SUB': 'My tib', // Your tib subrefrence 
        'TIB': 'http://jsbin.com/rararo', // Content you wish to be tibbed for 
    });});</script>
```
And then palce your tib button anywhere you wish on your web page: 
```html
<button class='bd-tib-btn'></button>
```