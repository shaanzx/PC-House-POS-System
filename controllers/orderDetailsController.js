$("#od_btnGetDetails").click(function (){
    if($("#od_inputOrderId").val()==""){
        alert("Enter an order ID")
    }else{
        let order = od_findOrder($("#od_inputOrderId").val());
        if(order == undefined){
            alert("Order ID not found");
        }else{
            $("#od_lblContainer,#od_tblContainer").css("display", "block");
            let odate = order.orderDate;
            let custId = order.custID;
            let discount = order.discount;
            let total = order.finalPrice;
            let orderDetails = order.orderDetails;

            $("#od_lblDate").text(odate);
            $("#od_lblCustId").text(custId);
            $("#od_lblDiscount").text(discount);
            $("#od_lbltotal").text(total);

            for (let i = 0; i < orderDetails.length; i++){
                let itemCode = orderDetails[i].itmCode;
                let unitPrice = orderDetails[i].unitPrice;
                let qty = orderDetails[i].qty;

                let row = `<tr>
                               <td>${itemCode}</td>
                               <td>${unitPrice}</td>
                               <td>${qty}</td>
                          </tr>`;

                $("#od_tBody").append(row);
            }
        }
    }
});

function od_findOrder(id){
    return orderDB.find(function (order) {
        return order.oid == id;
    });
}

$("#od_lblContainer,#od_tblContainer").css("display", "none");