$("#o_inputOrdQty").val(0);
$("#o_inputDiscount").val(0);

$(document).ready(function () {
  let nextOrderId = generateNextOrderID();
  $("#o_inputOrderId").val(nextOrderId);

  let currentDate = new Date();
  var formattedDate = currentDate.toISOString().split("T")[0];
  $("#o_inputOrderDate").val(formattedDate);

  loadItemCodes();
  loadCustIds();
});

/*$("#o_inputCustId").click(function (){
    $("#o_inputCustId").empty();
    loadCustIds();
});

$("#o_inputItmCode").click(function (){
    $("#o_inputItmCode").empty();
    loadItemCodes();
});*/

$("#o_inputCustId").on("change", function () {
  let selectedOption = $(this).val();

  let customer = o_findCustomer(selectedOption);
  $("#o_lblCustName").text(customer.name);
  $("#o_lblCustContact").text(customer.contact);
});

$("#o_inputItmCode").on("change", function () {
  let selectedOption = $(this).val();

  let item = o_findItem(selectedOption);
  $("#o_lblItmName").text(item.name);
  $("#o_lblItmUnitPrice").text(item.unitPrice);
  $("#o_lblItmQtyLeft").text(item.qty);
});

let finalTotal;
let subTotal;
$("#btnAddToCart").click(function () {
  let itmCode = $("#o_inputItmCode").val();
  let itmName = $("#o_lblItmName").text();
  let unitPrice = $("#o_lblItmUnitPrice").text();
  let qty = $("#o_inputOrdQty").val();
  let total = parseFloat(unitPrice) * parseFloat(qty);

  if (itmCode != null) {
    let itemDBQty = parseFloat($("#o_lblItmQtyLeft").text());
    let tableCheck = "notFound";
    $("#o_tBody tr").each(function () {
      let cellData = $(this).find("td:eq(0)").text();
      if (itmCode == cellData) {
        //if the itemCode is already in the table
        tableCheck = "found";
        let ordQtyValidResult = ordQtyValidation(qty);
        if (ordQtyValidResult) {
          let crntQty = parseFloat($(this).find("td:eq(3)").text());
          let newQty = crntQty + parseFloat(qty);

          if (newQty > itemDBQty) {
            alert(
              "insufficient item amount. Please order less than the amount left."
            );
          } else {
            $(this).find("td:eq(3)").text(newQty);
            let newTotal = parseFloat(unitPrice) * newQty;
            $(this).find("td:eq(4)").text(newTotal);
          }
        } else {
          alert("Order quantity required");
        }
      }
    });

    //if the itemCode is not already in the table
    if (tableCheck == "notFound") {
      let ordQtyValidResult = ordQtyValidation(qty);
      if (ordQtyValidResult) {
        if (parseFloat(qty) > itemDBQty) {
          alert(
            `insufficient item amount. Please enter an amount less than ${itemDBQty}.`
          );
        } else {
          let row = `<tr>
                   <td>${itmCode}</td>
                   <td>${itmName}</td>
                   <td>${unitPrice}</td>
                   <td>${qty}</td>
                    <td>${total}</td>
               </tr>`;

          $("#o_tBody").append(row);
          orderTblRowClicked();
        }
      } else {
        alert("Order quantity required");
      }
    }
  } else {
    alert("Please select an item first");
  }

  finalTotal = 0;
  $("#o_tBody tr").each(function () {
    let eachItemTotal = parseFloat($(this).find("td:eq(4)").text());
    finalTotal = finalTotal + eachItemTotal;
    $("#o_lblTotal").html("&nbsp;" + finalTotal + "/=");
  });

  let discount = $("#o_inputDiscount").val();
  if (discount === "") {
    subTotal = finalTotal;
  } else {
    let reduced_amount = (finalTotal / 100) * parseFloat(discount);
    subTotal = finalTotal - reduced_amount;
  }
  $("#o_lblSubTotal").html("&nbsp;" + subTotal + "/=");
});

$("#o_inputDiscount").on("keyup", function (e) {
  if (finalTotal == undefined) {
  } else {
    let discount = $("#o_inputDiscount").val();
    if (discount === "") {
      subTotal = finalTotal;
    } else {
      let reduced_amount = (finalTotal / 100) * parseFloat(discount);
      subTotal = finalTotal - reduced_amount;
    }
    $("#o_lblSubTotal").html("&nbsp;" + subTotal + "/=");
  }
});

$("#o_btnPurchase").click(function () {
  if ($("#o_inputCustId").val() != null) {
    if ($("#o_tBody tr").length == 0) {
      alert("Add something to the cart before trying to purchase");
    } else {
      let orderId = $("#o_inputOrderId").val();
      let orderDate = $("#o_inputOrderDate").val();
      let custId = $("#o_inputCustId").val();
      let discount = parseFloat($("#o_inputDiscount").val());
      let finalPrice = subTotal;
      let orderDetails = [];

      if (discount >= 0 && discount <= 100) {
        if ($("#o_inputCash").val() == "") {
          alert("input cash amount before purchasing");
        } else {
          $("#o_tBody tr").each(function () {
            let orderDetail = {
              itmCode: $(this).children().eq(0).text(),
              unitPrice: $(this).children().eq(2).text(),
              qty: $(this).children().eq(3).text(),
            };
            orderDetails.push(orderDetail);

            //reduce item quantity from the itemDB array
            let item = o_findItem(orderDetail.itmCode);
            let newQtyLeft = item.qty - orderDetail.qty;
            item.qty = newQtyLeft;
          });

          let newOrder = Object.assign({}, order);

          newOrder.oid = orderId;
          newOrder.orderDate = orderDate;
          newOrder.custID = custId;
          newOrder.discount = discount;
          newOrder.finalPrice = finalPrice;
          newOrder.orderDetails = orderDetails;

          orderDB.push(newOrder);

          alert("Order Placed Successfully");

          let nextOrderId = generateNextOrderID();
          $("#o_inputOrderId").val(nextOrderId);

          let currentDate = new Date();
          var formattedDate = currentDate.toISOString().split("T")[0];
          $("#o_inputOrderDate").val(formattedDate);

          document.getElementById("o_inputCustId").selectedIndex = -1;
          document.getElementById("o_inputItmCode").selectedIndex = -1;
          $("#o_inputOrdQty").val(0);
          $("#o_inputDiscount").val(0);
          $("#o_tBody").empty();
          $(
            "#o_lblCustName,#o_lblCustContact,#o_lblItmName,#o_lblItmUnitPrice,#o_lblItmQtyLeft,#o_lblTotal,#o_lblSubTotal"
          ).text("");
          $("#o_inputCash,#o_inputBalance").val("");
          finalTotal = 0;
          subTotal = 0;
        }
      } else {
        alert("discount must be between 0 and 100");
      }
    }
  } else {
    alert("Please select a customer ID");
  }
});

$("#o_inputCash").on("keyup", function () {
  let cash = parseFloat($("#o_inputCash").val());
  let balance = cash - subTotal;
  if (isNaN(balance)) {
  } else {
    if (balance >= 0) {
      $("#o_inputBalance").val(balance);
      $("#o_btnPurchase").prop("disabled", false);
      $("#o_inputCash").css({
        "background-color": "white",
        color: "black",
      });
    } else {
      $("#o_btnPurchase").prop("disabled", true);
      $("#o_inputCash").css({
        "background-color": "#eb4a4c",
        color: "white",
      });
      $("#o_inputBalance").val("Insufficient Cash");
    }
  }
});

function orderTblRowClicked() {
  $("#o_tBody tr:last-of-type").dblclick(function () {
    let result = confirm("are you sure to remove this item form the cart?");
    if (result) {
      $(this).remove();

      finalTotal = 0;
      if ($("#o_tBody tr").length == 0) {
        $("#o_lblTotal").html(0);
      } else {
        $("#o_tBody tr").each(function () {
          let eachItemTotal = parseFloat($(this).find("td:eq(4)").text());
          finalTotal = finalTotal + eachItemTotal;
          $("#o_lblTotal").html("&nbsp;" + finalTotal + "/=");
        });
      }

      let discount = $("#o_inputDiscount").val();
      if (discount === "") {
        subTotal = finalTotal;
      } else {
        let reduced_amount = (finalTotal / 100) * parseFloat(discount);
        subTotal = finalTotal - reduced_amount;
      }
      $("#o_lblSubTotal").html("&nbsp;" + subTotal + "/=");
    }
  });
}

function generateNextOrderID() {
  const highestOrderID = orderDB.reduce((max, order) => {
    const orderNumber = parseInt(order.oid.split("-")[1]);
    return orderNumber > max ? orderNumber : max;
  }, 0);

  const nextOrderNumber = highestOrderID + 1;
  return `OID-${String(nextOrderNumber).padStart(3, "0")}`;
}

// load CustId to Index

function loadCustIds() {
  for (let i = 0; i < customerDB.length; i++) {
    let custId = customerDB[i].id;

    $("#o_inputCustId").append(`<option>${custId}</option>`);
  }
  document.getElementById("o_inputCustId").selectedIndex = -1;
}

function loadItemCodes() {
  for (let i = 0; i < itemDB.length; i++) {
    let itemCode = itemDB[i].code;

    $("#o_inputItmCode").append(`<option>${itemCode}</option>`);
  }
  document.getElementById("o_inputItmCode").selectedIndex = -1;
}

function o_findCustomer(id) {
  return customerDB.find(function (customer) {
    return customer.id == id;
  });
}

function o_findItem(id) {
  return itemDB.find(function (item) {
    return item.code == id;
  });
}
