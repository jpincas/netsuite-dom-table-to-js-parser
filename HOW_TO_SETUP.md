# How to set up Google Analytics Enhanced E-Commerce in Netsuite SiteBuilder Websites

Unfortunately, getting ecommerce data into GA from Netsuite websites isn't as simple as copy-pasting a snippet of code or even multiple snippets of code.  Since we sometimes have to parse cart tables for data, we'll often have to wait for this parsing to finish before sending analytics data, which introduces a certain level of complexity.

Since each page in your site plays a different role and therefore sends differernt data to analytics, the setup is different for each page also.

Here's a rough guide to getting it working using 'table-parser.js' from this repo.  The whole thing is a headache and a bit of a hack, but it can be made to work somewhat well.  Be warned though, I expect this solution to be fairly buggy and brittle, but as longtime Netsuite site operaters know, that comes with the territory!

**First a few tips:**

- Use 'Web Site Tags' to copy and store these code snippets, then include the tag in the relevant parts of the relevant pages, rather than including the code directly.

- Replace the placeholder analytics ID with your account number.

- Replace the domain names in the cross-linker with your own.

- In the Google analytics console, set up 2 checkout steps.

- Remeber that you might have to do all of these code insertions in multiple templates, depending on how your webstore is set up.

- This will only set up analytics for 'ecommerce' pages.  Since we won't be using a generic snippet that is included in the header/footer of every page, you'll need to go to the extra lengths of including a generic snippet for content-type pages in the relevant templates.

- Each installation is different, so use this guide as a starting point and make any changes relevant to your acccount / website.  Pay particular attention to the Netsuite server tags and make sure they are the same as for your account - if not, substitute them for yours!


## Listing (Category) Pages

I'm assuming you don't have an 'Add to Cart' button in your list view.  If you do, you'll have to include the 'Add to Cart' code from the next section.

Put this code at the TOP of your list template(s):

```html
<script>
    //Basic analytics setup
    (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date(); a = s.createElement(o),
                m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-xxxxxxxxx', 'auto');  //Set to your analytics account
    ga('require', 'ec');
    ga('require', 'linker');
    ga('linker:autoLink', [ 'yourmaindomain.com, 'yournetsuitecheckoutdomain.com' ]); //Set to your domains

    var customerId = "<%=getCurrentAttribute('customer', 'internalid')%>";
    if (customerId) {
        ga('set', 'userId', customerId); // Set the user ID using signed-in user_id.
    }

    // Called when a link to a product is clicked.
    function onProductClick(product) {
        
        ga('ec:addProduct', product);
        ga('ec:setAction', 'click', {list: "<%=getCurrentAttribute('sitecategory','itemid')%>"});

        // Send click with an event, then send user to product page.
        ga('send', 'event', 'UX', 'click', 'Results', {
            hitCallback: function() {
                return true;
            }
        });
    }
</script>
```

Put this code at the BOTTOM of your list template(s):

```Html
<script>
ga('send', 'pageview');
</script>
```

Put this code AT THE TOP OF EACH PRODUCT CELL of your list template(s):

```html
<script>
var thisProduct = {
        'id': "<%=getCurrentAttribute('item','itemid')%>",                   
        'name': "<%=getCurrentAttribute('item','storedescription')%>",
        'brand': "<%=getCurrentAttribute('item','custitembrand')%>", //Substitute for your custom tag for brand
        'price': "<%=getCurrentAttribute('item', 'salesPrice')%>",
        'category' : "<%=getCurrentAttribute('sitecategory','itemid')%>"
    }
  ga('ec:addImpression', thisProduct);
</script>
```

Finally, for each link to the product drilldown page in the cell template, you'll need to trigger the 'Product Clicked' function when it is clicked, e.g., 

```html
<a onclick="onProductClick(thisProduct)"></a> //For all links
```

## Product Drilldown Pages

Place this code AT THE TOP of the drilldown template (in the 'Addition to HEAD' section, for example)

```html
<script>

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-xxxxxxxxx', 'auto');
  ga('require', 'ec');
ga('require', 'linker');
  ga('linker:autoLink', [ 'yourmaindomain.com, 'yournetsuitecheckoutdomain.com' ]); //Set to your domains

  var customerId = "<%=getCurrentAttribute('customer', 'internalid')%>";
    if (customerId) {
      ga('set', 'userId', customerId); // Set the user ID using signed-in user_id.
   }

ga('ec:addProduct', {
  'id': "<%=getCurrentAttribute('item','itemid')%>",                   // Product details are provided in an impressionFieldObject.
  'name': "<%=getCurrentAttribute('item','storedescription')%>",
  'brand': "<%=getCurrentAttribute('item','custitembrand')%>",
 'price': "<%=getCurrentAttribute('item', 'salesPrice')%>",
  'category' : "<%=getCurrentAttribute('sitecategory','itemid')%>"
});

ga('ec:setAction', 'detail');

ga('send', 'pageview');

// Called when a product is added to a shopping cart.
function addToCart() {
  ga('ec:addProduct', {
  'id': "<%=getCurrentAttribute('item','itemid')%>",                   // Product details are provided in an impressionFieldObject.
  'name': "<%=getCurrentAttribute('item','storedescription')%>",
  'brand': "<%=getCurrentAttribute('item','custitembrand')%>",
 'price': "<%=getCurrentAttribute('item', 'salesPrice')%>",
  'category' : "<%=getCurrentAttribute('sitecategory','itemid')%>"
  });
  ga('ec:setAction', 'add');
  ga('send', 'event', 'UX', 'click', 'add to cart');     // Send data using an event.
}


</script>
```

Now you just have to trigger the 'Add to Cart' function when the product is added to the cart, which is easier said than done.  You're going to have to customise your 'Add to Cart' button, which is in your 'Web Site Theme', on the 'Tabs and Button' tab.  Find the 'Add to Cart' button code, and slip the following snippet into the INPUT tag:

```javascript
onclick="preCartAdd();
```

Now go back to your drilldown template, and in the 'Addition to HEAD' section add this snippet:

```html
<script>
function preCartAdd() {
addToCart();
}
</script>
```

This will cause the 'addToCart' function to fire when the product is added to the cart, and the event and relevant data to be sent to analytics.

## Cart

Here's where we get to use the table parser for the first time.  Exciting! Make sure you've set up the 'checkout' steps in the Google Analytics console.  This is step 1 - I call it 'Cart'.

Go to Website > Tabs > Shopping Basket

In the MESSAGE HTML box (not the 'Greeting' - if you put it in the Greeting it will fire before the Cart table has been built and will fail):

```html
<script src='/js/table-parser.js'></script>

<script>

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-xxxxxxx', 'auto');
  ga('require', 'ec');
ga('require', 'linker');
  ga('linker:autoLink', [ 'yourmaindomain.com, 'yournetsuitecheckoutdomain.com' ]); //Set to your domains

  var customerId = "<%=getCurrentAttribute('customer', 'internalid')%>";
    if (customerId) {
      ga('set', 'userId', customerId); // Set the user ID using signed-in user_id.
   }

//Get the lines and transaction detail
var result = parseTable('cart');
for (i=0; i < result.lines.length; i++){
	ga('ec:addProduct', result.lines[i]);
}

ga('ec:setAction', 'checkout', {
    'step': 1       // A value of 1 indicates this action is first checkout step.
});

ga('send', 'pageview');

</script>
```

## Checkout

This is the final checkout step in Netsuite, where a summary of the order is shown.  The code is similar to the above.

Go to Website > Tabs > checkout

In 'Place Order Message':

```html
<script src='/js/table-parser.js'></script>
<script>

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-xxxxxxxxx', 'auto');
  ga('require', 'ec');
ga('require', 'linker');
  ga('linker:autoLink', [ 'yourmaindomain.com, 'yournetsuitecheckoutdomain.com' ]); //Set to your domains

  var customerId = "<%=getCurrentAttribute('customer', 'internalid')%>";
    if (customerId) {
      ga('set', 'userId', customerId); // Set the user ID using signed-in user_id.
   }

var result = parseTable('checkout');

for (i=0; i < result.lines.length; i++){
	ga('ec:addProduct', result.lines[i]);
}

ga('ec:setAction', 'checkout', {
    'step': 2       // A value of 1 indicates this action is first checkout step.
});

ga('send', 'pageview');

</script>
```

## Purchase

Finally, this is where the money is.  Stay on the same tab as above and put the following code in the 'Order Confirmation Message'.  Notice how the whole thing is wrapped in a function to execute only once the DOM has finished loading - that's to ensure that the cart table on the Order Thanks page has been constructed before we try to analyse it.

```html
<script src='/js/table-parser.js'></script>
<script>

document.addEventListener("DOMContentLoaded", function(event) { 
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-xxxxxxx', 'auto');
  ga('require', 'ec');
ga('require', 'linker');
    ga('linker:autoLink', [ 'yourmaindomain.com, 'yournetsuitecheckoutdomain.com' ]); //Set to your domains

  var customerId = "<%=getCurrentAttribute('customer', 'internalid')%>";
    if (customerId) {
      ga('set', 'userId', customerId); // Set the user ID using signed-in user_id.
   }

var result = parseTable('purchase');

for (i=0; i < result.lines.length; i++){
	ga('ec:addProduct', result.lines[i]);
}

result.transaction.id = Date.now();

ga('ec:setAction', 'purchase', result.transaction);

ga('send', 'pageview');
});

</script>
```

Now you've more or less finished.  Don't say I didn't warn that this was going to be a royal pain.











