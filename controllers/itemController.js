getAllItems();

$(document).ready(function () {
  let nextItemCode = generateNextItemID();
  $("#inputItemCode").val(nextItemCode);
});

//save btn action
$("#i_btnSave").click(function () {
  saveItem();
  $("#o_inputItmCode").empty();
  loadItemCodes();
  getAllItems();
  clearItemTxtFields();
});

//update btn action
$("#i_btnUpdate").click(function () {
  let id = $("#inputItemCode").val();
  updateItem(id.trim());
  getAllItems();
  clearItemTxtFields();
});

//delete btn action
$("#i_btnDelete").click(function () {
  let id = $("#inputItemCode").val();
  deleteItem(id.trim());
  getAllItems();
  clearItemTxtFields();
});

//clear btn action
$("#i_btnClear").click(function () {
  clearItemTxtFields();
});

//search btn action
$("#i_btnSearch").click(function () {
  let itmId = $("#i_inpSearch").val();

  let item = findItem(itmId.trim());

  if (item == undefined) {
    alert(`no item found with the code: ${itmId} . Please try again.`);
    $("#i_inpSearch").val("");
  } else {
    setDataToItemTxtFields(
      item.code,
      item.name,
      item.unitPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      item.qty
    );
    $("#i_collapseOne").collapse("show");
    $("#i_inpSearch").val("");
  }
});

function saveItem() {
  let itmCode = $("#inputItemCode").val();

  if (findItem(itmCode.trim()) == undefined) {
    let itmName = $("#inputItemName").val();
    let itmUnitPrice = $("#inputItemUnitPrice").val();
    let itmQty = $("#inputItemQtyOnHand").val();

    let newItem = Object.assign({}, item);

    newItem.code = itmCode;
    newItem.name = itmName;
    newItem.unitPrice = itmUnitPrice;
    newItem.qty = itmQty;

    itemDB.push(newItem);
  } else {
    alert(`item with the code: ${itmCode} already exists.`);
  }
}

function updateItem(id) {
  let item = findItem(id);

  if (item == undefined) {
    alert(`No item with the code: ${id} . Please check the code again.`);
  } else {
    let result = confirm("Confirm item details updating process?");
    if (result) {
      let itmName = $("#inputItemName").val();
      let itmUnitPrice = $("#inputItemUnitPrice").val();
      let itmQty = $("#inputItemQtyOnHand").val();

      item.name = itmName;
      item.unitPrice = itmUnitPrice;
      item.qty = itmQty;
    }
  }
}

function deleteItem(id) {
  let item = findItem(id);

  if (item == undefined) {
    alert(`No item with the code: ${id} . Please check the code again.`);
  } else {
    let result = confirm("Are you sure you want to remove this item?");
    if (result) {
      let status = "pending";
      for (let i = 0; i < itemDB.length; i++) {
        if (itemDB[i].code == id) {
          itemDB.splice(i, 1);
          status = "done";
          alert("item deleted successfully");
        }
      }
      if (status == "pending") {
        alert("item not removed");
      }
    }
  }
}

function findItem(id) {
  return itemDB.find(function (item) {
    return item.code == id;
  });
}

function getAllItems() {
  $("#i_tBody").empty();

  for (let i = 0; i < itemDB.length; i++) {
    let code = itemDB[i].code;
    let name = itemDB[i].name;
    let unitPrice = itemDB[i].unitPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    let qty = itemDB[i].qty;

    let row = `<tr>
                   <td>${code}</td>
                   <td>${name}</td>
                   <td>${unitPrice}</td>
                   <td>${qty}</td>
                   </tr>`;

    $("#i_tBody").append(row);
  }
  onTblItemRowClick();
}

function onTblItemRowClick() {
  let singleClickTimer;

  $("#i_tBody>tr").on("mousedown", function (event) {
    if (event.which === 1) {
      // Left mouse button (1) clicked
      let row = $(this);
      if (singleClickTimer) {
        clearTimeout(singleClickTimer);
        singleClickTimer = null;
        // Handle double click
        deleteItem(row.children().eq(0).text());
        getAllItems();
      } else {
        singleClickTimer = setTimeout(function () {
          singleClickTimer = null;
          // Handle single click
          let code = row.children().eq(0).text();
          let name = row.children().eq(1).text();
          let unitPrice = row.children().eq(2).text();
          let qty = row.children().eq(3).text();
          setDataToItemTxtFields(code, name, unitPrice, qty);
          $("#i_collapseOne").collapse("show");
          $("#i_collapseOne")[0].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300); // Adjust the delay (300 milliseconds) as needed
      }
    }
  });
}

function setDataToItemTxtFields(code, name, unitPrice, qty) {
  $("#inputItemCode").val(code);
  $("#inputItemName").val(name);
  $("#inputItemUnitPrice").val(unitPrice);
  $("#inputItemQtyOnHand").val(qty);

  $(
    "#inputItemCode,#inputItemName,#inputItemUnitPrice,#inputItemQtyOnHand"
  ).addClass("border-secondary-subtle");
  setItemBtn();
}

function clearItemTxtFields() {
  $(
    "#inputItemCode,#inputItemName,#inputItemUnitPrice,#inputItemQtyOnHand"
  ).val("");
  $(
    "#inputItemCode,#inputItemName,#inputItemUnitPrice,#inputItemQtyOnHand"
  ).addClass("border-secondary-subtle");
  setItemBtn();
  $(".i_err-label").css("display", "none");
}

function generateNextItemID() {
  const highestItemID = itemDB.reduce((max, item) => {
    const itemCode = parseInt(item.code.split("-")[1]);
    return itemCode > max ? itemCode : max;
  }, 0);

  const nextItemCode = highestItemID + 1;
  return `I00-${String(nextItemCode).padStart(3, "0")}`;
}
