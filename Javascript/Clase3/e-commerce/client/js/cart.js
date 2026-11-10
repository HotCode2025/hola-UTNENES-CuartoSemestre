const displayCart = () => {
  modalContainer.innerHTML = "";
  modalContainer.style.display = "block";

  // 1. Header del Modal
  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";
  modalHeader.innerHTML = `
    <h2 class="modal-header-title">Carrito</h2>
    <span class="modal-header-button">❌</span>
  `;
  modalContainer.append(modalHeader);

  const modalButton = modalHeader.querySelector(".modal-header-button");
  modalButton.addEventListener("click", () => {
    modalContainer.style.display = "none";
  });

  // Carrito vacío
  if (cart.length === 0) {
    const emptyCartText = document.createElement("h2");
    emptyCartText.className = "modal-body";
    emptyCartText.innerText = "El carrito está vacío 🛒";
    modalContainer.append(emptyCartText);
    return;
  }

  // 2. Body del Modal
  cart.forEach((product) => {
    const modalBody = document.createElement("div");
    modalBody.className = "modal-body";
    modalBody.innerHTML = `
      <img class="product-img" src="${product.img}">
      <div class="product-info">
        <h4>${product.productName}</h4>
      </div>
      <div class="quantity">
        <span class="quantity-btn-decrese">-</span>
        <span class="quantity-input">${product.quanty}</span>
        <span class="quantity-btn-increse">+</span>
      </div>
      <div class="price">$ ${product.price * product.quanty}</div>
      <span class="delete-product">❌</span>
    `;
    modalContainer.append(modalBody);

    const decrease = modalBody.querySelector(".quantity-btn-decrese");
    decrease.addEventListener("click", () => {
      if (product.quanty !== 1) {
        product.quanty--;
      }
      displayCart();
      cartCounter();
      saveLocal();
    });

    const increase = modalBody.querySelector(".quantity-btn-increse");
    increase.addEventListener("click", () => {
      product.quanty++;
      displayCart();
      cartCounter();
      saveLocal();
    });

    const deleteProduct = modalBody.querySelector(".delete-product");
    deleteProduct.addEventListener("click", () => {
      deleteCartProduct(product.id);
    });
  });

  // 3. Footer del Modal
  const total = cart.reduce((acc, el) => acc + el.price * el.quanty, 0);

  const modalFooter = document.createElement("div");
  modalFooter.className = "modal-footer";
  modalFooter.innerHTML = `
    <div class="total-price">Total: $ ${total}</div>
  `;
  modalContainer.append(modalFooter);
};

// Eliminar producto con SweetAlert2
const deleteCartProduct = (id) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "El producto será eliminado del carrito",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#222222",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      const foundId = cart.findIndex((element) => element.id === id);
      cart.splice(foundId, 1);
      displayCart();
      cartCounter();
      saveLocal();

      Swal.fire({
        title: "¡Eliminado!",
        text: "El producto fue removido correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
};

const cartCounter = () => {
  const cartLength = cart.reduce((acc, el) => acc + el.quanty, 0);
  cantidadCarrito.innerText = cartLength;
};

cartCounter();

verCarrito.addEventListener("click", displayCart);