// Google reference page for Enhanced Ecommerce implementation:
// https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce

//Parses the Netsuite table, isolating each row, building an object with the line data, and emitting
//and analytics event with that object. 
function parseTable(step, lineCallback, transactionCallback) {

    //Isolate the rows
    var rows = document.getElementById('carttable').getElementsByTagName('tr');

    //Loop over the rows
    for (i = 0; i < rows.length; i++) {

        //Filter out the header row at the top and summary rows at the bototm
        var rowId = rows[i].id;
        if (rowId.match("carttablerow") && rowId != "carttablerowtotal" ) {

            //The SKU is sometimes wrapped in a link
            var skuCell = rows[i].getElementsByClassName('carttablecellproductname')[0];          
            if (skuCell.getElementsByTagName('a').length){
                var sku = skuCell.getElementsByTagName('a')[0].innerHTML;
            } else {
                var sku = skuCell.innerHTML;
            }

            //Process the price to deliver it as a clean 2dp decimal
            var priceText = rows[i].getElementsByClassName('carttablecellrate')[0].innerHTML;
            var price = parseFloat(priceText.substring(1, (priceText.length)));

            //The qty may be in an input field
            var qtyText = rows[i].getElementsByClassName('carttablecellqty')[0];
            if (qtyText.getElementsByTagName('input').length){
                var qtyText = qtyText.getElementsByTagName('input')[0].value;
            } else {
                var qtyText = qtyText.innerHTML;
            }
            var qty = parseInt(qtyText);


            //Build the data object for the line
            var line = {
                'id': sku,
                'name': rows[i].getElementsByClassName('carttablecellproductdesc')[0].innerHTML,
                'price': price,
                'quantity': qty,
            }

            //Trigger the 'line analytics' callback
            if (line) {
                lineCallback(line);
            }

        }

    }

    //Return overall transaction values

     var transaction = {
        'revenue': 0,
        'shipping': 0,
        'tax': 0
    }
    
    //The structure of the transaction summary lines is slightly different at each step
    if (step == "cart") {

        var revenueText = (document.getElementById("carttablerowtotal").getElementsByClassName("carttablecellamount")[0].innerHTML);
        transaction.revenue = parseFloat(revenueText.substring(1, (revenueText.length)));

        var taxText = (document.getElementById("carttablerowtotal").getElementsByClassName("carttablecelltax")[0]);
        //In the cart, Tax text is wrapped in a <b> tag, so strip that out
        taxText = taxText.getElementsByTagName("b")[0].innerHTML;
        transaction.tax = parseFloat(taxText.substring(1, (taxText.length)));

    } else if (step == "checkout") {

        var revenueText = (document.getElementById("ordersummary_itemtotal").getElementsByClassName("carttablecellamount")[0].innerHTML);
        transaction.revenue = parseFloat(revenueText.substring(1, (revenueText.length)));

        var taxText = (document.getElementById("ordersummary_tax").getElementsByClassName("carttablecellamount")[0].innerHTML);
        transaction.tax = parseFloat(taxText.substring(1, (taxText.length)));

        var shippingText = (document.getElementById("ordersummary_shipping").getElementsByClassName("carttablecellamount")[0].innerHTML);
        transaction.shipping = parseFloat(shippingText.substring(1, (shippingText.length)));

    } else if (step = "purchase"){

        var revenueText = (document.getElementById("ordersummary_subtotal").getElementsByClassName("carttablecellamount")[0].innerHTML);
        transaction.revenue = parseFloat(revenueText.substring(1, (revenueText.length)));

        var taxText = (document.getElementById("ordersummary_Tax").getElementsByClassName("carttablecellamount")[0].innerHTML);
        transaction.tax = parseFloat(taxText.substring(1, (taxText.length)));

        var shippingText = (document.getElementById("ordersummary_shipping").getElementsByClassName("carttablecellamount")[0].innerHTML);
        transaction.shipping = parseFloat(shippingText.substring(1, (shippingText.length)));

    }

    //Trigger the 'transaction-level analytics' callback
    transactionCallback(transaction);

}
