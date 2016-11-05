// Google reference page for Enhanced Ecommerce implementation:
// https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce

//Parses the Netsuite table, isolating each row, building an object with the line data, and emitting
//and analytics event with that object. 
function parseTable(tableName) {

    //Isolate the rows
    var rows = document.getElementById(tableName).getElementsByClassName('uir-list-row-tr');

    //Loop over the rows
    for (i = 0; i < rows.length; i++) {

        //Extraction of the sku is slightly complicated by the fact that it is wrapped in link
        var skuCell = rows[i].getElementsByClassName('carttablecellproductname')[0];
        var sku = skuCell.getElementsByTagName('a')[0].innerHTML;

        //Process the price to deliver it as a clean 2dp decimal
        var priceText = rows[i].getElementsByClassName('carttablecellrate')[0].innerHTML;
        var price = parseFloat(priceText.substring(1, (priceText.length)));

        //Parse the quantity to deliver as an int
        var qtyText = rows[i].getElementsByClassName('carttablecellqty')[0].innerHTML;
        var qty = parseInt(qtyText);


        //Build the data object for the line
        var line = {
            'id': sku,
            'name': rows[i].getElementsByClassName('carttablecellproductdesc')[0].innerHTML,
            'price': price,
            'quantity': qty,
        }

        //Emit the line to analytics
        if (line) {
            emitLine(line);
        }

    }

    //Return overall transaction values

    var revenueText = (document.getElementById("ordersummary_itemtotal").getElementsByClassName("carttablecellamount")[0].innerHTML);
    var revenue = parseFloat(revenueText.substring(1, (revenueText.length)));

    var taxText = (document.getElementById("ordersummary_tax").getElementsByClassName("carttablecellamount")[0].innerHTML);
    var tax = parseFloat(taxText.substring(1, (revenueText.length)));

    var shippingText = (document.getElementById("ordersummary_shipping").getElementsByClassName("carttablecellamount")[0].innerHTML);
    var shipping = parseFloat(shippingText.substring(1, (revenueText.length)));

    return {
        'revenue': revenue,
        'shipping': shipping,
        'tax': tax
    }

}

//Called for each line on the transaction, use to emit a line level analytics event
function emitLine(line) {

    ga('ec:addProduct', line);

}

function processAnalytics(step) {

    //Parse the table, emitting lines and returning the overall transaction data
    var transaction = parseTable('carttable');
    //Emit the transaction
    if (step == "checkout1") {
        ga('ec:setAction', 'checkout', {
            'step': 1       // A value of 1 indicates this action is first checkout step.
        });
    } else if (step == "checkout2") {
        ga('ec:setAction', 'checkout', {
            'step': 1       // A value of 1 indicates this action is first checkout step.
        });
    } else if (step == "purchase") {
        ga('ec:setAction', 'purchase', transaction);
    }

}