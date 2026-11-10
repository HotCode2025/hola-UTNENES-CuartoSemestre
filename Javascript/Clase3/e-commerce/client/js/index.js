const shopContent = document.getElementById("shopContent");
const verCarrito = document.getElementById("verCarrito");
const modalContainer = document.getElementById("modal-container");
const cantidadCarrito = document.getElementById("cantidadCarrito");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

productos.forEach((product) => {
  const content = document.createElement("div");
  content.className = "card";
  content.innerHTML = `
    <img src="${product.img}">
    <h3>${product.productName}</h3>
    <p>${product.price} $</p>
  `;

  shopContent.append(content);

  const buyButton = document.createElement("button");
  buyButton.innerText = "Comprar";
  content.append(buyButton);

  buyButton.addEventListener("click", () => {
    const repeat = cart.some((repeatProduct) => repeatProduct.id === product.id);

    if (repeat) {
      cart.map((prod) => {
        if (prod.id === product.id) {
          prod.quanty++;
        }
      });
    } else {
      cart.push({
        id: product.id,
        productName: product.productName,
        price: product.price,
        quanty: product.quanty,
        img: product.img,
      });
    }

    cartCounter();
    saveLocal();

    // Notificación Toastify
    Toastify({
      text: `${product.productName} agregado al carrito`,
      duration: 2000,
      gravity: "bottom",
      position: "right",
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
        borderRadius: "8px",
      },
    }).showToast();
  });
});

const saveLocal = () => {
  localStorage.setItem("cart", JSON.stringify(cart));
};