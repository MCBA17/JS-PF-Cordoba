let users = [];

function cargarUsuarios() {
    return new Promise((resolve, reject) => {
        let usuariosGuardados = localStorage.getItem('users');
        if (usuariosGuardados) {
            resolve(JSON.parse(usuariosGuardados));
        } else {
            reject(new Error('No se encontraron usuarios en el almacenamiento local'));
        }
    });
}

cargarUsuarios()
    .then(usuarios => {
        users = usuarios;
        console.log('Usuarios cargados');
    })
    .catch(error => {
        console.error('Error al cargar usuarios:', error.message);
    });

cargarUsuarios();

let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

function register() {
    let username = document.getElementById('registerUsername').value;
    let password = document.getElementById('registerPassword').value;
    let confirmPassword = document.getElementById('confirmPassword').value;

    if (isLoggedIn) {
        Swal.fire({
            title: "Error",
            text: "Cierra sesión para crear otra cuenta.",
            icon: "error"
        });
        return;
    }

    if (username.length < 3 || password.length < 3) {
        Swal.fire({
            title: "Error",
            text: "El usuario y contraseña deben tener al menos 3 caracteres.",
            icon: "error"
        });
        return;
    }

    if (password !== confirmPassword) {
        Swal.fire({
            title: "Error",
            text: "Las contraseñas no coinciden.",
            icon: "error",
        });
        return;
    }

    let newUser = {
        username: username,
        password: password
    };

    users.push(newUser);

    Swal.fire({
        title: "¡Registrado con éxito!",
        text: `¡Bienvenido ${username}!`,
        icon: "success",
        timer: 3000,
        showConfirmButton: true
    }).then((result) => {
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');

        localStorage.setItem('users', JSON.stringify(users));

        window.location.href = "../index.html";
    });
}

function logout() {

    Swal.fire({
        title: "¿Estas seguro de que quieres cerrar sesión?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Cerrar sesión",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
            isLoggedIn = false;
            localStorage.setItem('isLoggedIn', 'false');
          Swal.fire({
            title: "¡Sesión cerrada!",
            text: "Has cerrado la sesión actual.",
            icon: "success",
            timer: 3000,
            showConfirmButton: true
        }).then((result) => {
            window.location.href = "../index.html";
        });
        }
      });
}

function login(event) {
    event.preventDefault();

    let username = document.getElementById('loginUsername').value;
    let password = document.getElementById('loginPassword').value;

    let foundUser = users.find(user => user.username === username && user.password === password);

    if (foundUser) {
        Swal.fire({
            title: "¡Iniciado Sesión!",
            text: `¡Bienvenido ${username}!`,
            icon: "success",
            timer: 3000,
            showConfirmButton: true
        }).then((result) => {

            isLoggedIn = true;

            localStorage.setItem('isLoggedIn', 'true');

            window.location.href = "../index.html";
        });
    } else {
        Swal.fire({
            title: "Datos incorrectos",
            text: "El usuario o contraseña ingresados no son correctos.",
            icon: "error"
        });
    }
}

function updateLinksVisibility() {
    if (isLoggedIn) {
        document.getElementById('registerLink').style.display = 'none';
        document.getElementById('loginLink').style.display = 'none';
        document.getElementById('logoutLink').style.display = 'inline';
    } else {
        document.getElementById('registerLink').style.display = 'inline';
        document.getElementById('loginLink').style.display = 'inline';
        document.getElementById('logoutLink').style.display = 'none';
    }
}

updateLinksVisibility();

Object.defineProperty(window, 'isLoggedIn', {
    set: function(value) {
        isLoggedIn = value;
        updateLinksVisibility();
    },
    get: function() {
        return isLoggedIn;
    }
});

class Carrito {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('carrito')) || [];
    }

    agregarAlCarrito(videojuego) {
        const index = this.items.findIndex(item => item.juego.titulo === videojuego.titulo);

        if (index === -1) {
            this.items.push({ juego: videojuego });
            this.guardarCarrito();
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: `${videojuego.titulo} fue agregado al carrito`,
                showConfirmButton: false,
                timer: 1500
              });
        } else {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: `${videojuego.titulo} ya está en el carrito.`,
                showConfirmButton: false,
                timer: 1500
              });
        }
    }

    mostrarCarrito() {
        let mensaje = '<div style="text-align: left;"><h4>Productos:</h4><ul>';
        let total = 0;
    
        for (const item of this.items) {
            mensaje += `<li>${item.juego.titulo}: $${item.juego.precio.toFixed(2)}</li>`;
            total += item.juego.precio;
        }
    
        mensaje += `</ul><h3>Total: $${total.toFixed(2)}</h3></div>`;
    
        Swal.fire({
            title: 'Carrito de Compras',
            html: mensaje,
            icon: 'info',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Comprar',
            cancelButtonText: 'Vaciar Carrito',
            cancelButtonColor: '#d33',
            reverseButtons: true,
            showLoaderOnConfirm: true,
            preConfirm: (action) => {
                if (action === 'comprar') {
                    return this.realizarCompra();
                } else if (action === 'vaciar') {
                    return this.borrarCarrito();
                }
            },
            cancelButtonAriaLabel: 'Vaciar Carrito',
            confirmButtonAriaLabel: 'Comprar',
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {

            if (result.isConfirmed) {

                this.realizarCompra();
            } else if (result.dismiss === Swal.DismissReason.cancel && !result.isConfirmed) {

                this.borrarCarrito();
            }
        });
    }
    
    

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
    }

    borrarCarrito() {
        let cantidadTotalEnCarrito = carrito.items.length;
        Swal.fire({
            title: "¿Estas seguro de que quieres vaciar tu carrito?",
            text: `Se eliminarán ${cantidadTotalEnCarrito} productos.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Vaciar Productos",
            cancelButtonText: "Cancelar"
          }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('carrito');
              Swal.fire({
                title: "¡Hecho!",
                text: "Tu carrito fue vaciado.",
                icon: "success"
              });
              setTimeout(() => {
                location.reload();
            }, 1500);
            }
          });
        }

    realizarCompra() {
        if (isLoggedIn) {
        let cantidadTotalEnCarrito = carrito.items.length;
        Swal.fire({
            title: "¿Quieres completar la compra?",
            text: `Se comprarán ${cantidadTotalEnCarrito} productos.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Comprar",
            cancelButtonText: "Cancelar"
          }).then((result) => {
            if (result.isConfirmed) {
              localStorage.removeItem('carrito');
              Swal.fire({
                title: "¡Compra realizada con éxito!",
                icon: "success"
            });
            setTimeout(() => {
              location.reload();
          }, 1500);
          }
        });
    }else{
        Swal.fire({
            title: "Debes haber iniciado sesión para completar la compra.",
            text: "Inicia sesión o crea tu cuenta si es tu primera vez.",
            icon: "error"
          });
    }
      }
    }

function borrarCarrito() {
    carrito.borrarCarrito();
}

function realizarCompra() {
    carrito.realizarCompra();
}

class Videojuego {
    constructor(titulo, genero, precio, imagen) {
        this.titulo = titulo;
        this.genero = genero;
        this.precio = precio;
        this.imagen = imagen;
    }
}

function mostrarCatalogo(catalogo) {
    const catalogoContainer = document.querySelector(".catalogo");

    catalogo.forEach(juego => {
        const link = document.createElement("a");
        link.href = `../templates/${formatoNombre(juego.titulo)}`;

        const card = document.createElement("div");
        card.classList.add("card");

        const imagen = document.createElement("img");
        imagen.src = juego.imagen;
        imagen.alt = juego.titulo;
        link.appendChild(imagen);

        const titulo = document.createElement("h2");
        titulo.textContent = juego.titulo;
        link.appendChild(titulo);

        const genero = document.createElement("p");
        genero.textContent = `Género: ${juego.genero}`;
        link.appendChild(genero);

        const precio = document.createElement("p");
        precio.textContent = `Precio: $${juego.precio.toFixed(2)}`;
        link.appendChild(precio);

        card.appendChild(link);
        catalogoContainer.appendChild(card);
    });
}

function formatoNombre(nombre) {
    return nombre.toLowerCase().replace(/\s+/g, '');
}

const catalogo = [
    new Videojuego('The Witcher 3', 'RPG', 29.99, "../assets/media/tw3.jpg"),
    new Videojuego('The Elder Scrolls 5: Skyrim', 'RPG', 35.99, "../assets/media/skyrim.jpg"),
    new Videojuego('Red Dead Redemption 2', 'Aventura', 49.99, "../assets/media/rdr2.jpeg"),
    new Videojuego('Cyberpunk 2077', 'Acción/Aventura', 59.99, "../assets/media/cyberpunk.jpg"),
    new Videojuego('Minecraft', 'Sandbox', 24.99, "../assets/media/mc.jpg"),
    new Videojuego('Elden Ring', 'JRPG', 47.99, "../assets/media/er.jpg"),
    new Videojuego('Rocket League', 'Deportes', 0, "../assets/media/rocketleague.jpg"),
    new Videojuego('Among Us', 'Multijugador', 4.99, "../assets/media/amongus.jpeg"),
    new Videojuego('Assassin\'s Creed Valhalla', 'Acción/Aventura', 44.99, "../assets/media/acv.jpg"),
    new Videojuego('Fear & Hunger 2: Termina', 'Survival/Horror', 11.99, "../assets/media/fah2.jpg"),
    new Videojuego('Hollow Knight', 'Metroidvania', 14.99, "../assets/media/hk.jpg"),
    new Videojuego('Stardew Valley', 'Simulación', 11.99, "../assets/media/sv.jpg"),
    new Videojuego('Genshin Impact', 'RPG', 0, "../assets/media/gi.jpeg"),
    new Videojuego('Sea of Thieves', 'Aventura', 29.99, "../assets/media/sot.jpg"),
    new Videojuego('Rainbow Six Siege', 'FPS', 19.99, "../assets/media/r6.jpeg"),
    new Videojuego('Dark Souls: Remastered', 'RPG', 39.99, "../assets/media/ds.jpg"),
    new Videojuego('Terraria', 'Sandbox', 5.99, "../assets/media/terraria.jpg"),
    new Videojuego('Hades', 'Roguelite', 4.99, "../assets/media/hades.jpg"),
    new Videojuego('Katana ZERO', 'Acción', 7.99, "../assets/media/kz.jpg"),
];



const carrito = new Carrito();

document.addEventListener("DOMContentLoaded", function() {
    const catalogoContainer = document.querySelector(".catalogo");

    catalogo.forEach(juego => {
        const link = document.createElement("a");
        link.href = `../templates/${formatoNombre(juego.titulo)}`;

        const card = document.createElement("div");
        card.classList.add("card");

        const imagen = document.createElement("img");
        imagen.src = juego.imagen;
        imagen.alt = juego.titulo;
        link.appendChild(imagen);

        const titulo = document.createElement("h2");
        titulo.textContent = juego.titulo;
        link.appendChild(titulo);

        const genero = document.createElement("p");
        genero.textContent = `Género: ${juego.genero}`;
        link.appendChild(genero);

        const precio = document.createElement("p");
        precio.textContent = `Precio: $${juego.precio.toFixed(2)}`;
        link.appendChild(precio);

        const agregarBtn = document.createElement("button");
        agregarBtn.textContent = "Agregar al Carrito";
        agregarBtn.classList.add("agregar-btn");
        agregarBtn.addEventListener("click", function() {
            carrito.agregarAlCarrito(juego);
        });
        card.appendChild(agregarBtn);

        card.appendChild(link);
        catalogoContainer.appendChild(card);
    });
});

function formatoNombre(nombre) {

    return nombre.toLowerCase().replace(/\s+/g, '');
}

function mostrarCarrito() {
    carrito.mostrarCarrito();
}