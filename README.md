#Cart Table Parsing for Netsuite Generated E-Commerce Pages

##Summary

Analytics JS code (in the main Google, but this applies to most analytics code) requires product and transaction details in a sane format (i.e. an array of objects) in order to communicate useful information to the analytics service.

In order to set up e-commerce analytics for a Netsuite site, unfortunately we're going to have to parse out these details from the 'cart tables' created by Netsuite on the cart page, checkout page, and 'thanks for your order' page - we can then ping them to Google, or any other analytics service easily.

As you might expect, the cart tables are subtly different depending on where they appear.  table-parser.js contains a single function, parseTable(), that should get the job of parsing these table done with minimum fuss.

##Usage

```javascript
parseTable(step) 
//where step = 'cart', 'checkout' or 'purchase'


var result = parseTable('purchase');

for (i=0; i < result.lines.length; i++){
	ga('ec:addProduct', result.lines[i]);
}

ga('ec:setAction', 'purchase', result.transaction);

```

##Examples

Check out cart.html, checkout.html and purchase.html for example tables - check the the console in dev tools to see the line and transaction level analytics events being logged to the console.

##How to Install Google Analytics for Enhanced Ecommerce in Netsuite Sites

I've included a more thorough guide to the complate installation procedure in HOW_TO_SETUP.md.  Warning: it's messy.

##Disclaimer

This is a hack, which is necessary because we only have access to the server-generated DOM.  It could be fairly brittle code, in that if Netsuite ever decides to change the structure of the tables it generates, it will break.  I'm also unsure as to whether the structure of the tables will be the same for everyone - I **strongly** suggest examining the HTML of the tables generated for your site and making any necessary changes to the parser.

